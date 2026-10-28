import { TrendingUp } from 'lucide-react'

function KpiCard({ title, value, change, progress, Icon, featured = false }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition-colors hover:border-[#0B7CFF]/50">
      <div className="flex items-center justify-between text-xs font-semibold text-[#364964]">
        <h2>{title}</h2>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            featured ? 'bg-[#0B7CFF] text-white shadow-sm' : 'bg-blue-50 text-[#0B7CFF]'
          }`}
        >
          <Icon size={14} aria-hidden="true" />
        </span>
      </div>

      <div className="my-3">
        <p className={`text-2xl font-black tracking-tight ${featured ? 'text-[#0B7CFF]' : 'text-[#232528]'}`}>
          {value}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp size={13} aria-hidden="true" />
          <span>{change}</span>
          <span className="ml-0.5 text-[11px] font-normal text-[#364964]">
            지난 기간 대비
          </span>
        </p>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${title} 진행률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-[#0B7CFF]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  )
}

export default KpiCard
