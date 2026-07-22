import { Bell, Menu, Search } from 'lucide-react'

export default function Header({ onMenu }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="เปิดเมนู"><Menu size={19} /></button>
        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
          <input className="h-9 w-72 rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-slate-500 md:block">15 มิ.ย. 2569</span>
        <button className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="การแจ้งเตือน">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">12</span>
        </button>
        <div className="h-7 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">AH</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">Admin Hospital</p>
            <p className="text-[10px] text-slate-400">System Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
