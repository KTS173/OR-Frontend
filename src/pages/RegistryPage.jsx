import { AlertTriangle, ArrowRight, CalendarClock, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Download, History, PhoneCall, Plus, RefreshCw, Search, ShieldCheck, TimerReset, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Filters from '../components/ui/Filters.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import PatientTable from '../components/ui/PatientTable.jsx'
import { patients as fallbackPatients } from '../data/mockData.js'
import { useMockQuery } from '../hooks/useMockQuery.js'
import { api } from '../services/api.js'

const configs = {
  validation: { title: 'OR Validation List', description: 'รายการเคสที่ต้องตรวจสอบก่อนส่งเข้า Surveillance', metrics: [['รอตรวจสอบทั้งหมด', '58'], ['เข้าเกณฑ์ (Eligible)', '24'], ['ข้อมูลไม่ครบถ้วน', '18'], ['ส่งเข้า OPD/IPD แล้ว', '24']] },
  opd: { title: 'คิว OPD', description: 'รายการผู้ป่วยนอกที่อยู่ในแผนติดตาม', metrics: [['คิวทั้งหมด', '18'], ['ติดตามวันนี้', '42'], ['เกินกำหนด', '11'], ['สงสัย SSI', '2']] },
  ipd: { title: 'คิว IPD', description: 'รายการผู้ป่วยในที่ต้องเฝ้าระวัง', metrics: [['คิวทั้งหมด', '15'], ['กำลังรักษา', '28'], ['รอจำหน่าย', '6'], ['ความเสี่ยงสูง', '3']] },
  followUp: { title: 'งานติดตามของฉัน', description: 'งานเฝ้าระวังและติดตามที่ได้รับมอบหมาย', metrics: [['งานทั้งหมด', '118'], ['กำลังติดตาม', '42'], ['เสร็จแล้ว', '62'], ['เกินกำหนด', '9']] },
  history: { title: 'ประวัติการติดตาม', description: 'ค้นหาและตรวจสอบประวัติการเฝ้าระวังย้อนหลัง', metrics: [['ประวัติทั้งหมด', '1,186'], ['เดือนนี้', '142'], ['ติดตามสำเร็จ', '1,108'], ['ยกเลิก', '36']] },
  suspected: { title: 'เคสสงสัยติดเชื้อ (Suspected SSI Cases)', description: 'เคสที่รอแพทย์ประเมินอาการ', metrics: [['รอประเมิน', '18'], ['ประเมินแล้ว', '48'], ['ความเสี่ยงสูง', '11'], ['เกิน SLA', '2']] },
  confirmed: { title: 'เคสยืนยันติดเชื้อ (Confirmed SSI Cases)', description: 'ทะเบียนผู้ป่วยที่ได้รับการยืนยัน SSI', metrics: [['ยืนยันเดือนนี้', '11'], ['กำลังรักษา', '8'], ['หายแล้ว', '36'], ['ส่ง THIP', '9']] },
  doctor: { title: 'แพทย์ตรวจสอบ SSI', description: 'รายการเคสที่ส่งให้แพทย์วินิจฉัยและรับรอง', metrics: [['รอตรวจสอบ', '14'], ['ตรวจวันนี้', '6'], ['ขอข้อมูลเพิ่ม', '3'], ['ยืนยันแล้ว', '11']] },
  notifications: { title: 'ศูนย์แจ้งเตือน', description: 'ติดตามเหตุการณ์สำคัญและงานที่ต้องดำเนินการ', metrics: [['แจ้งเตือนใหม่', '12'], ['สำคัญ', '4'], ['อ่านแล้ว', '142'], ['เก็บถาวร', '87']] },
  search: { title: 'ค้นหาข้อมูลกลาง', description: 'ค้นหาข้อมูลผู้ป่วยและประวัติข้ามหน่วยงาน', metrics: [['ผู้ป่วยทั้งหมด', '1,286'], ['ติดตามทั้งหมด', '8,642'], ['SSI ปีนี้', '36'], ['แผนก', '14']] },
  sync: { title: 'ข้อมูลที่เชื่อมต่อจาก HIS / TrackCare', description: 'ตรวจสอบสถานะและความสมบูรณ์ของข้อมูลต้นทาง', metrics: [['ซิงค์ล่าสุด', '14:05'], ['รายการวันนี้', '1,248'], ['สำเร็จ', '1,212'], ['ผิดพลาด', '36']] },
}

export default function RegistryPage({ type }) {
  const [search, setSearch] = useState('')
  const { data, loading } = useMockQuery(api.getPatients, fallbackPatients)
  const config = configs[type] ?? configs.validation
  const filtered = useMemo(() => data.filter((item) => [item.id, item.name, item.procedure, item.department].some((value) => value.toLowerCase().includes(search.toLowerCase()))), [data, search])
  if (type === 'validation') return <ValidationPage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'opd') return <OpdQueuePage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'followUp') return <MyFollowUpsPage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  return (
    <>
      <PageHeader title={config.title} description={config.description} actions={<><button className="btn-secondary"><Download size={14} />ส่งออก</button><button className="btn-primary">{type === 'sync' ? <RefreshCw size={14} /> : <Plus size={14} />}{type === 'sync' ? 'ซิงค์ข้อมูล' : 'เพิ่มรายการ'}</button></>} />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{config.metrics.map(([label, value], index) => <MetricCard key={label} label={label} value={value} unit={index === 0 ? 'รายการ' : ''} trend={index % 2 ? '+8%' : '+12%'} tone={['blue', 'green', 'amber', 'violet'][index]} />)}</section>
      <Filters search={search} onSearch={setSearch} />
      <PatientTable patients={filtered} loading={loading} />
    </>
  )
}

const opdMetrics = [
  ['รอรับเคสใหม่', '18', 'คน', History, '#1e3a8a', '#eff6ff', '#ffffff'],
  ['ครบกำหนดติดตาม', '42', 'คน', '/assets/icon/OR Validation List/Symbol2.png', '#10b981', '#ecfdf5', '#ffffff'],
  ['เกินกำหนดติดตาม', '11', 'คน', '/assets/icon/dashboard/time-alert_svgrepo.com.png', '#ef4444', '#fff7ed', '#ffffff'],
  ['สงสัย SSI', '2', '', '/assets/icon/dashboard/warning.png', '#e96500', '#fff7ed', '#fffaf5'],
  ['ยืนยัน SSI', '1', '', '/assets/icon/dashboard/ice.png', '#ef3741', '#fee2e2', '#fff4f4'],
]

function OpdQueuePage({ patients, loading, search, setSearch }) {
  const [selectedPatient, setSelectedPatient] = useState(null)
  return <div className="space-y-4">
    <section className="grid grid-cols-5 gap-4">{opdMetrics.map(([label,value,unit,Icon,color,bg,cardBg], index)=><article key={label} className="flex h-[140px] min-w-0 flex-col rounded-xl border border-black/10 p-[17px] shadow-sm" style={{backgroundColor:cardBg}}><div className="flex items-start justify-between gap-2"><p className="whitespace-nowrap text-[14px] font-medium" style={{color}}>{label}</p><span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{backgroundColor:bg,color}}>{typeof Icon === 'string' ? <span className="validation-card-icon" style={{backgroundColor:color,WebkitMaskImage:`url("${Icon}")`,maskImage:`url("${Icon}")`}}/> : <Icon size={20}/>}</span></div><p className="mt-3 flex items-baseline gap-1.5 text-[28px] font-semibold leading-8" style={{color}}><span>{value}</span><span className="text-[14px]">{unit}</span></p><p className={`mt-auto flex items-center whitespace-nowrap text-[12px] leading-4 ${index >= 3 ? 'text-red-500' : 'text-[#64748b]'}`}>{index >= 3 && <img src="/assets/icon/dashboard/up-red-margin.png" alt="" className="mr-1 h-[9px] w-3 object-contain"/>}{index===0?'ต้องรับเคสวันนี้':index===1?'ต้องติดตามวันนี้':index===2?'เกินกำหนดแล้ว':index===3?'2 ราย จากเมื่อวาน':'1 ราย จากเมื่อวาน'}</p></article>)}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm"><div className="flex h-full items-center gap-6">{['ทั้งหมด (52)','รายการคนไข้จากแผนก OR ใหม่ (48)','รายการผู้ป่วยจากการย้ายผู้ป่วยจากแผนก IPD (4)'].map((label,index)=><button key={label} className={`h-full text-[13px] font-medium ${index===0?'border-b-2 border-[#175beb] text-[#175beb]':'text-[#424752]'}`}>{label}</button>)}</div></section>
    <OpdPatientTable patients={patients} loading={loading} onSelect={setSelectedPatient}/>
    {selectedPatient && <AcceptPatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
  </div>
}

function OpdPatientTable({ patients, loading, onSelect }) {
  const rows = Array.from({length:10},(_,index)=>patients[index % Math.max(patients.length,1)]).filter(Boolean)
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[16px] font-semibold text-[#002d73]">รายการติดตามผู้ป่วย (58 ราย)</h2><button className="inline-flex h-[40px] w-[146px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[13px]"><span className="inline-flex items-center gap-3"><CalendarDays size={17}/>วันนี้</span><ChevronRight size={14} className="rotate-90"/></button></header><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-[12px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold text-[#1e293b]"><tr>{['','HN','ชื่อผู้ป่วย','อายุ/เพศ','หัตถการ','ศัลยแพทย์','วันผ่าตัด','วันรับข้อมูล'].map((h,i)=><th key={`${h}-${i}`} className="px-4 text-left">{i===0?<input type="checkbox"/>:h}</th>)}</tr></thead><tbody>{loading?Array.from({length:10}).map((_,i)=><tr key={i} className="h-[60px] border-t border-slate-100"><td colSpan="8" className="px-4"><div className="h-3 animate-pulse rounded bg-slate-100"/></td></tr>):rows.map((p,index)=><tr key={`${p.id}-${index}`} onClick={()=>onSelect(p)} className="h-[60px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40"><td className="px-4" onClick={e=>e.stopPropagation()}><input type="checkbox"/></td><td className="px-4 font-semibold text-[#175beb]">{p.id}</td><td className="px-4"><span className="font-medium">{p.name}</span><small className="block text-[10px] text-[#64748b]">({index%2?'3 มี.ค. 2514':'13 ก.ค. 2507'})</small></td><td className="px-4">{p.age} / {p.sex}</td><td className="max-w-[140px] px-4 text-center">{index===0?'Laparoscopic Cholecystectomy':index===1?'Total Knee Replacement (R)':index===2?'CABG (On Pump)':'Cesarean Section'}</td><td className="px-4">นพ กมลชนก อัศวรุ่งโรจน์</td><td className="px-4">10 มิ.ย 2569</td><td className="px-4">15 มิ.ย 2569</td></tr>)}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-[#e2e8f0] px-6 text-[12px] text-[#64748b]"><span>Showing 10 of 10 Historical Log</span><div className="flex gap-2"><button className="page-button w-auto px-3">Previous</button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button w-auto px-3">Next</button></div></footer></section>
}

const validationMetrics = [
  ['รอตรวจสอบทั้งหมด', '58', 'คน', 'Symbol1.png', '#1e3a8a', '#eff6ff', '#1e3a8a'],
  ['เข้าเกณฑ์ (Eligible)', '24', 'คน', 'Symbol2.png', '#10b981', '#ecfdf5', '#047857'],
  ['ข้อมูลไม่ครบถ้วน', '18', 'คน', 'Symbol3.png', '#f97316', '#fff7ed', '#7c2d12'],
  ['ส่งเข้า OPD/IPD แล้ว', '24', 'คน', '../dashboard/letter.png', '#3b82f6', '#eff6ff', '#0561d9'],
  ['ไม่เข้าเกณฑ์ (Removed)', '5', 'เคส', 'Container.png', '#ef2b2b', '#fff1f2'],
  ['เกินกำหนดตรวจสอบ', '7', 'เคส', '4Symbol.png', '#64748b', '#e8eef7'],
]

function ValidationPage({ patients, loading, search, setSearch }) {
  return <div className="space-y-4">
    <section className="grid grid-cols-4 gap-x-[17px] gap-y-4">{validationMetrics.map(([label, value, unit, icon, color, iconBg, labelColor = color]) => {
      const iconUrl = `/assets/icon/OR Validation List/${icon}`
      return <article key={label} className="h-[138px] rounded-xl border border-black/10 bg-white p-[20px] shadow-sm"><div className="flex h-11 items-start justify-between"><p className="text-[18px] leading-5 font-medium" style={{ color: labelColor }}>{label}</p><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: iconBg }}><span className="validation-card-icon" style={{ backgroundColor: color, WebkitMaskImage: `url("${iconUrl}")`, maskImage: `url("${iconUrl}")` }} /></span></div><p className="pt-3 text-[32px] leading-9 font-semibold" style={{ color }}>{value} <span className="text-[14px]">{unit}</span></p></article>
    })}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[73px] items-center justify-between rounded-xl border border-black/10 bg-white px-[17px] shadow-sm"><div className="flex items-center gap-4">{['ทั้งหมด (58)', 'รอตรวจสอบ (18)', 'ยืนยันการตรวจสอบ (14)', 'เข้าเกณฑ์ (32)', 'ไม่เข้าเกณฑ์ (5)', 'ส่งเข้าแล้ว (5)'].map((item, i) => <button key={item} className={`h-9 px-3 text-[14px] ${i === 0 ? 'border-b-2 border-[#175beb] font-medium text-[#175beb]' : 'text-[#424752]'}`}>{item}</button>)}</div><button className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px]"><RefreshCw size={13} />รีเฟรช</button></section>
    <PatientTable patients={patients} loading={loading} validation />
  </div>
}

const myMetrics = [
  ['ครบกำหนดวันนี้','18','คน',CalendarClock,'#1e3a8a'],['นัดหมายแล้ววันนี้','48','คน',PhoneCall,'#8b5cf6'],['ติดต่อไม่สำเร็จ','11','คน',PhoneCall,'#f97316'],['ดำเนินการเสร็จ','42','คน',CheckCircle2,'#10b981'],['เกินกำหนด','11','คน',TimerReset,'#ef4444'],['สงสัย SSI','2','',AlertTriangle,'#f97316'],['รอผู้ป่วยตอบกลับ','13','เคส',UserRound,'#0d9488'],
]

function MyFollowUpsPage({ patients, loading, search, setSearch }) {
  return <div className="space-y-4"><section className="grid grid-cols-5 gap-4">{myMetrics.map(([label,value,unit,Icon,color],index)=><article key={label} className="flex h-[128px] flex-col rounded-xl border border-black/10 bg-white p-[17px] shadow-sm"><div className="flex justify-between"><p className="text-[13px] font-medium" style={{color}}>{label}</p><span className="grid size-9 place-items-center rounded-lg bg-slate-50" style={{color}}><Icon size={20}/></span></div><p className="mt-3 text-[27px] font-semibold" style={{color}}>{value} <span className="text-[13px]">{unit}</span></p><p className="mt-auto text-[11px] text-slate-500">{index===2?'คนไข้ไม่รับโทรศัพท์':index===3?'ติดตามเสร็จสิ้น':index===4?'เกินกำหนดแล้ว':index===5?'↑ 2 ราย จากเมื่อวาน':'ต้องติดตามวันนี้'}</p></article>)}</section><MyFilters search={search} setSearch={setSearch}/><section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm"><div className="flex h-full items-center gap-7">{['ทั้งหมด (52)','รายการกำหนดติดตามวันนี้ (48)','รายการยังไม่ถึงรอบติดตาม','รายการสงสัย SSI','รายการติดเชื้อ SSI'].map((x,i)=><button key={x} className={`h-full text-[13px] font-medium ${i===0?'border-b-2 border-[#175beb] text-[#175beb]':'text-[#424752]'}`}>{x}</button>)}</div></section><MyFollowTable patients={patients} loading={loading}/></div>
}

function MyFilters({ search, setSearch }) {
  return <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-[16px] font-semibold"><Search size={19} className="text-[#175beb]"/>ค้นหาข้อมูล</h2><div className="mt-4 grid grid-cols-[400px_400px_1fr] gap-3"><label className="text-[12px]">เลือกช่วงวันที่<input className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-4" defaultValue="12 พ.ค. 2569 - 18 พ.ค. 2569"/></label>{['รอบการติดตาม','สถานะ'].map(x=><label key={x} className="text-[12px]">{x}<select className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3"><option>ทั้งหมด</option></select></label>)}</div><div className="mt-4 flex items-end gap-3"><label className="flex-1 text-[12px]">คำค้นหา<input value={search} onChange={e=>setSearch(e.target.value)} className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..."/></label><button className="btn-primary h-[40px] px-6"><Search size={14}/>ค้นหา</button><button onClick={()=>setSearch('')} className="btn-secondary h-[40px] px-5"><RefreshCw size={14}/>ล้างตัวกรอง</button></div></section>
}

function MyFollowTable({ patients, loading }) {
  const navigate = useNavigate()
  const rows=Array.from({length:10},(_,i)=>patients[i%Math.max(patients.length,1)]).filter(Boolean)
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[16px] font-semibold text-[#002d73]">รายการติดตามวันนี้ (48 ราย)</h2><button className="inline-flex h-10 w-[146px] items-center justify-between rounded-lg border border-slate-200 px-4"><CalendarDays size={17}/>วันนี้<ChevronRight size={14} className="rotate-90"/></button></header><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-[12px]"><thead className="h-10 bg-slate-50"><tr>{['','HN','ชื่อผู้ป่วย','หัตถการ','ศัลยแพทย์','ความเสี่ยง SSI','สถานะประเมิน SSI','เริ่มนัดครั้งแรก'].map((x,i)=><th key={`${x}-${i}`} className="px-4 text-left">{i===0?<input type="checkbox"/>:x}</th>)}</tr></thead><tbody>{!loading&&rows.map((p,i)=><tr key={`${p.id}-${i}`} onClick={()=>navigate(`/follow-ups/${p.id}`)} className="h-[70px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40"><td className="px-4" onClick={event=>event.stopPropagation()}><input type="checkbox"/></td><td className="px-4 font-semibold">{p.id}</td><td className="px-4">{p.name}<small className="block text-slate-500">{p.age} ปี (17 ม.ค. 2501)</small></td><td className="px-4">TKA</td><td className="px-4">นพ กมลชนก อัศวรุ่งโรจน์</td><td className={`px-4 ${i?'text-red-500':'text-orange-500'}`}>● {i?'สูง':'ปานกลาง'}</td><td className="px-4"><span className={`rounded-lg px-2 py-1 ${i===0?'bg-slate-100 text-slate-500':i===5?'bg-orange-50 text-orange-500':i===6?'bg-red-50 text-red-500':'bg-emerald-50 text-emerald-600'}`}>{i===0?'รอประเมิน':i===5?'สงสัย SSI':i===6?'ติดเชื้อ SSI':'ไม่ติดเชื้อ SSI'}</span></td><td className="px-4">15 มิ.ย 2569</td></tr>)}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[12px] text-slate-500"><span>Showing 10 of 10 Historical Log</span><div className="flex gap-2"><button className="page-button w-auto px-3">Previous</button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button w-auto px-3">Next</button></div></footer></section>
}

function AcceptPatientModal({ patient, onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="relative w-full max-w-[480px] rounded-2xl bg-white px-8 pb-7 pt-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>

        {/* Orange warning icon */}
        <div className="flex justify-center">
          <img src="/assets/icon/Alert Icon.png" alt="" className="h-20 w-20 object-contain"/>
        </div>

        <h2 className="mt-5 text-center text-[22px] font-semibold text-[#191c1e]">คุณจะเป็นผู้ดูแลคนไข้รายนี้</h2>
        <p className="mt-2 text-center text-[14px] leading-6 text-slate-500">คุณต้องการรับผู้ป่วยรายนี้<br/>เพื่อเป็นผู้รับผิดชอบในการติดตามใช่หรือไม่?</p>

        {/* Patient info card */}
        <div className="mt-5 rounded-xl bg-blue-50/60 p-4 text-[14px]">
          <p className="font-semibold text-[#191c1e]">HN {patient.id}&nbsp;&nbsp;{patient.name}</p>
          <p className="mt-1 text-slate-600">{patient.sex ?? 'ชาย'} • อายุ {patient.age ?? 68} ปี (17 ม.ค. 2501)</p>
          <p className="mt-0.5 text-slate-600">หัตถการ: <strong className="font-semibold">{patient.abbrev ?? 'TKA'} (เข่าขวา)</strong></p>
          <div className="mt-1 flex flex-wrap gap-x-6 text-slate-600">
            <span>วันที่ผ่าตัด: {patient.surgeryDate}</span>
            <span>วันที่จำหน่าย: 15 มิ.ย. 2569</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-[50px] rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-slate-50">ยกเลิก</button>
          <button
            onClick={() => { navigate(`/cases/${patient.id}/create-follow-up`); onClose() }}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#002d73] text-[14px] font-medium text-white hover:bg-[#001d52]"
          >ใช่, รับเป็นผู้ดูแล <ArrowRight size={16}/></button>
        </div>
      </section>
    </div>
  )
}
