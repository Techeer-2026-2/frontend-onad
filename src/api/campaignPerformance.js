import { getHomePerformance } from '../mock/homePerformance'

// 캠페인 성과(예산·집행 금액·기간별 노출/클릭/집행 추이)를 가져온다.
// 백엔드 통계 API가 아직 없어서 Mock을 Promise로 감싸 반환한다.
// TODO: API가 생기면 apiRequest로 호출하고, 응답을 아래 형태로 변환해서 반환한다.
// 반환 형태: { budget, spent, chart: { hour|day|week: { labels, impressions, clicks, spent } } | null } 또는 null
export async function getCampaignPerformance(campaignId, { signal } = {}) {
  signal?.throwIfAborted()
  return getHomePerformance(campaignId)
}
