import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': '대시보드',
  '/campaigns': '캠페인 관리',
  '/campaigns/new': '캠페인 등록',
  '/account': '내 정보',
}

function Header() {
  const { pathname } = useLocation()
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith('/campaigns/') ? '캠페인 상세' : '대시보드')

  return (
    <header className="z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-[#F0EFF7] bg-white px-5 md:px-10">
      <div className="flex items-center gap-3">
        <div className="hidden h-5 w-px bg-[#E4E2EF] sm:block" />
        <h1 className="text-base font-bold tracking-tight text-[#2A2C41]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-bold leading-tight text-[#2A2C41]">광고주 계정</div>
            <div className="text-[11px] text-[#8C8A9E]">ONAD Advertiser</div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2C41] text-[11px] font-bold text-white">OA</span>
        </div>
      </div>
    </header>
  )
}

export default Header
