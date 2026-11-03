import {
  LogOut,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'
import { getMyAccount } from '../api/owners'

const mainMenuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Campaigns', path: '/campaigns' },
  { label: 'Create', path: '/campaigns/new' },
]

function Sidebar({ isOpen = false, onNavigate = () => {} }) {
  const navigate = useNavigate()
  const [profileInitial, setProfileInitial] = useState('OA')
  const hasLocalProfileChange = useRef(false)

  useEffect(() => {
    let active = true
    function updateProfileInitial(event) {
      const initial = event.detail?.businessName?.trim().slice(0, 1).toUpperCase()
      if (initial) {
        hasLocalProfileChange.current = true
        setProfileInitial(initial)
      }
    }

    getMyAccount()
      .then((account) => {
        const initial = account?.businessName?.trim().slice(0, 1).toUpperCase()
        if (active && initial && !hasLocalProfileChange.current) setProfileInitial(initial)
      })
      .catch(() => {})
    window.addEventListener('account-updated', updateProfileInitial)
    return () => {
      active = false
      window.removeEventListener('account-updated', updateProfileInitial)
    }
  }, [])

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
    `rounded-full px-8 py-2.5 text-sm transition-all duration-200 ${
      isActive
        ? 'bg-white font-bold text-[#6C48F5] shadow-sm'
        : 'font-bold text-gray-500 hover:text-gray-800'
    }`

  return (
    <aside
      id="primary-sidebar"
      className={`fixed inset-x-0 top-0 z-50 flex h-24 shrink-0 select-none items-center border-b border-[#F0EFF7] bg-white px-5 transition-transform duration-200 md:static md:translate-x-0 md:px-10 ${isOpen ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}
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
        <span className="text-[26px] font-bold tracking-tight text-[#6C48F5]">ON<span className="text-[#2A2C41]">AD</span></span>
        <sup className="-ml-1 self-start pt-2 text-[8px] font-semibold text-[#AAA7B6]">™</sup>
      </button>

      <nav aria-label="메인 메뉴" className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-gray-100 bg-gray-50/80 p-1.5 shadow-sm backdrop-blur-sm md:flex">
        {mainMenuItems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/campaigns'}
            onClick={onNavigate}
            className={linkClassName}
          >
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="로그아웃"
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-[#858296] transition-colors hover:bg-[#F7F6FC] hover:text-[#6C48F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]"
        >
          <LogOut size={14} aria-hidden="true" />
          <span role="tooltip" className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-60 whitespace-nowrap rounded-md bg-[#2A2C41] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            로그아웃
          </span>
        </button>
        <NavLink
          to="/account"
          onClick={onNavigate}
          aria-label="내 정보"
          title="내 정보"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full border-white bg-[#2A2C41] text-sm font-bold text-white shadow-md ring-1 ring-[#E8E6F2] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]"
        >
          {profileInitial}
          <span role="tooltip" className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-60 whitespace-nowrap rounded-md bg-[#2A2C41] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            내 정보
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
