import { getHomePerformance } from '../mock/homePerformance'
import { ApiError, apiRequest, authenticatedFetch } from './client'
import { getCampaign } from './campaigns'

const DAY_MS = 24 * 60 * 60 * 1000

const campaignPath = (campaignId) => `/api/v1/campaigns/${encodeURIComponent(campaignId)}`

// 최근 days일(오늘 포함) 구간: 시작일 00:00 ~ 지금
function recentRange(days) {
  const to = new Date()
  const from = new Date(to)
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - (days - 1))
  return { from, to }
}

// 캠페인 AI 성과 요약
// GET /campaigns/{id}/summary → { campaignId, summary }
// 반환 형태: { summary } 또는 null(분석 결과 없음)
export async function getCampaignSummary(campaignId, { signal } = {}) {
  try {
    const response = await apiRequest(`${campaignPath(campaignId)}/summary`, { signal })
    return response?.summary ? { summary: response.summary } : null
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

// Content-Disposition 헤더에서 파일 이름을 꺼낸다 (filename*=UTF-8''... 우선)
function filenameFromDisposition(header) {
  if (!header) return null
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (encoded) return decodeURIComponent(encoded[1])
  return header.match(/filename="?([^";]+)"?/i)?.[1] ?? null
}

// 캠페인 성과 리포트 파일 (CSV / PDF)
// GET /campaigns/{id}/report/{csv|pdf}?from&to → 파일
// 반환 형태: { blob, filename, isSample: false }
export async function getCampaignReport(campaignId, { format, days = 7, signal } = {}) {
  const { from, to } = recentRange(days)
  const query = new URLSearchParams({ from: toLocalIso(from), to: toLocalIso(to) })
  const response = await authenticatedFetch(`${campaignPath(campaignId)}/report/${format}?${query}`, { signal })

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || contentType.includes('text/html')) {
    let message = `리포트를 내려받지 못했습니다. (${response.status})`
    if (contentType.includes('application/json')) {
      message = (await response.json().catch(() => null))?.message || message
    }
    throw new ApiError(message, response.ok ? 404 : response.status)
  }

  const fallbackName = `campaign-${campaignId}-report-${days}d.${format}`
  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(response.headers.get('content-disposition')) || fallbackName,
    isSample: false,
  }
}

// 캠페인 성과(예산, 집행 금액, 기간별 노출/클릭/집행 추이)를 가져온다. (대시보드 홈용)
// 반환 형태: { budget, spent, chart: { hour|day|week: { labels, impressions, clicks, spent } } | null } 또는 null
// 목데이터가 있는 캠페인은 목데이터를, 없는 실제 캠페인은 백엔드 시계열 API 를 쓴다.
// 기간(from, to)을 받아 시간, 일 추이를 만들고, 주 단위는 일 단위를 7일씩 묶는다.
export async function getCampaignPerformance(campaignId, { signal, from, to } = {}) {
  signal?.throwIfAborted()
  const mock = getHomePerformance(campaignId)
  if (mock) return mock

  const end = to ?? new Date()
  const begin = from ?? new Date(end.getTime() - 28 * DAY_MS)
  const [campaign, hourly, daily] = await Promise.all([
    getCampaign(campaignId, { signal }),
    fetchTimeseriesRange(campaignId, 'hour', begin, end, { signal }),
    fetchTimeseriesRange(campaignId, 'day', begin, end, { signal }),
  ])
  return {
    budget: campaign.totalBudget,
    spent: campaign.spentTotal,
    chart: {
      hour: toChart(hourly, hourLabel),
      day: toChart(daily, dayLabel),
      week: toWeeklyChart(daily),
    },
  }
}

// 백엔드 시계열 응답(bucketStart, impressionCount, clickCount, spentAmount)을 그래프 형태로 바꾼다.
function toChart(buckets, labelFn) {
  return {
    labels: buckets.map((b) => labelFn(b.bucketStart)),
    impressions: buckets.map((b) => b.impressionCount),
    clicks: buckets.map((b) => b.clickCount),
    spent: buckets.map((b) => b.spentAmount),
  }
}

function toWeeklyChart(daily) {
  const weekly = { labels: [], impressions: [], clicks: [], spent: [] }
  for (let start = 0; start < daily.length; start += 7) {
    const chunk = daily.slice(start, start + 7)
    weekly.labels.push(`${dayLabel(chunk[0].bucketStart)}~${dayLabel(chunk[chunk.length - 1].bucketStart)}`)
    weekly.impressions.push(chunk.reduce((sum, b) => sum + b.impressionCount, 0))
    weekly.clicks.push(chunk.reduce((sum, b) => sum + b.clickCount, 0))
    weekly.spent.push(chunk.reduce((sum, b) => sum + b.spentAmount, 0))
  }
  return weekly
}

const dayLabel = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`
const hourLabel = (iso) => `${dayLabel(iso)} ${iso.slice(11, 13)}시`

// LocalDateTime 형식(시간대 없음)으로 자른다. 백엔드는 서버 시각대의 로컬 시각을 기대한다.
function toLocalIso(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

function fetchTimeseriesRange(campaignId, granularity, from, to, { signal } = {}) {
  const query = new URLSearchParams({ from: toLocalIso(from), to: toLocalIso(to), granularity })
  return apiRequest(`${campaignPath(campaignId)}/stats/timeseries?${query}`, { signal })
}

// 최근 days일의 일별 시계열 + 캠페인 상세를 함께 가져온다
async function fetchRecentDaily(campaignId, days, signal) {
  const { from, to } = recentRange(days)
  const [campaign, daily] = await Promise.all([
    getCampaign(campaignId, { signal }),
    fetchTimeseriesRange(campaignId, 'day', from, to, { signal }),
  ])
  return { campaign, daily: Array.isArray(daily) ? daily : [] }
}

// 기간 안의 날짜별 집행 금액을 "그날까지의 누적 집행 금액"으로 바꾼다.
// 기간 이전에 쓴 금액(= 현재 누적 소진액 - 기간 내 소진액)에서 출발한다.
function toCumulativeSpent(daily, spentTotal) {
  const spentInRange = daily.reduce((sum, b) => sum + b.spentAmount, 0)
  let running = Math.max((spentTotal ?? 0) - spentInRange, 0)
  return daily.map((b) => (running += b.spentAmount))
}

// 캠페인 예산 소진 현황: 현재값 + 최근 days일 누적 추이
// 반환 형태: { budget, spent, history: { labels, cumulativeSpent } | null } 또는 null(예산 정보 없음)
export async function getCampaignBudget(campaignId, { days = 7, signal } = {}) {
  const { campaign, daily } = await fetchRecentDaily(campaignId, days, signal)
  if (!Number.isFinite(campaign?.totalBudget)) return null
  return {
    budget: campaign.totalBudget,
    spent: campaign.spentTotal ?? 0,
    history: daily.length
      ? {
          labels: daily.map((b) => dayLabel(b.bucketStart)),
          cumulativeSpent: toCumulativeSpent(daily, campaign.spentTotal),
        }
      : null,
  }
}

// 캠페인 상세 그래프용 일별 추이 (최근 days일)
// 반환 형태: { budget, labels, impressions, clicks, spent, cumulativeSpent } 또는 null(데이터 없음)
export async function getCampaignDailyTrend(campaignId, { days = 7, signal } = {}) {
  const { campaign, daily } = await fetchRecentDaily(campaignId, days, signal)
  const hasActivity = daily.some((b) => b.impressionCount > 0 || b.clickCount > 0)
  if (!hasActivity) return null
  return {
    budget: campaign.totalBudget,
    ...toChart(daily, dayLabel),
    cumulativeSpent: toCumulativeSpent(daily, campaign.spentTotal),
  }
}

const AGE_LABELS = { '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대+' }

// 타겟 연령대별 CTR 과 평균 대비 Lift
// GET /campaigns/{id}/stats/by-age → [{ ageGroup, impressionCount, clickCount, ctr }]
// 반환 형태: [{ age, ctr, lift }] (lift 는 "+12%" / "-5%" 형식). 노출이 없으면 빈 배열
export async function getCampaignAgeCtrLift(campaignId, { signal } = {}) {
  const rows = await apiRequest(`${campaignPath(campaignId)}/stats/by-age`, { signal })
  const known = (Array.isArray(rows) ? rows : []).filter(
    (row) => AGE_LABELS[row.ageGroup] && row.impressionCount > 0,
  )
  const totalImpressions = known.reduce((sum, row) => sum + row.impressionCount, 0)
  const totalClicks = known.reduce((sum, row) => sum + row.clickCount, 0)
  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return known
    .sort((a, b) => a.ageGroup.localeCompare(b.ageGroup))
    .map((row) => {
      const lift = averageCtr > 0 ? Math.round((row.ctr / averageCtr - 1) * 100) : 0
      return {
        age: AGE_LABELS[row.ageGroup],
        ctr: row.ctr,
        lift: `${lift >= 0 ? '+' : ''}${lift}%`,
        impressions: row.impressionCount,
      }
    })
}
