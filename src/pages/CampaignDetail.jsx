import { useState } from 'react'
import {
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  MousePointer2,
  Percent,
  Send,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import KpiCard from '../components/kpiCard'
import campaigns from '../data/campaigns'
import { TrendChart } from './Dashboard'
const campaignAdCopy = {
  'CAMP-2026-0920': {
    title: 'BLACKPINK - KILL THIS LOVE',
    body: '전 세계가 기다린 컴백! 지금 스포티파이 독점 신곡 감상하기',
  },
  'CAMP-2026-0915': {
    title: 'TikTok Stage VOICE ON Live',
    body: '동방신기, AB6IX, WayV 라이브 콘서트 실시간 예약!',
  },
  'CAMP-2026-0928': {
    title: 'NewJeans Autumn Special',
    body: '가을 감성 맞춤 플레이리스트 스포티파이 독점 공개',
  },
}
const ageCtr = [
  { label: '20대', value: 18.2, color: 'bg-[#0B7CFF]' },
  { label: '30대', value: 14.5, color: 'bg-[#101216]' },
  { label: '40대', value: 11.2, color: 'bg-[#364964]' },
  { label: '50대+', value: 8.8, color: 'bg-[#94A3B8]' },
]

function CampaignDetail() {
  const { campaignId } = useParams()
  const [granularity, setGranularity] = useState('hour')
  const campaign = campaigns.find((item) => item.id === campaignId)

  if (!campaign) {
    return (
      <section className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7CFF]">ONAD ADVERTISER PORTAL</p>
        <h1 className="mt-3 text-xl font-bold text-[#232528]">캠페인을 찾을 수 없습니다.</h1>
        <p className="mt-2 text-sm text-[#667085]">캠페인 목록에서 확인할 캠페인을 다시 선택해 주세요.</p>
        <Link to="/campaigns" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0B7CFF] px-4 text-sm font-semibold text-white hover:bg-blue-700">
          <ArrowLeft size={16} aria-hidden="true" /> 캠페인 목록으로
        </Link>
      </section>
    )
  }

  const isActive = campaign.status === 'active'
  const statusLabel = isActive ? '진행중' : campaign.status === 'pending' ? '예약 대기' : campaign.status
  const statusClass = isActive
    ? 'bg-[#1ED760] text-[#101216]'
    : 'bg-[#0B7CFF] text-white'
  const adCopy = campaignAdCopy[campaign.id]
  const metrics = [
    { title: '광고 발송(노출) 수', value: campaign.sent.toLocaleString(), change: '+18.4%', Icon: Send },
    { title: '클릭 수', value: campaign.clicks.toLocaleString(), change: '+12.8%', Icon: MousePointer2 },
    { title: 'CTR (클릭률)', value: campaign.ctr.toFixed(1) + '%', change: '+2.4%p', Icon: Percent, featured: true },
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
              <h1 className="text-lg font-bold text-[#232528]">{campaign.name}</h1>
              <span className={'rounded-full px-2.5 py-0.5 text-xs font-bold ' + statusClass}>{statusLabel}</span>
            </div>
            <p className="mt-0.5 truncate font-mono text-xs text-[#667085]">캠페인 ID: {campaign.id}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="hidden items-center gap-2 sm:flex">
            <button type="button" disabled title="캠페인 수정 기능은 준비 중입니다." className="min-h-8 cursor-not-allowed rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#98A2B3]">캠페인 수정</button>
            <button type="button" disabled title="상태 변경 기능은 준비 중입니다." className="min-h-8 cursor-not-allowed rounded-lg bg-[#101216] px-3 text-xs font-semibold text-white/50">{isActive ? '캠페인 일시정지' : '캠페인 재개'}</button>
            <button type="button" disabled title="캠페인 삭제 기능은 준비 중입니다." className="min-h-8 cursor-not-allowed rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-300">캠페인 삭제</button>
          </div>
          <span className="hidden h-6 w-px bg-[#E5E5E5] sm:block" />
          <Link to="/campaigns" aria-label="캠페인 목록으로 닫기" title="페이지 닫기" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#667085] transition-colors hover:bg-[#101216] hover:text-white">
            <X size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

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
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-bold text-[#232528]">{adCopy?.title || campaign.name}</p>
            </div>
            <div>
              <span className="mb-1 block font-medium text-[#667085]">광고 본문 문구</span>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed text-[#232528]">{adCopy?.body || '광고 본문 정보가 없습니다.'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="font-medium text-[#667085]">운영 기간</span><p className="font-bold text-[#232528]">{campaign.period}</p>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="font-medium text-[#667085]">타겟 오디언스</span><p className="font-bold text-[#232528]">{campaign.targetAudience}</p>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="font-medium text-[#667085]">맥락 연동 조건</span><p className="font-bold text-[#0B7CFF]">맑음 날씨 트리거</p>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="font-medium text-[#667085]">랜딩 페이지</span><p className="truncate font-mono text-[#232528]">spotify:album:4rG91I41z1q</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="캠페인 성과 분석 차트" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:col-span-1 sm:p-6 lg:col-span-2">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
            <h2 className="text-sm font-bold text-[#232528]">광고 성과 추이</h2>
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
        </article>

        <article className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#232528]">타겟 연령 조건별 CTR Lift 분석</h2>
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0B7CFF]">CTR Lift %</span>
          </div>
          <div className="h-60 px-2 pt-4">
            <div className="relative flex h-full items-end justify-around border-b border-slate-200">
              {[0, 1, 2, 3].map((line) => <div key={line} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ bottom: (line / 4) * 85 + '%' }} />)}
              {ageCtr.map(({ label, value, color }) => (
                <div key={label} className="z-10 flex h-full w-12 flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] text-[#364964]">{value}%</span>
                  <div className={'w-full rounded-t-md ' + color} style={{ height: (value / 20) * 78 + '%' }} />
                  <span className="pt-2 text-[10px] text-[#667085]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default CampaignDetail
