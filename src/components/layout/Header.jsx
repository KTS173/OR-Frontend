import { Bell, CalendarDays, ChevronDown, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const routeTitles = {
  '/dashboard': 'แดชบอร์ด',
  '/or-validation': 'OR Validation List (รายการเคสที่ต้องตรวจสอบก่อนส่งเข้า Surveillance)',
  '/opd-queue': 'รายการ คิว OPD (ชื่อ-แผนก)',
  '/ipd-queue': 'คิว IPD',
  '/my-follow-ups': 'งานติดตามของฉัน',
  '/calendar': 'ปฏิทินติดตาม',
  '/history': 'ประวัติการติดตาม',
  '/suspected-ssi': 'เคสสงสัย SSI',
  '/confirmed-ssi': 'เคสยืนยัน SSI',
  '/doctor-review': 'แพทย์ตรวจสอบ SSI',
  '/reports': 'รายงานและวิเคราะห์',
  '/notifications': 'การแจ้งเตือน',
  '/central-search': 'ค้นหาข้อมูลกลาง',
  '/documents': 'เอกสารข่าวสารกลาง',
  '/his-sync': 'ซิงค์ข้อมูลหลัก',
  '/settings': 'ตั้งค่า',
  '/users': 'จัดการผู้ใช้',
}

export default function Header({ onMenu }) {
  const { pathname } = useLocation()
  const title = pathname.endsWith('/create-follow-up') ? 'สร้างบันทึกการเฝ้าระวัง (Create Follow-up)' : pathname.startsWith('/cases/') ? 'รายละเอียดเคสผ่าตัด (OR Surgery Case Detail)' : routeTitles[pathname] ?? 'OR SMART SSI'
  return (
    <header className="sticky top-0 z-20 flex min-h-[var(--or-header-height)] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-[var(--or-header-padding)]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button onClick={onMenu} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="เปิดเมนู"><Menu size={19} /></button>
        <h1 className="min-w-0 truncate text-base leading-5 font-medium text-[#175beb] sm:text-xl xl:text-[24px]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-6">
        <button className="hidden h-[42px] w-[182px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px] py-[9px] text-[14px] font-normal leading-6 text-[#1f2937] md:flex"><span className="flex items-center gap-2"><CalendarDays size={18} />15 มิ.ย 2569</span><ChevronDown size={12} /></button>
        <div className="hidden h-8 w-px bg-[#e2e8f0] sm:block" />
        <button className="relative rounded-full p-1 text-slate-700 hover:bg-slate-50" aria-label="การแจ้งเตือน">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 grid h-[19px] min-w-[19px] place-items-center rounded-full border-2 border-white bg-[#e53935] p-0.5 text-[10px] leading-[15px] font-bold text-white">1</span>
        </button>
      </div>
    </header>
  )
}
