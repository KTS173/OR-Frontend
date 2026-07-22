import { Filter, Search, X } from 'lucide-react'

export default function Filters({ search, onSearch, compact = false }) {
  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative xl:col-span-2">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} className="field pl-9" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." />
        </label>
        {!compact && <>
          <select className="field"><option>สถานะทั้งหมด</option><option>รอตรวจสอบ</option><option>กำลังติดตาม</option><option>เกินกำหนด</option></select>
          <select className="field"><option>ทุกแผนก</option><option>ศัลยกรรมกระดูก</option><option>ศัลยกรรมทั่วไป</option><option>หัวใจและทรวงอก</option></select>
        </>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1"><Filter size={14} />ค้นหา</button>
          <button onClick={() => onSearch('')} className="btn-secondary" aria-label="ล้างตัวกรอง"><X size={15} /></button>
        </div>
      </div>
    </section>
  )
}
