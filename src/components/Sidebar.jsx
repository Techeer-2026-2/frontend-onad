import {
  ChartPie,
  ListChecks,
  PlusCircle,
  UserCog,
  LogOut,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

const mainMenuItems = [
  { label: '대시보드', path: '/dashboard', Icon: ChartPie },
  { label: '캠페인 관리', path: '/campaigns', Icon: ListChecks },
  { label: '캠페인 등록', path: '/campaigns/new', Icon: PlusCircle },
]

function Sidebar() {
  const navigate = useNavigate()

  const linkClassName = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#0B7CFF] text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <aside className="z-30 flex w-64 shrink-0 select-none flex-col border-r border-gray-800 bg-[#0C0C0D] text-white">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        aria-label="ONAD 대시보드로 이동"
        className="flex items-center gap-3 border-b border-gray-800 p-6 text-left"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B7CFF] text-l font-bold tracking-wider shadow-md">
          OA
        </span>
        <span>
          <span className="block text-lg font-bold leading-none tracking-wider">
            ONAD
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-[#1DB954]">
            ADVERTISER PORTAL
          </span>
        </span>
      </button>

      <nav aria-label="메인 메뉴" className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400">
          메인 메뉴
        </p>
        {mainMenuItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/campaigns'}
            className={linkClassName}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}

        <p className="px-3 pb-2 pt-6 text-[11px] font-semibold tracking-wider text-gray-400">
          계정 및 설정
        </p>
        <NavLink to="/account" className={linkClassName}>
          <UserCog size={18} aria-hidden="true" />
          <span>내 정보</span>
        </NavLink>
      </nav>

      <div className="border-t border-gray-800 bg-[#080809] p-4">
        <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">플랜 상태</span>
            <span className="rounded border border-[#1DB954]/30 bg-[#1DB954]/20 px-2 py-0.5 text-[10px] font-bold text-[#1DB954]">
              ACTIVE
            </span>
          </div>
          <div className="text-xs font-bold text-gray-200">
            ONAD 광고 관리 서비스
          </div>
          <div className="text-[11px] text-gray-400">
            타겟 광고 배너 관리
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-3 flex w-full items-center justify-center gap-2 py-1 text-xs text-gray-400 transition-colors hover:text-white"
        >
          <LogOut size={15} aria-hidden="true" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
