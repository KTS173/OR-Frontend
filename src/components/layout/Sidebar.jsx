import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  Database,
  FileBarChart,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  Stethoscope,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

const menu = [
  { label: 'แดชบอร์ด', path: '/dashboard', icon: LayoutDashboard },
  { label: 'ตรวจสอบเคสจาก OR', path: '/or-validation', icon: ClipboardCheck },
  { label: 'คิว OPD', path: '/opd-queue', icon: Stethoscope, badge: 17 },
  { label: 'คิว IPD', path: '/ipd-queue', icon: UserRoundCheck, badge: 15 },
  { label: 'งานติดตามของฉัน', path: '/my-follow-ups', icon: ClipboardCheck, badge: 1 },
  { label: 'ปฏิทินติดตาม', path: '/calendar', icon: CalendarDays },
  { label: 'ประวัติการติดตาม', path: '/history', icon: History },
  { label: 'เคสสงสัย SSI', path: '/suspected-ssi', icon: ShieldAlert, badge: 2, danger: true },
  { label: 'เคสยืนยัน SSI', path: '/confirmed-ssi', icon: ShieldAlert, badge: 1, danger: true },
  { label: 'แพทย์ตรวจสอบ SSI', path: '/doctor-review', icon: Stethoscope },
  { label: 'รายงานและวิเคราะห์', path: '/reports', icon: FileBarChart },
  { label: 'การแจ้งเตือน', path: '/notifications', icon: Bell, badge: 12, danger: true },
]

const adminMenu = [
  { label: 'ค้นหาข้อมูลกลาง', path: '/central-search', icon: Search },
  { label: 'เอกสารข่าวสารกลาง', path: '/documents', icon: FileText },
  { label: 'ซิงค์ข้อมูลหลัก', path: '/his-sync', icon: Database },
  { label: 'ตั้งค่า', path: '/settings', icon: Settings },
  { label: 'จัดการผู้ใช้', path: '/users', icon: Users },
]

function NavItems({ items, onNavigate }) {
  return items.map(({ label, path, icon: Icon, badge, danger }) => (
    <NavLink
      key={path}
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
            : 'text-blue-100/75 hover:bg-white/8 hover:text-white'
        }`
      }
    >
      <Icon size={17} strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${danger ? 'bg-red-500 text-white' : 'bg-white/12 text-blue-50'}`}>
          {badge}
        </span>
      ) : null}
    </NavLink>
  ))
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()

  const logout = () => {
    sessionStorage.removeItem('or-smart-auth')
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[228px] flex-col bg-[#072d64] text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <img src="/assets/images/smalllogo.png" alt="Bangkok Hospital" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
            <div>
              <p className="text-sm font-bold tracking-wide">BANGKOK</p>
              <p className="text-[10px] tracking-[0.16em] text-blue-200">HOSPITAL</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-blue-200 hover:bg-white/10 lg:hidden"><ChevronLeft size={18} /></button>
        </div>

        <div className="px-4 py-3 text-[9px] tracking-[0.13em] text-blue-300 uppercase">Post discharge surveillance</div>
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          <NavItems items={menu} onNavigate={onClose} />
          <div className="my-3 border-t border-white/10" />
          <NavItems items={adminMenu} onNavigate={onClose} />
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/6 p-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-500 text-xs font-bold">AH</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">AdminHospitalBK</p>
              <p className="text-[10px] text-blue-300">Admin</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-blue-200 hover:bg-white/8 hover:text-white"><LogOut size={16} />ออกจากระบบ</button>
          <p className="mt-3 text-center text-[9px] text-blue-300/70">Bangkok Hospital OR SMART v1.0</p>
        </div>
      </aside>
      <button onClick={() => open || onClose()} className="sr-only"><Menu /></button>
    </>
  )
}
