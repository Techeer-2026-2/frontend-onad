import {
  ChartPie,
  ListChecks,
  PlusCircle,
  UserCog,
  LogOut,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'

const mainMenuItems = [
  { label: '대시보드', path: '/dashboard', Icon: ChartPie },
  { label: '캠페인 관리', path: '/campaigns', Icon: ListChecks },
  { label: '캠페인 등록', path: '/campaigns/new', Icon: PlusCircle },
]

function Sidebar({ isOpen = false, onNavigate = () => {} }) {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Local authentication is cleared even when the API is unavailable.
    } finally {
      navigate('/login', { replace: true })
      onNavigate()
    }
  }

  const linkClassName = ({ isActive }) =>
    `flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#F0EDFF] text-[#6C48F5] shadow-sm'
        : 'text-[#858296] hover:bg-[#F7F6FC] hover:text-[#2A2C41]'
    }`

  return (
    <aside
      id="primary-sidebar"
      className={`fixed inset-x-0 top-0 z-50 flex min-h-20 shrink-0 select-none items-center border-b border-[#F0EFF7] bg-white px-5 transition-transform duration-200 md:static md:translate-x-0 md:px-10 ${isOpen ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}
    >
      <button
        type="button"
        onClick={() => {
          navigate('/dashboard')
          onNavigate()
        }}
        aria-label="ONAD 대시보드로 이동"
        className="flex shrink-0 items-center gap-2 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C48F5] text-lg font-black tracking-wider text-white shadow-lg shadow-[#6C48F5]/25">
          O
        </span>
        <span className="text-xl font-bold tracking-tight text-[#6C48F5]">ONAD</span>
      </button>

      <nav aria-label="메인 메뉴" className="mx-auto hidden items-center gap-1 md:flex">
        {mainMenuItems.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/campaigns'}
            onClick={onNavigate}
            className={linkClassName}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/account" onClick={onNavigate} className={linkClassName}>
          <UserCog size={15} aria-hidden="true" />
          <span>내 정보</span>
        </NavLink>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-[#858296] transition-colors hover:bg-[#F7F6FC] hover:text-[#6C48F5]"
        >
          <LogOut size={14} aria-hidden="true" />
          <span className="hidden lg:inline">로그아웃</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
