import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F1F1F1] text-[#232528]">
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative shrink-0">
          <Header />
          <button
            type="button"
            aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-controls="primary-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="absolute right-4 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
          >
            {isSidebarOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
        <main className="flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
