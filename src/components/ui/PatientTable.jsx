import { Check, ChevronLeft, ChevronRight, Clock3, Eye, MoreHorizontal, Phone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function PatientTable({ patients, loading = false, dashboard = false, validation = false }) {
  const navigate = useNavigate()
  const columns = dashboard ? 5 : validation ? 13 : 9
  const openPatient = (patient) => navigate(`/cases/${patient.id}?source=validation`)
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${dashboard ? 'patient-table-dashboard' : ''}`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 ${dashboard ? 'h-[65px] px-6' : validation ? 'min-h-[75px] px-4 py-3 sm:px-6' : 'px-4 py-3'}`}>
        <div><h2 className={`${dashboard || validation ? 'text-base text-[#002d73]' : 'text-sm text-slate-800'} font-medium`}>{dashboard ? 'รายการติดตามผู้ป่วย (1,250 ราย)' : validation ? 'รายการติดตามผู้ป่วย (58 ราย)' : 'รายการผู้ป่วย'}</h2>{!dashboard && !validation && <p className="mt-0.5 text-[10px] text-slate-400">ข้อมูลตัวอย่างสำหรับเชื่อมต่อ API</p>}</div>
        {dashboard ? <select className="h-[36px] w-[125px] rounded-lg border border-slate-300 bg-white px-4 text-[16px] font-base text-slate-500"><option>2569</option></select> : validation ? <select className="h-[42px] w-[154px] rounded-lg border border-[#e2e8f0] bg-white px-[17px] text-[14px]"><option>วันนี้</option></select> : <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><MoreHorizontal size={18} /></button>}
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-left ${dashboard ? 'min-w-[520px] text-[15px]' : validation ? 'min-w-[2258px] text-[15px]' : 'min-w-[980px] text-[15px]'}`}>
          <thead className="border-b border-slate-100 bg-slate-50 text-[14px] uppercase tracking-[.6px] text-slate-800 [&_th]:font-medium">{dashboard ? <tr className="h-14"><th className="px-8">HN</th><th className="px-8">ชื่อผู้ป่วย</th><th className="px-8">หัตถการ</th><th className="px-8">ศัลยแพทย์</th><th className="px-8">วันผ่าตัด</th></tr> : validation ? <tr>{['ข้อมูล HN', 'ชื่อผู้ป่วย', 'อายุ/เพศ', 'หัตถการ', 'ศัลยแพทย์', 'แผนก', 'วันที่ Admit', 'วันที่ผ่าตัด', 'วันที่จำหน่าย', 'ช่องทางติดต่อ', 'ความเสี่ยง SSI', 'สถานะตรวจสอบ', 'จัดการ'].map((h) => <th key={h} className="h-10 px-6 whitespace-nowrap text-center first:w-[110px] first:text-left">{h}</th>)}</tr> : <tr><th className="table-cell">HN</th><th className="table-cell">ชื่อผู้ป่วย</th><th className="table-cell">อายุ/เพศ</th><th className="table-cell">หัตถการ</th><th className="table-cell">ศัลยแพทย์</th><th className="table-cell">แผนก</th><th className="table-cell">วันผ่าตัด</th><th className="table-cell">สถานะ</th><th className="table-cell" /></tr>}</thead>
          <tbody
            className="divide-y divide-slate-100 [&_tr]:cursor-pointer"
            onClick={(event) => {
              const patientId = event.target.closest('tr')?.querySelector('td')?.textContent?.trim()
              const patient = patients.find((item) => item.id === patientId)
              if (patient) openPatient(patient)
            }}
          >
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: columns }).map((__, c) => <td key={c} className="table-cell"><div className="h-3 animate-pulse rounded bg-slate-100" /></td>)}</tr>) : (dashboard ? patients.slice(0, 5) : patients).map((p, index) => dashboard ? <tr key={p.id} className="h-28 text-[16px] font-normal text-[#4b5563] hover:bg-blue-50/35"><td className="px-8 font-medium">{p.id}</td><td className="px-8 whitespace-nowrap">{p.name}</td><td className="px-8 whitespace-nowrap">{p.abbrev ?? p.procedure}</td><td className="px-8 whitespace-nowrap">{p.surgeon}</td><td className="px-8 whitespace-nowrap">{p.surgeryDate}</td></tr> : validation ? <ValidationPatientRow key={`${p.id}-${index}`} patient={p} index={index} /> : <tr key={p.id} className="hover:bg-blue-50/35"><td className="table-cell font-semibold text-blue-700">{p.id}</td><td className="table-cell font-medium">{p.name}</td><td className="table-cell text-slate-500">{p.age} / {p.sex}</td><td className="table-cell max-w-44 truncate">{p.procedure}</td><td className="table-cell max-w-44 truncate">{p.surgeon}</td><td className="table-cell">{p.department}</td><td className="table-cell whitespace-nowrap">{p.surgeryDate}</td><td className="table-cell"><StatusBadge>{p.status}</StatusBadge></td><td className="table-cell"><Link to={`/cases/${p.id}`} className="inline-flex rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye size={16} /></Link></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className={`flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 sm:px-6 ${dashboard ? 'min-h-[60px] text-[16px]' : validation ? 'min-h-[47px] py-2 text-[12px] sm:text-[14px]' : 'py-2.5 text-[10px]'} text-slate-400`}><span>{dashboard || validation ? 'Showing 10 of 10 Historical Log' : `แสดง ${patients.length} จาก ${patients.length} รายการ`}</span><div className="flex items-center gap-1 sm:gap-2">{dashboard ? <><button className="h-[38px] rounded-lg border border-slate-200 px-5 text-[16px] font-normal text-slate-500">Previous</button><button className="page-button h-[38px] min-w-[38px] bg-[#175beb] text-[16px] text-white">1</button><button className="page-button h-[38px] min-w-[38px] text-[16px]">2</button><button className="page-button h-[38px] min-w-[38px] text-[16px]">3</button><button className="h-[38px] rounded-lg border border-slate-200 px-5 text-[16px] font-normal text-slate-500">Next</button></> : <><button className="page-button"><ChevronLeft size={13} /></button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button"><ChevronRight size={13} /></button></>}</div></div>
    </section>
  )
}

function ValidationPatientRow({ patient: p, index }) {
  const discharged = index !== 6
  const contactComplete = ![4, 5].includes(index)
  const reviewStatus = index === 6 ? 'ส่งแล้ว' : 'รอตรวจสอบ'
  const actionLabel = index === 4 || index === 5 ? 'แก้ไข' : index === 6 ? 'ตัดออก' : 'ตรวจสอบ'
  const risk = p.risk || (index === 0 || index === 6 ? 'ต่ำ' : index < 3 ? 'ปานกลาง' : 'สูง')
  const riskColor = risk === 'ต่ำ' ? 'bg-emerald-500' : risk === 'ปานกลาง' ? 'bg-orange-500' : 'bg-red-500'

  return (
    <tr className="h-[88px] border-b border-slate-100 text-[15px] font-normal text-[#434651] hover:bg-blue-50/35">
      <td className="px-6 font-medium">{p.id}</td>
      <td className="px-6 text-center">{p.name}</td>
      <td className="px-6 text-center">{p.age} / {p.sex}</td>
      <td className="px-6 text-center">{p.procedure}</td>
      <td className="px-6 text-center">{p.surgeon}</td>
      <td className="px-6 text-center">{p.department}</td>
      <td className="px-6 text-center">08/06/2569</td>
      <td className="px-6 text-center">{p.surgeryDate}</td>
      <td className="px-6 text-center">
        <span className={`inline-flex items-center gap-1.5 ${discharged ? 'text-emerald-600' : 'text-orange-500'}`}>
          {discharged ? (
            <span className="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border-[1.5px] border-current">
              <Check size={9} strokeWidth={4} />
            </span>
          ) : <Clock3 size={15} />}
          {discharged ? 'จำหน่ายแล้ว' : 'ยังไม่จำหน่าย'}
        </span>
        {discharged && <span className="mt-1 block text-[#434651]">15/06/2569</span>}
      </td>
      <td className={`px-6 text-center ${contactComplete ? 'text-emerald-600' : 'text-rose-500'}`}>
        <span className="inline-flex items-center gap-2 whitespace-nowrap"><Phone size={15} />{contactComplete ? 'ครบถ้วน' : 'เบอร์โทรไม่ครบ'}</span>
      </td>
      <td className="px-6 text-center"><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><i className={`h-2 w-2 rounded-full ${riskColor}`} />{risk}</span></td>
      <td className="px-6 text-center">
        <span className={`inline-flex rounded-md border px-2.5 py-1 text-[12px] ${reviewStatus === 'ส่งแล้ว' ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-orange-200 bg-orange-50 text-orange-500'}`}>{reviewStatus}</span>
      </td>
      <td className="px-6">
        <div className="flex items-center justify-center gap-1.5" onClick={(event) => event.stopPropagation()}>
          <Link to={`/cases/${p.id}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-blue-600"><Eye size={16} /></Link>
          <button className={`h-8 whitespace-nowrap rounded-lg border px-3 text-[12px] font-normal ${actionLabel === 'ตัดออก' ? 'border-rose-200 text-rose-500' : actionLabel === 'แก้ไข' ? 'border-orange-200 text-orange-500' : 'border-blue-100 text-blue-600'}`}>{actionLabel}</button>
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-blue-600" aria-label="เมนูเพิ่มเติม"><MoreHorizontal size={17} /></button>
        </div>
      </td>
    </tr>
  )
}
