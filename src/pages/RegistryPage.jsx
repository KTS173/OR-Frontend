import { Activity, AlertCircle, AlertTriangle, ArrowRight, Calendar, CalendarClock, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Database, Download, Eye, File, History, Layers, Mail, PhoneCall, Plus, RefreshCw, RotateCcw, Scissors, Search, Settings2, ShieldCheck, Stethoscope, TimerReset, UserCheck, UserRound, X } from 'lucide-react'
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
  if (type === 'history') return <HistoryPage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'suspected' || type === 'confirmed') return <SuspectedSSIPage type={type} patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'notifications') return <NotificationsCenterPage />
  if (type === 'search') return <CentralSearchPage />
  if (type === 'sync') return <HisSyncPage />
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
    <section className="grid grid-cols-5 gap-4">{opdMetrics.map(([label,value,unit,Icon,color,bg,cardBg], index)=><article key={label} className="flex h-[140px] min-w-0 flex-col rounded-xl border border-black/10 p-[17px] shadow-sm" style={{backgroundColor:cardBg}}><div className="flex items-start justify-between gap-2"><p className="whitespace-nowrap text-[15px] font-medium" style={{color}}>{label}</p><span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{backgroundColor:bg,color}}>{typeof Icon === 'string' ? <span className="validation-card-icon" style={{backgroundColor:color,WebkitMaskImage:`url("${Icon}")`,maskImage:`url("${Icon}")`}}/> : <Icon size={20}/>}</span></div><p className="mt-3 flex items-baseline gap-1.5 text-[30px] font-semibold leading-8" style={{color}}><span>{value}</span><span className="text-[15px]">{unit}</span></p><p className={`mt-auto flex items-center whitespace-nowrap text-[13px] leading-4 ${index >= 3 ? 'text-red-500' : 'text-[#64748b]'}`}>{index >= 3 && <img src="/assets/icon/dashboard/up-red-margin.png" alt="" className="mr-1 h-[9px] w-3 object-contain"/>}{index===0?'ต้องรับเคสวันนี้':index===1?'ต้องติดตามวันนี้':index===2?'เกินกำหนดแล้ว':index===3?'2 ราย จากเมื่อวาน':'1 ราย จากเมื่อวาน'}</p></article>)}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm"><div className="flex h-full items-center gap-6">{['ทั้งหมด (52)','รายการคนไข้จากแผนก OR ใหม่ (48)','รายการผู้ป่วยจากการย้ายผู้ป่วยจากแผนก IPD (4)'].map((label,index)=><button key={label} className={`h-full text-[14px] font-medium ${index===0?'border-b-2 border-[#175beb] text-[#175beb]':'text-[#424752]'}`}>{label}</button>)}</div></section>
    <OpdPatientTable patients={patients} loading={loading} onSelect={setSelectedPatient}/>
    {selectedPatient && <AcceptPatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
  </div>
}

function OpdPatientTable({ patients, loading, onSelect }) {
  const rows = Array.from({length:10},(_,index)=>patients[index % Math.max(patients.length,1)]).filter(Boolean)
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[18px] font-semibold text-[#002d73]">รายการติดตามผู้ป่วย (58 ราย)</h2><button className="inline-flex h-[40px] w-[146px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[14px]"><span className="inline-flex items-center gap-3"><CalendarDays size={17}/>วันนี้</span><ChevronRight size={14} className="rotate-90"/></button></header><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-[13px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold text-[#1e293b]"><tr>{['','HN','ชื่อผู้ป่วย','อายุ/เพศ','หัตถการ','ศัลยแพทย์','วันผ่าตัด','วันรับข้อมูล'].map((h,i)=><th key={`${h}-${i}`} className="px-4 text-left">{i===0?<input type="checkbox"/>:h}</th>)}</tr></thead><tbody>{loading?Array.from({length:10}).map((_,i)=><tr key={i} className="h-[60px] border-t border-slate-100"><td colSpan="8" className="px-4"><div className="h-3 animate-pulse rounded bg-slate-100"/></td></tr>):rows.map((p,index)=><tr key={`${p.id}-${index}`} onClick={()=>onSelect(p)} className="h-[60px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40"><td className="px-4" onClick={e=>e.stopPropagation()}><input type="checkbox"/></td><td className="px-4 font-semibold text-[#175beb]">{p.id}</td><td className="px-4"><span className="font-medium">{p.name}</span><small className="block text-[11px] text-[#64748b]">({index%2?'3 มี.ค. 2514':'13 ก.ค. 2507'})</small></td><td className="px-4">{p.age} / {p.sex}</td><td className="max-w-[140px] px-4 text-center">{index===0?'Laparoscopic Cholecystectomy':index===1?'Total Knee Replacement (R)':index===2?'CABG (On Pump)':'Cesarean Section'}</td><td className="px-4">นพ กมลชนก อัศวรุ่งโรจน์</td><td className="px-4">10 มิ.ย 2569</td><td className="px-4">15 มิ.ย 2569</td></tr>)}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-[#e2e8f0] px-6 text-[13px] text-[#64748b]"><span>Showing 10 of 10 Historical Log</span><div className="flex gap-2"><button className="page-button w-auto px-3">Previous</button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button w-auto px-3">Next</button></div></footer></section>
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
      return <article key={label} className="h-[138px] rounded-xl border border-black/10 bg-white p-[20px] shadow-sm"><div className="flex h-11 items-start justify-between"><p className="text-[20px] leading-5 font-medium" style={{ color: labelColor }}>{label}</p><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: iconBg }}><span className="validation-card-icon" style={{ backgroundColor: color, WebkitMaskImage: `url("${iconUrl}")`, maskImage: `url("${iconUrl}")` }} /></span></div><p className="pt-3 text-[34px] leading-9 font-semibold" style={{ color }}>{value} <span className="text-[15px]">{unit}</span></p></article>
    })}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[73px] items-center justify-between rounded-xl border border-black/10 bg-white px-[17px] shadow-sm"><div className="flex items-center gap-4">{['ทั้งหมด (58)', 'รอตรวจสอบ (18)', 'ยืนยันการตรวจสอบ (14)', 'เข้าเกณฑ์ (32)', 'ไม่เข้าเกณฑ์ (5)', 'ส่งเข้าแล้ว (5)'].map((item, i) => <button key={item} className={`h-9 px-3 text-[15px] ${i === 0 ? 'border-b-2 border-[#175beb] font-medium text-[#175beb]' : 'text-[#424752]'}`}>{item}</button>)}</div><button className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[15px]"><RefreshCw size={13} />รีเฟรช</button></section>
    <PatientTable patients={patients} loading={loading} validation />
  </div>
}

const myMetrics = [
  ['ครบกำหนดวันนี้','18','คน',CalendarClock,'#1e3a8a'],['นัดหมายแล้ววันนี้','48','คน',PhoneCall,'#8b5cf6'],['ติดต่อไม่สำเร็จ','11','คน',PhoneCall,'#f97316'],['ดำเนินการเสร็จ','42','คน',CheckCircle2,'#10b981'],['เกินกำหนด','11','คน',TimerReset,'#ef4444'],['สงสัย SSI','2','',AlertTriangle,'#f97316'],['รอผู้ป่วยตอบกลับ','13','เคส',UserRound,'#0d9488'],
]

function MyFollowUpsPage({ patients, loading, search, setSearch }) {
  return <div className="space-y-4"><section className="grid grid-cols-5 gap-4">{myMetrics.map(([label,value,unit,Icon,color],index)=><article key={label} className="flex h-[140px] flex-col rounded-xl border border-black/10 bg-white p-[17px] shadow-sm"><div className="flex justify-between"><p className="text-[15px] font-medium" style={{color}}>{label}</p><span className="grid size-9 place-items-center rounded-lg bg-slate-50" style={{color}}><Icon size={20}/></span></div><p className="mt-3 flex items-baseline gap-1.5 text-[30px] font-semibold leading-8" style={{color}}><span>{value}</span><span className="text-[15px]">{unit}</span></p><p className="mt-auto text-[13px] text-slate-500">{index===2?'คนไข้ไม่รับโทรศัพท์':index===3?'ติดตามเสร็จสิ้น':index===4?'เกินกำหนดแล้ว':index===5?'↑ 2 ราย จากเมื่อวาน':'ต้องติดตามวันนี้'}</p></article>)}</section><MyFilters search={search} setSearch={setSearch}/><section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm"><div className="flex h-full items-center gap-7">{['ทั้งหมด (52)','รายการกำหนดติดตามวันนี้ (48)','รายการยังไม่ถึงรอบติดตาม','รายการสงสัย SSI','รายการติดเชื้อ SSI'].map((x,i)=><button key={x} className={`h-full text-[14px] font-medium ${i===0?'border-b-2 border-[#175beb] text-[#175beb]':'text-[#424752]'}`}>{x}</button>)}</div></section><MyFollowTable patients={patients} loading={loading}/></div>
}

function MyFilters({ search, setSearch }) {
  return <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-[18px] font-semibold"><Search size={19} className="text-[#175beb]"/>ค้นหาข้อมูล</h2><div className="mt-4 grid grid-cols-[400px_400px_1fr] gap-3"><label className="text-[13px]">เลือกช่วงวันที่<input className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-4" defaultValue="12 พ.ค. 2569 - 18 พ.ค. 2569"/></label>{['รอบการติดตาม','สถานะ'].map(x=><label key={x} className="text-[13px]">{x}<select className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3"><option>ทั้งหมด</option></select></label>)}</div><div className="mt-4 flex items-end gap-3"><label className="flex-1 text-[13px]">คำค้นหา<input value={search} onChange={e=>setSearch(e.target.value)} className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..."/></label><button className="btn-primary h-[40px] px-6"><Search size={14}/>ค้นหา</button><button onClick={()=>setSearch('')} className="btn-secondary h-[40px] px-5"><RefreshCw size={14}/>ล้างตัวกรอง</button></div></section>
}

function MyFollowTable({ patients, loading }) {
  const navigate = useNavigate()
  const rows=Array.from({length:10},(_,i)=>patients[i%Math.max(patients.length,1)]).filter(Boolean)
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[18px] font-semibold text-[#002d73]">รายการติดตามวันนี้ (48 ราย)</h2><button className="inline-flex h-10 w-[146px] items-center justify-between rounded-lg border border-slate-200 px-4"><CalendarDays size={17}/>วันนี้<ChevronRight size={14} className="rotate-90"/></button></header><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-[13px]"><thead className="h-10 bg-slate-50"><tr>{['','HN','ชื่อผู้ป่วย','หัตถการ','ศัลยแพทย์','ความเสี่ยง SSI','สถานะประเมิน SSI','เริ่มนัดครั้งแรก'].map((x,i)=><th key={`${x}-${i}`} className="px-4 text-left">{i===0?<input type="checkbox"/>:x}</th>)}</tr></thead><tbody>{!loading&&rows.map((p,i)=><tr key={`${p.id}-${i}`} onClick={()=>navigate(`/follow-ups/${p.id}`)} className="h-[70px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40"><td className="px-4" onClick={event=>event.stopPropagation()}><input type="checkbox"/></td><td className="px-4 font-semibold">{p.id}</td><td className="px-4">{p.name}<small className="block text-slate-500">{p.age} ปี (17 ม.ค. 2501)</small></td><td className="px-4">TKA</td><td className="px-4">นพ กมลชนก อัศวรุ่งโรจน์</td><td className={`px-4 ${i?'text-red-500':'text-orange-500'}`}>● {i?'สูง':'ปานกลาง'}</td><td className="px-4"><span className={`rounded-lg px-2 py-1 ${i===0?'bg-slate-100 text-slate-500':i===5?'bg-orange-50 text-orange-500':i===6?'bg-red-50 text-red-500':'bg-emerald-50 text-emerald-600'}`}>{i===0?'รอประเมิน':i===5?'สงสัย SSI':i===6?'ติดเชื้อ SSI':'ไม่ติดเชื้อ SSI'}</span></td><td className="px-4">15 มิ.ย 2569</td></tr>)}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500"><span>Showing 10 of 10 Historical Log</span><div className="flex gap-2"><button className="page-button w-auto px-3">Previous</button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button w-auto px-3">Next</button></div></footer></section>
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

        <h2 className="mt-5 text-center text-[24px] font-semibold text-[#191c1e]">คุณจะเป็นผู้ดูแลคนไข้รายนี้</h2>
        <p className="mt-2 text-center text-[15px] leading-6 text-slate-500">คุณต้องการรับผู้ป่วยรายนี้<br/>เพื่อเป็นผู้รับผิดชอบในการติดตามใช่หรือไม่?</p>

        {/* Patient info card */}
        <div className="mt-5 rounded-xl bg-blue-50/60 p-4 text-[15px]">
          <p className="font-semibold text-[#191c1e]">HN {patient.id}&nbsp;&nbsp;{patient.name}</p>
          <p className="mt-1 text-slate-600">{patient.sex ?? 'ชาย'} • อายุ {patient.age ?? 68} ปี (17 ม.ค. 2501)</p>
          <p className="mt-0.5 text-slate-600">หัตถการ: <strong className="font-semibold">{patient.abbrev ?? 'TKA'} (เข่าขวา)</strong></p>
          <div className="mt-1 flex flex-wrap gap-x-6 text-slate-600">
            <span>วันที่ผ่าตัด: {patient.surgeryDate}</span>
            <span>วันที่จำหน่าย: 15 มิ.ย. 2569</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-[50px] rounded-xl border border-slate-200 text-[15px] font-medium text-slate-700 hover:bg-slate-50">ยกเลิก</button>
          <button
            onClick={() => { navigate(`/cases/${patient.id}/create-follow-up`); onClose() }}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#002d73] text-[15px] font-medium text-white hover:bg-[#001d52]"
          >ใช่, รับเป็นผู้ดูแล <ArrowRight size={16}/></button>
        </div>
      </section>
    </div>
  )
}

function HistoryPage({ patients, loading, search, setSearch }) {
  const [activeTab, setActiveTab] = useState('all')

  const historyMetrics = [
    { label: 'ประวัติติดตามทั้งหมด', value: '1,118 คน', subtext: 'รายการ', icon: CalendarClock, iconBg: 'bg-blue-50 text-blue-600' },
    { label: 'ติดตามสำเร็จ', value: '842 คน', subtext: 'รายการ', icon: CheckCircle2, iconBg: 'bg-emerald-50 text-emerald-600' },
    { label: 'ย้ายไปแผนกอื่น', value: '276 คน', subtext: 'รายการ', icon: PhoneCall, iconBg: 'bg-purple-50 text-purple-600' }
  ]

  const historyRows = [
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '0123456', name: 'นายสมชาย ใจดี', age: '68 ปี', birth: '17 ม.ค. 2501', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '0234567', name: 'นางสาวรวิภา แก้วดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '0234567', name: 'นางสาววิภาพร คำดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '123459', name: 'นายอนันต์ รัตนกุล', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '456789', name: 'นางวรรณา ทองดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '456789', name: 'นายธีรดล อัคนิพงศ์', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' },
    { date: '15 มิ.ย. 2569', time: '10:15', hn: '456789', name: 'นายธีรดล อัคนิพงศ์', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', dept: 'OPD (ชื่อแผนก)', staff: '(ชื่อ-นามสกุลเจ้าหน้าที่)', ssi: 'ไม่ติดเชื้อ SSI' }
  ]

  return (
    <div className="flex flex-col gap-6 text-left pb-10">

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {historyMetrics.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between min-h-[110px] transition-all hover:shadow-md"
            >
              <div>
                <span className="text-[13px] font-medium text-slate-500">{card.label}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <strong className="text-[26px] font-bold text-slate-800 tracking-tight">{card.value}</strong>
                  <span className="text-[13px] text-slate-400">{card.subtext}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Filters Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3">
          <Search size={16} />
          ค้นหาข้อมูล
        </h3>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="form-group text-left flex-1">
            <label className="text-[12px] font-medium text-slate-500">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input 
                type="text" 
                className="form-input text-[13px] h-9 py-1 pr-9" 
                defaultValue="12 พ.ค. 2569 - 18 พ.ค. 2569" 
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="form-group text-left flex-1">
            <label className="text-[12px] font-medium text-slate-500">ประเภทประวัติ</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-[2] w-full">
            <div className="form-group text-left flex-1">
              <label className="text-[12px] font-medium text-slate-500">แผนกปัจจุบัน</label>
              <select className="form-select mt-1 text-[13px] h-9 py-1">
                <option>OPD-ทั่วไป</option>
              </select>
            </div>
            
            <span className="text-slate-400 self-end mb-2.5">—</span>

            <div className="form-group text-left flex-1">
              <label className="text-[12px] font-medium text-slate-500">แผนกปลายทาง</label>
              <select className="form-select mt-1 text-[13px] h-9 py-1">
                <option>ทั้งหมด</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="form-group text-left md:col-span-3">
            <label className="text-[12px] font-medium text-slate-500">คำค้นหา</label>
            <input 
              type="text" 
              className="form-input mt-1 text-[13px] h-9 py-1" 
              placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." 
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-[#175beb] h-9 text-[13px] font-medium text-white shadow-sm hover:bg-blue-700 flex items-center justify-center gap-1.5">
              <Search size={14} />
              ค้นหา
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 h-9 text-[13px] font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <RotateCcw size={14} />
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-5 shadow-sm">
        <div className="flex h-full items-center gap-7">
          <button 
            onClick={() => setActiveTab('all')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'all' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            ทั้งหมด (52)
          </button>
          <button 
            onClick={() => setActiveTab('success')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'success' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            ติดตามสำเร็จ
          </button>
          <button 
            onClick={() => setActiveTab('transfer')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'transfer' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            ส่งต่อการติดตามไปแผนกอื่น
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex h-[64px] items-center justify-between border-b border-slate-100 px-6">
          <h2 className="text-[16px] font-semibold text-[#002d73]">ประวัติการส่งต่อ</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[13px] text-[#434651]">
            <thead className="h-10 bg-slate-50 font-medium text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">วันที่/เวลา</th>
                <th className="px-4 py-2 text-left">HN</th>
                <th className="px-4 py-2 text-left">ชื่อผู้ป่วย</th>
                <th className="px-4 py-2 text-left">หัตถการ</th>
                <th className="px-4 py-2 text-left">แผนกติดตามเดิม</th>
                <th className="px-4 py-2 text-left">ผู้รับผิดชอบ</th>
                <th className="px-4 py-2 text-left">ผลการประเมินSSIล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row, idx) => (
                <tr key={idx} className="h-[70px] border-t border-slate-100 hover:bg-blue-50/20">
                  <td className="px-4 py-2 font-medium text-slate-700">
                    <div>{row.date}</div>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{row.time}</span>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-700">{row.hn}</td>
                  <td className="px-4 py-2">
                    <span className="font-semibold text-[#175beb] block">{row.name}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{row.age} ({row.birth})</span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700">{row.procedure}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {row.dept}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{row.staff}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">
                      {row.ssi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  );
}

function SuspectedSSIPage({ type, patients, loading, search, setSearch }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const metrics = [
    { label: 'เคสรอแพทย์ตรวจ', value: '18 เคส', subtext: 'รอตรวจสอบวันนี้', icon: AlertTriangle, iconBg: 'bg-amber-50 text-amber-600' },
    { label: 'แพทย์กำลังตรวจสอบ', value: '48 เคส', subtext: 'กำลังดำเนินการตรวจสอบ', icon: TimerReset, iconBg: 'bg-purple-50 text-purple-600' },
    { label: 'ยืนยัน SSI', value: '11 เคส', subtext: 'เคสติดเชื้อ', icon: AlertCircle, iconBg: 'bg-red-50 text-red-600' }
  ]

  const ssiRows = [
    { hn: '0123456', name: 'นายสมชาย ใจดี', age: '68 ปี', birth: '17 ม.ค. 2501', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'ปานกลาง', riskColor: 'text-orange-500', status: 'สงสัย SSI' },
    { hn: '0123459', name: 'นายอนันต์ รัตนกุล', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' },
    { hn: '0456789', name: 'นางวรรณา ทองดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' },
    { hn: '0456789', name: 'นายธีรดล อัคนิพงศ์', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' },
    { hn: '0234567', name: 'นายปัณณวิชญ์ ศิลาวงศ์ไพร', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' },
    { hn: '0234567', name: 'นางสาวรวิภา แก้วดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' },
    { hn: '0234567', name: 'นางสาววิภาพร คำดี', age: '62 ปี', birth: '13 ก.ค. 2507', procedure: 'TKA', surgeon: 'นพ กมลชนก อัศวรุ่งโรจน์', date: '10/6/2569', risk: 'สูง', riskColor: 'text-red-500', status: 'สงสัย SSI' }
  ]

  return (
    <div className="flex flex-col gap-6 text-left pb-10">
      {/* Top Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between min-h-[110px] transition-all hover:shadow-md"
            >
              <div>
                <span className="text-[13px] font-medium text-slate-500">{card.label}</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <strong className="text-[26px] font-bold text-slate-800 tracking-tight">{card.value}</strong>
                  <span className="text-[12px] text-slate-400 mt-0.5">{card.subtext}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Filters Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3">
          <Search size={16} />
          ค้นหาข้อมูล
        </h3>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input 
                type="text" 
                className="form-input text-[13px] h-9 py-1 pr-9" 
                defaultValue="12 พ.ค. 2569 - 18 พ.ค. 2569" 
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">ความเสี่ยง</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1" defaultValue={type === 'confirmed' ? 'ยืนยัน SSI' : 'สงสัย SSI'}>
              <option>ทุกระดับความเสี่ยง</option>
              <option>สงสัย SSI</option>
              <option>ยืนยัน SSI</option>
            </select>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">สถานะ</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="form-group text-left md:col-span-3">
            <label className="text-[12px] font-medium text-slate-500">คำค้นหา</label>
            <input 
              type="text" 
              className="form-input mt-1 text-[13px] h-9 py-1" 
              placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." 
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-[#175beb] h-9 text-[13px] font-medium text-white shadow-sm hover:bg-blue-700 flex items-center justify-center gap-1.5">
              <Search size={14} />
              ค้นหา
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 h-9 text-[13px] font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <RotateCcw size={14} />
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-5 shadow-sm">
        <div className="flex h-full items-center gap-7">
          <button 
            onClick={() => setActiveTab('all')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'all' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            ทั้งหมด (52)
          </button>
          <button 
            onClick={() => setActiveTab('suspected')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'suspected' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            รายการสงสัย SSI
          </button>
          <button 
            onClick={() => setActiveTab('confirmed')}
            className={`h-full text-[14px] font-medium transition-all ${
              activeTab === 'confirmed' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
            }`}
          >
            รายการติดเชื้อ SSI
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
          <h2 className="text-[17px] font-semibold text-[#002d73]">รายการติดตามวันนี้ (48 ราย)</h2>
          <button className="inline-flex h-[40px] w-[146px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[14px]">
            <span className="inline-flex items-center gap-3"><CalendarDays size={17}/>วันนี้</span>
            <ChevronRight size={14} className="rotate-90"/>
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[13px] text-[#434651]">
            <thead className="h-10 bg-slate-50 font-semibold text-[#1e293b]">
              <tr>
                <th className="px-4 py-2 text-left" style={{ width: '40px' }}><input type="checkbox" /></th>
                <th className="px-4 py-2 text-left">HN</th>
                <th className="px-4 py-2 text-left">ชื่อผู้ป่วย</th>
                <th className="px-4 py-2 text-left">หัตถการ</th>
                <th className="px-4 py-2 text-left">ศัลยแพทย์</th>
                <th className="px-4 py-2 text-left">วันผ่าตัด</th>
                <th className="px-4 py-2 text-left">ความเสี่ยง SSI</th>
                <th className="px-4 py-2 text-left">สถานะประเมิน SSI</th>
              </tr>
            </thead>
            <tbody>
              {ssiRows.map((row, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => navigate(`/suspected-cases/${row.hn}/info`)}
                  className="h-[70px] border-t border-slate-100 hover:bg-blue-50/20 cursor-pointer"
                >
                  <td className="px-4 py-2" onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className="px-4 py-2 font-semibold text-slate-700">{row.hn}</td>
                  <td className="px-4 py-2">
                    <span className="font-semibold text-[#175beb] block">{row.name}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{row.age} ({row.birth})</span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700">{row.procedure}</td>
                  <td className="px-4 py-2 text-slate-600">{row.surgeon}</td>
                  <td className="px-4 py-2 text-slate-500">{row.date}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 font-semibold ${row.riskColor}`}>
                      ● {row.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {type === 'confirmed' ? (
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-500">
                        ยืนยัน SSI
                      </span>
                    ) : (
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[12px] font-semibold text-orange-500">
                        สงสัย SSI
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  );
}

function NotificationsCenterPage() {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dateRange, setDateRange] = useState('01/05/2569 - 01/06/2569');
  const [notifType, setNotifType] = useState('ทั้งหมด');
  const [status, setStatus] = useState('ทั้งหมด');
  const [importance, setImportance] = useState('ทั้งหมด');
  const [patientType, setPatientType] = useState('คนไข้ทั้งหมด');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      unread: true,
      type: 'พบผู้ป่วยสงสัยการติดเชื้อ SSI',
      detail: 'ระบบตรวจพบความเสี่ยง SSI สูงจากแบบประเมิน',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'รายละเอียดความเสี่ยง: ตรวจพบระดับความเสี่ยง Critical เนื่องจากผู้ป่วยทำแบบประเมินตนเองแล้วมีไข้สูง ปวดแผลผ่าตัด และแผลบวมแดง แนะนำส่งต่อประสานงานแพทย์ตรวจอย่างเร่งด่วน'
    },
    {
      id: 2,
      unread: true,
      type: 'ติดตามนัดหมายวันนี้',
      detail: 'มีผู้ป่วยครบกำหนดติดตามอาการวันนี้',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'กำหนดการนัดหมาย: ครบกำหนดติดตามผู้ป่วยรอบ Day 30 ตามโปรโตคอลการผ่าตัดศัลยกรรมกระดูก'
    },
    {
      id: 3,
      unread: true,
      type: 'ติดตามเลยกำหนด (เกิน 1 วัน)',
      detail: 'ผู้ป่วยยังไม่ได้ส่งข้อมูลตามกำหนด',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'เลยกำหนดการบันทึก: ผู้ป่วยเลยรอบประเมินอาการ Day 14 มาเป็นเวลา 48 ชั่วโมง ยังไม่มีการส่งข้อมูลแผลผ่าตัดกลับมา'
    },
    {
      id: 4,
      unread: true,
      type: 'ติดตามเลยกำหนด (เกิน 1 วัน)',
      detail: 'ผู้ป่วยยังไม่ได้ส่งข้อมูลตามกำหนด',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'เลยกำหนดการบันทึก: เลยกำหนดติดตามผู้ป่วยรอบ Day 7 เจ้าหน้าที่โทรติดตามแล้วไม่รับสาย'
    },
    {
      id: 5,
      unread: false,
      type: 'มีเคสใหม่จากห้องผ่าตัด',
      detail: 'มีผู้ป่วยผ่าตัดใหม่เข้าสู่ระบบติดตาม',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'การเชื่อมต่อ HIS: ได้รับประวัติการผ่าตัดเคสใหม่จากแผนกศัลยกรรมกระดูกเรียบร้อยแล้ว'
    },
    {
      id: 6,
      unread: false,
      type: 'ผู้ป่วยส่งรูปแผล',
      detail: 'มีผู้ป่วยอัปโหลดรูปแผลใหม่',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'ไฟล์ภาพแผล: ผู้ป่วยอัปโหลดรูปแผลความละเอียดสูงสำหรับช่วงติดตาม Day 14 ตรวจสอบเบื้องต้นแผลปกติ'
    },
    {
      id: 7,
      unread: false,
      type: 'ผู้ป่วยส่งรูปแผล',
      detail: 'มีผู้ป่วยอัปโหลดรูปแผลใหม่',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'ไฟล์ภาพแผล: ผู้ป่วยอัปโหลดรูปแผลติดตาม Day 28 แผลแห้งดีและตัดไหมเรียบร้อยแล้ว'
    },
    {
      id: 8,
      unread: false,
      type: 'ผู้ป่วยส่งรูปแผล',
      detail: 'มีผู้ป่วยอัปโหลดรูปแผลใหม่',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'ไฟล์ภาพแผล: ผู้ป่วยอัปโหลดรูปแผลติดตาม Day 1 แผลเรียบปกติ ไม่มีน้ำเหลืองซึม'
    },
    {
      id: 9,
      unread: false,
      type: 'ผู้ป่วยส่งรูปแผล',
      detail: 'มีผู้ป่วยอัปโหลดรูปแผลใหม่',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'ไฟล์ภาพแผล: ผู้ป่วยอัปโหลดรูปแผลติดตาม Day 7 แผลปิดเรียบร้อย ไม่มีอักเสบ'
    },
    {
      id: 10,
      unread: false,
      type: 'ผู้ป่วยส่งรูปแผล',
      detail: 'มีผู้ป่วยอัปโหลดรูปแผลใหม่',
      patient: { name: 'นายสมชาย ใจดี', hn: 'HN 66012345', or: 'OR2567-0512-0123' },
      time: '12/05/2567 10:25',
      fullDetail: 'ไฟล์ภาพแผล: ผู้ป่วยอัปโหลดรูปแผลติดตาม Day 30 แผลหายสนิทเรียบร้อย'
    }
  ]);

  const handleOpenDetail = (notif) => {
    setSelectedNotification(notif);
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, unread: false } : n)
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Section */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73] mb-4">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูล
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-600">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="h-[38px] w-full rounded-lg border border-slate-200 pl-10 pr-4 text-xs font-semibold text-slate-600"
              />
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">ประเภทการแจ้งเตือน</label>
            <select
              value={notifType}
              onChange={e => setNotifType(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>พบผู้ป่วยสงสัยการติดเชื้อ SSI</option>
              <option>ติดตามนัดหมายวันนี้</option>
              <option>ติดตามเลยกำหนด</option>
              <option>มีเคสใหม่จากห้องผ่าตัด</option>
              <option>ผู้ป่วยส่งรูปแผล</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">สถานะ</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>ยังไม่ได้อ่าน</option>
              <option>อ่านแล้ว</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">ระดับความสำคัญ</label>
            <select
              value={importance}
              onChange={e => setImportance(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>สำคัญ</option>
              <option>ปกติ</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">ประเภท ผู้คนไข้</label>
            <select
              value={patientType}
              onChange={e => setPatientType(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>คนไข้ทั้งหมด</option>
              <option>ศัลยกรรมกระดูก</option>
              <option>ศัลยกรรมทั่วไป</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications Table Card */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[18px] font-semibold text-[#002d73]">รายการแจ้งเตือน</h2>
          <button className="inline-flex h-[40px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[14px]">
            <span className="inline-flex items-center gap-3 text-xs font-semibold text-slate-700">
              <CalendarDays size={17} className="text-slate-500" />
              วันนี้
            </span>
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans">
            <thead className="h-[46px] bg-[#f8fafc] font-semibold text-[#1e293b]">
              <tr>
                <th className="px-6 text-left">สถานะ</th>
                <th className="px-4 text-left">ประเภทการแจ้งเตือน</th>
                <th className="px-4 text-left">รายละเอียด</th>
                <th className="px-4 text-left">ผู้ป่วย / เคส</th>
                <th className="px-4 text-left">เวลา</th>
                <th className="px-6 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <tr key={notif.id} className="h-[76px] hover:bg-slate-50/60 transition">
                  <td className="px-6 font-semibold">
                    {notif.unread ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        ยังไม่ได้อ่าน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#10b981]">
                        <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                        อ่านแล้ว
                      </span>
                    )}
                  </td>
                  <td className="px-4 font-semibold text-slate-800">{notif.type}</td>
                  <td className="px-4 text-slate-500 text-xs font-medium max-w-[280px] truncate">{notif.detail}</td>
                  <td className="px-4">
                    <span className="font-semibold text-slate-800 block">{notif.patient.name}</span>
                    <small className="block text-[11px] text-slate-400 font-medium">
                      {notif.patient.hn} | {notif.patient.or}
                    </small>
                  </td>
                  <td className="px-4 text-slate-500 text-xs font-medium">{notif.time}</td>
                  <td className="px-6 text-right">
                    <button
                      onClick={() => handleOpenDetail(notif)}
                      className="inline-flex h-[36px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition"
                    >
                      <Eye size={14} className="text-slate-400" />
                      เปิดดู
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>

      {/* Detail Dialog Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 animate-fade-in font-sans">
          <section className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                selectedNotification.unread ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Bell size={20} />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedNotification.type}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedNotification.time}</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ข้อมูลผู้ป่วย / เคส</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{selectedNotification.patient.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedNotification.patient.hn} • เลขที่ใบผ่าตัด: {selectedNotification.patient.or}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">รายละเอียดการแจ้งเตือน</p>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed font-medium">
                  {selectedNotification.fullDetail}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="h-[40px] rounded-xl bg-[#002d73] hover:bg-[#001d52] px-6 text-sm font-semibold text-white transition"
              >
                รับทราบ
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function CentralSearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ทั้งหมด');

  const categories = [
    { label: 'ทั้งหมด', count: 8642 },
    { label: 'ผู้ป่วย', count: 1250 },
    { label: 'หัตถการ', count: 58 },
    { label: 'การติดตาม', count: 118 },
    { label: 'เอกสาร', count: 128 },
    { label: 'การส่งต่อ', count: 24 },
    { label: 'SSI', count: 12 },
    { label: 'แพทย์', count: 4 },
    { label: 'แผนก', count: 14 }
  ];

  const popularKeywords = [
    'SSI ล่าสุด', 'แพทย์ ศัลยกรรม', 'หัตถการ C-Section',
    'ส่งต่อ ICU', 'MRSA', 'ผู้ป่วย IPD วันนี้',
    'ติดตามเกินกำหนด', 'เอกสาร Informed Consent'
  ];

  const [results, setResults] = useState([
    { id: 1, type: 'ผู้ป่วย', icon: UserRound, code: '0123456', name: 'นายสมชาย ใจดี', sub: 'อายุ 67 ปี (10 ก.พ. 2501)', found: 'ข้อมูลผู้ป่วย (โปรไฟล์ผู้ป่วย)', dept: 'OPD', date: '15 มิ.ย. 2569 10:15', status: 'กำลังติดตาม', statusType: 'green-pill' },
    { id: 2, type: 'หัตถการ', icon: Scissors, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'TKA (รายละเอียดอาการ)', dept: 'OPD', date: '15 มิ.ย. 2569 09:58', status: 'เอกสารล่าสุด', statusType: 'purple-pill' },
    { id: 3, type: 'เอกสาร', icon: File, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'รายการเอกสารแนบ (12 รายการ)', dept: 'OPD', date: '15 มิ.ย. 2569 09:58', status: 'เอกสารล่าสุด', statusType: 'purple-pill' },
    { id: 4, type: 'แพทย์', icon: Stethoscope, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'ข้อมูลแพทย์ (รายละเอียดแพทย์)', dept: 'OPD', date: '15 มิ.ย. 2569 09:58', status: 'PHYSICIAN', statusType: 'orange-border' },
    { id: 5, type: 'ผู้รับผิดชอบ', icon: UserCheck, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'ข้อมูลผู้รับผิดชอบ (รายละเอียดเจ้าหน้าที่ดูแล)', dept: 'OPD', date: '15 มิ.ย. 2569 09:58', status: 'OPD NURSE', statusType: 'blue-border' },
    { id: 6, type: 'ติดตาม', icon: CalendarDays, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'ติดตามหลังผ่าตัดครั้งที่ 1 (1/6)', dept: 'OPD', date: '15 มิ.ย. 2569 09:58', status: 'ตามนัด', statusType: 'blue-pill' },
    { id: 7, type: 'เอกสาร', icon: RefreshCw, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'ส่งต่อไปยัง IPD', dept: 'OPD → IPD', date: '15 มิ.ย. 2569 09:58', status: 'สำเร็จ', statusType: 'green-border' },
    { id: 8, type: 'SSI', icon: AlertTriangle, code: '0123456', name: 'นายสมชาย ใจดี', sub: '', found: 'สงสัย SSI แผลผ่าตัด', dept: 'IPD', date: '15 มิ.ย. 2569 09:58', status: 'รอประเมิน', statusType: 'purple-pill' }
  ]);

  const filteredResults = useMemo(() => {
    return results.filter(item => {
      const matchQuery = [item.code, item.name, item.found, item.dept].some(val =>
        val.toLowerCase().includes(query.toLowerCase())
      );
      if (activeTab === 'ทั้งหมด') return matchQuery;
      return matchQuery && item.type === activeTab;
    });
  }, [query, activeTab, results]);

  return (
    <div className="space-y-4">
      {/* Top metrics summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">การค้นหาวันนี้</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">1,286 <span className="text-xs font-medium text-slate-400">ครั้ง</span></p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Search size={20} />
          </span>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ผลลัพธ์ทั้งหมด</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">8,642 <span className="text-xs font-medium text-slate-400">รายการ</span></p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Layers size={20} />
          </span>
        </div>
      </div>

      {/* Main Search Panel Card */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73]">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาทุกข้อมูลจากทุกแหล่งในระบบ
        </h2>

        {/* Input Bar */}
        <div>
          <label className="text-[13px] font-semibold text-slate-600">คำค้นหา</label>
          <div className="mt-1 flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหา HN, AN, ชื่อผู้ป่วย, เบอร์โทร, หัตถการ, แพทย์, แผนก, เอกสาร, หมายเหตุ, ประวัติติดตาม..."
              className="h-[38px] flex-1 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold outline-none focus:border-[#175beb]"
            />
            <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 transition">
              ค้นหา
            </button>
            <button
              onClick={() => setQuery('')}
              className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Categories Tabs Selector */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(cat.label)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                activeTab === cat.label
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Popular searches tags */}
        <div className="pt-2 border-t border-slate-50 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">คำค้นหายอดนิยม 🔥</span>
          {popularKeywords.map(keyword => (
            <button
              key={keyword}
              onClick={() => setQuery(keyword)}
              className="inline-flex rounded bg-slate-50 hover:bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 border border-slate-100 transition"
            >
              {keyword}
            </button>
          ))}
        </div>
      </section>

      {/* Result Card Grid */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[64px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-[#002d73]">ผลการค้นหา ({filteredResults.length} รายการ)</h2>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans border-collapse">
            <thead className="h-[46px] bg-[#f8fafc] font-bold text-[#1e293b]">
              <tr className="border-b border-slate-100">
                <th className="px-4 text-left w-12"><input type="checkbox" /></th>
                <th className="px-4 text-left">ประเภทข้อมูล</th>
                <th className="px-4 text-left">HN / AN</th>
                <th className="px-4 text-left">ชื่อผู้ป่วย</th>
                <th className="px-4 text-left">รายการที่พบ</th>
                <th className="px-4 text-left">แผนก</th>
                <th className="px-4 text-left">วันที่อัปเดตล่าสุด</th>
                <th className="px-4 text-left">สถานะ</th>
                <th className="px-6 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.id} className="h-[68px] hover:bg-slate-50/60 transition">
                    <td className="px-4"><input type="checkbox" /></td>
                    <td className="px-4">
                      <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                        <span className="grid h-8 w-8 place-items-center rounded bg-slate-100 text-slate-500">
                          <Icon size={16} />
                        </span>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 font-bold text-slate-800">{row.code}</td>
                    <td className="px-4">
                      <span className="font-bold text-slate-800 block">{row.name}</span>
                      {row.sub && <small className="block text-[11px] text-slate-400 font-semibold mt-0.5">{row.sub}</small>}
                    </td>
                    <td className="px-4 text-slate-500 text-xs font-semibold">{row.found}</td>
                    <td className="px-4 text-slate-600 font-bold">{row.dept}</td>
                    <td className="px-4 text-slate-400 text-xs font-medium">{row.date}</td>
                    <td className="px-4">
                      {row.statusType === 'green-pill' && <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 font-bold border border-emerald-100">{row.status}</span>}
                      {row.statusType === 'purple-pill' && <span className="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-xs text-purple-600 font-bold border border-purple-100">{row.status}</span>}
                      {row.statusType === 'blue-pill' && <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-bold border border-blue-100">{row.status}</span>}
                      {row.statusType === 'orange-border' && <span className="inline-block rounded-md bg-white border border-orange-200 px-2 py-0.5 text-xs text-orange-500 font-bold">{row.status}</span>}
                      {row.statusType === 'blue-border' && <span className="inline-block rounded-md bg-white border border-blue-200 px-2 py-0.5 text-xs text-blue-600 font-bold">{row.status}</span>}
                      {row.statusType === 'green-border' && <span className="inline-block rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-xs text-emerald-600 font-bold">{row.status}</span>}
                    </td>
                    <td className="px-6 text-right">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#175beb] hover:bg-slate-50 transition">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  );
}

function HisSyncPage() {
  const [dateRange, setDateRange] = useState('12 พ.ค. 2569 - 18 พ.ค. 2569');
  const [db, setDb] = useState('ทั้งหมด');
  const [syncStatus, setSyncStatus] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [sources, setSources] = useState([
    { id: 0, type: 'ผู้ป่วย, แพทย์, แผนก', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:30', receive: 'อัปเดตแล้ว', count: '2,156 รายการ' },
    { id: 1, type: 'หัตถการ, ศัลยแพทย์, เวลาผ่าตัด', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:28', receive: 'อัปเดตแล้ว', count: '1,842 รายการ' },
    { id: 2, type: 'ผลตรวจทางห้องปฏิบัติการ', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:28', receive: 'อัปเดตแล้ว', count: '3,215 รายการ' },
    { id: 3, type: 'ผลเพาะเชื้อ', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:28', receive: 'อัปเดตแล้ว', count: '886 รายการ' },
    { id: 4, type: 'รหัสโรค', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:28', receive: 'อัปเดตแล้ว', count: '1,247 รายการ' },
    { id: 5, type: 'ข้อมูลเจ้าหน้าที่ในระบบ', status: 'เชื่อมต่ออยู่', lastSync: '22/05/2567 14:28', receive: 'อัปเดตแล้ว', count: '1,247 รายการ' }
  ]);

  const triggerSync = (id, type) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(`ซิงค์ข้อมูลประเภท "${type}" สำเร็จเรียบร้อยแล้ว!`);
      // Update last sync time
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear() + 543} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setSources(prev => prev.map(item => item.id === id ? { ...item, lastSync: formattedDate } : item));
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top sync summaries */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ซิงค์ล่าสุดสำเร็จ</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">14/06/2569</p>
            <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span className="text-emerald-500 font-bold">↑ 8%</span> จากเมื่อวาน
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
          </span>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ซิงค์สำเร็จ</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">1,248</p>
            <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span className="text-emerald-500 font-bold">↑ 8%</span> จากเมื่อวาน
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </span>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ซิงค์ล้มเหลว</p>
            <p className="mt-2 text-2xl font-bold text-red-500">36</p>
            <p className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-red-500">
              <span className="text-red-500 font-bold">↑ 12%</span> จากเมื่อวาน
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500">
            <AlertCircle size={20} />
          </span>
        </div>
      </div>

      {/* Database Search Filter panel */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73] mb-4">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูล
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-600">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="h-[38px] w-full rounded-lg border border-slate-200 pl-10 pr-4 text-xs font-semibold text-slate-600"
              />
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">ฐานข้อมูล</label>
            <select
              value={db}
              onChange={e => setDb(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>ผู้ป่วย, แพทย์, แผนก</option>
              <option>หัตถการ, ศัลยแพทย์</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">สถานะการซิงค์</label>
            <select
              value={syncStatus}
              onChange={e => setSyncStatus(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>สำเร็จ</option>
              <option>ล้มเหลว</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1 text-[13px] font-semibold text-slate-600">
            คำค้นหา
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาข้อมูลตาราง..."
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#175beb]"
            />
          </label>
          <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 transition">
            ค้นหา
          </button>
          <button
            onClick={() => { setSearch(''); setDateRange('12 พ.ค. 2569 - 18 พ.ค. 2569'); }}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      {/* Data Sources Table Card */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[18px] font-semibold text-[#002d73]">แหล่งข้อมูล (Data Sources)</h2>
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
            <Settings2 size={14} /> ตั้งค่าการซิงค์
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans border-collapse">
            <thead className="h-[46px] bg-[#f8fafc] font-bold text-[#1e293b]">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left">ID_table</th>
                <th className="px-4 py-3 text-left">ประเภทข้อมูล</th>
                <th className="px-4 py-3 text-left">สถานะการเชื่อมต่อ</th>
                <th className="px-4 py-3 text-left">ซิงค์ล่าสุด</th>
                <th className="px-4 py-3 text-left">สถานะการรับ</th>
                <th className="px-4 py-3 text-left">จำนวนข้อมูล</th>
                <th className="px-6 py-3 text-right">การทำงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sources.map((row) => (
                <tr key={row.id} className="h-[68px] hover:bg-slate-50/60 transition">
                  <td className="px-4 text-slate-400 font-bold">{row.id}</td>
                  <td className="px-4 font-bold text-slate-800">{row.type}</td>
                  <td className="px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 text-slate-500 font-semibold">{row.lastSync}</td>
                  <td className="px-4 text-emerald-600 font-bold">{row.receive}</td>
                  <td className="px-4 font-semibold text-slate-800">{row.count}</td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => triggerSync(row.id, row.type)}
                        disabled={isSyncing}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                        ซิงค์ข้อมูล
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  );
}

