import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="h-dvh overflow-hidden bg-onad-surfaceace ptextext-onad-dark md:p-8">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col overflow-hidden bg-white md:h-[calc(100vh-4rem)] md:rounded-4xl md:shadow-[0_20px_60px_-15px_rgba(42,44,65,0.16)]">
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <button
          type="button"
          aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-controls="primary-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen((open) => !open)}
          className="fixed right-4 top-4 z-60 flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E6F4] bg-white text-onad-purple shadow-sm transition-colors hover:bg-[#F3F1FF] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple md:hidden"
        >
          {isSidebarOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
        <main className="onad-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto bg-white p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
    </div>
  )
}

export default DashboardLayout
