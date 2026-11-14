import { useEffect, useState } from 'react'
import { getCampaignBudget } from '../api/campaignPerformance'
import { burnRateMetric, formatWon, getMetricValues } from '../utils/chartMetrics'
import MetricTrendChart from './MetricTrendChart'
import PeriodToggle from './PeriodToggle'

function CampaignBudgetSection({ campaignId }) {
  const [days, setDays] = useState(7)
  // 어떤 요청(캠페인 + 기간)의 결과인지 key와 함께 저장한다
  const [budgetState, setBudgetState] = useState({ key: null, data: null, error: '' })
  const requestKey = `${campaignId}:${days}`

  useEffect(() => {
    const controller = new AbortController()
    getCampaignBudget(campaignId, { days, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setBudgetState({ key: requestKey, data, error: '' })
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'AbortError') return
        setBudgetState({ key: requestKey, data: null, error: '예산 정보를 불러오지 못했습니다.' })
      })
    return () => controller.abort()
  }, [campaignId, days, requestKey])

  const isLoading = budgetState.key !== requestKey
  const budget = isLoading ? null : budgetState.data
  const rate = budget && budget.budget > 0 ? (budget.spent / budget.budget) * 100 : null
  const isOverBudget = Boolean(budget && budget.spent > budget.budget)
  const barWidth = rate === null ? 0 : Math.min(rate, 100)

  const statusMessage = isLoading
    ? '예산 정보를 불러오는 중입니다…'
    : budgetState.error || '예산 정보가 없습니다.'

  return (
    <section aria-labelledby="campaign-budget-title" className="space-y-4 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm sm:p-6">
      {/* 제목 + 기간 필터 (그래프에만 적용) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="campaign-budget-title" className="text-sm font-bold text-[#2A2C41]">예산 소진율</h2>
        <PeriodToggle value={days} onChange={setDays} />
      </div>

      {rate === null ? (
        <p role={isLoading ? 'status' : undefined} className="rounded-xl bg-[#FAFAFD] px-4 py-6 text-center text-sm text-[#858296]">
          {statusMessage}
        </p>
      ) : (
        <>
          {/* 현재값 카드 */}
          <div className="rounded-xl bg-[#FAFAFD] p-4">
            <p className="text-[11px] font-semibold tracking-wide text-[#9A97A7]">현재</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <p className="text-3xl font-black tracking-tight text-[#2A2C41]">{burnRateMetric.format(rate)}</p>
              <p className="text-xs font-semibold text-[#6F6C80]">
                {isOverBudget ? <span className="text-rose-600">예산 초과</span> : <>남은 예산 {formatWon(budget.budget - budget.spent)}</>}
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="예산 소진율"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(barWidth)}
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECEAF5]"
            >
              <div className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-[#6C48F5]'}`} style={{ width: `${barWidth}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#858296]">집행 {formatWon(budget.spent)} / 총 예산 {formatWon(budget.budget)}</p>
          </div>

          {/* 누적 소진율 추이 */}
          <div className="space-y-2">
            <p className="text-xs text-[#858296]">누적 소진율 추이 · 단위 {burnRateMetric.unit}</p>
            {budget.history ? (
              <MetricTrendChart
                labels={budget.history.labels}
                values={getMetricValues({ ...budget.history, budget: budget.budget }, burnRateMetric)}
                metricLabel={burnRateMetric.label}
                formatValue={burnRateMetric.format}
              />
            ) : (
              <p className="flex h-96 items-center justify-center rounded-2xl bg-[#F7F7FB] px-6 text-center text-sm text-[#858296]">
                날짜별 예산 소진 기록이 없습니다.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default CampaignBudgetSection
