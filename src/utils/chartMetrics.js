export function formatWon(value) {
  return `₩${Math.round(value).toLocaleString('ko-KR')}`
}

// 성과 그래프 지표: 계산식과 단위 표시 방법 (홈, 캠페인 상세 공용)
export const chartMetrics = {
  ctr: {
    label: 'CTR',
    description: '클릭률',
    unit: '%',
    calc: ({ impressions, clicks }) => (impressions > 0 ? (clicks / impressions) * 100 : 0),
    format: (value) => `${value.toFixed(2)}%`,
  },
  cpc: {
    label: 'CPC',
    description: '클릭당 비용',
    unit: '원',
    calc: ({ clicks, spent }) => (clicks > 0 ? spent / clicks : 0),
    format: formatWon,
  },
  cpm: {
    label: 'CPM',
    description: '1,000회 노출당 비용',
    unit: '원',
    calc: ({ impressions, spent }) => (impressions > 0 ? (spent / impressions) * 1000 : 0),
    format: formatWon,
  },
}

// 캠페인 상세 전용: 총 예산 대비 누적 집행 금액
export const burnRateMetric = {
  label: '예산 소진율',
  description: '총 예산 대비 누적 집행 금액',
  unit: '%',
  calc: ({ cumulativeSpent, budget }) => (budget > 0 ? (cumulativeSpent / budget) * 100 : 0),
  format: (value) => `${value.toFixed(1)}%`,
}

// 그래프 데이터(series)를 선택한 지표의 숫자 배열로 바꾼다
// (지표마다 필요한 값만 있으면 되므로, 없는 배열은 undefined로 넘긴다)
export function getMetricValues(series, metric) {
  return series.labels.map((_, index) =>
    metric.calc({
      impressions: series.impressions?.[index],
      clicks: series.clicks?.[index],
      spent: series.spent?.[index],
      cumulativeSpent: series.cumulativeSpent?.[index],
      budget: series.budget,
    }),
  )
}
