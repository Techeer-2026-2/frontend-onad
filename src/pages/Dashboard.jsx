import { useEffect, useState } from 'react'
import {
  ChartLine,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CampaignTable from '../components/CampaignTable'
import KpiCard from '../components/kpiCard'
import { getCampaign, getCampaigns } from '../api/campaigns'
import { mockCampaigns } from '../data/campaigns'

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

function mapDashboardCampaign(campaign, detail) {
  const sent = toNonnegativeNumber(detail.impressionCount)
  const clicks = toNonnegativeNumber(detail.clickCount)
  if (sent === null || clicks === null) throw new Error('캠페인 상세 통계 응답이 올바르지 않습니다.')
  return {
    ...campaign,
    id: campaign.campaignId,
    name: campaign.title,
    targetAudience: formatTargetAudience(campaign.targetAgeGroups, campaign.targetGenders),
    period: formatCampaignPeriod(campaign.startAt, campaign.endAt),
    sent,
    clicks,
    ctr: sent !== null && clicks !== null ? (sent > 0 ? clicks / sent * 100 : 0) : null,
  }
}

const chartSeries = {
  hour: {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    impressions: [420, 680, 1450, 890, 920, 1680, 1100, 750],
    clicks: [45, 72, 185, 95, 98, 210, 130, 82],
  },
  day: {
    labels: ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26'],
    impressions: [1450, 1620, 1880, 1720, 1980, 2100, 2050],
    clicks: [210, 140, 165, 205, 215, 120, 150],
  },
  week: {
    labels: ['9월 1주차', '9월 2주차', '9월 3주차', '9월 4주차'],
    impressions: [8900, 11200, 12847, 10500],
    clicks: [820, 1050, 1203, 980],
  },
}

const datePresets = {
  yesterday: {
    label: '2026.09.25 (어제)',
    start: '2026-09-25',
    end: '2026-09-25',
  },
  '7days': {
    label: '2026.09.20 ~ 2026.09.26 (최근 7일)',
    start: '2026-09-20',
    end: '2026-09-26',
  },
  '30days': {
    label: '2026.08.28 ~ 2026.09.26 (최근 30일)',
    start: '2026-08-28',
    end: '2026-09-26',
  },
}

const presetOptions = [
  ['30days', '이번 달 (This month)'],
  ['yesterday', '어제'],
  ['7days', '최근 7일'],
  ['custom', '직접 설정'],
]

function formatDate(date) {
  return date.replaceAll('-', '.')
}

export function TrendChart({ granularity }) {
  const { labels, impressions, clicks } = chartSeries[granularity]
  const width = 760
  const height = 290
  const left = 24
  const right = 24
  const top = 18
  const bottom = 45
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const maxImpressions = Math.ceil(Math.max(...impressions) / 1000) * 1000
  const step = chartWidth / labels.length
  const barWidth = Math.min(46, step * 0.34)

  return (
    <div className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${granularity === 'hour' ? '시간' : granularity === 'day' ? '일' : '주'} 단위 노출 및 클릭 추이 샘플 차트`}
        className="h-96 w-full"
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
            >
              <title>{`${labels[index]} 노출 ${value.toLocaleString()}건 · 클릭 ${clicks[index].toLocaleString()}회`}</title>
            </rect>
          )
        })}
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
  const [dateLabel, setDateLabel] = useState(datePresets['7days'].label)
  const [dateInputs, setDateInputs] = useState({ start: '2026-09-01', end: '2026-09-26' })
  const [showCustomDates, setShowCustomDates] = useState(false)
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false)
  const [dateError, setDateError] = useState('')
  const [granularity, setGranularity] = useState('day')

  useEffect(() => {
    const controller = new AbortController()
    getCampaigns({ signal: controller.signal })
      .then(async (response) => {
        if (!Array.isArray(response)) throw new Error('캠페인 목록 응답 형식이 올바르지 않습니다.')
        // 각 캠페인의 노출/클릭은 목록이 아닌 상세 응답에서 제공됩니다.
        const details = []
        for (let index = 0; index < response.length; index += 5) {
          const batch = response.slice(index, index + 5)
          const results = await Promise.all(batch.map((campaign) => {
            if (campaign.campaignId == null) throw new Error('캠페인 ID가 누락되었습니다.')
            return getCampaign(campaign.campaignId, { signal: controller.signal })
          }))
          details.push(...results)
        }
        if (controller.signal.aborted) return
        setCampaigns(response.map((campaign, index) => mapDashboardCampaign(campaign, details[index])))
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

  const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.sent || 0), 0)
  const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0)
  const activeCampaignCount = campaigns.filter((campaign) => campaign.status === 'ONGOING' || campaign.status === 'active').length
  const recentCampaigns = campaigns.length > 0 ? campaigns.slice(0, 10) : mockCampaigns
  const metrics = [
    { label: '누적 노출 수', value: totalImpressions.toLocaleString('ko-KR'), tone: 'lavender' },
    { label: '누적 클릭수', value: totalClicks.toLocaleString('ko-KR'), tone: 'dark' },
    { label: '누적 CTR', value: `${totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(1) : '0.0'}%`, tone: 'pink' },
    { label: '진행 중인 캠페인', value: activeCampaignCount, tone: 'purple', to: '/campaigns' },
  ]


  const applyPreset = (preset) => {
    setSelectedPreset(preset)
    setDateLabel(datePresets[preset].label)
    setDateInputs({ start: datePresets[preset].start, end: datePresets[preset].end })
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
    setDateLabel(`${formatDate(start)} ~ ${formatDate(end)} (샘플 데이터)`)
    setDateError('')
    setShowCustomDates(false)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 text-[30px] font-extrabold tracking-tight text-[#111827]">안녕하세요, 광고주님!</h2>
          <p className="text-sm text-gray-500">이번 달 광고 성과 요약을 확인해보세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPresetMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isPresetMenuOpen}
              className="inline-flex min-h-11 min-w-44 items-center justify-between gap-5 rounded-xl border border-[#E4E1F0] bg-white px-4 text-sm font-semibold text-[#2A2C41] shadow-sm transition hover:border-[#CFC4FF] hover:bg-[#FCFBFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]"
            >
              <span>{presetOptions.find(([value]) => value === selectedPreset)?.[1] || '기간 설정'}</span>
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
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${selectedPreset === value ? 'bg-[#F0ECFF] text-[#6C48F5]' : 'text-[#4B485C] hover:bg-[#F7F5FF] hover:text-[#6C48F5]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/campaigns/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6C48F5] px-5 text-sm font-bold text-white shadow-lg shadow-[#6C48F5]/25 transition hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]">
            <Plus size={17} aria-hidden="true" /> 새 캠페인 등록
          </Link>
        </div>
      </section>

      {showCustomDates && (
        <section className="mb-10 space-y-4 rounded-2xl border border-[#DED9FA] bg-white p-5 shadow-lg shadow-[#6C48F5]/5" aria-labelledby="custom-date-title">
          <h2 id="custom-date-title" className="text-sm font-bold text-[#2A2C41]">
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
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/10"
              />
            </label>
            <label className="text-xs font-medium text-[#5D5A6E]" htmlFor="end-date-input">
              종료일
              <input
                id="end-date-input"
                type="date"
                value={dateInputs.end}
                onChange={(event) => setDateInputs((current) => ({ ...current, end: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E8E6F2] p-2.5 text-xs outline-none focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/10"
              />
            </label>
          </div>
          {dateError && <p className="text-xs text-red-600" role="alert">{dateError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCustomDates(false)} className="rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-xs text-[#5D5A6E] hover:bg-[#F7F7FB]">
              취소
            </button>
            <button type="button" onClick={applyCustomDates} className="rounded-lg bg-[#6C48F5] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5839DB]">
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
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => <KpiCard key={metric.tone} {...metric} />)}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8">
      <section className="space-y-4 rounded-[2rem] border border-[#ECEAF5] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] md:p-6" aria-labelledby="trend-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 id="trend-title" className="text-xl font-extrabold tracking-tight text-[#2A2C41]">
              캠페인 성과 추이
            </h2>
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
                  className={`rounded-md px-3 py-1 ${granularity === value ? 'bg-white font-bold text-[#6C48F5] shadow-sm' : 'text-[#6F6C80] hover:text-[#2A2C41]'}`}
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

        <div className="flex items-center gap-2 text-[11px] font-medium text-[#6F6C80]" aria-hidden="true">
          <span className="h-2 w-2 rounded-sm bg-[#6C48F5]" />노출 수
        </div>
        <TrendChart granularity={granularity} />
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
