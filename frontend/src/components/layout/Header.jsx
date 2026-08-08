import { Bell, CalendarDays, ChevronDown, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const routeTitles = {
  '/dashboard': 'แดชบอร์ด',
  '/or-validation': 'OR Validation List (รายการเคสที่ต้องตรวจสอบก่อนส่งเข้า Surveillance)',
  '/opd-queue': 'รายการ คิว OPD (ชื่อ-แผนก)',
  '/ipd-queue': 'รายการ คิว IPD (ชื่อ-แผนก)',
  '/my-follow-ups': 'งานติดตามของฉัน',
  '/calendar': 'ปฏิทินติดตาม',
  '/history': 'ประวัติการติดตาม',
  '/suspected-ssi': 'เคสสงสัยติดเชื้อ (Suspected SSI Cases)',
  '/confirmed-ssi': 'เคสสงสัยติดเชื้อ (Suspected SSI Cases)',
  '/doctor-review': 'เคสสงสัยติดเชื้อ (Suspected SSI Cases) (แพทย์ประเมินอาการ)',
  '/reports': 'รายงานและวิเคราะห์',
  '/notifications': 'ศูนย์แจ้งเตือน (Notifications Center)',
  '/central-search': 'ค้นหาข้อมูลกลาง',
  '/documents': 'เอกสารข่าวสารกลาง',
  '/his-sync': 'ซิงค์ข้อมูลหลัก',
  '/settings': 'ตั้งค่า',
  '/users': 'จัดการผู้ใช้',
}

export default function Header({ onMenu }) {
  const { pathname, search } = useLocation()
  const isSetup = search.includes('setup=true')
  let title = pathname.endsWith('/create-follow-up') ? 'สร้างบันทึกการเฝ้าระวัง (Create Follow-up)' : pathname.startsWith('/cases/') || pathname.startsWith('/follow-ups/') ? (isSetup ? 'ตั้งค่ารอบ follow-up' : 'งานติดตามของฉัน') : routeTitles[pathname] ?? 'OR SMART SSI'

  if (pathname.startsWith('/suspected-cases/')) {
    const parts = pathname.split('/')
    const subtab = parts[3]
    let subName = 'ข้อมูลคนไข้'
    if (subtab === 'evaluations') subName = 'ประวัติการประเมินอาการ'
    if (subtab === 'eval-detail') subName = 'เคสสงสัยSSI แพทย์'
    if (subtab === 'docs') subName = 'เอกสาร'
    title = `เคสสงสัยติดเชื้อ (Suspected SSI Cases) (${subName})`
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-[var(--or-header-height)] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-[var(--or-header-padding)]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button onClick={onMenu} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="เปิดเมนู"><Menu size={19} /></button>
        <h1 className="min-w-0 truncate text-base leading-5 font-medium text-[#175beb] sm:text-xl xl:text-[24px]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-6">
        <button className="hidden h-[42px] w-[182px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px] py-[9px] text-[14px] font-normal leading-6 text-[#1f2937] md:flex"><span className="flex items-center gap-2"><CalendarDays size={18} />{new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date())}</span><ChevronDown size={12} /></button>
        <div className="hidden h-8 w-px bg-[#e2e8f0] sm:block" />
        <button className="bell-btn relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md" aria-label="การแจ้งเตือน">
          <Bell size={20} className="bell-icon transition-transform duration-200" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-bold text-white shadow-sm animate-pulse-subtle">1</span>
        </button>
      </div>
    </header>
  )
}
