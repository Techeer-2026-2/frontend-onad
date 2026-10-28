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
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#0C0C0D] px-6 text-white md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-bold leading-tight">광고주 계정</div>
            <div className="text-[11px] text-gray-400">ONAD 광고주 포털</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
