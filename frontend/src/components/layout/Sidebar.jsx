import {
  Bell,
  BedSingle,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  CloudDownload,
  Database,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { api } from '../../services/api.js'

const primaryMenu = [
  { label: 'แดชบอร์ด', path: '/dashboard', icon: LayoutDashboard },
  { label: 'ตรวจสอบเคสจาก OR', path: '/or-validation', icon: ClipboardCheck },
  { label: 'คิว OPD', path: '/opd-queue', icon: ClipboardList, badge: 17 },
  { label: 'คิว IPD', path: '/ipd-queue', icon: BedSingle, badge: 15 },
  { label: 'งานติดตามของฉัน', path: '/my-follow-ups', icon: ListChecks, countKey: 'followUps' },
  { label: 'ปฏิทินติดตาม', path: '/calendar', icon: CalendarDays },
  { label: 'ประวัติการติดตาม', path: '/history', icon: RotateCcw },
]

const ssiMenu = [
  { label: 'เคสสงสัย SSI', path: '/suspected-ssi', icon: ShieldAlert, countKey: 'suspected', danger: true },
  { label: 'เคสยืนยัน SSI', path: '/confirmed-ssi', icon: ShieldCheck, countKey: 'confirmed', danger: true },
  { label: 'แพทย์ตรวจสอบ SSI', path: '/doctor-review', icon: Stethoscope },
]

const reportMenu = [
  { label: 'รายงานและวิเคราะห์', path: '/reports', icon: ChartNoAxesColumnIncreasing },
  { label: 'การแจ้งเตือน', path: '/notifications', icon: Bell, countKey: 'notifications', danger: true },
]

const adminMenu = [
  { label: 'ข้อมูลจาก RIS', path: '/ris-operations', icon: Database },
  { label: 'ค้นหาข้อมูลกลาง', path: '/central-search', icon: Search },
  { label: 'เอกสารข่าวสารกลาง', path: '/documents', icon: FileText },
  { label: 'ซิงค์ข้อมูลหลัก', path: '/his-sync', icon: CloudDownload },
  { label: 'ตั้งค่า', path: '/settings', icon: Settings },
  { label: 'จัดการผู้ใช้', path: '/users', icon: Users },
]

function NavItems({ items, onNavigate, counts }) {
  const { pathname } = useLocation()
  return items.map(({ label, path, icon: Icon, badge, danger, countKey }) => {
    const isActive = pathname === path || 
      (path === '/my-follow-ups' && pathname.startsWith('/cases/')) ||
      (path === '/doctor-review' && pathname.startsWith('/suspected-cases/'))

    return (
      <NavLink
        key={path}
        to={path}
        onClick={onNavigate}
        className={
          `group flex h-[50px] items-center gap-4 rounded-[9px] px-4 text-[15px] font-medium transition ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
              : 'text-[#d7e5f3] hover:bg-white/8 hover:text-white'
          }`
        }
      >
        <Icon size={19} strokeWidth={2} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {(countKey ? counts[countKey] : badge) ? (
          <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-center text-[16px] font-bold ${danger ? 'bg-[#ff4747] text-white' : 'bg-[#286eea] text-white'}`}>
            {countKey ? counts[countKey] : badge}
          </span>
        ) : null}
      </NavLink>
    )
  })
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { data: patients, refetch } = useApiQuery(api.getPatients)
  const counts = {
    opd: patients.filter((patient) => patient.patientType === 'opd').length,
    ipd: patients.filter((patient) => patient.patientType === 'ipd').length,
    followUps: patients.filter((patient) => patient.patientType === 'opd' || patient.patientType === 'ipd').length,
    suspected: patients.filter((patient) => /SUSPECT|สงสัย/i.test(patient.status || '')).length,
    confirmed: patients.filter((patient) => /CONFIRM.*SSI|SSI.*CONFIRM|ยืนยัน.*SSI/i.test(patient.status || '')).length,
    notifications: 0,
  }

  useEffect(() => {
    const refresh = () => refetch()
    window.addEventListener('operations-updated', refresh)
    return () => window.removeEventListener('operations-updated', refresh)
  }, [refetch])

  const logout = () => {
    sessionStorage.removeItem('or-smart-auth')
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onClose} />}
      <aside className={`or-sidebar fixed inset-y-0 left-0 z-40 flex h-dvh flex-col text-white transition-transform lg:static lg:h-auto lg:min-h-[1368px] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex min-h-[158px] items-start justify-between border-b border-white/10 px-9 pt-9">
          <div className="flex items-center gap-3">
            <img src="/assets/images/smalllogo.png" alt="Bangkok Hospital" className="h-[51px] w-[49.11px] shrink-0 rounded-[9px] object-contain" />
            <div>
              <p className="font-['Inter'] text-[24px] leading-[28px] font-semibold tracking-[1px]">BANGKOK</p>
              <p className="font-['Inter'] text-[20px] leading-[28px] font-semibold tracking-[1px]">HOSPITAL</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-blue-200 hover:bg-white/10 lg:hidden"><ChevronLeft size={18} /></button>
        </div>

        <div className="pointer-events-none -mt-[55px] mb-[35px] px-[55px] text-[14px] text-blue-100/85">post discharge surveillance</div>
        <nav className="or-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-5 lg:overflow-visible">
          <div className="space-y-1"><NavItems items={primaryMenu.map((item) => item.path === '/opd-queue' ? { ...item, countKey: 'opd' } : item.path === '/ipd-queue' ? { ...item, countKey: 'ipd' } : item)} onNavigate={onClose} counts={counts} /></div>
          <div className="my-2 border-t border-white/10" />
          <div className="space-y-1"><NavItems items={ssiMenu} onNavigate={onClose} counts={counts} /></div>
          <div className="my-2 border-t border-white/10" />
          <div className="space-y-1"><NavItems items={reportMenu} onNavigate={onClose} counts={counts} /></div>
          <div className="my-2 border-t border-white/10" />
          <div className="space-y-1">
          <NavItems items={adminMenu} onNavigate={onClose} counts={counts} />
          </div>
        </nav>

        <div className="shrink-0 px-6 pb-6">
          <div className="mb-2 flex h-[104px] items-center gap-3 rounded-[9px] border border-blue-200/60 bg-white/5 px-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white bg-[#f5dfd5] text-lg">👩🏻</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">AdminHospitalBK</p>
              <p className="mt-1 flex items-center gap-2 text-[12px] text-blue-100"><span className="h-2 w-2 rounded-full bg-emerald-400" />Admin</p>
            </div>
            <ChevronLeft size={17} className="-rotate-90" />
          </div>
          <button onClick={logout} className="flex h-[50px] w-full items-center gap-4 rounded-[9px] border border-blue-200/60 px-5 text-[14px] font-semibold text-white hover:bg-white/8"><LogOut size={20} />ออกจากระบบ</button>
        </div>
        <div className="grid min-h-[72px] shrink-0 place-items-center border-t border-white/10 text-[16px] font-medium text-blue-50">Bangkok Hospital OR SMART v1.0</div>
      </aside>
      <button onClick={() => open || onClose()} className="sr-only"><Menu /></button>
    </>
  )
}
