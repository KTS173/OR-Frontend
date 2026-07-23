import { AlertTriangle, ArrowLeft, ArrowRight, Check, Info, MinusCircle, RefreshCw, Send, UserRound, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { patients } from '../data/mockData.js'

const validationItems = ['ข้อมูลผู้ป่วยครบถ้วน', 'มีข้อมูลหัตถการ', 'มีศัลยแพทย์', 'มีข้อมูลวันผ่าตัด', 'มีวันจำหน่าย', 'มีเบอร์โทรศัพท์พร้อมใช้งาน']
const followUpDays = ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 28', 'Day 30']

function DetailRow({ label, value }) {
  return <div className="flex min-h-5 items-start justify-between gap-4 text-[14px] leading-5 text-[#424752]"><span>{label}</span><strong className="text-right font-medium">{value}</strong></div>
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const patient = patients.find((item) => item.id === id) ?? patients[0]
  const [queueOpen, setQueueOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [excludeOpen, setExcludeOpen] = useState(false)

  const handleSend = () => {
    setQueueOpen(false)
    setSuccessOpen(true)
  }

  if (pathname.startsWith('/follow-ups/')) return <FollowUpCaseDetail patient={patient}/>

  return (
    <>
      <div className="flex h-6 items-center justify-between"><Link to="/or-validation" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12}/>กลับไปหน้ารายการ</Link><div className="flex items-center gap-2"><span className="rounded-full bg-blue-50 px-2 py-1 text-[12px] text-blue-600">ข้อมูลจาก HIS / TrackCare</span><StatusBadge>{patient.status}</StatusBadge></div></div>
      <PatientSummary patient={patient}/>
      <nav className="mt-3 flex h-[73px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px]"><div className="flex h-[39px] gap-6 border-b border-[#e2e8f0]"><button className="border-b-2 border-[#175beb] text-[16px] font-medium text-[#175beb]">ข้อมูลคนไข้</button><button className="text-[16px] text-[#424752]">เอกสารอ้างอิง</button></div><button className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px]"><RefreshCw size={14}/>รีเฟรช</button></nav>
      <SurgerySection patient={patient}/>
      <ContactAndProcedures patient={patient}/>
      <FollowUpTimeline/>
      <ActionBar onExclude={() => setExcludeOpen(true)} onQueue={() => setQueueOpen(true)}/>
      {queueOpen && <QueueModal patient={patient} onClose={() => setQueueOpen(false)} onSend={handleSend} />}
      {successOpen && <SuccessModal patient={patient} onClose={() => setSuccessOpen(false)} />}
      {excludeOpen && <ExcludeCaseModal patient={patient} onClose={() => setExcludeOpen(false)} />}
    </>
  )
}

function FollowUpCaseDetail({ patient }) {
  return <>
    <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
      <Link to="/my-follow-ups" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12}/>กลับไปหน้ารายการ</Link>
      <div className="flex items-center gap-2">
        <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] text-emerald-600">สร้าง Follow-up สำเร็จ</span>
        <span className="rounded border border-orange-200 bg-orange-50 px-2.5 py-1 text-[12px] text-orange-500">ต้องติดตามวันนี้</span>
      </div>
    </div>
    <PatientSummary patient={patient}/>
    <FollowUpTabs/>
    <FollowUpTimeline/>
    <SurgerySection patient={patient}/>
    <ContactAndProcedures patient={patient}/>
  </>
}

function FollowUpTabs() {
  const tabs = ['ข้อมูลคนไข้', 'ประเมินตามรอบ (รอบที่ 1)', 'การติดตาม / Timeline', 'ย้ายเคส / ส่งต่อการดูแล', 'เอกสาร']
  return <nav className="mt-3 flex min-h-[73px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white px-[17px] py-2 shadow-sm">
    <div className="flex min-w-0 items-center gap-6 overflow-x-auto">
      {tabs.map((tab, index)=><button key={tab} className={`h-12 shrink-0 text-[14px] font-medium ${index === 0 ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>{tab}</button>)}
    </div>
    <button className="inline-flex h-[42px] shrink-0 items-center gap-2 rounded-lg bg-[#175beb] px-5 text-[14px] font-medium text-white shadow-sm"><span className="text-lg leading-none">+</span>เพิ่มกิจกรรมแรก</button>
  </nav>
}

function ActionBar({ onExclude, onQueue }) {
  return <section className="mt-3 flex h-[62px] items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-6 shadow-sm">
    <button onClick={onExclude} className="inline-flex h-[37px] items-center justify-center gap-2 rounded-xl border border-red-400 bg-white px-5 text-[14px] font-medium text-red-500 transition hover:bg-red-50"><MinusCircle size={16}/>ตัดเคสออก</button>
    <div className="flex w-[291px] items-center gap-3">
      <button className="inline-flex h-[37px] w-[133px] items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] font-medium text-[#424752]"><Check size={14}/>บันทึกข้อมูล</button>
      <button onClick={onQueue} className="inline-flex h-[38px] w-[146px] items-center justify-center gap-2 rounded-lg bg-[#175beb] text-[14px] font-medium text-white shadow-sm"><Send size={14}/>ส่งเข้า Queue</button>
    </div>
  </section>
}

function PatientSummary({ patient }) {
  return <section className="mt-3 grid gap-3 xl:grid-cols-[827fr_273fr]"><PatientInfoCard patient={patient}/><aside className="h-[273px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h2 className="text-[16px] font-medium leading-7 text-[#424752]">สถานะข้อมูล (Validation)</h2><div className="mt-2 space-y-2">{validationItems.map(item=><p key={item} className="flex items-center gap-2 text-[14px] leading-5 text-[#424752]"><span className="grid size-[18px] place-items-center rounded-full bg-[#16a34a] text-white"><Check size={12} strokeWidth={3}/></span>{item}</p>)}</div><div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-[5px] text-center text-[12px] leading-6 text-emerald-700">ข้อมูลพร้อมสำหรับสร้าง Follow-up</div></aside></section>
}

export function PatientInfoCard({ patient }) {
  return <article className="flex min-h-[273px] items-center gap-[31px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] pb-[25px] pt-[13px] shadow-sm">
    <div className="grid size-[98px] shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50/40 text-[#175beb]"><UserRound size={60} strokeWidth={1.4}/></div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[14px] font-medium leading-7 text-[#424752]">HN <span className="ml-1">{patient.id}</span></p><h2 className="text-[24px] font-semibold leading-8 text-[#191c1e]">{patient.name}</h2></div>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px] text-[#424752]"><span>ประเภทผู้ป่วย</span><span className="rounded-md bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-[#175beb]">OPD</span><span className="ml-2">สถานะเคส</span><span className="rounded-md bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-[#175beb]">ติดตามโดยOPD</span></div>
      </div>
      <div className="mt-[11px] grid grid-cols-[177px_161px_1fr]">
        <div className="space-y-2"><DetailRow label="เพศ" value={patient.sex ?? 'ชาย'}/><DetailRow label="อายุ" value={`${patient.age ?? 68} ปี`}/><DetailRow label="เบอร์โทร" value="081-234-5678"/><DetailRow label="วันเกิด" value="17 ม.ค. 2501"/></div>
        <div className="ml-2 space-y-2 border-l border-black/10 px-3"><DetailRow label="เชื้อชาติ" value="ไทย"/><DetailRow label="สัญชาติ" value="ไทย"/><DetailRow label="สิทธิการรักษา" value="-"/></div>
        <div className="ml-2 border-l border-black/10 pl-3 text-[14px] text-[#424752]"><p>ที่อยู่</p><strong className="mt-2 block font-medium">99/9 หมู่ 4 จ.เชียงใหม่ 5100</strong></div>
      </div>
    </div>
  </article>
}

function SurgerySection({ patient }) {
  const surgery = [['วันที่ผ่าตัด',patient.surgeryDate],['วันที่จำหน่าย','15 มิ.ย. 2569'],['เวลาเริ่มผ่าตัด','10:10 น.'],['เวลาสิ้นสุดผ่าตัด','12:10 น.'],['ระยะเวลาผ่าตัด','2 ชม. 40 นาที'],['ประเภทผู้ป่วย','OPD'],['หัตถการ',patient.procedure]]
  return <section className="mt-3 grid gap-3 xl:grid-cols-[740fr_360fr]"><article className="h-[274px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลการผ่าตัด (Surgery Information)</h3><div className="mt-3 grid grid-cols-2 gap-x-6"><div className="space-y-2">{surgery.map(([l,v])=><DetailRow key={l} label={l} value={v}/>)}</div><div className="space-y-2 border-l border-black/10 pl-6">{[['ศัลยแพทย์',patient.surgeon],['แผนก',patient.department],['ห้องผ่าตัด','OR 4'],['ประเภทแผล','Clean wound'],['ASA Class','Class II'],['Implant','Total knee prosthesis'],['Diagnosis','Primary osteoarthritis']].map(([l,v])=><DetailRow key={l} label={l} value={v}/>)}</div></div></article><article className="h-[274px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm"><h3 className="px-6 py-[13px] text-[16px] font-medium text-[#002d73]">ปัจจัยเสี่ยง SSI</h3>{[['อายุ > 60 ปี','มี'],['เบาหวาน','มี'],['การติดเชื้อก่อนผ่าตัด','ไม่มี']].map(([l,v])=><div key={l} className="flex h-[42px] items-center justify-between border-t border-slate-100 px-6 text-[14px] text-[#424752]"><span>{l}</span><span className="inline-flex items-center gap-2"><span className={`grid size-[18px] place-items-center rounded-full text-white ${v==='มี'?'bg-[#16a34a]':'bg-slate-400'}`}><Check size={12}/></span>{v}</span></div>)}<div className="flex h-[58px] items-center justify-between border-t border-black/10 px-6 text-[14px] font-medium"><span>Risk Score</span><span className="flex items-center gap-3 font-semibold">72 % <i className="size-[7px] rounded-full bg-[#f57e0c]"/>ปานกลาง</span></div></article></section>
}

function ContactAndProcedures({ patient }) {
  const contacts = [
    ['/assets/icon/dashboard/phone.png', 'เบอร์โทรหลัก', '081-234-5678'],
    ['/assets/icon/dashboard/phone.png', 'เบอร์โทร 2', '-'],
    ['/assets/icon/user info/line_svgrepo.com.png', 'Line', 'Somchai_jaidee'],
    ['/assets/icon/user info/sms.png', 'SMS', '081-234-5678'],
    ['/assets/icon/user info/email.png', 'อีเมล', '-'],
  ]
  return <section className="mt-3 grid min-h-[216px] gap-3 xl:grid-cols-[332fr_740fr]">
    <article className="rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm">
      <h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลติดต่อ (Contact)</h3>
      <div className="mt-3 space-y-3">{contacts.map(([icon,label,value])=><div key={label} className="flex items-center justify-between text-[14px] leading-5 text-[#424752]"><span className="inline-flex items-center gap-2"><img src={icon} alt="" className="h-5 w-5 shrink-0 object-contain"/>{label}</span><strong className="font-medium">{value}</strong></div>)}</div>
    </article>
    <article className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-[13px] shadow-sm">
      <h3 className="inline-flex items-center gap-1 text-[16px] font-medium leading-7 text-[#002d73]">รายการหัตถการในเคส (มี 1 รายการ)<Info size={17} className="text-[#64748b]"/></h3>
      <div className="overflow-hidden border border-black/10 shadow-sm"><table className="w-full table-fixed text-[12px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold uppercase tracking-[.6px] text-[#1e293b]"><tr><th className="w-[110px] text-center">ลำดับ</th><th className="text-left">หัตถการ</th><th className="text-left">ศัลยแพทย์</th><th className="w-[140px] text-center">สถานะ SSI</th></tr></thead><tbody><tr className="h-[57px]"><td className="text-center font-medium">1</td><td>TKA (เข่าขวา)</td><td>{patient.surgeon.replace('นพ.', 'นพ')}</td><td className="text-center"><span className="inline-flex items-center gap-1 text-[#16a34a]"><i className="size-[7px] rounded-full bg-[#16a34a]"/>เข้าเกณฑ์</span></td></tr></tbody></table></div>
      <div className="flex min-h-[34px] items-center gap-2 rounded border border-[#0057b8]/10 bg-[#eff6ff] px-[13px] py-[5px] text-[12px] leading-6 text-[#0057b8]"><Info size={17} className="shrink-0"/>เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up</div>
    </article>
  </section>
}

function FollowUpTimeline() {
  return <section className="mt-3 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><h3 className="text-[16px] font-semibold text-[#002d73]">การติดตามที่แนะนำ</h3><span className="text-[14px] text-[#424752]">(ยังไม่ได้สร้าง Follow-up)</span></div><p className="text-[14px] text-[#424752]">ระบบแนะนำรอบการติดตามมาตรฐานสำหรับหัตถการนี้</p><div className="relative mx-4 mt-8 flex h-[111px] items-start justify-between before:absolute before:top-2 before:right-4 before:left-4 before:h-0.5 before:bg-[#696969]">{followUpDays.map(day=><div key={day} className="relative z-10 flex flex-col items-center"><i className="size-4 rounded-full bg-[#696969] shadow-[0_0_0_4px_white]"/><strong className="mt-2 text-[12px] font-semibold text-[#3b82f6]">{day}</strong><span className="text-[10px] text-[#424752]">ยังไม่เริ่ม</span></div>)}</div><div className="flex gap-[13px] text-[14px]">{[['#16a34a','ดำเนินการสำเร็จ'],['#3b82f6','อยู่ระหว่างติดตามดำเนินการ'],['#696969','ยังไม่เริ่มติดตาม']].map(([c,l])=><span key={l} className="flex items-center gap-2"><i className="size-[10px] rounded-full" style={{backgroundColor:c}}/>{l}</span>)}</div><p className="mt-3 rounded-md bg-[#f2f4f6] p-2 text-[12px] text-[#424752]">หมายเหตุ: วันที่อาจเปลี่ยนแปลงได้ตามการกำหนดของโรงพยาบาล</p></section>
}

function ExcludeCaseModal({ patient, onClose }) {
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const canSubmit = reason && confirmed
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#334155]/45 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="exclude-title" className="relative flex w-full max-w-[512px] max-h-[90vh] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl" onMouseDown={event=>event.stopPropagation()}>
      <button onClick={onClose} className="absolute right-6 top-6 z-10 text-[#9ca3af]"><X size={22} strokeWidth={2.4}/></button>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-5 pt-8 text-center">
        <div className="mx-auto grid size-[64px] place-items-center rounded-full border-4 border-[#fda4af] bg-[#fee2e2] text-[#ef191f]"><AlertTriangle size={25} strokeWidth={2.5}/></div>
        <h2 id="exclude-title" className="mt-4 text-[24px] font-semibold leading-8 text-[#202124]">ไม่เข้าเงื่อนไขการเฝ้าระวัง SSI</h2>
        <p className="mt-2 text-[16px] text-[#6b7280]">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>
        <div className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-left text-[#20242b]"><div className="flex items-baseline gap-x-5"><strong className="text-[17px]">HN {patient.id}</strong><strong className="text-[18px]">{patient.name}</strong></div><p className="mt-2 text-[14px] font-medium text-[#4b5563]">{patient.sex} • อายุ {patient.age} ปี (17 ม.ค. 2501)</p><p className="mt-2 text-[14px] font-medium text-[#4b5563]">หัตถการ: TKA (เข่าขวา)</p><div className="mt-2 flex gap-x-6 text-[14px] font-medium text-[#4b5563]"><span>วันที่ผ่าตัด: 10 มิ.ย. 2569</span><span>วันที่จำหน่าย: 15 มิ.ย. 2569</span></div></div>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">เหตุผลที่ไม่เข้าเงื่อนไข <span className="text-red-500">*</span><select value={reason} onChange={event=>setReason(event.target.value)} className="mt-2 h-[44px] w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#64748b] shadow-sm outline-none focus:border-[#175beb]"><option value="">เลือกเหตุผล</option><option>หัตถการไม่เข้าเกณฑ์ SSI Surveillance</option><option>ข้อมูลผู้ป่วยซ้ำ</option><option>ยกเลิกการผ่าตัด</option><option>เหตุผลอื่น</option></select></label>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">รายละเอียดเพิ่มเติม (ถ้ามี)<textarea className="mt-2 h-[78px] w-full resize-none rounded-lg border border-[#cbd5e1] p-3 text-[14px] shadow-sm outline-none focus:border-[#175beb]" placeholder="ระบุรายละเอียดเพิ่มเติม"/></label>
        <label className="mt-4 flex items-center gap-3 text-left text-[14px] font-medium text-[#334155]"><input checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} type="checkbox" className="size-5 rounded accent-[#175beb]"/>ยืนยันว่าข้อมูลถูกต้องและไม่เข้าเกณฑ์การเฝ้าระวัง</label>
      </div>
      <footer className="grid h-[82px] shrink-0 grid-cols-2 gap-3 border-t border-[#f1f5f9] bg-[#fafafa] px-8 py-4"><button onClick={onClose} className="rounded-lg border border-[#cbd5e1] bg-white text-[16px] font-semibold text-[#374151] shadow-sm">ยกเลิก</button><button disabled={!canSubmit} onClick={onClose} className={`rounded-lg text-[16px] font-semibold text-white shadow-sm ${canSubmit?'bg-[#e92323] hover:bg-red-700':'cursor-not-allowed bg-[#f87171]'}`}>ยืนยันการยกออก</button></footer>
    </section>
  </div>
}

function QueueModal({ patient, onClose, onSend }) {
  return <div className="fixed inset-0 z-50 bg-slate-950/45" onMouseDown={onClose}><aside className="absolute inset-y-0 right-0 w-full max-w-[708px] overflow-y-auto bg-white shadow-2xl" onMouseDown={(e)=>e.stopPropagation()}>
    <header className="flex h-[85px] items-center justify-between border-b border-slate-200 px-6"><div><h2 className="text-[20px] font-semibold text-[#1f2937]">ส่งเคสไปยัง OPD/IPD Queue</h2><p className="mt-1 text-[14px] text-slate-500">กำหนดปลายทางและแผนการติดตามเบื้องต้นก่อนส่งต่อ</p></div><button onClick={onClose}><X size={20} className="text-slate-400"/></button></header>
    <div className="space-y-6 p-6">
      <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-[17px]"><h3 className="flex items-center gap-2 text-[16px] font-semibold text-blue-800"><Users size={20}/>สรุปข้อมูลเคส</h3><div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">{[['ชื่อผู้ป่วย',patient.name],['แผนกต้นทาง',patient.department],['HN',`HN${patient.id}`],['หัตถการ',patient.procedure],['ความเสี่ยง SSI',patient.risk],['ศัลยแพทย์',patient.surgeon]].map(([k,v])=><div key={k} className="grid grid-cols-[89px_1fr]"><span className="text-slate-500">{k}</span><strong className="font-medium">{v}</strong></div>)}</div></section>
      <section className="space-y-5">{[['เลือกปลายทาง *','tabs'],['เลือกแผนก *','select'],['กำหนดระดับความสำคัญ *','priority']].map(([label,type])=><div key={label} className="grid grid-cols-[209px_1fr] items-center"><label className="text-[14px]">{label}</label>{type==='tabs'?<div className="grid h-[38px] grid-cols-2 overflow-hidden rounded-lg border border-slate-300"><button className="border-r border-blue-400 bg-blue-50 text-blue-600">OPD</button><button>IPD</button></div>:type==='select'?<select className="field h-[39px]"><option>ศัลยกรรมทั่วไป (General Surgery)</option></select>:<div className="grid grid-cols-3 gap-2"><button className="h-[38px] rounded-lg border border-blue-400 bg-blue-50 text-blue-600">ปกติ</button><button className="h-[38px] rounded-lg border border-slate-300">ด่วน</button><button className="h-[38px] rounded-lg border border-slate-300">เร่งด่วน</button></div>}</div>)}
        <div className="grid grid-cols-[209px_1fr]"><label className="pt-2 text-[14px]">บันทึกเบื้องต้นจาก OR</label><textarea className="h-[78px] rounded-lg border border-slate-300 p-3 text-[14px]" placeholder="กรอกบันทึกเบื้องต้น..."/></div>
      </section>
      <div className="flex h-[46px] items-center gap-3 rounded-lg bg-blue-50 px-3 text-[14px] text-blue-700"><Info size={16}/>หลังจากส่งเคส ระบบจะแสดงประวัติการส่งข้อมูลในส่วนนี้</div>
      <div className="flex justify-end gap-3 border-b border-slate-200 pb-5">
        <button onClick={onClose} className="btn-secondary h-[38px] px-6">ยกเลิก</button>
        <button onClick={onSend} className="btn-primary inline-flex h-[38px] items-center gap-2 px-6"><Send size={14}/>ส่งเคส</button>
      </div>
      <section><h3 className="mb-4 text-[16px] font-semibold">ประวัติการส่งข้อมูล</h3><div className="overflow-hidden rounded-lg border border-slate-200"><table className="w-full text-[12px]"><thead className="h-10 bg-slate-50"><tr>{['ส่งโดย','วันที่/เวลา','ปลายทาง','สถานะปัจจุบัน','แผนกรับเคส'].map(h=><th key={h} className="px-4 text-left">{h}</th>)}</tr></thead><tbody>{Array.from({length:4}).map((_,i)=><tr key={i} className="h-[61px] border-t border-slate-100"><td className="px-4">พญ.อัญชลีกิตติวรานันท์</td><td className="px-4">08/05/2567<br/><span className="text-slate-400">14:20 น.</span></td><td className="px-4">{i?'IPD':'OPD'}</td><td className="px-4"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">{i?'ส่งสำเร็จ':'รอรับเคส'}</span></td><td className="px-4">ศัลยกรรมทั่วไป</td></tr>)}</tbody></table></div></section>
    </div>
  </aside>
  </div>
}

function SuccessModal({ patient, onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <section className="relative w-full max-w-[480px] rounded-2xl bg-white px-8 pb-7 pt-8 shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>

        {/* Double-ring checkmark */}
        <div className="flex justify-center">
          <div className="grid h-[80px] w-[80px] place-items-center rounded-full border-[8px] border-blue-100">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-blue-600">
              <Check size={26} className="text-white" strokeWidth={3}/>
            </div>
          </div>
        </div>

        <h2 className="mt-5 text-center text-[22px] font-semibold text-[#191c1e]">ส่งข้อมูลสำเร็จ</h2>
        <p className="mt-1 text-center text-[14px] text-slate-500">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>

        {/* Patient info card */}
        <div className="mt-5 rounded-xl bg-blue-50/60 p-4 text-[14px]">
          <p className="font-semibold text-[#191c1e]">HN {patient.id}&nbsp;&nbsp;{patient.name}</p>
          <p className="mt-1 text-slate-600">{patient.sex ?? 'ชาย'} • อายุ {patient.age ?? 68} ปี (17 ม.ค. 2501)</p>
          <p className="mt-0.5 text-slate-600">หัตถการ: <strong className="font-semibold">{patient.abbrev} (เข่าขวา)</strong></p>
          <div className="mt-1 flex flex-wrap gap-x-6 text-slate-600">
            <span>วันที่ผ่าตัด: {patient.surgeryDate}</span>
            <span>วันที่จำหน่าย: 15 มิ.ย. 2569</span>
          </div>
        </div>

        <hr className="my-4 border-slate-100"/>

        {/* Info rows */}
        <div className="space-y-3 text-[14px]">
          {[['วันที่สร้าง','15 มิ.ย. 2569 10:45 น.'],['ผู้สร้าง','AdminHospitalBK (OR Nurse)'],['ปลายทาง','OPD'],['แผนก','OPD A']].map(([k,v])=>(
            <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span>{v}</span></div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
          <Info size={18} className="mt-0.5 shrink-0"/>
          <p>ระบบได้ส่งมอบหมายงานเรียบร้อยแล้ว<br/>สามารถตรวจสอบรายการได้ที่เมนู "รายการส่งไป OPD/IPD"</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-[50px] rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-slate-50">
            ยกเลิก
          </button>
          <button
            onClick={() => { navigate('/or-validation'); onClose() }}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#002d73] text-[14px] font-medium text-white hover:bg-[#001d52]"
          >
            ไปหน้ารายการ OPD/IPD <ArrowRight size={16}/>
          </button>
        </div>
      </section>
    </div>
  )
}
