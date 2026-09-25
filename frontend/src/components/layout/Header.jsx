import { Bell, CalendarDays, ChevronDown, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { api } from '../../services/api.js'

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
  '/his-sync': 'ข้อมูลที่เชื่อมต่อจาก HIS / TrackCare',
  '/settings': 'ตั้งค่า',
  '/users': 'จัดการผู้ใช้',
}

export default function Header({ onMenu }) {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { data: notifications, refetch } = useApiQuery(api.getNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const notificationRef = useRef(null)
  const unreadCount = notifications.filter((notification) => !notification.read_at).length
  useEffect(() => { const refresh = () => refetch(); const timer = window.setInterval(refresh, 60000); window.addEventListener('operations-updated', refresh); return () => { window.clearInterval(timer); window.removeEventListener('operations-updated', refresh) } }, [refetch])
  useEffect(() => {
    const closeOnOutsideClick = event => { if (!notificationRef.current?.contains(event.target)) setNotificationOpen(false) }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])
  const notificationLabels = { NEW_QUEUE: 'รับเคสใหม่', FOLLOW_UP_DUE: 'ถึงรอบติดตาม', FOLLOW_UP_OVERDUE: 'ติดตามเกินกำหนด', FOLLOW_UP_RECORDED: 'บันทึกติดตามตามรอบ', SSI_RISK_FOUND: 'พบความเสี่ยง SSI', SSI_SENT_TO_DOCTOR: 'ส่งให้แพทย์ตรวจสอบ', SSI_CONFIRMED: 'ยืนยัน SSI', SSI_NOT_CONFIRMED: 'ไม่พบการติดเชื้อ SSI', SSI_RECOVERED: 'หายจาก SSI', CASE_TRANSFERRED: 'ย้ายเคส', DOCUMENT_UPLOADED: 'เพิ่มเอกสาร', ADDITIONAL_ACTIVITY: 'เพิ่มกิจกรรมแทรก' }
  const openNotification = async notification => {
    setNotificationOpen(false)
    if (!notification.read_at) {
      try { await api.markNotificationRead(notification.notification_key); window.dispatchEvent(new Event('operations-updated')) } catch { /* เปิดรายละเอียดต่อได้ */ }
    }
    navigate(`/notifications?notification=${encodeURIComponent(notification.notification_key)}`)
  }
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
        <h1 className="min-w-0 truncate py-1 text-base leading-normal font-medium text-[#175beb] sm:text-xl xl:text-[24px]">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-6">
        <button className="hidden h-[42px] w-[182px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px] py-[9px] text-[14px] font-normal leading-6 text-[#1f2937] md:flex"><span className="flex items-center gap-2"><CalendarDays size={18} />{new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date())}</span><ChevronDown size={12} /></button>
        <div className="hidden h-8 w-px bg-[#e2e8f0] sm:block" />
        <div ref={notificationRef} className="relative">
          <button onClick={() => setNotificationOpen(value => !value)} className="bell-btn relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md" aria-label={`การแจ้งเตือนที่ยังไม่ได้อ่าน ${unreadCount} รายการ`} aria-expanded={notificationOpen}>
            <Bell size={20} className="bell-icon transition-transform duration-200" />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-rose-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse-subtle">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {notificationOpen && <section className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-[16px] font-semibold text-[#002d73]">การแจ้งเตือน</h2><p className="mt-0.5 text-[11px] text-slate-500">ยังไม่ได้อ่าน {unreadCount} รายการ</p></div><button type="button" onClick={() => { setNotificationOpen(false); navigate('/notifications') }} className="text-[12px] font-medium text-blue-600 hover:underline">ดูทั้งหมด</button></header>
            <div className="max-h-[420px] overflow-y-auto">{!notifications.length ? <p className="px-4 py-10 text-center text-[13px] text-slate-400">ยังไม่มีการแจ้งเตือน</p> : notifications.slice(0, 6).map(notification => <button key={notification.notification_key} type="button" onClick={() => openNotification(notification)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${notification.read_at ? 'bg-white' : 'bg-blue-50/50'}`}><span className={`mt-1 size-2 shrink-0 rounded-full ${notification.priority === 'HIGH' ? 'bg-red-500' : notification.read_at ? 'bg-slate-300' : 'bg-blue-600'}`} /><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-slate-800">{notificationLabels[notification.notification_type] || 'การแจ้งเตือน'}</span><span className="mt-1 line-clamp-2 block text-[12px] leading-5 text-slate-500">{notification.detail || '-'}</span><span className="mt-1.5 block text-[11px] text-slate-400">HN {notification.hn || '-'} · {notification.event_at ? new Date(notification.event_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</span></span></button>)}</div>
            <footer className="p-2"><button type="button" onClick={() => { setNotificationOpen(false); navigate('/notifications') }} className="h-9 w-full rounded-lg text-[13px] font-medium text-blue-600 hover:bg-blue-50">เปิดศูนย์แจ้งเตือน</button></footer>
          </section>}
        </div>
      </div>
    </header>
  )
}
