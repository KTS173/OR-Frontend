import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-700">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[228px]">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
          <Outlet />
        </main>
        <footer className="mx-4 mb-4 flex flex-col justify-between gap-2 border-t border-slate-200 pt-3 text-[10px] text-slate-400 sm:mx-6 sm:flex-row">
          <span>ระบบ OR SMART SSI สำหรับบุคลากรโรงพยาบาลที่ได้รับอนุญาต</span>
          <span>© Bangkok Hospital · Version 1.0</span>
        </footer>
      </div>
    </div>
  )
}
