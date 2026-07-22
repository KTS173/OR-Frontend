import { ChevronLeft, ChevronRight, Eye, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function PatientTable({ patients, loading = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div><h2 className="text-sm font-semibold text-slate-800">รายการผู้ป่วย</h2><p className="mt-0.5 text-[10px] text-slate-400">ข้อมูลตัวอย่างสำหรับเชื่อมต่อ API</p></div>
        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><MoreHorizontal size={18} /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
            <tr><th className="table-cell">HN</th><th className="table-cell">ชื่อผู้ป่วย</th><th className="table-cell">อายุ/เพศ</th><th className="table-cell">หัตถการ</th><th className="table-cell">ศัลยแพทย์</th><th className="table-cell">แผนก</th><th className="table-cell">วันผ่าตัด</th><th className="table-cell">สถานะ</th><th className="table-cell"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index}>{Array.from({ length: 9 }).map((__, cell) => <td key={cell} className="table-cell"><div className="h-3 animate-pulse rounded bg-slate-100" /></td>)}</tr>) : patients.map((patient) => (
              <tr key={patient.id} className="transition hover:bg-blue-50/35">
                <td className="table-cell font-semibold text-blue-700">{patient.id}</td>
                <td className="table-cell font-medium text-slate-700">{patient.name}</td>
                <td className="table-cell text-slate-500">{patient.age} / {patient.sex}</td>
                <td className="table-cell max-w-44 truncate">{patient.procedure}</td>
                <td className="table-cell max-w-44 truncate">{patient.surgeon}</td>
                <td className="table-cell">{patient.department}</td>
                <td className="table-cell whitespace-nowrap">{patient.surgeryDate}</td>
                <td className="table-cell"><StatusBadge>{patient.status}</StatusBadge></td>
                <td className="table-cell"><Link to={`/cases/${patient.id}`} className="inline-flex rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label={`ดูเคส ${patient.id}`}><Eye size={16} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400">
        <span>แสดง {patients.length} จาก {patients.length} รายการ</span>
        <div className="flex items-center gap-1"><button className="page-button"><ChevronLeft size={13} /></button><button className="page-button bg-blue-600 text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button"><ChevronRight size={13} /></button></div>
      </div>
    </section>
  )
}
