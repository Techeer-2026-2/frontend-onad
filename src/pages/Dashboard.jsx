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
import { mockDashboardChartSeries } from '../mock/dashboard'

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

export function TrendChart({ granularity, series = mockDashboardChartSeries[granularity] }) {
  const { labels, impressions, clicks } = series
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const width = 760
  const height = 290
  const left = 24
  const right = 24
  const top = 18
  const bottom = 45
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const maxImpressions = Math.ceil(Math.max(...impressions) / 1000) * 1000
  const maxClicks = Math.max(...clicks)
  const step = chartWidth / labels.length
  const barWidth = Math.min(46, step * 0.34)
  const clickPoints = clicks.map((value, index) => {
    const x = left + step * index + step / 2
    const y = top + chartHeight - (value / maxClicks) * chartHeight * 0.72 - chartHeight * 0.1
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${granularity === 'hour' ? '시간' : granularity === 'day' ? '일' : '주'} 단위 노출 및 클릭 추이 샘플 차트`}
        className="h-96 w-full"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <line x1={left} x2={width - right} y1={top + chartHeight} y2={top + chartHeight} stroke="#E8E6F2" />

        {impressions.map((value, index) => {
          const x = left + step * index + (step - barWidth) / 2
          const barHeight = (value / maxImpressions) * chartHeight
          return (
            <rect
              key={labels[index]}
              x={x}
              y={top + chartHeight - barHeight}
              width={barWidth}
              height={barHeight}
              rx="8"
              fill="#6C48F5"
              opacity="0.95"
            />
          )
        })}
        <polyline points={clickPoints} fill="none" stroke="#2A2C41" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {clicks.map((value, index) => {
          const x = left + step * index + step / 2
          const y = top + chartHeight - (value / maxClicks) * chartHeight * 0.72 - chartHeight * 0.1
          return <circle key={`click-${labels[index]}`} cx={x} cy={y} r="3" fill="#2A2C41" stroke="#2A2C41" strokeWidth="3" />
        })}
        {labels.map((label, index) => (
          <rect
            key={`hit-${label}`}
            x={left + step * index}
            y={top}
            width={step}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
          />
        ))}
        {hoveredIndex !== null && (() => {
          const tooltipWidth = 132
          const tooltipHeight = 68
          const centerX = left + step * hoveredIndex + step / 2
          const tooltipX = Math.min(Math.max(centerX - tooltipWidth / 2, left), width - right - tooltipWidth)
          const tooltipY = top + 8
          return (
            <g pointerEvents="none">
              <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="10" fill="white" stroke="#E8E6F2" />
              <text x={tooltipX + 12} y={tooltipY + 18} fill="#2A2C41" fontSize="10" fontWeight="700">{labels[hoveredIndex]}</text>
              <circle cx={tooltipX + 16} cy={tooltipY + 35} r="3" fill="#6C48F5" />
              <text x={tooltipX + 24} y={tooltipY + 39} fill="#6F6C80" fontSize="10">노출 {impressions[hoveredIndex].toLocaleString()}</text>
              <circle cx={tooltipX + 16} cy={tooltipY + 53} r="3" fill="#2A2C41" />
              <text x={tooltipX + 24} y={tooltipY + 57} fill="#6F6C80" fontSize="10">클릭 {clicks[hoveredIndex].toLocaleString()}</text>
            </g>
          )
        })()}
        {labels.map((label, index) => (
          <text key={label} x={left + step * index + step / 2} y={height - 14} textAnchor="middle" fill="#9A97A7" fontSize="11">
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
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
    { label: '남은 예산', value: '—', caption: '예산 정보 없음', icon: Coins, tone: 'pink' },
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
      />
      </div>
    </div>
  )
}

export default Dashboard
