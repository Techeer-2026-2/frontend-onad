import { useEffect, useState } from 'react'
import { getCampaignDailyTrend } from '../api/campaignPerformance'
import { chartMetrics, getMetricValues } from '../utils/chartMetrics'
import MetricTrendChart from './MetricTrendChart'
import PeriodToggle from './PeriodToggle'

function CampaignTrendSection({ campaignId }) {
  const [metricKey, setMetricKey] = useState('ctr')
  const [days, setDays] = useState(7)
  // 어떤 요청(캠페인 + 기간)의 결과인지 key와 함께 저장한다
  const [trendState, setTrendState] = useState({ key: null, data: null, error: '' })
  const requestKey = `${campaignId}:${days}`

  useEffect(() => {
    const controller = new AbortController()
    getCampaignDailyTrend(campaignId, { days, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setTrendState({ key: requestKey, data, error: '' })
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'AbortError') return
        setTrendState({ key: requestKey, data: null, error: '성과 데이터를 불러오지 못했습니다.' })
      })
    return () => controller.abort()
  }, [campaignId, days, requestKey])

  const isLoading = trendState.key !== requestKey
  const trend = isLoading ? null : trendState.data
  const metric = chartMetrics[metricKey]
  const emptyMessage = isLoading
    ? '성과 데이터를 불러오는 중입니다…'
    : trendState.error || '아직 표시할 성과 데이터가 없습니다. 캠페인이 집행되면 일별 성과가 표시돼요.'

  return (
    <section aria-labelledby="campaign-trend-title" className="space-y-4 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm sm:p-6">
      {/* 제목 + 기간 필터 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="campaign-trend-title" className="text-sm font-bold text-[#2A2C41]">광고 성과 추이</h2>
        <PeriodToggle value={days} onChange={setDays} />
      </div>

      {/* 지표 탭 + 단위 */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-[#F0EFF7]">
        <div role="tablist" aria-label="성과 지표 선택" className="-mb-px flex overflow-x-auto">
          {Object.entries(chartMetrics).map(([key, item]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metricKey === key}
              aria-controls="campaign-trend-panel"
              onClick={() => setMetricKey(key)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-bold transition sm:px-4 ${metricKey === key ? 'border-[#6C48F5] text-[#6C48F5]' : 'border-transparent text-[#9A97A7] hover:text-[#2A2C41]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="pb-2 text-xs text-[#858296]">{metric.description} · 단위 {metric.unit}</p>
      </div>

      {/* 그래프 또는 상태 문구 */}
      <div id="campaign-trend-panel" role="tabpanel">
        {trend ? (
          <MetricTrendChart labels={trend.labels} values={getMetricValues(trend, metric)} metricLabel={metric.label} formatValue={metric.format} />
        ) : (
          <p role={isLoading ? 'status' : undefined} className="flex h-96 items-center justify-center rounded-2xl bg-[#F7F7FB] px-6 text-center text-sm leading-6 text-[#858296]">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default CampaignTrendSection
