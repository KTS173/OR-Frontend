import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import AnnouncementFooter from './AnnouncementFooter.jsx'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.querySelector('.or-content')?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.querySelector('.or-page')?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, location.search])

  return (
    <div className="or-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="or-content">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="or-page w-full flex-1">
          <Outlet />
        </main>
        <AnnouncementFooter />
      </div>
    </div>
  )
}
