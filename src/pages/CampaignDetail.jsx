import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  MousePointer2,
  Percent,
  Send,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import KpiCard from '../components/kpiCard'
import { deleteCampaign, getCampaign } from '../api/campaigns'
import { subscribeCampaignStats } from '../api/campaignStats'

function formatAgeGroups(values) {
  if (!Array.isArray(values) || values.length === 0) return '—'
  if (values.includes('all')) return '전체 연령'
  return values.map((value) => value.replace(/^(\d+)s$/, '$1대')).join(', ')
}

function formatGenders(values) {
  if (!Array.isArray(values) || values.length === 0) return '—'
  if (values.includes('all')) return '전체 성별'
  return values.map((value) => ({ male: '남성', female: '여성' }[value] || value)).join(', ')
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatCount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : '—'
}

function getStatus(status) {
  const statuses = {
    ONGOING: { label: '진행중', className: 'bg-[#1ED760] text-[#101216]' },
    PENDING: { label: '예약 대기', className: 'bg-[#0B7CFF] text-white' },
    ENDED: { label: '종료', className: 'bg-slate-100 text-[#667085]' },
  }
  return statuses[status] || { label: status || '상태 미확인', className: 'bg-slate-100 text-[#667085]' }
}

function CampaignDetail() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loadedCampaignId, setLoadedCampaignId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [liveStats, setLiveStats] = useState(null)
  const [streamStatus, setStreamStatus] = useState('connecting')
  const [streamError, setStreamError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getCampaign(campaignId, { signal: controller.signal })
      .then((response) => {
        if (!response || typeof response !== 'object') {
          throw new Error('캠페인 상세 응답 형식이 올바르지 않습니다.')
        }
        setCampaign(response)
        setLoadedCampaignId(campaignId)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setCampaign(null)
          setErrorMessage(error.message || '캠페인 정보를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [campaignId, retryCount])

  useEffect(() => {
    const controller = new AbortController()
    subscribeCampaignStats(campaignId, {
      signal: controller.signal,
      onStats: (stats) => setLiveStats({ ...stats, campaignId }),
      onStatus: (status) => setStreamStatus(status),
      onError: (message) => setStreamError(message),
    })
    return () => controller.abort()
  }, [campaignId])

  async function handleDelete() {
    if (!window.confirm('캠페인을 삭제할까요? 삭제한 캠페인은 복구할 수 없습니다.')) return

    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteCampaign(campaignId)
      navigate('/campaigns', { replace: true, state: { notice: '캠페인을 삭제했습니다.' } })
    } catch (error) {
      setDeleteError(error.message || '캠페인을 삭제하지 못했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || (!errorMessage && loadedCampaignId !== campaignId)) {
    return <p role="status" className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-16 text-center text-sm text-[#667085]">캠페인 정보를 불러오는 중입니다…</p>
  }

  if (errorMessage || !campaign) {
    return (
      <section className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7CFF]">ONAD ADVERTISER PORTAL</p>
        <h1 className="mt-3 text-xl font-bold text-[#232528]">{errorMessage || '캠페인을 찾을 수 없습니다.'}</h1>
        <button type="button" onClick={() => { setIsLoading(true); setErrorMessage(''); setRetryCount((count) => count + 1) }} className="mt-5 rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] hover:bg-gray-50">다시 시도</button>
        <div><Link to="/campaigns" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0B7CFF]"><ArrowLeft size={16} aria-hidden="true" /> 캠페인 목록으로</Link></div>
      </section>
    )
  }

  const status = getStatus(campaign.status)
  const currentLiveStats = liveStats?.campaignId === campaignId ? liveStats : null
  const impressions = currentLiveStats?.impressionCount ?? campaign.impressionCount
  const clicks = currentLiveStats?.clickCount ?? campaign.clickCount
  const ctr = Number.isFinite(impressions) && Number.isFinite(clicks)
    ? `${impressions > 0 ? (clicks / impressions * 100).toFixed(1) : '0.0'}%`
    : '—'
  const metrics = [
    { title: '광고 발송(노출) 수', value: formatCount(impressions), Icon: Send },
    { title: '클릭 수', value: formatCount(clicks), Icon: MousePointer2 },
    { title: 'CTR (클릭률)', value: ctr, Icon: Percent, featured: true },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#101216] text-[#1ED760]">
            <ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#232528]">{campaign.title}</h1>
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-bold ' + status.className}>{status.label}</span>
            </div>
            <p className="mt-0.5 truncate font-mono text-xs text-[#667085]">캠페인 ID: {campaign.campaignId}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/campaigns/${campaignId}/edit`} className="inline-flex min-h-8 items-center rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#344054] hover:bg-gray-50">캠페인 수정</Link>
            <button type="button" disabled title="캠페인 발송/상태 변경 API는 Swagger에 없습니다." className="min-h-8 cursor-not-allowed rounded-lg bg-[#101216] px-3 text-xs font-semibold text-white/50">{campaign.status === 'ONGOING' ? '캠페인 일시정지' : '캠페인 재개'}</button>
            <button type="button" onClick={handleDelete} disabled={isDeleting} className="min-h-8 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? '삭제 중…' : '캠페인 삭제'}</button>
          </div>
          <span className="hidden h-6 w-px bg-[#E5E5E5] sm:block" />
          <Link to="/campaigns" aria-label="캠페인 목록으로 닫기" title="페이지 닫기" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#667085] transition-colors hover:bg-[#101216] hover:text-white">
            <X size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {deleteError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}

      <div role="status" className="text-xs text-[#667085]">
        실시간 통계: {streamStatus === 'connected' ? '연결됨' : streamStatus === 'stopped' ? '연결 중단' : '연결 중'}
        {streamError ? ` · ${streamError}` : ''}
        {streamStatus !== 'connected' ? ' · 마지막 조회 수치를 표시합니다.' : ''}
      </div>
      <section aria-label="캠페인 주요 성과" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((metric) => <KpiCard key={metric.title} {...metric} />)}
      </section>

      <section className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-[#232528]">
          <ChartNoAxesColumnIncreasing size={16} className="text-[#0B7CFF]" aria-hidden="true" /> 캠페인 상세 설정 정보
        </h2>
        <div className="grid grid-cols-1 gap-6 text-xs lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <span className="mb-1 block font-medium text-[#667085]">광고 제목 (헤드라인)</span>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-bold text-[#232528]">{campaign.title || '—'}</p>
            </div>
            <div>
              <span className="mb-1 block font-medium text-[#667085]">광고 본문 문구</span>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed text-[#232528]">{campaign.body || '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="font-medium text-[#667085]">운영 기간</span><p className="font-bold text-[#232528]">{formatDateTime(campaign.startAt)} ~ {formatDateTime(campaign.endAt)}</p></div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="font-medium text-[#667085]">타겟 연령</span><p className="font-bold text-[#232528]">{formatAgeGroups(campaign.targetAgeGroups)}</p></div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="font-medium text-[#667085]">타겟 성별</span><p className="font-bold text-[#232528]">{formatGenders(campaign.targetGenders)}</p></div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="font-medium text-[#667085]">랜딩 페이지</span><p className="truncate font-mono text-[#232528]">{campaign.linkUrl || '—'}</p></div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="font-medium text-[#667085]">배너 이미지</span>{campaign.imageUrl ? <a href={campaign.imageUrl} target="_blank" rel="noreferrer" className="block truncate font-mono text-[#0B7CFF] hover:underline">이미지 확인</a> : <p className="font-bold text-[#232528]">—</p>}</div>
          </div>
        </div>
      </section>

      <section aria-label="캠페인 성과 분석 차트" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="flex min-h-72 flex-col justify-between space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:col-span-1 sm:p-6 lg:col-span-2">
          <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-[#232528]">광고 성과 추이</h2>
          <p className="py-12 text-center text-sm text-[#667085]">현재 Campaign API는 시간대별 성과 추이 데이터를 제공하지 않습니다.</p>
        </article>
        <article className="flex min-h-72 flex-col justify-between space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-[#232528]">타겟 연령 조건별 CTR Lift 분석</h2>
          <p className="py-12 text-center text-sm text-[#667085]">현재 Campaign API는 연령별 CTR 데이터를 제공하지 않습니다.</p>
        </article>
      </section>
    </div>
  )
}

export default CampaignDetail
