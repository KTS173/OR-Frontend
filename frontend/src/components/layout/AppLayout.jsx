import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SystemAnnouncement from '../ui/SystemAnnouncement.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const isSuspectedCases = pathname.startsWith('/suspected-') || pathname.startsWith('/doctor-review')

  return (
    <div className="or-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="or-content">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="or-page w-full flex-1">
          <Outlet />
        </main>
        <footer className="mx-4 mb-4 flex flex-col justify-between gap-2 border-t border-slate-200 pt-3 text-[16px] text-slate-400 sm:mx-6 sm:flex-row">
          <span>ระบบ OR SMART SSI สำหรับบุคลากรโรงพยาบาลที่ได้รับอนุญาต</span>
          <span>© Bangkok Hospital · Version 1.0</span>
        </footer>
      </div>
    </div>
  )
}
