import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Eye,
  Link2,
  MousePointerClick,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import KpiCard from '../components/kpiCard'
import CampaignPreview from '../components/CampaignPreview'
import { CampaignAgeStats, CampaignSummaryAndReport, CampaignTrend } from '../components/CampaignInsights'
import { deleteCampaign, getCampaign } from '../api/campaigns'
import { subscribeCampaignStats } from '../api/campaignStats'

function getAgeGroupChips(values) {
  if (!Array.isArray(values) || values.length === 0) return ['—']
  if (values.includes('all')) return ['전체 연령']
  return values.map((value) => value.replace(/^(\d+)s$/, '$1대'))
}

function formatGenders(values) {
  if (!Array.isArray(values) || values.length === 0) return '—'
  if (values.includes('all')) return '전체 성별'
  return values.map((value) => ({ male: '남성', female: '여성' }[value] || value)).join(', ')
}

function formatScheduleDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : '—'
}

function getStatus(status) {
  const statuses = {
    ONGOING: { label: '진행중', className: 'bg-[#FFF0F3] text-[#FF6B8B]' },
    PENDING: { label: '예약 대기', className: 'bg-[#DCFCE7] text-[#16A34A]' },
    ENDED: { label: '종료', className: 'bg-[#F1F3F5] text-[#6B7280]' },
  }
  return statuses[status] || { label: status || '상태 미확인', className: 'bg-[#F1F3F5] text-[#6B7280]' }
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
  useEffect(() => {
    const controller = new AbortController()

    getCampaign(campaignId, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        if (!response || typeof response !== 'object') {
          throw new Error('캠페인 상세 응답 형식이 올바르지 않습니다.')
        }
        setCampaign(response)
        setLoadedCampaignId(campaignId)
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
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
    if (loadedCampaignId !== campaignId) return undefined

    const controller = new AbortController()
    subscribeCampaignStats(campaignId, {
      signal: controller.signal,
      onStats: (stats) => setLiveStats({ ...stats, campaignId }),
      onStatus: () => {},
      onError: () => {},
    })
    return () => controller.abort()
  }, [campaignId, loadedCampaignId])

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
        <h1 className="mt-3 text-xl font-bold text-[#232528]">{errorMessage || '캠페인을 찾을 수 없습니다.'}</h1>
        <button type="button" onClick={() => { setIsLoading(true); setErrorMessage(''); setRetryCount((count) => count + 1) }} className="mt-5 rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] hover:bg-gray-50">다시 시도</button>
        <div><Link to="/campaigns" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6C48F5]"><ArrowLeft size={16} aria-hidden="true" /> 캠페인 목록으로</Link></div>
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
    { label: '누적 노출 수', value: formatCount(impressions), icon: Eye, tone: 'lavender' },
    { label: '누적 클릭수', value: formatCount(clicks), icon: MousePointerClick, tone: 'dark' },
    { label: '누적 CTR', value: ctr, icon: ChartNoAxesColumnIncreasing, tone: 'pink' },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col gap-4 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6C48F5]">
            <ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#2A2C41]">{campaign.title}</h1>
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-bold ' + status.className}>{status.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            {campaign.status !== 'ENDED' && <>
              <Link to={`/campaigns/${campaignId}/edit`} className="inline-flex min-h-8 items-center rounded-lg border border-[#DED9FA] bg-[#F8F7FF] px-3 text-xs font-semibold text-[#6C48F5] hover:bg-[#F0EDFF]">캠페인 수정</Link>
              <button type="button" disabled title="캠페인 발송/상태 변경 API는 Swagger에 없습니다." className="min-h-8 cursor-not-allowed rounded-lg bg-[#2A2C41] px-3 text-xs font-semibold text-white/50">{campaign.status === 'ONGOING' ? '캠페인 일시정지' : '캠페인 재개'}</button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="min-h-8 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? '삭제 중…' : '캠페인 삭제'}</button>
            </>}
          </div>
          <span className="hidden h-6 w-px bg-[#E8E6F2] sm:block" />
          <Link to="/campaigns" aria-label="캠페인 목록으로 닫기" title="페이지 닫기" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F6FC] text-[#858296] transition-colors hover:bg-[#2A2C41] hover:text-white">
            <X size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {deleteError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}

      
      <section aria-label="캠페인 주요 성과" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((metric) => <KpiCard key={metric.label} {...metric} />)}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#F0EFF7] pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#2A2C41]"><ChartNoAxesColumnIncreasing size={16} className="text-[#6C48F5]" aria-hidden="true" /> 캠페인 상세 설정 정보</h2>
            {campaign.status !== 'ENDED' && <Link to={`/campaigns/${campaignId}/edit`} className="rounded-lg bg-[#F0EDFF] px-3.5 py-2 text-xs font-bold text-[#6C48F5] shadow-sm transition hover:bg-[#DED9FA]">설정 수정</Link>}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl bg-[#FAFAFD] px-4 py-3.5">
                <span className="block text-[11px] font-semibold tracking-wide text-[#9A97A7]">광고 제목 (헤드라인)</span>
                <p className="mt-1.5 text-sm font-bold leading-6 text-[#2A2C41]">{campaign.title || '—'}</p>
              </div>
              <div className="rounded-xl bg-[#FAFAFD] px-4 py-3.5">
                <span className="block text-[11px] font-semibold tracking-wide text-[#9A97A7]">광고 본문 문구</span>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-[#2A2C41]">{campaign.body || '—'}</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#F0EFF7] bg-white divide-y divide-[#F0EFF7]">
                <div className="flex min-h-16 items-center justify-between gap-5 px-4 py-3 sm:px-5"><span className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#6F6C80]"><CalendarDays size={18} className="text-[#858296]" />운영 기간</span><span className="text-right text-sm font-bold text-[#2A2C41]">{formatScheduleDate(campaign.startAt)} <span className="mx-1 text-[#AAA7B6]">~</span> {formatScheduleDate(campaign.endAt)}</span></div>
                <div className="flex min-h-16 items-center justify-between gap-5 px-4 py-3 sm:px-5"><span className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#6F6C80]"><Users size={18} className="text-[#858296]" />타겟 연령</span><span className="flex flex-wrap justify-end gap-2">{getAgeGroupChips(campaign.targetAgeGroups).map((age) => <span key={age} className="rounded-lg bg-[#F6F1FF] px-3 py-1 text-sm font-bold text-[#6C48F5]">{age}</span>)}</span></div>
                <div className="flex min-h-16 items-center justify-between gap-5 px-4 py-3 sm:px-5"><span className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#6F6C80]"><UserRound size={18} className="text-[#858296]" />타겟 성별</span><span className="text-right text-sm font-bold text-[#2A2C41]">{formatGenders(campaign.targetGenders)}</span></div>
                <div className="flex min-h-16 items-center justify-between gap-5 px-4 py-3 sm:px-5"><span className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#6F6C80]"><Link2 size={18} className="text-[#858296]" />랜딩 페이지</span><span title={campaign.linkUrl || ''} className="max-w-[55%] truncate text-right font-mono text-sm font-bold text-[#4E5970]">{campaign.linkUrl || '—'}</span></div>
              </div>
            </div>
          </section>
          <CampaignTrend key={campaignId} campaignId={campaignId} />
        </div>
        <div className="space-y-6">
          <aside className="rounded-[2rem] border border-[#ECEAF5] bg-white p-5 shadow-sm"><h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#858296]">Live Preview</h3><CampaignPreview title={campaign.title} body={campaign.body} imageUrl={campaign.imageUrl} /></aside>
          <CampaignAgeStats key={campaignId} campaignId={campaignId} />
          <CampaignSummaryAndReport key={campaignId} campaignId={campaignId} />
        </div>
      </div>
    </div>
  )
}

export default CampaignDetail
