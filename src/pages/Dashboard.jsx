import { useState } from 'react'
import {
  CalendarDays,
  ChartLine,
  MousePointer2,
  Percent,
  Send,
  SlidersHorizontal,
} from 'lucide-react'
import CampaignTable from '../components/CampaignTable'
import KpiCard from '../components/kpiCard'
import campaigns from '../data/campaigns'

const metrics = [
  { title: '광고 발송(노출) 수', value: '12,847', change: '+18.4%', progress: 78, Icon: Send },
  { title: '클릭 수', value: '1,203', change: '+12.8%', progress: 64, Icon: MousePointer2 },
  { title: 'CTR (클릭률)', value: '15.2%', change: '+2.4%p', progress: 82, Icon: Percent, featured: true },
]

const chartSeries = {
  hour: {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    impressions: [420, 680, 1450, 890, 920, 1680, 1100, 750],
    clicks: [45, 72, 185, 95, 98, 210, 130, 82],
  },
  day: {
    labels: ['09.20 (일)', '09.21 (월)', '09.22 (화)', '09.23 (수)', '09.24 (목)', '09.25 (금)', '09.26 (토)'],
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

function formatDate(date) {
  return date.replaceAll('-', '.')
}

function TrendChart({ granularity }) {
  const { labels, impressions, clicks } = chartSeries[granularity]
  const width = 760
  const height = 230
  const left = 50
  const right = 12
  const top = 22
  const bottom = 42
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const maxImpressions = Math.ceil(Math.max(...impressions) / 1000) * 1000
  const maxClicks = Math.max(...clicks) * 1.2
  const step = chartWidth / labels.length
  const barWidth = Math.min(34, step * 0.46)
  const points = clicks.map((value, index) => {
    const x = left + step * index + step / 2
    const y = top + chartHeight - (value / maxClicks) * chartHeight
    return { x, y, value }
  })

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${granularity === 'hour' ? '시간' : granularity === 'day' ? '일' : '주'} 단위 노출 및 클릭 추이 샘플 차트`}
        className="h-64 min-w-150 w-full"
      >
        {[0, 1, 2, 3].map((tick) => {
          const y = top + (chartHeight / 3) * tick
          const value = Math.round(maxImpressions * (1 - tick / 3))
          return (
            <g key={tick}>
              <line x1={left} x2={width - right} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="3 4" />
              <text x={left - 8} y={y + 4} textAnchor="end" fill="#64748B" fontSize="10">
                {value.toLocaleString()}
              </text>
            </g>
          )
        })}

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
              rx="4"
              fill="#0B7CFF"
              opacity="0.9"
            >
              <title>{`${labels[index]} 노출 ${value.toLocaleString()}건`}</title>
            </rect>
          )
        })}

        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="#0C0C0D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(({ x, y, value }, index) => (
          <g key={labels[index]}>
            <circle cx={x} cy={y} r="5" fill="white" stroke="#0B7CFF" strokeWidth="2.5">
              <title>{`${labels[index]} 클릭 ${value.toLocaleString()}회`}</title>
            </circle>
            <text x={x} y={height - 12} textAnchor="middle" fill="#64748B" fontSize="10">
              {labels[index]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function Dashboard() {
  const [selectedPreset, setSelectedPreset] = useState('7days')
  const [dateLabel, setDateLabel] = useState(datePresets['7days'].label)
  const [dateInputs, setDateInputs] = useState({ start: '2026-09-01', end: '2026-09-26' })
  const [showCustomDates, setShowCustomDates] = useState(false)
  const [dateError, setDateError] = useState('')
  const [granularity, setGranularity] = useState('day')

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

  const presetClassName = (preset) =>
    `rounded-lg px-3 py-1.5 transition-colors ${
      selectedPreset === preset
        ? 'bg-[#0C0C0D] font-semibold text-white'
        : 'border border-[#E5E5E5] hover:bg-slate-50'
    }`

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays size={16} className="text-[#0B7CFF]" aria-hidden="true" />
          <span className="text-sm font-bold text-[#232528]">분석 기간 설정:</span>
          <span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-[#364964]">
            {dateLabel}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            샘플 데이터
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
          <button type="button" className={presetClassName('yesterday')} onClick={() => applyPreset('yesterday')} aria-pressed={selectedPreset === 'yesterday'}>
            어제
          </button>
          <button type="button" className={presetClassName('7days')} onClick={() => applyPreset('7days')} aria-pressed={selectedPreset === '7days'}>
            최근 7일
          </button>
          <button type="button" className={presetClassName('30days')} onClick={() => applyPreset('30days')} aria-pressed={selectedPreset === '30days'}>
            최근 30일
          </button>
          <button
            type="button"
            onClick={() => { setShowCustomDates((visible) => !visible); setDateError('') }}
            aria-expanded={showCustomDates}
            className="flex items-center gap-1 rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-[#0B7CFF] transition-colors hover:bg-blue-50"
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
            직접 설정
          </button>
        </div>
      </section>

      {showCustomDates && (
        <section className="space-y-4 rounded-xl border border-[#0B7CFF] bg-white p-5 shadow-lg" aria-labelledby="custom-date-title">
          <h2 id="custom-date-title" className="text-sm font-bold text-[#232528]">
            분석 시작일 및 종료일 지정
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-[#364964]" htmlFor="start-date-input">
              시작일
              <input
                id="start-date-input"
                type="date"
                value={dateInputs.start}
                onChange={(event) => setDateInputs((current) => ({ ...current, start: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] p-2.5 text-xs outline-none focus:border-[#0B7CFF]"
              />
            </label>
            <label className="text-xs font-medium text-[#364964]" htmlFor="end-date-input">
              종료일
              <input
                id="end-date-input"
                type="date"
                value={dateInputs.end}
                onChange={(event) => setDateInputs((current) => ({ ...current, end: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] p-2.5 text-xs outline-none focus:border-[#0B7CFF]"
              />
            </label>
          </div>
          {dateError && <p className="text-xs text-red-600" role="alert">{dateError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCustomDates(false)} className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs text-[#364964] hover:bg-slate-100">
              취소
            </button>
            <button type="button" onClick={applyCustomDates} className="rounded-lg bg-[#0B7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0066E0]">
              기간 적용
            </button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="주요 광고 지표">
        {metrics.map((metric) => <KpiCard key={metric.title} {...metric} />)}
      </section>

      <section className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm" aria-labelledby="trend-title">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 id="trend-title" className="flex items-center gap-2 text-base font-bold text-[#232528]">
              <ChartLine size={18} className="text-[#0B7CFF]" aria-hidden="true" />
              시간대별 / 일별 광고 성과 추이
            </h2>
            <p className="mt-0.5 text-xs text-[#364964]">
              노출 수와 클릭 수를 비교한 샘플 시계열 차트
            </p>
          </div>
          <div className="inline-flex self-start rounded-lg border border-[#E5E5E5] bg-slate-50 p-0.5 text-xs font-medium sm:self-auto" role="group" aria-label="차트 시간 단위">
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
                className={`rounded-md px-3 py-1 ${granularity === value ? 'bg-white font-bold text-[#0B7CFF] shadow-sm' : 'text-[#364964] hover:text-[#232528]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-4 text-[11px] font-medium text-[#364964]" aria-hidden="true">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#0B7CFF]" />노출 수</span>
          <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-[#0C0C0D]" />클릭 수</span>
        </div>
        <TrendChart granularity={granularity} />
      </section>

      <CampaignTable campaigns={campaigns} />
    </div>
  )
}

export default Dashboard
