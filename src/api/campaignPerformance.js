import { ApiError, apiRequest, authenticatedFetch } from './client'
import { getCampaign } from "./campaigns";

function campaignPath(campaignId) {
  return `/api/v1/campaigns/${encodeURIComponent(campaignId)}`
}

export function getCampaignTimeseries(campaignId, { from, to, granularity = 'day', signal } = {}) {
  const query = new URLSearchParams({ granularity })
  if (from) query.set('from', from)
  if (to) query.set('to', to)
  return apiRequest(`${campaignPath(campaignId)}/stats/timeseries?${query}`, { signal })
}

export function toTrendSeries(buckets, granularity) {
  if (!Array.isArray(buckets)) throw new Error('성과 추이 응답 형식이 올바르지 않습니다.')
  return {
    labels: buckets.map(({ bucketStart }) => {
      const date = bucketStart.slice(5, 10).replace('-', '.')
      return granularity === 'hour' ? `${date} ${bucketStart.slice(11, 16)}` : date
    }),
    impressions: buckets.map(({ impressionCount }) => impressionCount),
    clicks: buckets.map(({ clickCount }) => clickCount),
    ctr: buckets.map(({ ctr }) => ctr),
    cpc: buckets.map(({ cpc }) => cpc),
    cpm: buckets.map(({ cpm }) => cpm),
  }
}

export function getCampaignAgeStats(campaignId, { signal } = {}) {
  return apiRequest(`${campaignPath(campaignId)}/stats/by-age`, { signal })
}

export function getCampaignSummary(campaignId, { signal } = {}) {
  return apiRequest(`${campaignPath(campaignId)}/summary`, { signal })
}

export async function downloadCampaignReport(campaignId, format, { signal } = {}) {
  const response = await authenticatedFetch(`${campaignPath(campaignId)}/report/${format}`, { signal })
  const expectedType = format === 'pdf' ? 'application/pdf' : 'text/csv'

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new ApiError(error?.message || '리포트를 내려받지 못했습니다.', response.status)
  }
  if (!response.headers.get('content-type')?.includes(expectedType)) {
    throw new Error('리포트 파일 형식이 올바르지 않습니다.')
  }

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = `campaign-${campaignId}-report.${format}`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---- 아래는 develop 의 보고서·예산·추이 컴포넌트가 쓰는 함수다. 같은 백엔드 API 를 #61 함수로 감싼다. ----

// 예산 소진 현황: 캠페인 상세의 총 예산·집행액을 쓴다.
export async function getCampaignBudget(campaignId, { signal } = {}) {
  const campaign = await getCampaign(campaignId, { signal })
  return {
    budget: campaign.totalBudget,
    spent: campaign.spentTotal,
    history: null,
  }
}

// 일별 추이 (최근 days 일). 집행액 누적도 함께 만든다.
export async function getCampaignDailyTrend(campaignId, { days = 7, signal } = {}) {
  const to = new Date()
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
  const buckets = await getCampaignTimeseries(campaignId, { from: toLocalIso(from), to: toLocalIso(to), granularity: 'day', signal })
  let running = 0
  const cumulativeSpent = buckets.map((b) => (running += b.spentAmount))
  return {
    labels: buckets.map(({ bucketStart }) => bucketStart.slice(5, 10).replace('-', '/')),
    impressions: buckets.map((b) => b.impressionCount),
    clicks: buckets.map((b) => b.clickCount),
    spent: buckets.map((b) => b.spentAmount),
    cumulativeSpent,
  }
}

// 리포트: downloadCampaignReport 가 파일을 직접 내려받으므로 blob 없이 결과만 돌려준다.
export async function getCampaignReport(campaignId, { format, signal } = {}) {
  await downloadCampaignReport(campaignId, format, { signal })
  return { blob: null, filename: `campaign-${campaignId}-report.${format}`, isSample: false }
}

function toLocalIso(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}
