import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import CampaignTable from '../components/CampaignTable'
import campaigns from '../data/campaigns'

function CampaignList() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7CFF]">
            ONAD ADVERTISER PORTAL
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#232528]">캠페인 관리</h1>
          <p className="mt-1 text-sm text-[#667085]">
            등록된 광고 캠페인의 상태와 성과를 확인하세요.
          </p>
        </div>
        <Link
          to="/campaigns/new"
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#0B7CFF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF] sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          캠페인 등록
        </Link>
      </header>

      <CampaignTable
        campaigns={campaigns}
        title="전체 캠페인"
        description="캠페인별 운영 상태와 성과를 확인할 수 있습니다. (샘플 데이터)"
        showAllLink={false}
      />
    </div>
  )
}

export default CampaignList
