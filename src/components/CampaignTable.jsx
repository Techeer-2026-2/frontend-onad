import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function CampaignTable({ campaigns }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] p-5">
        <div>
          <h2 className="text-base font-bold text-[#232528]">최근 운영 캠페인 현황</h2>
          <p className="mt-0.5 text-xs text-[#364964]">
            ONAD 광고 캠페인 성과 요약 (샘플 데이터)
          </p>
        </div>
        <Link
          to="/campaigns"
          className="flex items-center gap-1 text-xs font-semibold text-[#0B7CFF] hover:underline"
        >
          <span>전체 캠페인 보기</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-xs text-[#232528]">
          <thead className="border-b border-[#E5E5E5] bg-slate-50 font-semibold uppercase text-[#364964]">
            <tr>
              <th scope="col" className="px-4 py-3">캠페인명</th>
              <th scope="col" className="px-4 py-3">상태</th>
              <th scope="col" className="px-4 py-3">타겟 조건</th>
              <th scope="col" className="px-4 py-3 text-right">발송(노출) 수</th>
              <th scope="col" className="px-4 py-3 text-right">클릭 수</th>
              <th scope="col" className="px-4 py-3 text-right">CTR</th>
              <th scope="col" className="px-4 py-3">운영 기간</th>
              <th scope="col" className="px-4 py-3 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {campaigns.map((campaign) => {
              const active = campaign.status === 'active'
              const statusLabel = active ? '진행중' : '예약 대기'
              const statusClass = active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-blue-200 bg-blue-50 text-[#0B7CFF]'

              return (
                <tr key={campaign.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold">
                    <Link to={`/campaigns/${campaign.id}`} className="hover:text-[#0B7CFF]">
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#364964]">
                    {campaign.targetAudience}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {campaign.sent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {campaign.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0B7CFF]">
                    {campaign.ctr.toFixed(1)}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#364964]">
                    {campaign.period}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="whitespace-nowrap text-xs font-bold text-[#0B7CFF] hover:underline"
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CampaignTable
