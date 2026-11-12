import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ChartLine,
  ChevronDown,
  Coins,
  Eye,
  Megaphone,
  MousePointerClick,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CampaignSelect from '../components/CampaignSelect'
import CampaignTable from '../components/CampaignTable'
import KpiCard from '../components/kpiCard'
import { getCampaigns } from '../api/campaigns'
import { mockDashboardChartSeries, mockDashboardDatePresets } from '../mock/dashboard'

function remainingBudgetMetric(campaign) {
  const budget = toNonnegativeNumber(campaign?.budget)
  const spent = toNonnegativeNumber(campaign?.spentAmount)
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

const presetOptions = [
  ['30days', '이번 달'],
  ['yesterday', '어제'],
  ['7days', '최근 7일'],
  ['custom', '직접 설정'],
]

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
  const [selectedPreset, setSelectedPreset] = useState('7days')
  const [dateInputs, setDateInputs] = useState({ start: '2026-09-01', end: '2026-09-26' })
  const [showCustomDates, setShowCustomDates] = useState(false)
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false)
  const [dateError, setDateError] = useState('')
  const [granularity, setGranularity] = useState('day')
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


  const applyPreset = (preset) => {
    setSelectedPreset(preset)
    setDateInputs({ start: mockDashboardDatePresets[preset].start, end: mockDashboardDatePresets[preset].end })
    setDateError('')
  }

  const applyCustomDates = () => {
    const { start, end } = dateInputs
    if (!start || !end) {
      setDateError('시작일과 종료일을 모두 선택해 주세요.')
      return
    }
    if (start > end) {
      setDateError('종료일은 시작일과 같거나 이후여야 합니다.')
      return
    }

    setSelectedPreset('custom')
    setDateError('')
    setShowCustomDates(false)
  }

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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isPresetMenuOpen}
              className="inline-flex min-h-11 min-w-44 items-center justify-between gap-5 rounded-xl border border-[#E4E1F0] bg-white px-4 text-sm font-semibold text-onad-dark shadow-sm transition hover:border-[#CFC4FF] hover:bg-[#FCFBFF] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple"
            >
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#7C6DB9]" aria-hidden="true" />
                {presetOptions.find(([value]) => value === selectedPreset)?.[1] || '기간 설정'}
              </span>
              <ChevronDown size={16} className={`text-[#7C6DB9] transition-transform ${isPresetMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {isPresetMenuOpen && (
              <div role="menu" aria-label="분석 기간 선택" className="absolute right-0 z-20 mt-2 w-full min-w-52 overflow-hidden rounded-xl border border-[#E4E1F0] bg-white p-1.5 shadow-xl shadow-[#342B68]/10">
                {presetOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsPresetMenuOpen(false)
                      if (value === 'custom') {
                        setSelectedPreset('custom')
                        setShowCustomDates(true)
                        setDateError('')
                        return
                      }
                      applyPreset(value)
                      setShowCustomDates(false)
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${selectedPreset === value ? 'bg-[#F0ECFF] text-onad-purplele' : 'text-[#4B485C] hover:bg-[#F7F5FF] hover:text-onad-purple'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/campaigns/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-onad-purple px-5 text-sm font-bold text-white shadow-lg shadow-onad-purple/25 transition hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple">
            <Plus size={17} aria-hidden="true" /> 새 캠페인 등록
          </Link>
        </div>
      </section>

      {showCustomDates && (
        <section className="mb-10 space-y-4 rounded-2xl border border-[#DED9FA] bg-white p-5 shadow-lg shadow-onad-purple/5" aria-labelledby="custom-date-title">
          <h2 id="custom-date-title" className="text-sm font-bold text-onad-dark">
            분석 시작일 및 종료일 지정
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-[#5D5A6E]" htmlFor="start-date-input">
              시작일
              <input
                id="start-date-input"
                type="date"
                value={dateInputs.start}
                onChange={(event) => setDateInputs((current) => ({ ...current, start: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-onad-purple focus:ring-2 focus:ring-onad-purple/1010"
              />
            </label>
            <label className="text-xs font-medium text-[#5D5A6E]" htmlFor="end-date-input">
              종료일
              <input
                id="end-date-input"
                type="date"
                value={dateInputs.end}
                onChange={(event) => setDateInputs((current) => ({ ...current, end: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-onad-purple focus:ring-2 focus:ring-onad-purple/1010"
              />
            </label>
          </div>
          {dateError && <p className="text-xs text-red-600" role="alert">{dateError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCustomDates(false)} className="rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-xs text-[#5D5A6E] hover:bg-[#F7F7FB]">
              취소
            </button>
            <button type="button" onClick={applyCustomDates} className="rounded-lg bg-onad-purple px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5839DB]">
              기간 적용
            </button>
          </div>
        </section>
      )}

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
      <section className="space-y-4 rounded-4xl border border-[#ECEAF5] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] md:p-6" aria-labelledby="trend-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 id="trend-title" className="text-xl font-extrabold tracking-tight text-onad-dark">
              캠페인 성과 추이
            </h2>
            {selectedCampaign && <p className="mt-1 text-xs text-[#858296]">{selectedCampaign.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex self-start rounded-lg border border-[#E8E6F2] bg-[#F7F7FB] p-0.5 text-xs font-medium sm:self-auto" role="group" aria-label="차트 시간 단위">
              {[
                ['hour', '시간'],
                ['day', '일'],
                ['week', '주'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGranularity(value)}
                  aria-pressed={granularity === value}
                  className={`rounded-md px-3 py-1 ${granularity === value ? 'bg-white font-bold text-onad-purple shadow-sm' : 'text-[#6F6C80] hover:text-onad-dark'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7FB] text-[#A3A0AF]">
              <ChartLine size={19} aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-[#6F6C80]" aria-hidden="true">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-onad-purple" />노출 수</span>
          <span className="flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-[#2A2C41]" />클릭 수</span>
        </div>
        <p className="flex h-96 items-center justify-center rounded-2xl bg-[#F7F7FB] text-sm text-[#858296]">기간별 성과 데이터는 연동 준비 중입니다.</p>
      </section>

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
