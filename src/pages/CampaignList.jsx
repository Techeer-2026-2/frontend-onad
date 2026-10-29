import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import CampaignTable from '../components/CampaignTable'
import { getCampaigns } from '../api/campaigns'

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

function CampaignList() {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getCampaigns({ signal: controller.signal })
      .then((response) => {
        if (!Array.isArray(response)) {
          throw new Error('캠페인 목록 응답 형식이 올바르지 않습니다.')
        }
        setCampaigns(response.map((campaign) => ({
          ...campaign,
          id: campaign.campaignId,
          name: campaign.title,
          targetAudience: formatTargetAudience(campaign.targetAgeGroups, campaign.targetGenders),
          period: formatCampaignPeriod(campaign.startAt, campaign.endAt),
        })))
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setErrorMessage(error.message || '캠페인 목록을 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [retryCount])

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
        description="캠페인별 운영 상태와 타겟 연령, 운영 기간을 확인할 수 있습니다."
        showAllLink={false}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRetry={() => {
          setIsLoading(true)
          setErrorMessage('')
          setRetryCount((count) => count + 1)
        }}
      />
    </div>
  )
}

export default CampaignList
