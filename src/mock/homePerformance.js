// 메인 홈 성과 Mock 데이터 (API 연동 전까지 사용)
const chartLabels = {
  hour: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  day: ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26'],
  week: ['9월 1주차', '9월 2주차', '9월 3주차', '9월 4주차'],
}

export const mockHomePerformance = {
  'mock-summer-release': {
    budget: 5000000,
    spent: 3620000,
    chart: {
      hour: { labels: chartLabels.hour, impressions: [420, 680, 1450, 890, 920, 1680, 1100, 750], clicks: [45, 72, 185, 95, 98, 210, 130, 82], spent: [2100, 3300, 7400, 4300, 4600, 8700, 5400, 3700] },
      day: { labels: chartLabels.day, impressions: [1450, 1620, 1880, 1720, 1980, 2100, 2050], clicks: [210, 140, 165, 205, 215, 120, 150], spent: [7200, 8300, 9500, 8400, 10100, 10900, 10300] },
      week: { labels: chartLabels.week, impressions: [8900, 11200, 12847, 10500], clicks: [820, 1050, 1203, 980], spent: [44500, 57100, 64200, 51400] },
    },
  },
  'mock-indie-festival': { budget: 2000000, spent: 0, chart: null },
  'mock-redvelvet-event': {
    budget: 3000000,
    spent: 2450000,
    chart: {
      hour: { labels: chartLabels.hour, impressions: [310, 520, 980, 640, 700, 1210, 860, 540], clicks: [9, 15, 31, 17, 19, 38, 24, 14], spent: [1500, 2700, 4900, 3300, 3400, 6200, 4300, 2800] },
      day: { labels: chartLabels.day, impressions: [11200, 10800, 10100, 9300, 8700, 8000, 7400], clicks: [340, 318, 290, 262, 241, 220, 198], spent: [56000, 55100, 51500, 47400, 45200, 41600, 38500] },
      week: { labels: chartLabels.week, impressions: [82000, 76500, 70300, 61500], clicks: [2650, 2420, 2210, 1720], spent: [410000, 390000, 358500, 320000] },
    },
  },
  'mock-spring-playlist': { budget: 6000000, spent: 6000000, chart: null },
}

export function getHomePerformance(campaignId) {
  return mockHomePerformance[campaignId] ?? null
}
