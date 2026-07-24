import { Filter, RefreshCw, Search, X } from 'lucide-react'

export default function Filters({ search, onSearch, compact = false, validation = false }) {
  if (validation) return <ValidationFilters search={search} onSearch={onSearch} />
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

function ValidationFilters({ search, onSearch }) {
  const fields = ['สถานะตรวจสอบ', 'หัตถการ', 'รอบการติดตาม', 'สถานะผู้ป่วย', 'สถานะผู้ป่วย']
  return <section className="rounded-xl border border-black/10 bg-white p-[25px] shadow-sm">
    <h2 className="flex items-center gap-2 text-[18px] leading-6 font-semibold text-[#191c1e]"><Search size={18} className="text-[#175beb]" />ค้นหาข้อมูล</h2>
    <div className="mt-4 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{fields.map((label, i) => <label key={`${label}-${i}`} className="flex flex-col gap-1 text-[14px] leading-[18px] text-[#424752]">{label}<select className="h-[39px] rounded-lg border border-[#e2e8f0] bg-white px-[13px] text-[15px] text-[#191c1e]"><option>ทั้งหมด</option></select></label>)}</div>
    <div className="mt-4 grid gap-[10px] lg:grid-cols-[201px_minmax(0,1fr)] xl:grid-cols-[201px_minmax(0,1fr)_246px]">
      <label className="flex flex-col gap-1 text-[14px] leading-[18px] text-[#424752]">ความเสี่ยง SSI<select className="h-[39px] rounded-lg border border-[#e2e8f0] bg-white px-[13px] text-[15px]"><option>ทั้งหมด</option></select></label>
      <label className="flex flex-col gap-1 text-[14px] leading-[18px] text-[#424752]">คำค้นหา<input value={search} onChange={(e) => onSearch(e.target.value)} className="h-[39px] rounded-lg border border-[#e2e8f0] px-[13px] text-[15px] outline-none" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." /></label>
      <div className="flex flex-wrap items-end gap-2 lg:col-span-2 xl:col-span-1"><button className="flex h-[42px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#175beb] px-6 text-[15px] font-semibold tracking-[.6px] text-white"><Search size={14} />ค้นหา</button><button onClick={() => onSearch('')} className="flex h-[42px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#e2e8f0] px-[17px] text-[15px] font-medium tracking-[.6px] text-[#424752]"><RefreshCw size={13} />ล้างตัวกรอง</button></div>
    </div>
  </section>
}
