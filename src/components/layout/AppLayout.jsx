import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SystemAnnouncement from '../ui/SystemAnnouncement.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const systemAnnouncement = {
  date: '15 มิ.ย. 2569',
  message: 'ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.',
}

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
        <footer className="mx-4 mb-4 sm:mx-6">
          <SystemAnnouncement
            date={systemAnnouncement.date}
            message={systemAnnouncement.message}
          />
        </footer>
      </div>
    </div>
  )
}
