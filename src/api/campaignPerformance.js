import { getMockDailyTrend } from '../mock/campaignDailyTrend'
import { getHomePerformance } from '../mock/homePerformance'

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
