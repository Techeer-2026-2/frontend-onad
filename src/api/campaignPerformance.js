import { getMockDailyTrend } from '../mock/campaignDailyTrend'
import { mockCampaignSummaries } from '../mock/campaignSummaries'
import { getHomePerformance } from '../mock/homePerformance'
import { chartMetrics } from '../utils/chartMetrics'

const MOCK_AI_DELAY_MS = 1200
const MOCK_REPORT_DELAY_MS = 1000

// 요청이 취소되면 바로 멈추는 대기 함수 (Mock에서 AI 응답 시간을 흉내 낸다)
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

// 캠페인 AI 성과 요약
// TODO: API가 생기면 apiRequest(`/api/v1/campaigns/${id}/summary`)로 바꾼다. (팀원 PR #61 참고)
// 반환 형태: { summary } 또는 null(분석 결과 없음)
export async function getCampaignSummary(campaignId, { signal } = {}) {
  await wait(MOCK_AI_DELAY_MS, signal)
  return mockCampaignSummaries[campaignId] ?? null
}

// 날짜별 성과를 CSV 문자열로 만든다. 맨 앞의 BOM 문자(U+FEFF)는 엑셀에서 한글이 깨지지 않게 한다.
function buildReportCsv(trend, days) {
  const header = ['날짜', '노출 수', '클릭 수', 'CTR(%)', '집행 금액(원)', 'CPC(원)', 'CPM(원)']
  const rows = trend.labels.slice(-days).map((label, offset) => {
    const index = trend.labels.length - days + offset
    const point = { impressions: trend.impressions[index], clicks: trend.clicks[index], spent: trend.spent[index] }
    return [
      label,
      point.impressions,
      point.clicks,
      chartMetrics.ctr.calc(point).toFixed(2),
      point.spent,
      Math.round(chartMetrics.cpc.calc(point)),
      Math.round(chartMetrics.cpm.calc(point)),
    ]
  })
  return '\uFEFF' + [header, ...rows].map((row) => row.join(',')).join('\r\n')
}

// 캠페인 성과 리포트 파일
// TODO: API가 생기면 authenticatedFetch(`/api/v1/campaigns/${id}/report/${format}`)로 받고
//       response.blob()을 반환한다. (팀원 PR #61 참고, 현재 백엔드는 기간(days) 파라미터를 받지 않음)
// 반환 형태: { blob, filename, isSample } (PDF Mock은 blob 없이 isSample: true)
export async function getCampaignReport(campaignId, { format, days = 7, signal } = {}) {
  await wait(MOCK_REPORT_DELAY_MS, signal) // 파일 생성 시간 흉내

  const trend = getMockDailyTrend(campaignId)
  if (!trend) throw new Error('리포트로 만들 성과 데이터가 없습니다.')

  const filename = `campaign-${campaignId}-report-${days}d.${format}`
  if (format === 'pdf') return { blob: null, filename, isSample: true }

  return {
    blob: new Blob([buildReportCsv(trend, days)], { type: 'text/csv;charset=utf-8' }),
    filename,
    isSample: false,
  }
}

// 캠페인 성과(예산·집행 금액·기간별 노출/클릭/집행 추이)를 가져온다.
// 백엔드 통계 API가 아직 없어서 Mock을 Promise로 감싸 반환한다.
// TODO: API가 생기면 apiRequest로 호출하고, 응답을 아래 형태로 변환해서 반환한다.
// 반환 형태: { budget, spent, chart: { hour|day|week: { labels, impressions, clicks, spent } } | null } 또는 null
export async function getCampaignPerformance(campaignId, { signal } = {}) {
  signal?.throwIfAborted()
  return getHomePerformance(campaignId)
}

// 캠페인 예산 소진 현황: 현재값 + 최근 days일 누적 추이
// 백엔드가 날짜별 기록을 어떤 형식으로 주든, 이 함수에서 아래 한 가지 형태로 맞춘다.
//  - 날짜별 집행 금액      → 누적합으로 바꾼다
//  - 날짜별 누적 집행 금액 → 그대로 쓴다
//  - 날짜별 소진율(%)      → (소진율 ÷ 100) × 예산으로 바꾼다
// 반환 형태: { budget, spent, history: { labels, cumulativeSpent } | null } 또는 null(예산 정보 없음)
export async function getCampaignBudget(campaignId, { days = 7, signal } = {}) {
  signal?.throwIfAborted()
  const performance = getHomePerformance(campaignId)
  if (!performance) return null

  const trend = getMockDailyTrend(campaignId)
  return {
    budget: performance.budget,
    spent: performance.spent,
    history: trend
      ? { labels: trend.labels.slice(-days), cumulativeSpent: trend.cumulativeSpent.slice(-days) }
      : null,
  }
}

// 캠페인 상세 그래프용 일별 추이 (최근 days일)
// TODO: API가 생기면 apiRequest(`/api/v1/campaigns/${id}/stats/daily?days=${days}`)처럼 호출하고 아래 형태로 변환한다.
// 반환 형태: { budget, labels, impressions, clicks, spent, cumulativeSpent } 또는 null
export async function getCampaignDailyTrend(campaignId, { days = 7, signal } = {}) {
  signal?.throwIfAborted()
  const trend = getMockDailyTrend(campaignId)
  if (!trend) return null

  const pick = (values) => values.slice(-days) // 마지막 days개
  return {
    budget: trend.budget,
    labels: pick(trend.labels),
    impressions: pick(trend.impressions),
    clicks: pick(trend.clicks),
    spent: pick(trend.spent),
    cumulativeSpent: pick(trend.cumulativeSpent),
  }
}
