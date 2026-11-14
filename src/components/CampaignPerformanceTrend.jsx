import { useEffect, useState } from 'react'
import { getCampaignTimeseries } from '../api/campaigns'

const timeZone = 'Asia/Seoul'
const dateFormat = new Intl.DateTimeFormat('sv-SE', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
const labelFormat = new Intl.DateTimeFormat('ko-KR', { timeZone, month: 'numeric', day: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('ko-KR', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const numberFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })
const periods = { '7days': '최근 7일', yesterday: '어제', month: '이번 달', custom: '직접 설정' }
const granularities = { hour: '시간', day: '일', week: '주' }
const metricUnits = { CPC: '원', CTR: '%', CPM: '원' }

function addDays(date, days) {
  const shifted = new Date(`${date}T00:00:00Z`)
  shifted.setUTCDate(shifted.getUTCDate() + days)
  return shifted.toISOString().slice(0, 10)
}

function presetRange(preset) {
  const today = dateFormat.format(new Date())
  if (preset === 'yesterday') {
    const yesterday = addDays(today, -1)
    return { from: yesterday, end: yesterday }
  }
  return { from: preset === 'month' ? `${today.slice(0, 7)}-01` : addDays(today, -6), end: today }
}

function isCount(value) {
  return Number.isFinite(value) && value >= 0
}

function readBuckets(response) {
  if (!Array.isArray(response)) throw new Error('성과 추이 응답 형식이 올바르지 않습니다.')
  return response.map(({ bucketStart, impressionCount, clickCount, spentAmount }) => {
    // 날짜 또는 시간대가 없는 날짜·시각은 한국 시간으로 해석한다.
    const hasTime = typeof bucketStart === 'string' && bucketStart.includes('T')
    const date = typeof bucketStart === 'string' && new Date(hasTime
      ? bucketStart + (/(Z|[+-]\d{2}:\d{2})$/.test(bucketStart) ? '' : '+09:00')
      : `${bucketStart}T00:00:00+09:00`)
    if (!date || !Number.isFinite(date.getTime()) || !isCount(impressionCount) || !isCount(clickCount)) {
      throw new Error('성과 추이 집계 구간이 올바르지 않습니다.')
    }
    return { date, impressionCount, clickCount, spentAmount: isCount(spentAmount) ? spentAmount : null }
  }).sort((a, b) => a.date - b.date)
}

function metricValue(bucket, metric) {
  const { impressionCount, clickCount, spentAmount } = bucket
  if (metric === 'CTR') return impressionCount > 0 ? clickCount / impressionCount * 100 : null
  if (spentAmount === null) return null
  if (metric === 'CPC') return clickCount > 0 ? spentAmount / clickCount : null
  return impressionCount > 0 ? spentAmount / impressionCount * 1000 : null
}

function PerformanceChart({ buckets, metric, granularity }) {
  const values = buckets.map(bucket => metricValue(bucket, metric))
  if (values.every(value => value === null)) {
    return <p className="py-16 text-center text-sm text-gray-500">선택한 기간에 {metric}을 계산할 수 있는 데이터가 없어요.</p>
  }

  const maxValue = values.reduce((max, value) => Math.max(max, value ?? 0), 1)
  const first = buckets[0].date.getTime()
  const last = buckets.at(-1).date.getTime()
  const points = buckets.map(({ date }, index) => ({
    date,
    value: values[index],
    x: first === last ? 400 : 44 + (date.getTime() - first) / (last - first) * 712,
    y: 210 - values[index] / maxValue * 186,
  }))
  const line = points.map(({ x, y, value }, index) => {
    if (value === null) return ''
    return `${index > 0 && points[index - 1].value !== null ? 'L' : 'M'}${x},${y}`
  }).join(' ')
  const labelStep = Math.max(1, Math.ceil(points.length / 6))
  const unit = metricUnits[metric]

  return (
    <svg viewBox="0 0 800 250" role="img" aria-label={`${metric} 성과 추이 (${unit})`} className="w-full">
      <line x1="44" y1="210" x2="756" y2="210" stroke="#E8E6F2" />
      <path d={line} fill="none" stroke="#6C48F5" strokeWidth="2.5" />
      {points.map(({ date, value, x, y }, index) => {
        const label = granularity === 'hour' ? `${labelFormat.format(date)} ${timeFormat.format(date)}` : labelFormat.format(date)
        return (
          <g key={`${date.toISOString()}-${index}`}>
            {value !== null && (
              <circle cx={x} cy={y} r="4" fill="#6C48F5">
                <title>{`${label} · ${numberFormat.format(value)}${unit}`}</title>
              </circle>
            )}
            {index % labelStep === 0 && (
              <text x={x} y="234" textAnchor="middle" fill="#6F6C80" fontSize="12">{label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const controlClass = 'rounded-lg border border-[#E4E1F0] bg-white px-3 py-2 text-sm text-onad-dark'

export default function CampaignPerformanceTrend({ campaign }) {
  const campaignId = campaign?.id
  const [preset, setPreset] = useState('7days')
  const [range, setRange] = useState(() => presetRange('7days'))
  const [draft, setDraft] = useState(range)
  const [granularity, setGranularity] = useState('day')
  const [metric, setMetric] = useState('CTR')
  const [retryCount, setRetryCount] = useState(0)
  const [result, setResult] = useState(null)
  const { from, end } = range
  const to = addDays(end, 1)
  const requestKey = JSON.stringify([campaignId, from, to, granularity, retryCount])
  const current = result?.key === requestKey ? result : null

  useEffect(() => {
    if (campaignId == null) return
    const controller = new AbortController()
    getCampaignTimeseries(campaignId, { from, to, granularity, signal: controller.signal })
      .then(readBuckets)
      .then(buckets => {
        if (!controller.signal.aborted) setResult({ key: requestKey, buckets })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        const message = [404, 501].includes(error.status)
          ? '현재 이 캠페인의 성과 추이를 조회할 수 없어요.'
          : '성과 추이를 불러오지 못했어요.'
        setResult({ key: requestKey, error: message })
      })
    return () => controller.abort()
  }, [campaignId, from, to, granularity, requestKey])

  function changePreset(next) {
    setPreset(next)
    if (next === 'custom') setDraft(range)
    else setRange(presetRange(next))
  }

  const invalidRange = !draft.from || !draft.end || draft.from > draft.end

  return (
    <section className="space-y-4 rounded-4xl border border-[#ECEAF5] bg-white p-5 md:p-6" aria-labelledby="trend-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="trend-title" className="text-xl font-extrabold text-onad-dark">캠페인 성과 추이</h2>
          <p className="mt-1 text-xs text-gray-500">{campaign.name} · {from} ~ {end} (한국 시간)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="분석 기간" className={controlClass} value={preset} onChange={event => changePreset(event.target.value)}>
            {Object.entries(periods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select aria-label="집계 단위" className={controlClass} value={granularity} onChange={event => setGranularity(event.target.value)}>
            {Object.entries(granularities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>
      {preset === 'custom' && (
        <form className="flex flex-wrap items-end gap-3" onSubmit={event => {
          event.preventDefault()
          if (!invalidRange) setRange(draft)
        }}>
          <label className="grid gap-1 text-xs">
            시작일
            <input required type="date" className={controlClass} value={draft.from} onInput={event => setDraft({ ...draft, from: event.currentTarget.value })} />
          </label>
          <label className="grid gap-1 text-xs">
            종료일
            <input required type="date" className={controlClass} value={draft.end} onInput={event => setDraft({ ...draft, end: event.currentTarget.value })} />
          </label>
          <button type="submit" disabled={invalidRange} className="rounded-lg bg-onad-purple px-3 py-2 text-sm font-bold text-white disabled:opacity-50">기간 적용</button>
          {draft.from && draft.end && invalidRange && <p role="alert" className="text-sm text-rose-600">종료일은 시작일과 같거나 이후여야 해요.</p>}
        </form>
      )}
      <div role="group" aria-label="성과 지표" className="flex gap-2">
        {Object.keys(metricUnits).map(value => (
          <button key={value} type="button" aria-pressed={metric === value} onClick={() => setMetric(value)}
            className={`rounded-lg px-3 py-2 text-sm font-bold ${metric === value ? 'bg-[#F0ECFF] text-onad-purple' : 'text-gray-500'}`}>
            {value}
          </button>
        ))}
      </div>
      {!current ? (
        <p role="status" className="py-16 text-center text-sm text-gray-500">성과 추이를 불러오는 중이에요.</p>
      ) : current.error ? (
        <div className="py-16 text-center text-sm">
          <p role="alert">{current.error}</p>
          <button type="button" className={`mt-2 ${controlClass}`} onClick={() => setRetryCount(count => count + 1)}>다시 시도</button>
        </div>
      ) : current.buckets.length === 0 ? (
        <p role="status" className="py-16 text-center text-sm text-gray-500">선택한 기간에 성과 데이터가 없어요.</p>
      ) : <PerformanceChart buckets={current.buckets} metric={metric} granularity={granularity} />}
    </section>
  )
}
