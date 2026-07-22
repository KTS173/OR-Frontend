import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'

const events = { 3: ['โทรติดตาม · 4'], 5: ['ประเมินแผล · 2'], 8: ['OPD · 6'], 10: ['โทรติดตาม · 5'], 12: ['ตรวจรูปแผล · 3'], 15: ['ครบกำหนด · 8', 'เกินกำหนด · 2'], 18: ['IPD · 4'], 22: ['แพทย์ประเมิน · 3'], 26: ['ปิดเคส · 7'] }

export default function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, index) => index - 1)
  return (
    <><PageHeader title="ปฏิทินติดตาม" description="กำหนดการติดตามผู้ป่วยและงานประจำวัน" actions={<button className="btn-primary"><Plus size={14} />สร้างงานติดตาม</button>} />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">{[['งานเดือนนี้', 118], ['กำหนดวันนี้', 8], ['เสร็จแล้ว', 42], ['เกินกำหนด', 9], ['รอแพทย์', 3]].map(([label, value]) => <div key={label} className="card py-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xl font-bold text-slate-800">{value}</p></div>)}</section>
      <section className="card"><div className="flex items-center justify-between"><button className="btn-secondary"><ChevronLeft size={15} /></button><h2 className="text-base font-bold text-slate-800">มิถุนายน 2569</h2><button className="btn-secondary"><ChevronRight size={15} /></button></div><div className="mt-5 grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200">{['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => <div key={day} className="bg-slate-50 p-2 text-center text-[10px] font-semibold text-slate-500">{day}</div>)}{days.map((day, index) => <div key={index} className={`min-h-24 border-t border-r border-slate-100 p-2 ${day < 1 || day > 30 ? 'bg-slate-50/50 text-slate-300' : day === 15 ? 'bg-blue-50/60' : 'bg-white'}`}><span className={`text-[11px] ${day === 15 ? 'grid h-6 w-6 place-items-center rounded-full bg-blue-600 font-bold text-white' : ''}`}>{day > 0 && day <= 30 ? day : ''}</span><div className="mt-1 space-y-1">{(events[day] ?? []).map((event) => <div key={event} className={`truncate rounded px-1.5 py-1 text-[9px] ${event.includes('เกิน') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{event}</div>)}</div></div>)}</div></section>
    </>
  )
}
