import { useEffect, useState } from 'react'
import {
  Coins,
  Eye,
  Megaphone,
  MousePointerClick,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CampaignSelect from '../components/CampaignSelect'
import CampaignPerformanceTrend from '../components/CampaignPerformanceTrend'
import CampaignTable from '../components/CampaignTable'
import KpiCard from '../components/kpiCard'
import { getCampaigns } from '../api/campaigns'

function remainingBudgetMetric(campaign) {
  const budget = toNonnegativeNumber(campaign?.totalBudget)
  const spent = toNonnegativeNumber(campaign?.spentTotal)
  const card = { label: '남은 예산', icon: Coins, tone: 'pink' }

  if (budget === null || budget === 0) {
    return { ...card, value: '—', caption: '예산 미설정' }
  }
  if (spent === null) {
    return { ...card, value: '—', caption: '집행액 미집계' }
  }

  const remaining = Math.max(0, budget - spent)
  const usageRate = toNonnegativeNumber(campaign.budgetUsageRate) ?? spent / budget * 100
  return {
    ...card,
    value: `₩${remaining.toLocaleString('ko-KR')}`,
    caption: `예산 소진율 ${usageRate.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`,
    progress: Math.min(usageRate, 100),
  }
}

function formatTargetAudience(ageGroups, genders) {
  const ages = Array.isArray(ageGroups)
    ? ageGroups.includes('all') ? ['전체 연령'] : ageGroups.map((value) => value.replace(/^(\d+)s$/, '$1대'))
    : []
  const gendersLabel = Array.isArray(genders)
    ? genders.includes('all') ? ['전체 성별'] : genders.map((value) => ({ male: '남성', female: '여성' })[value] || value)
    : []
  return [...ages, ...(gendersLabel.length ? [`(${gendersLabel.join(', ')})`] : [])].join(' ') || '—'
}

function formatCampaignPeriod(startAt, endAt) {
  const format = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ko-KR')
  }
  return `${format(startAt)} ~ ${format(endAt)}`
}

function toNonnegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function mapDashboardCampaign(campaign) {
  const sent = toNonnegativeNumber(campaign.impressionCount)
  const clicks = toNonnegativeNumber(campaign.clickCount)
  if (campaign.campaignId == null || sent === null || clicks === null) {
    throw new Error('캠페인 목록 응답이 올바르지 않습니다.')
  }
  return {
    ...campaign,
    id: campaign.campaignId,
    name: campaign.title,
    targetAudience: formatTargetAudience(campaign.targetAgeGroups, campaign.targetGenders),
    period: formatCampaignPeriod(campaign.startAt, campaign.endAt),
    sent,
    clicks,
    ctr: sent > 0 ? clicks / sent * 100 : 0,
  }
}

function Dashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getCampaigns({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        if (!Array.isArray(response)) throw new Error('캠페인 목록 응답 형식이 올바르지 않습니다.')
        setCampaigns(response.map(mapDashboardCampaign))
        setErrorMessage('')
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'AbortError') return
        setCampaigns([])
        setErrorMessage(error.message || '대시보드 데이터를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [retryCount])

  const isOngoing = (campaign) => campaign.status === 'ONGOING'
  // 기본 선택: 진행 중인 첫 캠페인 → 없으면 첫 캠페인
  const defaultCampaign = campaigns.find(isOngoing) ?? campaigns[0]
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? defaultCampaign
  const campaignOptions = campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))

  const activeCampaignCount = campaigns.filter(isOngoing).length
  const recentCampaigns = campaigns.slice(0, 10)
  const metrics = [
    { label: '누적 노출 수', value: selectedCampaign?.sent.toLocaleString('ko-KR') ?? '—', icon: Eye, tone: 'lavender' },
    { label: '누적 클릭수', value: selectedCampaign?.clicks.toLocaleString('ko-KR') ?? '—', icon: MousePointerClick, tone: 'dark' },
    remainingBudgetMetric(selectedCampaign),
    { label: '진행 중인 캠페인', value: activeCampaignCount, icon: Megaphone, tone: 'purple', to: '/campaigns' },
  ]


  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 text-[30px] font-extrabold tracking-tight text-[#111827]">안녕하세요, 광고주님!</h2>
          <p className="text-sm text-gray-500">캠페인별 누적 광고 성과를 확인해보세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedCampaign && (
            <CampaignSelect options={campaignOptions} value={selectedCampaign.id} onChange={setSelectedCampaignId} />
          )}
          <Link to="/campaigns/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-onad-purple px-5 text-sm font-bold text-white shadow-lg shadow-onad-purple/25 transition hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple">
            <Plus size={17} aria-hidden="true" /> 새 캠페인 등록
          </Link>
        </div>
      </section>

      <section className="mb-10" aria-label="주요 광고 지표">
        {isLoading ? (
          <p role="status" className="rounded-xl border bg-white p-5 text-sm text-[#667085]">광고 성과를 불러오는 중입니다…</p>
        ) : errorMessage ? (
          <div className="rounded-xl border bg-white p-5 text-sm" role="alert">
            <p className="text-rose-600">{errorMessage}</p>
            <button type="button" className="mt-3 rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => { setIsLoading(true); setErrorMessage(''); setRetryCount((n) => n + 1) }}>다시 시도</button>
          </div>
        ) : !selectedCampaign ? (
          <p role="status" className="rounded-xl border bg-white p-5 text-sm text-[#667085]">등록된 캠페인이 없어요.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => <KpiCard key={metric.tone} {...metric} />)}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8">
        {selectedCampaign && <CampaignPerformanceTrend campaign={selectedCampaign} />}

        <CampaignTable
          campaigns={recentCampaigns}
          title="최근 캠페인 상태"
          hideDescription
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => { setIsLoading(true); setErrorMessage(''); setRetryCount((n) => n + 1) }}
          dashboard
          sortable
        />
      </div>
    </div>
  )
}

export default Dashboard
