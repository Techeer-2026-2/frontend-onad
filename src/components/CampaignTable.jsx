import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function CampaignTable({
  campaigns = [],
  title = '최근 운영 캠페인 현황',
  description = 'ONAD 광고 캠페인 성과 요약 (샘플 데이터)',
  showAllLink = true,
  isLoading = false,
  errorMessage = '',
  onRetry,
  pagination,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] p-5">
        <div>
          <h2 className="text-base font-bold text-[#232528]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#364964]">{description}</p>
        </div>
        {pagination ? (
          <label className="flex items-center gap-2 text-xs text-[#667085]">
            표시 개수
            <select
              value={pagination.pageSize}
              disabled={isLoading}
              onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-[#D0D5DD] bg-white px-2 py-2 text-[#344054] disabled:opacity-50"
            >
              {[20, 50, 100].map((size) => <option key={size} value={size}>{size}개</option>)}
            </select>
          </label>
        ) : showAllLink && (
          <Link
            to="/campaigns"
            className="flex items-center gap-1 text-xs font-semibold text-[#0B7CFF] hover:underline"
          >
            <span>전체 캠페인 보기</span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-220 text-left text-xs text-[#232528]">
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
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#667085]" role="status">
                  캠페인 목록을 불러오는 중입니다…
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p role="alert" className="text-sm text-rose-600">{errorMessage}</p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-3 rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#344054] hover:bg-gray-50"
                    >
                      다시 시도
                    </button>
                  )}
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#667085]">
                  등록된 캠페인이 없습니다.
                </td>
              </tr>
            ) : campaigns.map((campaign) => {
              const active = campaign.status === 'active' || campaign.status === 'ONGOING'
              const pending = campaign.status === 'pending' || campaign.status === 'PENDING'
              const statusLabel = active ? '진행중' : pending ? '예약 대기' : campaign.status === 'ENDED' ? '종료' : campaign.status
              const statusClass = active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : pending
                  ? 'border-blue-200 bg-blue-50 text-[#0B7CFF]'
                  : 'border-slate-200 bg-slate-50 text-[#667085]'

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
                    {Number.isFinite(campaign.sent) ? campaign.sent.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Number.isFinite(campaign.clicks) ? campaign.clicks.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0B7CFF]">
                    {Number.isFinite(campaign.ctr) ? `${campaign.ctr.toFixed(1)}%` : '—'}
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

      {pagination && (
        <nav aria-label="전체 캠페인 페이지" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5E5] px-5 py-4">
          <p className="text-xs text-[#667085]" aria-live="polite">
            {isLoading ? '조회 중…' : errorMessage ? '조회 실패' : `총 ${pagination.totalElements.toLocaleString('ko-KR')}건`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={isLoading || pagination.page === 0}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#344054] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={15} aria-hidden="true" /> 이전
            </button>
            <span className="text-xs text-[#344054]">
              {pagination.totalPages === 0 ? '0 / 0' : `${pagination.page + 1} / ${pagination.totalPages}`}
            </span>
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={isLoading || pagination.page + 1 >= pagination.totalPages}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#344054] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음 <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </section>
  )
}

export default CampaignTable
