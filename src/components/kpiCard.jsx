import { TrendingUp } from 'lucide-react'

function KpiCard({ title, value, change, Icon, featured = false }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[#E5E5E5] bg-white px-5 py-3.5 shadow-sm transition-colors hover:border-[#0B7CFF]/50">
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
        {change && (
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp size={13} aria-hidden="true" />
            <span>지난 기간 대비 {change}</span>
          </p>
        )}
      </div>
    </article>
  )
}

export default KpiCard
