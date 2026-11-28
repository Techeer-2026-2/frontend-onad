import { Home, MapPin, Music2, Search, TrainFront, UserRound } from 'lucide-react'

// Onbeat 하단 내비게이션 메뉴 (미리보기에서는 홈이 선택된 상태)
const navItems = [
  { label: '홈', icon: Home, active: true },
  { label: '검색', icon: Search },
  { label: '라이브러리', icon: Music2 },
  { label: '지도', icon: MapPin },
  { label: '마이', icon: UserRound },
]

// Onbeat 홈 상단(검색창 → 광고 배너 캐러셀 → 오늘의 출근길 패널)을 흉내 낸 미리보기
// 실제 노출 방식(Onbeat AdBannerCarousel)과 같게: 이미지가 있으면 이미지만, 없으면 제목·본문 글자 배너
function CampaignPreview({ title, body, imageUrl, compact = false, className = '' }) {
  const previewTitle = title?.trim() || '캠페인 타이틀이 여기에 표시됩니다'
  const previewBody = body?.trim() || '캠페인 설명을 입력하면 미리보기에 실시간으로 반영됩니다.'

  return (
    <div className={`mx-auto w-full ${compact ? 'max-w-[260px] rounded-[2.2rem] border-[8px] p-2' : 'max-w-[360px] rounded-[2.8rem] border-[10px] p-3'} border-[#181A1E] bg-[#101114] shadow-[0_22px_42px_-14px_rgba(16,18,23,0.45)] ${className}`}>
      <div className="overflow-hidden rounded-[1.7rem] bg-linear-to-b from-[#d8f6ff] via-[#a9e6fb] to-[#e9fbff] px-3 pb-5 pt-2">
        {/* 상태 바 */}
        <div className="flex items-center justify-between px-2 pb-3 text-[10px] font-bold text-[#08295c]">
          <span>9:41</span>
          <span className="tracking-[-0.05em]">●●● ▰</span>
        </div>

        {/* 검색창 자리 (장식) */}
        <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 text-[#2f7fb8] shadow-[inset_0_1px_2px_#fff,0_2px_5px_rgba(11,105,165,0.25)]">
          <Search size={14} aria-hidden="true" />
          <span className="truncate text-[10px] text-[#5c87a8]">노래, 아티스트, 플레이리스트 검색</span>
        </div>

        {/* 광고 배너 (3:1) */}
        <div className="relative mt-3 aspect-[3/1] overflow-hidden rounded-[14px] border-[3px] border-[#edffff] shadow-[0_0_0_1px_#087ed2,0_3px_7px_rgba(11,105,165,0.36)]">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="캠페인 배너 미리보기" className="h-full w-full object-cover" />
              {/* 아래쪽을 어둡게 깔아서 어떤 이미지 위에서도 흰 글자가 읽히게 한다 */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/35 to-transparent px-2.5 pb-1.5 pt-5">
                <strong className="line-clamp-1 text-[11px] text-white">{previewTitle}</strong>
                <span className="line-clamp-1 text-[8px] text-white/85">{previewBody}</span>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col justify-center gap-0.5 bg-linear-to-br from-[#b7f7ff] via-[#4dbdea] to-[#d9fbff] px-3">
              <strong className="line-clamp-1 text-[12px] text-[#08295c]">{previewTitle}</strong>
              <span className="line-clamp-2 text-[9px] leading-[1.35] text-[#23507f]">{previewBody}</span>
            </div>
          )}
          <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-[rgba(8,43,106,0.72)] px-1.5 py-px text-[8px] font-extrabold text-white">광고</span>
        </div>

        {/* 캐러셀 점: 첫 칸이 내 광고 */}
        <div className="flex items-center justify-center gap-1.5 pt-2" aria-hidden="true">
          <span className="h-2 w-4 rounded-full border border-[#006bc3] bg-linear-to-b from-[#d9ffff] via-[#50c7ff] to-[#0060c8]" />
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 rounded-full border border-[#379ac7] bg-linear-to-b from-[#ecffff] to-[#8cd8f2]" />
          ))}
        </div>

        {/* 오늘의 출근길 패널 자리 (흐리게) */}
        <div className="mt-3 overflow-hidden rounded-xl border border-white/80 bg-white/55 opacity-70" aria-hidden="true">
          <div className="flex items-center gap-1.5 bg-linear-to-b from-[#4fb4ea] to-[#1f7fcf] px-2.5 py-1.5 text-[9px] font-bold text-white">
            <TrainFront size={11} />오늘의 출근길 ♫
          </div>
          <div className="flex gap-2 p-2.5">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-[#c7e9f7]" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-2 w-3/4 rounded-full bg-[#c7e9f7]" />
              <div className="h-2 w-1/2 rounded-full bg-[#d8f0fa]" />
              <div className="h-2 w-2/3 rounded-full bg-[#d8f0fa]" />
            </div>
          </div>
        </div>

        {/* 하단 내비게이션 (장식) */}
        <div className="mt-4 rounded-[14px] border-2 border-[#e7ffff] bg-linear-to-r from-[#00aaf8] via-[#79caff] to-[#0d7bde] p-0.5 shadow-[0_0_0_1px_#087fdd,0_2px_6px_#2581ac]" aria-hidden="true">
          <div className="flex justify-between gap-0.5 rounded-[11px] border border-[#a6d8ee] bg-linear-to-b from-white via-[#d9f7ff] to-[#9ad6f7] p-0.5">
            {navItems.map(({ label, icon: Icon, active }) => (
              <span
                key={label}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[9px] py-1 text-[7px] font-extrabold ${
                  active
                    ? 'border border-[#056acb] bg-linear-to-b from-[#7adcff] via-[#0068eb] to-[#04a7ff] text-white'
                    : 'text-[#064686]'
                }`}
              >
                <Icon size={12} />
                <span className="truncate">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-white/70" />
      <p className="mt-3 px-2 pb-1 text-center text-[10px] leading-4 text-white/60">
        {imageUrl
          ? '이미지 위에 제목과 본문 첫 줄이 함께 표시돼요.'
          : '이미지가 없으면 제목·본문이 글자 배너로 표시돼요.'}
      </p>
    </div>
  )
}

export default CampaignPreview
