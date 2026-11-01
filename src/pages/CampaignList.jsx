import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import CampaignHistoryPanel from '../components/CampaignHistoryPanel'
import CampaignTable from '../components/CampaignTable'
import { getCampaigns } from '../api/campaigns'
import { mockCampaigns } from '../data/campaigns'

function formatTargetAudience(ageGroups, genders) {
  const ages = Array.isArray(ageGroups)
    ? ageGroups.includes('all') ? ['전체 연령'] : ageGroups.map((value) => value.replace(/^(\d+)s$/, '$1대'))
    : []
  const genderLabels = Array.isArray(genders)
    ? genders.includes('all') ? ['전체 성별'] : genders.map((value) => ({ male: '남성', female: '여성' }[value] || value))
    : []
  return [...ages, ...(genderLabels.length ? [`(${genderLabels.join(', ')})`] : [])].join(' ') || '—'
}

function formatCampaignPeriod(startAt, endAt) {
  const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ko-KR')
  }

  return `${formatDate(startAt)} ~ ${formatDate(endAt)}`
}

function AllCampaignsPanel() {
  const [campaigns, setCampaigns] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getCampaigns({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        if (!Array.isArray(response)) {
          throw new Error('캠페인 목록 응답 형식이 올바르지 않습니다.')
        }
        setCampaigns(response.map((campaign) => ({
          ...campaign,
          id: campaign.campaignId,
          sent: campaign.impressionCount,
          clicks: campaign.clickCount,
          ctr: campaign.impressionCount > 0 ? (campaign.clickCount / campaign.impressionCount) * 100 : null,
          name: campaign.title,
          targetAudience: formatTargetAudience(campaign.targetAgeGroups, campaign.targetGenders),
          period: formatCampaignPeriod(campaign.startAt, campaign.endAt),
        })))
        setPage(0)
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'AbortError') {
          setErrorMessage(error.message || '캠페인 목록을 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [retryCount])

  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns
  const filteredCampaigns = displayCampaigns.filter((campaign) => {
    const normalizedStatus = campaign.status === 'ONGOING' || campaign.status === 'active' ? 'ongoing'
      : campaign.status === 'ENDED' || campaign.status === 'ended' ? 'ended' : 'pending'
    return (statusFilter === 'all' || normalizedStatus === statusFilter)
      && campaign.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  })
  const totalPages = Math.ceil(filteredCampaigns.length / pageSize)
  const visibleCampaigns = filteredCampaigns.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="inline-flex w-fit rounded-xl bg-[#F4F4F6] p-1.5 text-sm font-semibold">
          {[
            ['all', '전체 캠페인'],
            ['ongoing', '진행중'],
            ['ended', '종료됨'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setStatusFilter(value); setPage(0) }}
              className={`rounded-lg px-5 py-2.5 transition ${statusFilter === value ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#858296] hover:text-[#2A2C41]'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#E8E6F2] bg-white px-4 text-[#9A97A7] sm:w-[34rem]">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">캠페인명 검색</span>
          <input
            value={searchTerm}
            onChange={(event) => { setSearchTerm(event.target.value); setPage(0) }}
            placeholder="캠페인명 검색..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#2A2C41] outline-none placeholder:text-[#B0ADBC]"
          />
        </label>
      </div>
      <CampaignTable
      campaigns={visibleCampaigns}
      title=""
      hideDescription
      showAllLink={false}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={() => {
        setIsLoading(true)
        setErrorMessage('')
        setRetryCount((count) => count + 1)
      }}
      pagination={{
        page,
        pageSize,
        totalElements: filteredCampaigns.length,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size)
          setPage(0)
        },
      }}
      management
      hideHeader
    />
    </div>
  )
}

function CampaignList() {
  const [searchParams] = useSearchParams()
  const showHistory = searchParams.get('tab') === 'history'

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">캠페인 관리</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            모든 광고 캠페인의 성과를 상세히 확인하고 관리하세요.
          </p>
        </div>
        <Link
          to="/campaigns/new"
          className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#6C48F5] px-7 py-2 text-sm font-bold text-white shadow-lg shadow-[#6C48F5]/25 transition-colors hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5] sm:mt-1 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          새 캠페인 등록
        </Link>
      </header>

      {showHistory ? <CampaignHistoryPanel /> : <AllCampaignsPanel />}
    </div>
  )
}

export default CampaignList
