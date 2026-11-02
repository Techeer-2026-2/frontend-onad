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
  compact = false,
  hideDescription = false,
  dashboard = false,
  management = false,
  hideHeader = false,
}) {
  return (
    <section className={`overflow-hidden rounded-[2rem] border border-[#ECEAF5] bg-white transition-shadow duration-300 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ${compact ? 'flex h-full flex-col' : ''} ${management ? 'flex flex-col' : ''}`}>
      {!hideHeader && <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EFF7] ${compact ? 'px-8 py-7' : 'px-5 py-5 md:px-7'}`}>
        <div>
          <h2 className={`${compact ? 'text-lg' : dashboard ? 'text-xl' : 'text-base'} font-bold tracking-tight text-[#2A2C41]`}>{title}</h2>
          {!compact && !hideDescription && <p className="mt-1 text-xs text-[#858296]">{description}</p>}
        </div>
        {pagination ? (
          <label className="flex items-center gap-2 text-xs text-[#667085]">
            표시 개수
            <select
              value={pagination.pageSize}
              disabled={isLoading}
              onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-[#E4E1F0] bg-white px-2 py-2 text-[#5D5A6E] outline-none focus:border-[#6C48F5] disabled:opacity-50"
            >
              {[20, 50, 100].map((size) => <option key={size} value={size}>{size}개</option>)}
            </select>
          </label>
        ) : showAllLink && (
          <Link
            to="/campaigns"
            className={`flex items-center gap-1 font-semibold text-[#6C48F5] hover:underline ${dashboard ? 'text-sm' : 'text-xs'}`}
          >
            <span>{compact ? 'View All Campaigns' : '전체 캠페인 보기'}</span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>}

      <div className={`${compact ? 'flex-1 overflow-x-auto px-8 pb-6' : management ? 'overflow-x-auto' : 'overflow-x-auto'}`}>
        <table className={`w-full text-left ${management ? 'text-base' : dashboard ? 'text-[15px]' : 'text-xs'} text-[#2A2C41] ${compact ? 'min-w-0' : 'min-w-220'}`}>
          <thead className={`border-b border-[#F0EFF7] ${dashboard ? 'bg-white text-sm text-[#9CA3AF]' : 'bg-[#FAFAFD] text-[#8C8A9E]'} font-semibold uppercase tracking-wide`}>
            {management ? <tr>
              <th scope="col" className="px-5 py-5">상태</th>
              <th scope="col" className="px-5 py-5">캠페인명</th>
              <th scope="col" className="px-5 py-5 text-right">노출수</th>
              <th scope="col" className="px-5 py-5 text-right">클릭수</th>
              <th scope="col" className="px-5 py-5 text-right">CTR</th>
              <th scope="col" className="px-5 py-5">운영 기간</th>
              <th scope="col" className="px-5 py-5 text-center">관리</th>
            </tr> : <tr>
              <th scope="col" className={`${compact ? 'px-2 py-3' : 'px-4 py-3'}`}>캠페인명 {compact && '(CAMPAIGN)'}</th>
              <th scope="col" className={`${compact ? 'px-2 py-3 text-center' : 'px-4 py-3'}`}>상태 {compact && '(STATUS)'}</th>
              <th scope="col" className={compact ? 'hidden' : 'px-4 py-3'}>타겟 조건</th>
              <th scope="col" className={`${compact ? 'px-2 py-3 text-right' : 'px-4 py-3 text-right'}`}>{compact ? '노출수 (IMPR.)' : '발송(노출) 수'}</th>
              <th scope="col" className={compact ? 'hidden' : 'px-4 py-3 text-right'}>클릭 수</th>
              <th scope="col" className={compact ? 'hidden' : 'px-4 py-3 text-right'}>CTR</th>
              <th scope="col" className={compact ? 'hidden' : 'px-4 py-3'}>운영 기간</th>
              <th scope="col" className={compact ? 'hidden' : 'px-4 py-3 text-center'}>관리</th>
            </tr>}
          </thead>
          <tbody className="divide-y divide-[#F0EFF7]">
            {isLoading ? (
              <tr>
                  <td colSpan={compact ? 3 : management ? 7 : 8} className="px-4 py-12 text-center text-sm text-[#667085]" role="status">
                  캠페인 목록을 불러오는 중입니다…
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td colSpan={compact ? 3 : management ? 7 : 8} className="px-4 py-12 text-center">
                  <p role="alert" className="text-sm text-rose-600">{errorMessage}</p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-3 rounded-lg border border-[#E4E1F0] px-3 py-2 text-xs font-semibold text-[#5D5A6E] hover:bg-[#F7F6FC]"
                    >
                      다시 시도
                    </button>
                  )}
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={compact ? 3 : management ? 7 : 8} className="px-4 py-12 text-center text-sm text-[#667085]">
                  등록된 캠페인이 없습니다.
                </td>
              </tr>
            ) : campaigns.map((campaign) => {
              const active = campaign.status === 'active' || campaign.status === 'ONGOING'
              const pending = campaign.status === 'pending' || campaign.status === 'PENDING'
              const ended = campaign.status === 'ended' || campaign.status === 'ENDED'
              const statusLabel = active ? '진행중' : pending ? '예약 대기' : campaign.status === 'ENDED' ? '종료' : campaign.status
              const statusClass = active
                ? 'bg-[#FFF0F3] text-[#FF6B8B]'
                : pending
                  ? 'bg-[#DCFCE7] text-[#16A34A]'
                  : 'bg-[#F1F3F5] text-[#9AA3B2]'

              if (management) {
                return (
                  <tr key={campaign.id} className={`transition-colors hover:bg-[#FAF9FF] ${ended ? 'text-[#9AA3B2]' : ''}`}>
                    <td className="px-5 py-6"><span className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-bold ${statusClass}`}>{statusLabel}</span></td>
                    <td className="px-5 py-6 font-bold"><Link to={`/campaigns/${campaign.id}`} className={ended ? 'text-[#9AA3B2]' : 'hover:text-[#6C48F5]'}>{campaign.name}</Link></td>
                    <td className="px-5 py-6 text-right font-mono">{Number.isFinite(campaign.sent) ? campaign.sent.toLocaleString() : '—'}</td>
                    <td className="px-5 py-6 text-right font-mono">{Number.isFinite(campaign.clicks) ? campaign.clicks.toLocaleString() : '—'}</td>
                    <td className={`px-5 py-6 text-right font-bold ${ended ? 'text-[#9AA3B2]' : 'text-[#6C48F5]'}`}>{Number.isFinite(campaign.ctr) ? `${campaign.ctr.toFixed(1)}%` : '—'}</td>
                    <td className={`whitespace-nowrap px-5 py-6 text-sm ${ended ? 'text-[#9AA3B2]' : 'text-[#858296]'}`}>{campaign.period}</td>
                    <td className="px-5 py-6 text-center"><Link to={`/campaigns/${campaign.id}`} className={`whitespace-nowrap text-sm font-bold hover:underline ${ended ? 'text-[#9AA3B2]' : 'text-[#6C48F5]'}`}>{ended ? '결과보고서' : '상세보기'}</Link></td>
                  </tr>
                )
              }

              return (
                <tr key={campaign.id} className="transition-colors hover:bg-[#FAF9FF]">
                  <td className={`${compact ? 'max-w-55 px-2 py-4 text-sm font-bold' : dashboard ? 'px-4 py-4 font-bold' : 'px-4 py-3 font-bold'}`}>
                    <Link to={`/campaigns/${campaign.id}`} className={`hover:text-[#6C48F5] ${compact || dashboard ? 'text-[#6C48F5]' : ''}`}>
                      {campaign.name}
                    </Link>
                  </td>
                  <td className={`${compact ? 'px-2 py-4 text-center' : dashboard ? 'px-4 py-4' : 'px-4 py-3'}`}>
                    <span className={`whitespace-nowrap rounded-md px-2.5 py-1 font-bold ${dashboard ? 'text-sm' : 'text-xs'} ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className={`${compact ? 'hidden' : dashboard ? 'whitespace-nowrap px-4 py-4 text-[#5D5A6E]' : 'whitespace-nowrap px-4 py-3 text-[#5D5A6E]'}`}>
                    {campaign.targetAudience}
                  </td>
                  <td className={`${compact ? 'px-2 py-4 text-right text-sm font-medium' : dashboard ? 'px-4 py-4 text-right font-mono' : 'px-4 py-3 text-right font-mono'}`}>
                    {Number.isFinite(campaign.sent) ? campaign.sent.toLocaleString() : '—'}
                  </td>
                  <td className={compact ? 'hidden' : dashboard ? 'px-4 py-4 text-right font-mono' : 'px-4 py-3 text-right font-mono'}>
                    {Number.isFinite(campaign.clicks) ? campaign.clicks.toLocaleString() : '—'}
                  </td>
                  <td className={compact ? 'hidden' : dashboard ? 'px-4 py-4 text-right font-bold text-[#6C48F5]' : 'px-4 py-3 text-right font-bold text-[#6C48F5]'}>
                    {Number.isFinite(campaign.ctr) ? `${campaign.ctr.toFixed(1)}%` : '—'}
                  </td>
                  <td className={compact ? 'hidden' : dashboard ? 'whitespace-nowrap px-4 py-4 text-sm text-[#858296]' : 'whitespace-nowrap px-4 py-3 text-[11px] text-[#858296]'}>
                    {campaign.period}
                  </td>
                  <td className={compact ? 'hidden' : dashboard ? 'px-4 py-4 text-center' : 'px-4 py-3 text-center'}>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className={`whitespace-nowrap font-bold hover:underline ${ended ? 'text-[#9AA3B2]' : 'text-[#6C48F5]'} ${dashboard ? 'text-sm' : 'text-xs'}`}
                    >
                      {ended ? '결과보고서' : '상세'}
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && management ? (
        <nav aria-label="전체 캠페인 페이지" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EFF7] px-7 py-5">
          <p className="text-sm text-[#7D8796]" aria-live="polite">
            {isLoading ? '조회 중…' : errorMessage ? '조회 실패' : `총 ${pagination.totalElements.toLocaleString('ko-KR')}개 중 ${pagination.totalElements === 0 ? 0 : pagination.page * pagination.pageSize + 1}-${Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)}`}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="이전 페이지" onClick={() => pagination.onPageChange(pagination.page - 1)} disabled={isLoading || pagination.page === 0} className="flex h-9 w-7 items-center justify-center text-[#758194] transition hover:text-[#6C48F5] disabled:opacity-40"><ChevronLeft size={20} aria-hidden="true" /></button>
            {Array.from({ length: Math.min(3, Math.max(1, pagination.totalPages)) }, (_, index) => (
              <button key={index} type="button" onClick={() => pagination.onPageChange(index)} disabled={isLoading} aria-current={pagination.page === index ? 'page' : undefined} className={`flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${pagination.page === index ? 'bg-[#6C48F5] text-white shadow-sm shadow-[#6C48F5]/25' : 'text-[#758194] hover:bg-[#F5F3FF] hover:text-[#6C48F5]'}`}>{index + 1}</button>
            ))}
            <button type="button" aria-label="다음 페이지" onClick={() => pagination.onPageChange(pagination.page + 1)} disabled={isLoading || pagination.page + 1 >= pagination.totalPages} className="flex h-9 w-7 items-center justify-center text-[#758194] transition hover:text-[#6C48F5] disabled:opacity-40"><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
        </nav>
      ) : pagination && (
        <nav aria-label="전체 캠페인 페이지" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EFF7] px-5 py-4 md:px-7">
          <p className="text-xs text-[#858296]" aria-live="polite">
            {isLoading ? '조회 중…' : errorMessage ? '조회 실패' : `총 ${pagination.totalElements.toLocaleString('ko-KR')}건`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={isLoading || pagination.page === 0}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#E4E1F0] px-3 text-xs font-semibold text-[#5D5A6E] hover:bg-[#F7F6FC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={15} aria-hidden="true" /> 이전
            </button>
            <span className="text-xs text-[#5D5A6E]">
              {pagination.totalPages === 0 ? '0 / 0' : `${pagination.page + 1} / ${pagination.totalPages}`}
            </span>
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={isLoading || pagination.page + 1 >= pagination.totalPages}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#E4E1F0] px-3 text-xs font-semibold text-[#5D5A6E] hover:bg-[#F7F6FC] disabled:cursor-not-allowed disabled:opacity-50"
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
