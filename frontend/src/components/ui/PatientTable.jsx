import { ChevronLeft, ChevronRight, Eye, MoreHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function PatientTable({ patients, loading = false, dashboard = false, validation = false }) {
  const navigate = useNavigate()
  const columns = dashboard ? 5 : validation ? 14 : 9
  const openPatient = (patient) => navigate(`/cases/${patient.id}`)
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 ${validation ? 'min-h-[75px] px-4 py-3 sm:px-6' : 'px-4 py-3'}`}>
        <div><h2 className={`${dashboard || validation ? 'text-base text-[#002d73]' : 'text-sm text-slate-800'} font-medium`}>รายการติดตามผู้ป่วย <span className="text-sm text-slate-400">({patients.length} ราย)</span></h2>{!dashboard && !validation && <p className="mt-0.5 text-[10px] text-slate-400">ข้อมูลจากฐานข้อมูล</p>}</div>
        {dashboard ? <select className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500"><option>2569</option></select> : validation ? <select className="h-[42px] w-[154px] rounded-lg border border-[#e2e8f0] bg-white px-[17px] text-[14px]"><option>วันนี้</option></select> : <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><MoreHorizontal size={18} /></button>}
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-left ${dashboard ? 'min-w-[520px] text-[13px]' : validation ? 'min-w-[2258px] text-[14px]' : 'min-w-[980px] text-xs'}`}>
          <thead className="border-b border-slate-100 bg-slate-50 text-[12px] font-semibold uppercase tracking-[.6px] text-[#1e293b]">{dashboard ? <tr><th className="table-cell">HN</th><th className="table-cell">ชื่อผู้ป่วย</th><th className="table-cell">หัตถการ</th><th className="table-cell">ศัลยแพทย์</th><th className="table-cell">วันผ่าตัด</th></tr> : validation ? <tr>{['ข้อมูล HN','ชื่อผู้ป่วย','อายุ/เพศ','หัตถการ','ศัลยแพทย์','แผนก','วันที่จำหน่าย','วันที่ Admit','วันที่ผ่าตัด','สถานะจำหน่าย','ช่องทางติดต่อ','ความเสี่ยง SSI','สถานะตรวจสอบ','จัดการ'].map((h) => <th key={h} className="h-10 px-6 whitespace-nowrap text-center first:w-[110px] first:text-left">{h}</th>)}</tr> : <tr><th className="table-cell">HN</th><th className="table-cell">ชื่อผู้ป่วย</th><th className="table-cell">อายุ/เพศ</th><th className="table-cell">หัตถการ</th><th className="table-cell">ศัลยแพทย์</th><th className="table-cell">แผนก</th><th className="table-cell">วันผ่าตัด</th><th className="table-cell">สถานะ</th><th className="table-cell" /></tr>}</thead>
          <tbody
            className="divide-y divide-slate-100 [&_tr]:cursor-pointer"
            onClick={(event) => {
              const patientId = event.target.closest('tr')?.querySelector('td')?.textContent?.trim()
              const patient = patients.find((item) => item.id === patientId)
              if (patient) openPatient(patient)
            }}
          >
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: columns }).map((__, c) => <td key={c} className="table-cell"><div className="h-3 animate-pulse rounded bg-slate-100" /></td>)}</tr>) : patients.map((p) => dashboard ? <tr key={p.id} className="hover:bg-blue-50/35"><td className="table-cell font-semibold">{p.id}</td><td className="table-cell font-medium">{p.name}</td><td className="table-cell">{p.abbrev ?? p.procedure}</td><td className="table-cell">{p.surgeon}</td><td className="table-cell whitespace-nowrap">{p.surgeryDate}</td></tr> : validation ? <tr key={p.id} className="h-[88px] border-b border-slate-100 text-[#434651] hover:bg-blue-50/35"><td className="px-6 font-medium">{p.id}</td><td className="px-6 text-center">{p.name}</td><td className="px-6 text-center">{p.age} / {p.sex}</td><td className="px-6 text-center">{p.procedure}</td><td className="px-6 text-center">{p.surgeon}</td><td className="px-6 text-center">{p.department}</td><td className="px-6 text-center">-</td><td className="px-6 text-center">{p.episodeDate || '-'}</td><td className="px-6 text-center">{p.surgeryDate}</td><td className="px-6 text-center">-</td><td className="px-6 text-center">-</td><td className="px-6 text-center"><span className="inline-flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-full bg-orange-500" />{p.risk}</span></td><td className="px-6 text-center"><StatusBadge>{p.status}</StatusBadge></td><td className="px-6"><div className="flex items-center justify-end gap-1"><Link to={`/cases/${p.id}`} className="grid h-[25px] w-[25px] place-items-center rounded-lg border border-black/10 text-blue-600"><Eye size={16} /></Link><button className="h-[25px] rounded-lg border border-blue-100 px-2 text-[12px] text-blue-600">ติดตามข้อมูลคนไข้</button><button className="grid h-[25px] w-[25px] place-items-center rounded-lg border border-black/10"><MoreHorizontal size={16} /></button></div></td></tr> : <tr key={p.id} className="hover:bg-blue-50/35"><td className="table-cell font-semibold text-blue-700">{p.id}</td><td className="table-cell font-medium">{p.name}</td><td className="table-cell text-slate-500">{p.age} / {p.sex}</td><td className="table-cell max-w-44 truncate">{p.procedure}</td><td className="table-cell max-w-44 truncate">{p.surgeon}</td><td className="table-cell">{p.department}</td><td className="table-cell whitespace-nowrap">{p.surgeryDate}</td><td className="table-cell"><StatusBadge>{p.status}</StatusBadge></td><td className="table-cell"><Link to={`/cases/${p.id}`} className="inline-flex rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye size={16} /></Link></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className={`flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 sm:px-6 ${validation ? 'min-h-[47px] py-2 text-[12px] sm:text-[14px]' : 'py-2.5 text-[10px]'} text-slate-400`}><span>แสดง {patients.length} จาก {patients.length} รายการ</span><div className="flex items-center gap-1 sm:gap-2"><button className="page-button"><ChevronLeft size={13} /></button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button"><ChevronRight size={13} /></button></div></div>
    </section>
  )
}
