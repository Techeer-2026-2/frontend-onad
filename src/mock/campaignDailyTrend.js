import { mockHomePerformance } from './homePerformance'

// 캠페인 상세 그래프용 일별 Mock 데이터 (기준일까지 최근 30일)
const END_DATE = new Date(2026, 8, 26) // 2026-09-26, 대시보드 Mock과 같은 기준일
const DAYS = 30

// 캠페인별 하루 평균값과 추세 (trend: 하루마다 노출이 늘거나 주는 비율)
// spikes: { 날짜 인덱스(0 = 30일 전, 29 = 기준일): 그날 클릭 배수 } - 클릭이 몰려 예산이 빠르게 소진된 날
const dailyBase = {
  'mock-summer-release': { impressions: 19000, ctr: 3.3, cpm: 3000, trend: 0.006, spikes: { 12: 2.8, 26: 3.5 } }, // 9/9, 9/23
  'mock-redvelvet-event': { impressions: 26000, ctr: 3.0, cpm: 2900, trend: -0.008, spikes: { 6: 2.2, 25: 2.5 } }, // 9/3, 9/22
}

export function getMockDailyTrend(campaignId) {
  const base = dailyBase[campaignId]
  const performance = mockHomePerformance[campaignId]
  if (!base || !performance) return null

  const days = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(END_DATE)
    date.setDate(END_DATE.getDate() - (DAYS - 1 - index))
    // 사인/코사인으로 매일 조금씩 다른 값을 만든다 (랜덤이 아니라 항상 같은 결과)
    const wave = 1 + 0.15 * Math.sin(index * 1.3) + 0.08 * Math.cos(index * 0.7)
    const impressions = Math.round(base.impressions * wave * (1 + base.trend * index))
    const ctr = base.ctr * (1 + 0.1 * Math.sin(index * 0.9))
    const cpm = base.cpm * (1 + 0.05 * Math.cos(index * 1.1))
    const multiplier = base.spikes[index] ?? 1
    const baseClicks = Math.round((impressions * ctr) / 100)
    const baseSpent = Math.round((impressions * cpm) / 1000)
    const cpc = baseSpent / baseClicks // 평소 클릭당 비용
    const clicks = Math.round(baseClicks * multiplier)
    return {
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      impressions,
      clicks,
      spent: Math.round(clicks * cpc), // 클릭당 과금: 클릭이 늘어난 만큼 비용도 증가
    }
  })

  // 예산 소진율용 누적 집행 금액: 30일 이전에 쓴 금액에서 시작해, 마지막 날 = 총 집행 금액
  const windowSpent = days.reduce((sum, day) => sum + day.spent, 0)
  let cumulative = performance.spent - windowSpent
  const cumulativeSpent = days.map((day) => (cumulative += day.spent))

  return {
    budget: performance.budget,
    labels: days.map((day) => day.label),
    impressions: days.map((day) => day.impressions),
    clicks: days.map((day) => day.clicks),
    spent: days.map((day) => day.spent),
    cumulativeSpent,
  }
}
