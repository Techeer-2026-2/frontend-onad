import { useEffect, useState } from 'react'
import {
  downloadCampaignReport,
  getCampaignAgeStats,
  getCampaignSummary,
  getCampaignTimeseries,
  toTrendSeries,
} from '../api/campaignPerformance'
import MetricTrendChart from './MetricTrendChart'

const panel = 'space-y-4 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm'
const button = 'rounded-lg border border-[#DED9FA] px-3 py-2 text-xs font-semibold text-[#6C48F5] disabled:opacity-50'
const ageLabel = { '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대+', unknown: '미확인' }
const formatCount = (value) => value.toLocaleString('ko-KR')

function useCampaignData(campaignId, load) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    load(campaignId, { signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('성과 응답 형식이 올바르지 않습니다.')
        if (!controller.signal.aborted) setResult({ attempt, data })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ attempt, error })
      })
    return () => controller.abort()
  }, [campaignId, load, attempt])

  return { result: result?.attempt === attempt ? result : null, retry: () => setAttempt((count) => count + 1) }
}

function InsightContent({ request, children }) {
  const { result, retry } = request
  if (!result) return <p role="status" className="text-sm text-[#667085]">불러오는 중입니다…</p>
  if (result.error) return (
    <div className="space-y-2">
      <p role="alert" className="text-sm text-[#667085]">{result.error.status === 404 ? '이 성과 API를 사용할 수 없습니다.' : result.error.message}</p>
      <button type="button" className={button} onClick={retry}>다시 시도</button>
    </div>
  )
  return children(result.data)
}

export function CampaignTrend({ campaignId }) {
  const request = useCampaignData(campaignId, getCampaignTimeseries)
  const [metric, setMetric] = useState('impressions')
  const label = metric === 'impressions' ? '노출' : '클릭'
  return (
    <section className={panel} aria-label="광고 성과 추이">
      <h2 className="text-sm font-bold text-[#2A2C41]">광고 성과 추이 · 최근 7일</h2>
      <InsightContent request={request}>
        {(data) => {
          if (!data.length) return <p className="text-sm text-[#667085]">조회된 성과가 없습니다.</p>
          const series = toTrendSeries(data, 'day')
          return (
            <>
              <div className="flex gap-2">
                <button type="button" className={button} aria-pressed={metric === 'impressions'} onClick={() => setMetric('impressions')}>노출</button>
                <button type="button" className={button} aria-pressed={metric === 'clicks'} onClick={() => setMetric('clicks')}>클릭</button>
              </div>
              <MetricTrendChart key={metric} labels={series.labels} values={series[metric]} metricLabel={label} formatValue={formatCount} />
            </>
          )
        }}
      </InsightContent>
    </section>
  )
}

export function CampaignAgeStats({ campaignId }) {
  const request = useCampaignData(campaignId, getCampaignAgeStats)
  return (
    <section className={panel} aria-label="연령대별 성과">
      <h2 className="text-sm font-bold text-[#2A2C41]">연령대별 성과 · 최근 7일</h2>
      <InsightContent request={request}>
        {(rows) => rows.some((item) => item.impressionCount || item.clickCount) ? (
          <table className="w-full text-right text-xs text-[#2A2C41]">
            <thead><tr className="text-[#667085]"><th scope="col" className="text-left">연령</th><th scope="col">노출</th><th scope="col">클릭</th><th scope="col">CTR</th></tr></thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.ageGroup} className="border-t border-[#F0EFF7]">
                  <th scope="row" className="py-2 text-left">{ageLabel[item.ageGroup] ?? item.ageGroup}</th>
                  <td>{formatCount(item.impressionCount)}</td>
                  <td>{formatCount(item.clickCount)}</td>
                  <td>{item.ctr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-[#667085]">집계된 연령대별 성과가 없습니다.</p>}
      </InsightContent>
    </section>
  )
}

export function CampaignSummaryAndReport({ campaignId }) {
  const [summary, setSummary] = useState(null)
  const [report, setReport] = useState(null)

  async function loadSummary() {
    setSummary({ busy: true })
    try {
      const response = await getCampaignSummary(campaignId)
      if (!response?.summary?.trim()) throw new Error('요약 문장이 비어 있습니다.')
      setSummary({ text: response.summary })
    } catch (error) {
      const message = error.status === 503
        ? 'AI 성과 요약은 서버 설정이 준비되면 사용할 수 있습니다.'
        : error.status === 404 ? 'AI 성과 요약 API를 사용할 수 없습니다.' : error.message
      setSummary({ error: message })
    }
  }

  async function download(format) {
    setReport({ busy: format })
    try {
      await downloadCampaignReport(campaignId, format)
      setReport(null)
    } catch (error) {
      setReport({ error: error.status === 404 ? '이 리포트 API를 사용할 수 없습니다.' : error.message })
    }
  }

  return (
    <section className={panel} aria-label="성과 요약 및 리포트">
      <h2 className="text-sm font-bold text-[#2A2C41]">성과 요약 및 리포트</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={summary?.busy} onClick={loadSummary}>{summary?.busy ? '요약 중…' : 'AI 성과 요약 조회'}</button>
        {['csv', 'pdf'].map((format) => (
          <button key={format} type="button" className={button} disabled={Boolean(report?.busy)} onClick={() => download(format)}>
            {report?.busy === format ? '다운로드 중…' : `${format.toUpperCase()} 다운로드`}
          </button>
        ))}
      </div>
      {summary?.text && <p role="status" className="whitespace-pre-line text-sm leading-relaxed text-[#344054]">{summary.text}</p>}
      {summary?.error && <p role="alert" className="text-sm text-[#667085]">{summary.error}</p>}
      {report?.error && <p role="alert" className="text-sm text-[#667085]">{report.error}</p>}
    </section>
  )
}
