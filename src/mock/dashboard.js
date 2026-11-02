// Dashboard fallback data used before live analytics are available.
export const mockDashboardChartSeries = {
  hour: {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    impressions: [420, 680, 1450, 890, 920, 1680, 1100, 750],
    clicks: [45, 72, 185, 95, 98, 210, 130, 82],
  },
  day: {
    labels: ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26'],
    impressions: [1450, 1620, 1880, 1720, 1980, 2100, 2050],
    clicks: [210, 140, 165, 205, 215, 120, 150],
  },
  week: {
    labels: ['9월 1주차', '9월 2주차', '9월 3주차', '9월 4주차'],
    impressions: [8900, 11200, 12847, 10500],
    clicks: [820, 1050, 1203, 980],
  },
}

export const mockDashboardDatePresets = {
  yesterday: { label: '2026.09.25 (어제)', start: '2026-09-25', end: '2026-09-25' },
  '7days': { label: '2026.09.20 ~ 2026.09.26 (최근 7일)', start: '2026-09-20', end: '2026-09-26' },
  '30days': { label: '2026.08.28 ~ 2026.09.26 (최근 30일)', start: '2026-08-28', end: '2026-09-26' },
}
