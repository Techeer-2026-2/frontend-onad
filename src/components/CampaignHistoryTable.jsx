import { Link } from 'react-router-dom'

function formatAgeGroups(values) {
  if (!Array.isArray(values) || values.length === 0) return '—'
  if (values.includes('all')) return '전체 연령'
  return values.map((value) => value.replace(/^(\d+)s$/, '$1대')).join(', ')
}

function formatGenders(values) {
  if (!Array.isArray(values) || values.length === 0) return '—'
  if (values.includes('all')) return '전체 성별'
  return values.map((value) => ({ male: '남성', female: '여성' }[value] || value)).join(', ')
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatCount(value) {
  return Number.isFinite(value) ? value.toLocaleString('ko-KR') : '—'
}

function CampaignHistoryTable({ campaigns, isLoading, errorMessage, onRetry }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-220 text-left text-xs text-[#232528]">
        <caption className="sr-only">종료된 캠페인의 타겟 조건, 운영 기간 및 발송·클릭 성과</caption>
        <thead className="border-b border-[#E5E5E5] bg-slate-50 font-semibold text-[#364964]">
          <tr>
            <th scope="col" className="px-4 py-3">캠페인명</th>
            <th scope="col" className="px-4 py-3">타겟 조건</th>
            <th scope="col" className="px-4 py-3 text-right">발송(노출) 수</th>
            <th scope="col" className="px-4 py-3 text-right">클릭 수</th>
            <th scope="col" className="px-4 py-3 text-right">CTR</th>
            <th scope="col" className="px-4 py-3">운영 기간</th>
            <th scope="col" className="px-4 py-3">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5]">
          {isLoading ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#667085]" role="status">캠페인 이력을 불러오는 중입니다…</td></tr>
          ) : errorMessage ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center">
                <p role="alert" className="text-sm text-rose-600">{errorMessage}</p>
                <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#344054] hover:bg-gray-50">다시 시도</button>
              </td>
            </tr>
          ) : campaigns.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#667085]">종료된 캠페인이 없습니다.</td></tr>
          ) : campaigns.map((campaign) => (
            <tr key={campaign.campaignId} className="transition-colors hover:bg-slate-50/80">
              <td className="max-w-64 break-words px-4 py-3 font-bold">
                <Link to={'/campaigns/' + campaign.campaignId} className="hover:text-[#0B7CFF]">{campaign.title || '제목 없음'}</Link>
              </td>
              <td className="px-4 py-3 text-[#364964]">
                <span className="block">{formatAgeGroups(campaign.targetAgeGroups)}</span>
                <span className="mt-1 block text-[11px] text-[#667085]">{formatGenders(campaign.targetGenders)}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatCount(campaign.sentCount)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCount(campaign.clickCount)}</td>
              <td className="px-4 py-3 text-right font-bold text-[#0B7CFF]">{Number.isFinite(campaign.clickRate) ? (campaign.clickRate * 100).toFixed(1) + '%' : '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#364964]">
                <span className="block">{formatDateTime(campaign.startAt)}</span>
                <span className="mt-1 block">~ {formatDateTime(campaign.endAt)}</span>
              </td>
              <td className="px-4 py-3">
                <Link to={'/campaigns/' + campaign.campaignId} className="text-xs font-bold text-[#0B7CFF] hover:underline" aria-label={campaign.title + ' 상세 보기'}>상세</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CampaignHistoryTable
