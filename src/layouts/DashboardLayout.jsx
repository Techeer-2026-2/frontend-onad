import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F3F4FB] p-0 text-[#2A2C41] md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1600px] flex-col overflow-hidden bg-white md:rounded-[2rem] md:shadow-[0_20px_60px_-15px_rgba(42,44,65,0.16)]">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}
        <Sidebar
          isOpen={isSidebarOpen}
          onNavigate={() => setIsSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="relative shrink-0">
          <Header />
          <button
            type="button"
            aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-controls="primary-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="absolute right-4 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-[#E7E6F4] bg-white text-[#6C48F5] shadow-sm transition-colors hover:bg-[#F3F1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5] md:hidden"
          >
            {isSidebarOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
        <main className="flex-1 space-y-6 overflow-y-auto bg-[#FBFBFE] p-5 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
    </div>
  )
}

export default DashboardLayout
