import { Music2, Play } from 'lucide-react'

function CampaignPreview({ title, body, imageUrl, compact = false, className = '' }) {
  const previewTitle = title?.trim() || '캠페인 타이틀이 여기에 표시됩니다'
  const previewBody = body?.trim() || '캠페인 설명을 입력하면 미리보기에 실시간으로 반영됩니다.'

  return (
    <div className={`mx-auto w-full ${compact ? 'max-w-[260px] rounded-[2.2rem] border-[8px] p-2' : 'max-w-[360px] rounded-[2.8rem] border-[10px] p-3'} border-[#181A1E] bg-[#101114] text-white shadow-[0_22px_42px_-14px_rgba(16,18,23,0.45)] ${className}`}>
      <div className="flex items-center justify-between px-2 pb-4 pt-1 text-[10px] font-bold"><span>9:41</span><span className="tracking-[-0.05em]">●●● ▰</span></div>
      <div className="rounded-[1.7rem] bg-[#1E2025] p-4">
        <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8061F9]"><Music2 size={17} /></div><span className="text-[13px] font-bold">ONAD</span></div><span className="text-[10px] text-white/50">광고</span></div>
        <div className="overflow-hidden rounded-2xl bg-[#292C33]">
          {imageUrl ? <img src={imageUrl} alt="캠페인 배너 미리보기" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square w-full flex-col items-center justify-center bg-linear-to-br from-[#8061F9] to-[#39246F] text-white/70"><Music2 size={40} /><span className="mt-3 text-[11px]">배너 이미지 미리보기</span></div>}
          <div className="space-y-3 p-4"><p className="line-clamp-2 text-sm font-bold leading-5">{previewTitle}</p><p className="line-clamp-2 text-[11px] leading-5 text-white/65">{previewBody}</p><button type="button" className="flex w-full items-center justify-center gap-1 rounded-full bg-[#6C48F5] py-2.5 text-[11px] font-bold"><Play size={12} fill="currentColor" />자세히 보기</button></div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#292B31] p-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#8061F9] to-[#6C48F5]"><Music2 size={17} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">PLAYLIST</p><p className="mt-0.5 text-[9px] text-white/50">미리보기</p></div><Play size={14} /></div>
        <div className="mt-5 flex justify-around border-t border-white/10 pt-4 text-[9px] text-white/45"><span>홈</span><span className="font-semibold text-white">탐색</span><span>보관함</span><span>내 정보</span></div>
      </div>
      <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-white/70" />
    </div>
  )
}

export default CampaignPreview
