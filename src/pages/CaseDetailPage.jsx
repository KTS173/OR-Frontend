import { ArrowLeft, Calendar, Check, ClipboardPlus, Edit3, Phone, Send, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { patients } from '../data/mockData.js'

const timeline = ['รับข้อมูลจาก OR', 'ตรวจสอบข้อมูล', 'ส่งเข้าคิวติดตาม', 'ติดตามครั้งที่ 1', 'แพทย์ประเมิน', 'ปิดเคส']

export default function CaseDetailPage() {
  const { id } = useParams()
  const patient = patients.find((item) => item.id === id) ?? patients[0]
  return (
    <>
      <Link to="/or-validation" className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-blue-600"><ArrowLeft size={14} />กลับไปหน้ารายการ</Link>
      <PageHeader title="รายละเอียดเคสผ่าตัด" description={`OR Surgery Case Detail · HN ${patient.id}`} actions={<><button className="btn-secondary"><Edit3 size={14} />แก้ไขข้อมูล</button><button className="btn-primary"><Send size={14} />ส่งเข้าคิว OPD/IPD</button></>} />
      <section className="card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600"><UserRound size={28} /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-slate-800">{patient.name}</h2><StatusBadge>{patient.status}</StatusBadge></div><p className="mt-1 text-xs text-slate-400">HN {patient.id} · {patient.age} ปี · {patient.sex}</p></div></div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700"><strong>ข้อมูลครบถ้วน 92%</strong><p className="mt-1 text-[10px]">พร้อมส่งเข้าแผนติดตาม</p></div>
        </div>
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">{[['หัตถการ', patient.procedure], ['ศัลยแพทย์', patient.surgeon], ['แผนก', patient.department], ['วันที่ผ่าตัด', patient.surgeryDate]].map(([label, value]) => <div key={label}><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xs font-medium text-slate-700">{value}</p></div>)}</div>
      </section>
      <section className="card mt-4"><div className="card-title"><div><h2>สถานะการดำเนินงาน</h2><p>ลำดับ workflow ของเคส</p></div></div><div className="mt-5 flex min-w-[700px] items-start overflow-x-auto pb-2">{timeline.map((step, index) => <div key={step} className="relative flex flex-1 flex-col items-center text-center before:absolute before:top-4 before:right-1/2 before:left-[-50%] before:h-0.5 before:bg-blue-200 first:before:hidden"><span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full ${index < 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index < 3 ? <Check size={14} /> : index + 1}</span><p className="mt-2 text-[10px] font-medium text-slate-600">{step}</p></div>)}</div></section>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="card"><div className="card-title"><div><h2>ข้อมูลการรักษาและการผ่าตัด</h2><p>ข้อมูลจาก HIS / TrackCare</p></div></div><div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">{[['Diagnosis', 'Primary osteoarthritis, right knee'], ['ASA Class', 'Class II'], ['ประเภทแผล', 'Clean wound'], ['Implant', 'Total knee prosthesis'], ['Antibiotic prophylaxis', 'Cefazolin 2 g IV'], ['วันจำหน่าย', '12 มิ.ย. 2569']].map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-xs font-medium text-slate-700">{value}</p></div>)}</div></section>
        <section className="card"><div className="card-title"><div><h2>แผนการติดตาม</h2><p>รอบการเฝ้าระวัง</p></div><Calendar size={17} className="text-blue-600" /></div><div className="mt-3 space-y-3">{['Day 3 · โทรติดตาม', 'Day 7 · ประเมินแผล', 'Day 14 · ตรวจภาพแผล', 'Day 30 · ปิดการติดตาม'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><span className={`h-2.5 w-2.5 rounded-full ${index < 1 ? 'bg-emerald-500' : 'bg-blue-500'}`} /><span className="flex-1 text-xs text-slate-600">{item}</span>{index === 0 && <Check size={14} className="text-emerald-500" />}</div>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><button className="btn-secondary"><Phone size={14} />โทรติดตาม</button><button className="btn-primary"><ClipboardPlus size={14} />บันทึกผล</button></div></section>
      </div>
    </>
  )
}
