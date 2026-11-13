import { Target } from 'lucide-react'

const formatCount = (value) => value.toLocaleString('ko-KR')

function GoalProgressCard({ targetClicks, clicks }) {
  const hasGoal = Number.isFinite(targetClicks) && targetClicks > 0
  const currentClicks = Number.isFinite(clicks) ? clicks : 0
  const rate = hasGoal ? (currentClicks / targetClicks) * 100 : null
  const isAchieved = rate !== null && rate >= 100
  const barWidth = rate === null ? 0 : Math.min(rate, 100)

  return (
    <section aria-labelledby="goal-progress-title" className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0EFF7] pb-3">
        <h2 id="goal-progress-title" className="flex items-center gap-2 text-sm font-bold text-[#2A2C41]">
          <Target size={16} className="text-[#6C48F5]" aria-hidden="true" />목표 클릭 달성률
        </h2>
        {isAchieved && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">목표 달성</span>}
      </div>

      {!hasGoal ? (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-[#2A2C41]">목표 클릭수가 설정되지 않았어요.</p>
          <p className="mt-1 text-xs text-[#858296]">목표를 정하면 달성률을 확인할 수 있어요.</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className={`text-3xl font-black tracking-tight ${isAchieved ? 'text-emerald-600' : 'text-[#2A2C41]'}`}>{rate.toFixed(1)}%</p>
            <p className="text-xs font-semibold text-[#6F6C80]">
              {isAchieved
                ? `목표보다 ${formatCount(currentClicks - targetClicks)}회 초과`
                : `남은 클릭 ${formatCount(targetClicks - currentClicks)}회`}
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="목표 클릭 달성률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(barWidth)}
            className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECEAF5]"
          >
            <div className={`h-full rounded-full ${isAchieved ? 'bg-emerald-500' : 'bg-[#6C48F5]'}`} style={{ width: `${barWidth}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#FAFAFD] px-3 py-2.5">
              <dt className="text-[11px] font-semibold text-[#9A97A7]">현재 클릭수</dt>
              <dd className="mt-0.5 text-sm font-bold text-[#2A2C41]">{formatCount(currentClicks)}회</dd>
            </div>
            <div className="rounded-xl bg-[#FAFAFD] px-3 py-2.5">
              <dt className="text-[11px] font-semibold text-[#9A97A7]">목표 클릭수</dt>
              <dd className="mt-0.5 text-sm font-bold text-[#2A2C41]">{formatCount(targetClicks)}회</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}

export default GoalProgressCard
