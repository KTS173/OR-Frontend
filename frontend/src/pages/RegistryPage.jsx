import { Activity, AlertCircle, AlertTriangle, ArrowLeftRight, ArrowRight, Bell, Calendar, CalendarClock, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Database, Download, Eye, File, History, Layers, Mail, PhoneCall, Plus, RefreshCw, RotateCcw, Scissors, Search, Settings2, ShieldCheck, Stethoscope, TimerReset, UserCheck, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Filters from '../components/ui/Filters.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import PatientTable from '../components/ui/PatientTable.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TrackingHistoryTable from '../components/TrackingHistoryTable.jsx'
import { useApiQuery } from '../hooks/useApiQuery.js'
import { api } from '../services/api.js'

const configs = {
  validation: { title: 'OR Validation List', description: 'รายการเคสที่ต้องตรวจสอบก่อนส่งเข้า Surveillance', metrics: [] },
  opd: { title: 'คิว OPD', description: 'รายการผู้ป่วยนอกที่อยู่ในแผนติดตาม', metrics: [] },
  ipd: { title: 'คิว IPD', description: 'รายการผู้ป่วยในที่ต้องเฝ้าระวัง', metrics: [] },
  followUp: { title: 'งานติดตามของฉัน', description: 'งานเฝ้าระวังและติดตามที่ได้รับมอบหมาย', metrics: [] },
  history: { title: 'ประวัติการติดตาม', description: 'ค้นหาและตรวจสอบประวัติการเฝ้าระวังย้อนหลัง', metrics: [] },
  suspected: { title: 'เคสสงสัยติดเชื้อ (Suspected SSI Cases)', description: 'เคสที่รอแพทย์ประเมินอาการ', metrics: [] },
  confirmed: { title: 'เคสยืนยันติดเชื้อ (Confirmed SSI Cases)', description: 'ทะเบียนผู้ป่วยที่ได้รับการยืนยัน SSI', metrics: [] },
  doctor: { title: 'แพทย์ตรวจสอบ SSI', description: 'รายการเคสที่ส่งให้แพทย์วินิจฉัยและรับรอง', metrics: [] },
  notifications: { title: 'ศูนย์แจ้งเตือน', description: 'ติดตามเหตุการณ์สำคัญและงานที่ต้องดำเนินการ', metrics: [] },
  search: { title: 'ค้นหาข้อมูลกลาง', description: 'ค้นหาข้อมูลผู้ป่วยและประวัติข้ามหน่วยงาน', metrics: [] },
  sync: { title: 'ข้อมูลที่เชื่อมต่อจาก HIS / TrackCare', description: 'ตรวจสอบสถานะและความสมบูรณ์ของข้อมูลต้นทาง', metrics: [] },
}

export default function RegistryPage({ type }) {
  const [search, setSearch] = useState('')
  const query = type === 'followUp' ? api.getFollowUpPatients : type === 'history' ? api.getEvaluationHistory : api.getPatients
  const { data, loading, refetch } = useApiQuery(query)
  const currentUser = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { return null } }, [])
  const config = configs[type] ?? configs.validation
  const filtered = useMemo(() => data.filter((item) => {
    const isQueue = ['opd', 'ipd'].includes(type)
    const matchesQueue = !isQueue || (item.patientType?.toLowerCase() === type && item.workflowStatus === 'QUEUED')
    const matchesWorkflow = type === 'validation' ? item.workflowStatus === 'OR_PENDING'
      : type === 'suspected' || type === 'doctor' ? item.ssiStatus === 'SUSPECTED_SSI'
        : type === 'confirmed' ? item.ssiStatus === 'CONFIRMED_SSI'
          : type === 'history' ? Boolean(item.evaluationId)
            : true
    const matchesSearch = [item.id, item.name, item.procedure, item.department, item.operationNo]
      .some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
    return matchesQueue && matchesWorkflow && matchesSearch
  }), [currentUser, data, search, type])
  if (type === 'validation') return <ValidationPage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'opd' || type === 'ipd') return <OpdQueuePage queueType={type} patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'followUp') return <MyFollowUpsPage patients={filtered} loading={loading} search={search} setSearch={setSearch} />
  if (type === 'history') return <TrackingHistoryTable patients={filtered} loading={loading} />
  if (type === 'suspected' || type === 'confirmed' || type === 'doctor') return <SuspectedSSIPage type={type} patients={filtered} loading={loading} search={search} setSearch={setSearch} refetch={refetch} />
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

function OpdQueuePage({ queueType, patients, loading, search, setSearch }) {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const metricValues = [patients.length, patients.length, 0, patients.filter(p => /SUSPECT|สงสัย/i.test(p.status || '')).length, patients.filter(p => /CONFIRM.*SSI|SSI.*CONFIRM|ยืนยัน.*SSI/i.test(p.status || '')).length]
  return <div className="space-y-4">
    <section className="grid grid-cols-5 gap-4">{opdMetrics.map(([label, , unit, Icon, color, bg, cardBg], index) => <article key={label} className="flex h-[140px] min-w-0 flex-col rounded-xl border border-black/10 p-[17px] shadow-sm" style={{ backgroundColor: cardBg }}><div className="flex items-start justify-between gap-2"><p className="whitespace-nowrap text-[14px] font-medium" style={{ color }}>{label}</p><span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: bg, color }}>{typeof Icon === 'string' ? <span className="validation-card-icon" style={{ backgroundColor: color, WebkitMaskImage: `url("${Icon}")`, maskImage: `url("${Icon}")` }} /> : <Icon size={20} />}</span></div><p className="mt-3 flex items-baseline gap-1.5 text-[28px] font-semibold leading-8" style={{ color }}><span>{metricValues[index]}</span><span className="text-[14px]">{unit}</span></p><p className={`mt-auto flex items-center whitespace-nowrap text-[12px] leading-4 ${index >= 3 ? 'text-red-500' : 'text-[#64748b]'}`}>{index >= 3 && <img src="/assets/icon/dashboard/up-red-margin.png" alt="" className="mr-1 h-[9px] w-3 object-contain" />}{index === 0 ? `ข้อมูล ${queueType.toUpperCase()} จากฐานข้อมูล` : 'ข้อมูลจากฐานข้อมูล'}</p></article>)}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm"><div className="flex h-full items-center gap-6">{[`ทั้งหมด (${patients.length})`, `รายการคนไข้จากแผนก OR ใหม่ (${patients.length})`, 'รายการผู้ป่วยจากการย้ายผู้ป่วยจากแผนก IPD (0)'].map((label, index) => <button key={label} className={`h-full text-[13px] font-medium ${index === 0 ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>{label}</button>)}</div></section>
    <OpdPatientTable patients={patients} loading={loading} onSelect={setSelectedPatient} />
    {selectedPatient && <AcceptPatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
  </div>
}

function OpdPatientTable({ patients, loading, onSelect }) {
  const rows = patients.slice(0, 10)
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[18px] font-semibold text-[#002d73]">รายการติดตามผู้ป่วย ({patients.length} ราย)</h2><button className="inline-flex h-[40px] w-[146px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[14px]"><span className="inline-flex items-center gap-3"><CalendarDays size={17} />วันนี้</span><ChevronRight size={14} className="rotate-90" /></button></header><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-[13px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold text-[#1e293b]"><tr>{['HN', 'ชื่อผู้ป่วย', 'อายุ/เพศ', 'หัตถการ', 'ศัลยแพทย์', 'วันผ่าตัด', 'วันรับข้อมูล'].map(h => <th key={h} className="px-4 text-left">{h}</th>)}</tr></thead><tbody>{loading ? Array.from({ length: 10 }).map((_, i) => <tr key={i} className="h-[60px] border-t border-slate-100"><td colSpan="7" className="px-4"><div className="h-3 animate-pulse rounded bg-slate-100" /></td></tr>) : rows.map((p) => <tr key={p.operationNo || p.id} onClick={() => onSelect(p)} className="h-[60px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40"><td className="px-4 font-semibold text-[#175beb]">{p.id}</td><td className="px-4"><span className="font-medium">{p.name}</span><small className="block text-[11px] text-[#64748b]">({p.dateOfBirth || '-'})</small></td><td className="px-4">{p.age ?? '-'} / {p.sex || '-'}</td><td className="max-w-[140px] px-4 text-center">{p.procedure || '-'}</td><td className="px-4">{p.surgeon || '-'}</td><td className="px-4">{p.surgeryDate}</td><td className="px-4">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('th-TH') : '-'}</td></tr>)}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-[#e2e8f0] px-6 text-[13px] text-[#64748b]"><span>Showing {rows.length} of {patients.length} Historical Log</span><div className="flex gap-2"><button className="page-button w-auto px-3">Previous</button><button className="page-button bg-[#175beb] text-white">1</button><button className="page-button">2</button><button className="page-button">3</button><button className="page-button w-auto px-3">Next</button></div></footer></section>
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
  const metricValues = [patients.length, patients.filter(p => /ELIGIBLE/i.test(p.status || '')).length, patients.filter(p => !p.id || !p.operationNo || !p.procedure).length, patients.filter(p => /SENT|COMPLETED/i.test(p.status || '')).length, patients.filter(p => /REMOVED|INELIGIBLE/i.test(p.status || '')).length, 0]
  return <div className="space-y-4">
    <section className="grid grid-cols-4 gap-x-[17px] gap-y-4">{validationMetrics.map(([label, , unit, icon, color, iconBg, labelColor = color], index) => {
      const iconUrl = `/assets/icon/OR Validation List/${icon}`
      return <article key={label} className="h-[138px] rounded-xl border border-black/10 bg-white p-[20px] shadow-sm"><div className="flex h-11 items-start justify-between"><p className="text-[18px] leading-5 font-medium" style={{ color: labelColor }}>{label}</p><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: iconBg }}><span className="validation-card-icon" style={{ backgroundColor: color, WebkitMaskImage: `url("${iconUrl}")`, maskImage: `url("${iconUrl}")` }} /></span></div><p className="pt-3 text-[32px] leading-9 font-semibold" style={{ color }}>{metricValues[index]} <span className="text-[14px]">{unit}</span></p></article>
    })}</section>
    <Filters search={search} onSearch={setSearch} validation />
    <section className="flex h-[73px] items-center justify-between rounded-xl border border-black/10 bg-white px-[17px] shadow-sm"><div className="flex items-center gap-4">{[`ทั้งหมด (${patients.length})`, `รอตรวจสอบ (${patients.filter(p => /PENDING|WAIT|รอ/i.test(p.status || '')).length})`, `ยืนยันการตรวจสอบ (${patients.filter(p => /VERIFIED/i.test(p.status || '')).length})`, `เข้าเกณฑ์ (${patients.filter(p => /ELIGIBLE/i.test(p.status || '')).length})`, `ไม่เข้าเกณฑ์ (${patients.filter(p => /REMOVED|INELIGIBLE/i.test(p.status || '')).length})`, `ส่งเข้าแล้ว (${patients.filter(p => /SENT|COMPLETED/i.test(p.status || '')).length})`].map((item, i) => <button key={item} className={`h-9 px-3 text-[14px] ${i === 0 ? 'border-b-2 border-[#175beb] font-medium text-[#175beb]' : 'text-[#424752]'}`}>{item}</button>)}</div><button className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px]"><RefreshCw size={13} />รีเฟรช</button></section>
    <PatientTable patients={patients} loading={loading} validation />
  </div>
}

function MyFollowUpsPage({ patients, loading, search, setSearch }) {
  const myMetrics = [
    { label: 'เคสติดตามทั้งหมด', value: patients.length, unit: 'คน', tone: 'green', subtext: 'ข้อมูลจากฐานข้อมูล' },
    { label: 'นัดหมายแล้ววันนี้', value: 0, unit: 'คน', tone: 'blue', subtext: 'ยังไม่มีข้อมูลนัดหมาย' },
    { label: 'ติดต่อไม่สำเร็จ', value: patients.filter(p => /CONTACT_FAILED/i.test(p.followUpStatus || '')).length, unit: 'คน', tone: 'orange', subtext: 'ข้อมูลจากการติดตามจริง' },
    { label: 'ดำเนินการเสร็จ', value: patients.filter(p => /COMPLETED/i.test(p.followUpStatus || '')).length, unit: 'คน', tone: 'green', subtext: 'ข้อมูลจากการติดตามจริง' },
    { label: 'เกินกำหนด', value: patients.filter(p => /OVERDUE/i.test(p.followUpStatus || '')).length, unit: 'คน', tone: 'red', subtext: 'ข้อมูลจากการติดตามจริง' },
    { label: 'สงสัย SSI', value: patients.filter(p => /SUSPECT|สงสัย/i.test(p.followUpStatus || '')).length, unit: 'เคส', tone: 'orange', subtext: 'ข้อมูลจากการติดตามจริง' },
    { label: 'รอผู้ป่วยตอบกลับ', value: patients.filter(p => /PENDING|WAIT/i.test(p.followUpStatus || '')).length, unit: 'เคส', tone: 'violet', subtext: 'ข้อมูลจากการติดตามจริง' },
  ]
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-5 gap-4">
        {myMetrics.map((m) => (
          <MetricCard key={m.label} {...m} dashboard />
        ))}
      </section>
      <MyFilters search={search} setSearch={setSearch} />
      <section className="flex h-[66px] items-center rounded-xl border border-black/10 bg-white px-4 shadow-sm">
        <div className="flex h-full items-center gap-7">
          {[`ทั้งหมด (${patients.length})`, 'รายการกำหนดติดตามวันนี้ (0)', 'รายการยังไม่ถึงรอบติดตาม (0)', `รายการสงสัย SSI (${patients.filter(p => /SUSPECT|สงสัย/i.test(p.followUpStatus || '')).length})`, `รายการติดเชื้อ SSI (${patients.filter(p => /CONFIRM.*SSI|SSI.*CONFIRM|ยืนยัน.*SSI/i.test(p.followUpStatus || '')).length})`].map((x, i) => (
            <button key={x} className={`h-full text-[14px] font-medium ${i === 0 ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>
              {x}
            </button>
          ))}
        </div>
      </section>
      <MyFollowTable patients={patients} loading={loading} />
    </div>
  );
}

function MyFilters({ search, setSearch }) {
  return <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-[18px] font-semibold"><Search size={19} className="text-[#175beb]" />ค้นหาข้อมูล</h2><div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"><label className="text-[13px]">เลือกช่วงวันที่<input className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-4" placeholder="ยังไม่ได้เลือกช่วงวันที่" /></label>{['รอบการติดตาม', 'สถานะ'].map(x => <label key={x} className="text-[13px]">{x}<select className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3"><option>ทั้งหมด</option></select></label>)}</div><div className="mt-4 flex items-end gap-3"><label className="flex-1 text-[13px]">คำค้นหา<input value={search} onChange={e => setSearch(e.target.value)} className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3" placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." /></label><button className="btn-primary h-[40px] px-6"><Search size={14} />ค้นหา</button><button onClick={() => setSearch('')} className="btn-secondary h-[40px] px-5"><RefreshCw size={14} />ล้างตัวกรอง</button></div></section>
}

function MyFollowTable({ patients, loading }) {
  const navigate = useNavigate()
  const rows = patients.slice(0, 10)
  const openFollowUp = async (patient) => {
    try { if (patient.followUpId && !patient.followUpViewedAt) await api.markFollowUpViewed(patient.followUpId) } catch { /* เปิดเคสต่อได้แม้บันทึกการอ่านล้มเหลว */ }
    window.dispatchEvent(new Event('operations-updated'))
    navigate(`/follow-ups/${patient.id}`)
  }
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><header className="flex h-[72px] items-center justify-between px-6"><h2 className="text-[18px] font-semibold text-[#002d73]">รายการงานติดตาม ({patients.length} ราย)</h2></header><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-[13px]"><thead className="h-10 bg-slate-50"><tr>{['HN', 'ชื่อผู้ป่วย', 'หัตถการ', 'ศัลยแพทย์', 'ความเสี่ยง SSI', 'สถานะติดตาม', 'กำหนดติดตามครั้งแรก'].map(x => <th key={x} className="px-4 text-left">{x}</th>)}</tr></thead><tbody>{loading && <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">กำลังโหลดข้อมูล...</td></tr>}{!loading && !rows.length && <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">ยังไม่มีการสร้างงานติดตาม</td></tr>}{!loading && rows.map((p) => { const firstSchedule = Array.isArray(p.followUpSchedule) ? p.followUpSchedule[0] : null; return <tr key={p.followUpId || p.operationNo} onClick={() => openFollowUp(p)} className={`h-[70px] cursor-pointer border-t border-slate-100 hover:bg-blue-50/40 ${!p.followUpViewedAt ? 'bg-blue-50/30' : ''}`}><td className="px-4 font-semibold">{p.id}</td><td className="px-4">{p.name}{!p.followUpViewedAt && <span className="ml-2 inline-block size-2 rounded-full bg-blue-600" />}<small className="block text-slate-500">{p.age != null ? `${p.age} ปี` : '-'} {p.dateOfBirth ? `(${p.dateOfBirth})` : ''}</small></td><td className="px-4">{p.procedure || '-'}</td><td className="px-4">{p.surgeon || '-'}</td><td className="px-4">-</td><td className="px-4"><StatusBadge>{p.followUpStatus || '-'}</StatusBadge></td><td className="px-4">{firstSchedule?.date || firstSchedule?.scheduledAt || '-'}</td></tr>})}</tbody></table></div><footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500"><span>แสดง {rows.length} จาก {patients.length} รายการ</span></footer></section>
}

function AcceptPatientModal({ patient, onClose }) {
  const navigate = useNavigate()
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const currentUser = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { return null } }, [])
  const accept = async () => {
    let user = null
    try { user = JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { /* empty */ }
    if (!user?.id) return setError('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่')
    setAccepting(true); setError('')
    try {
      await api.acceptOperation(patient.operationNo, user.id)
      window.dispatchEvent(new Event('operations-updated'))
      navigate(patient.followUpId ? `/follow-ups/${patient.id}` : `/cases/${patient.id}/create-follow-up`)
      onClose()
    } catch (reason) { setError(reason.message) }
    finally { setAccepting(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="relative w-full max-w-[480px] rounded-2xl bg-white px-8 pb-7 pt-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>

        {/* Orange warning icon */}
        <div className="flex justify-center">
          <img src="/assets/icon/Alert Icon.png" alt="" className="h-20 w-20 object-contain" />
        </div>

        <h2 className="mt-5 text-center text-[24px] font-semibold text-[#191c1e]">คุณจะเป็นผู้ดูแลคนไข้รายนี้</h2>
        <p className="mt-2 text-center text-[15px] leading-6 text-slate-500">คุณต้องการรับผู้ป่วยรายนี้<br />เพื่อเป็นผู้รับผิดชอบในการติดตามใช่หรือไม่?</p>
        <p className="mt-3 text-center text-[13px] text-blue-600">ผู้รับเคส: {currentUser?.name || '-'} ({currentUser?.role || '-'})</p>

        {/* Patient info card */}
        <div className="mt-5 rounded-xl bg-blue-50/60 p-4 text-[15px]">
          <p className="font-semibold text-[#191c1e]">HN {patient.id}&nbsp;&nbsp;{patient.name}</p>
          <p className="mt-1 text-slate-600">{patient.sex || '-'} • อายุ {patient.age ?? '-'} ปี {patient.dateOfBirth ? `(${patient.dateOfBirth})` : ''}</p>
          <p className="mt-0.5 text-slate-600">หัตถการ: <strong className="font-semibold">{patient.procedure || '-'}</strong></p>
          <div className="mt-1 flex flex-wrap gap-x-6 text-slate-600">
            <span>วันที่ผ่าตัด: {patient.surgeryDate}</span>
            <span>วันที่จำหน่าย: -</span>
          </div>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-[50px] rounded-xl border border-slate-200 text-[15px] font-medium text-slate-700 hover:bg-slate-50">ยกเลิก</button>
          <button
            disabled={accepting}
            onClick={accept}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#002d73] text-[15px] font-medium text-white hover:bg-[#001d52]"
          >{accepting ? 'กำลังรับเคส...' : 'ใช่, รับเป็นผู้ดูแล'} <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  )
}

function HistoryPage({ patients, loading, search, setSearch }) {
  const [activeTab, setActiveTab] = useState('all')

  const historyMetrics = [
    { label: 'ประวัติติดตามทั้งหมด', value: String(patients.length), unit: 'คน', tone: 'blue', subtext: 'รายการ' },
    { label: 'ติดตามสำเร็จ', value: String(patients.filter(p => String(p.status).toUpperCase() === 'COMPLETED').length), unit: 'คน', tone: 'green', subtext: 'รายการ' },
    { label: 'ย้ายไปแผนกอื่น', value: '0', unit: 'คน', tone: 'violet', subtext: 'ยังไม่มีข้อมูล' }
  ]

  const historyRows = patients.map((patient) => {
    const timestamp = patient.evaluatedAt ? new Date(patient.evaluatedAt) : null
    const result = patient.evaluationResult === 'suspect_ssi' ? 'สงสัย SSI' : patient.evaluationResult === 'not_infected' ? 'ไม่เข้าข่าย SSI' : patient.evaluationResult || '-'
    return { date: timestamp ? timestamp.toLocaleDateString('th-TH') : '-', time: timestamp ? timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-', hn: patient.id, name: patient.name, age: patient.age ? `${patient.age} ปี` : '-', birth: patient.dateOfBirth || '-', procedure: `${patient.procedure || '-'} • ${patient.evaluationRound || '-'}`, dept: patient.receivingDepartment || patient.patientType?.toUpperCase() || '-', staff: patient.evaluatedBy || '-', ssi: result, suspected: patient.evaluationResult === 'suspect_ssi' }
  })

  return (
    <div className="flex flex-col gap-6 text-left pb-10">

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {historyMetrics.map((card, idx) => (
          <MetricCard key={idx} {...card} dashboard />
        ))}
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
                type="date"
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
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'all' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
              }`}
          >
            ทั้งหมด ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('success')}
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'success' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
              }`}
          >
            ติดตามสำเร็จ
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'transfer' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
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
          <table className="w-full min-w-[1050px] text-[13px] text-[#434651]">
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
                    <span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${row.suspected ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {row.ssi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500">
          <span>แสดง {historyRows.length} จาก {historyRows.length} รายการ</span>
        </footer>
      </section>

    </div>
  );
}

function SuspectedSSIPage({ type, patients, loading, search, setSearch, refetch }) {
  const rawNavigate = useNavigate()
  const navigate = (to, options) => rawNavigate(typeof to === 'string' && to.startsWith('/suspected-cases/') && !to.includes('?') ? `${to}?from=${type}` : to, options)
  const detailQuery = `?from=${type}`
  const [riskLevels, setRiskLevels] = useState([
    { id: 'low', name: 'ต่ำ', min: 0, max: 24, color: '#10b981' },
    { id: 'moderate', name: 'ปานกลาง', min: 25, max: 50, color: '#f59e0b' },
    { id: 'high', name: 'สูง', min: 51, max: 74, color: '#ef4444' },
    { id: 'critical', name: 'สูงมาก', min: 75, max: 100, color: '#7f1d1d' },
  ])
  useEffect(() => { api.getSettings().then(settings => { if (Array.isArray(settings.riskLevels) && settings.riskLevels.length) setRiskLevels(settings.riskLevels.map(level => level.id === 'moderate' && Number(level.max) === 49 ? { ...level, max: 50 } : level.id === 'high' && Number(level.min) === 50 ? { ...level, min: 51 } : level)) }).catch(() => {}) }, [])
  const [activeTab, setActiveTab] = useState('all')
  const [actionError, setActionError] = useState('')
  const currentUser = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { return null } }, [])

  const decide = async (event, row, decision) => {
    event.stopPropagation()
    setActionError('')
    try {
      await api.reviewOperation(row.operationNo, { decision, reviewedBy: currentUser?.name })
      window.dispatchEvent(new Event('operations-updated'))
      refetch()
    } catch (error) { setActionError(error.message) }
  }
  const recover = async (event, row) => {
    event.stopPropagation()
    setActionError('')
    try { await api.markRecovered(row.operationNo); window.dispatchEvent(new Event('operations-updated')); refetch() }
    catch (error) { setActionError(error.message) }
  }

  const metrics = [
    { label: 'เคสรอแพทย์ตรวจ', value: String(patients.filter(p => /PENDING|WAIT|รอ/i.test(p.status || '')).length), unit: 'เคส', tone: 'orange', subtext: 'รอตรวจสอบเคสวันนี้' },
    { label: 'แพทย์กำลังตรวจสอบ', value: String(patients.filter(p => /REVIEW|PROGRESS|ตรวจ/i.test(p.status || '')).length), unit: 'เคส', tone: 'purple', subtext: 'กำลังดำเนินการตรวจสอบ' },
    { label: 'ยืนยัน SSI', value: String(patients.filter(p => /CONFIRM.*SSI|SSI.*CONFIRM|ยืนยัน.*SSI/i.test(p.status || '')).length), unit: 'เคส', tone: 'rose', subtext: 'พบติดเชื้อ' }
  ]

  const ssiRows = patients.map(patient => {
    const answers = Object.values(patient.evaluationData?.symptoms || {}).filter(Boolean)
    const points = answers.reduce((sum, value) => /^(has|yes|true|มี)$/i.test(String(value)) ? sum + 1 : /^(unknown|unsure|ไม่ทราบ)$/i.test(String(value)) ? sum + 0.5 : sum, 0)
    const calculated = answers.length ? Number(((points / answers.length) * 100).toFixed(2)) : null
    const score = calculated != null ? calculated : patient.evaluationScore != null ? Number(patient.evaluationScore) : null
    const level = score == null ? null : riskLevels.find(item => score >= Number(item.min) && score <= Number(item.max)) || riskLevels[riskLevels.length - 1]
    const schedule = Array.isArray(patient.followUpSchedule) ? patient.followUpSchedule : []
    const nextDueIndex = Math.min(Number(patient.currentRoundIndex || 0), schedule.length)
    const completedIndexes = schedule.map((round, index) => round.status === 'COMPLETED' || round.completedAt ? index : -1).filter(index => index >= 0)
    const currentIndex = completedIndexes.length ? completedIndexes[completedIndexes.length - 1] : Math.max(0, nextDueIndex - 1)
    const nextIndex = completedIndexes.length ? currentIndex + 1 : nextDueIndex
    return { operationNo: patient.operationNo, hn: patient.id, name: patient.name, age: patient.age ? `${patient.age} ปี` : '-', birth: patient.dateOfBirth || '-', procedure: patient.procedure || '-', surgeon: patient.surgeon || '-', date: patient.surgeryDate, risk: level ? `${level.name} ${score}%` : 'ยังไม่มีคะแนน', riskColor: '', riskColorValue: level?.color || '#94a3b8', status: patient.ssiStatus, evaluationResult: patient.evaluationResult, startedAt: schedule[0]?.date || patient.followUpCreatedAt, templateDays: patient.followUpTemplateDays, schedule, currentIndex, currentRound: schedule[currentIndex], nextRound: schedule[nextIndex], phone: patient.phonePrimary }
  })

  return (
    <div className="flex flex-col gap-6 text-left pb-10">
      {/* Top Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((card, idx) => (
          <MetricCard key={idx} {...card} dashboard />
        ))}
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
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'all' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
              }`}
          >
            ทั้งหมด ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('suspected')}
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'suspected' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
              }`}
          >
            รายการสงสัย SSI
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`h-full text-[14px] font-medium transition-all ${activeTab === 'confirmed' ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
              }`}
          >
            รายการติดเชื้อ SSI
          </button>
        </div>
      </section>

      {/* Table Section */}
      {actionError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{actionError}</div>}
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
          <h2 className="text-[17px] font-semibold text-[#002d73]">รายการติดตามวันนี้ ({patients.length} ราย)</h2>
          <button className="inline-flex h-[40px] w-[146px] items-center justify-between rounded-lg border border-[#e2e8f0] px-4 text-[14px]">
            <span className="inline-flex items-center gap-3"><CalendarDays size={17} />วันนี้</span>
            <ChevronRight size={14} className="rotate-90" />
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1900px] text-[13px] text-[#434651]">
            <thead className="h-10 bg-slate-50 font-semibold text-[#1e293b]">
              <tr>
                <th className="px-4 py-2 text-left">HN</th>
                <th className="px-4 py-2 text-left">ชื่อผู้ป่วย</th>
                <th className="px-4 py-2 text-left">หัตถการ</th>
                <th className="px-4 py-2 text-left">ศัลยแพทย์</th>
                <th className="px-4 py-2 text-left">วันผ่าตัด</th>
                <th className="px-4 py-2 text-left">ความเสี่ยง SSI</th>
                <th className="px-4 py-2 text-left">สถานะประเมิน SSI</th>
                <th className="px-4 py-2 text-left">เริ่มติดตามครั้งแรก</th>
                <th className="px-4 py-2 text-left">รอบติดตาม</th>
                <th className="px-4 py-2 text-left">รอบปัจจุบัน</th>
                <th className="px-4 py-2 text-left">นัดติดตามถัดไป</th>
                <th className="px-4 py-2 text-left">ช่องทางติดต่อ</th>
                <th className="px-4 py-2 text-left">สถานะตรวจ SSI</th>
                <th className="px-4 py-2 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {ssiRows.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => navigate(`/suspected-cases/${row.hn}/info${detailQuery}`)}
                  className="h-[70px] border-t border-slate-100 hover:bg-blue-50/20 cursor-pointer"
                >
                  <td className="px-4 py-2 font-semibold text-slate-700">{row.hn}</td>
                  <td className="px-4 py-2">
                    <span className="font-semibold text-[#175beb] block">{row.name}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{row.age} ({row.birth})</span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700">{row.procedure}</td>
                  <td className="px-4 py-2 text-slate-600">{row.surgeon}</td>
                  <td className="px-4 py-2 text-slate-500">{row.date}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-2 font-semibold" style={{ color: row.riskColorValue }}>
                      <i className="size-2 rounded-full" style={{ backgroundColor: row.riskColorValue }} />{row.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {row.status === 'RECOVERED' ? <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">หายจากการติดเชื้อ</span> : row.status === 'CONFIRMED_SSI' ? (
                      <span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${row.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        ยืนยัน SSI
                      </span>
                    ) : /suspect/i.test(row.evaluationResult || '') || row.status === 'SUSPECTED_SSI' ? (
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[12px] font-semibold text-orange-500">
                        สงสัย SSI
                      </span>
                    ) : /not_infected|not_ssi/i.test(row.evaluationResult || '') ? <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">ไม่เข้าข่าย SSI</span> : <span className="text-slate-400">รอประเมิน</span>}
                  </td>
                  <td className="px-4 py-2">{row.startedAt ? new Date(row.startedAt).toLocaleDateString('th-TH') : '-'}</td>
                  <td className="px-4 py-2">{row.templateDays ? <>Day {row.templateDays}<small className="block text-blue-600">({row.schedule.length} รอบ)</small></> : '-'}</td>
                  <td className="px-4 py-2">{row.currentRound ? <>{row.currentRound.day}<small className="block text-blue-600">รอบติดตาม {row.currentIndex + 1}/{row.schedule.length} รอบ</small></> : '-'}</td>
                  <td className="px-4 py-2">{row.nextRound ? <>{row.nextRound.day}<small className="block text-slate-500">{row.nextRound.date || '-'}</small></> : 'สิ้นสุดรอบ'}</td>
                  <td className="px-4 py-2">{row.phone || '-'}</td>
                  <td className="px-4 py-2"><span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${row.status === 'CONFIRMED_SSI' ? 'bg-red-50 text-red-500' : row.status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>{row.status === 'SUSPECTED_SSI' ? 'รอแพทย์ตรวจสอบ' : row.status === 'CONFIRMED_SSI' ? 'ยืนยัน SSI' : row.status === 'RECOVERED' ? 'หายจากการติดเชื้อ' : '-'}</span></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/suspected-cases/${row.hn}/info`) }} className="rounded-lg border border-slate-200 p-2 text-blue-600" aria-label="ดูข้อมูล"><Eye size={15} /></button>
                      {type === 'doctor' && <span className="text-[12px] text-slate-500">รอแจ้งผลให้เจ้าหน้าที่</span>}
                      {type === 'suspected' && <><button onClick={(event) => decide(event, row, 'NOT_SSI')} className="rounded-md border border-emerald-500 px-3 py-2 text-emerald-600">ไม่ติดเชื้อ</button><button type="button" onClick={(event) => decide(event, row, 'CONFIRMED_SSI')} className="inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 font-semibold text-white"><AlertCircle size={15}/>เข้าข่ายการติดเชื้อ SSI</button></>}
                      {type === 'confirmed' && (row.status === 'RECOVERED' ? <span className="text-emerald-600">สิ้นสุดการติดเชื้อแล้ว</span> : <button onClick={(event) => recover(event, row)} className="rounded-md border border-emerald-500 px-3 py-2 text-emerald-600">บันทึกว่าหายแล้ว</button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500">
          <span>แสดง {ssiRows.length} จาก {ssiRows.length} รายการ</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

    </div>
  );
}

function NotificationsCenterPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('');
  const [notifType, setNotifType] = useState('ทั้งหมด');
  const [status, setStatus] = useState('ทั้งหมด');
  const [importance, setImportance] = useState('ทั้งหมด');
  const [patientType, setPatientType] = useState('คนไข้ทั้งหมด');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { data: notificationData, loading, refetch } = useApiQuery(api.getNotifications)
  useEffect(() => { const timer = window.setInterval(refetch, 60000); return () => window.clearInterval(timer) }, [refetch])
  const typeLabels = {
    NEW_QUEUE: 'รับเคสใหม่', FOLLOW_UP_DUE: 'ถึงรอบติดตาม',
    FOLLOW_UP_OVERDUE: 'ติดตามเกินกำหนด', FOLLOW_UP_TOMORROW: 'ใกล้ถึงรอบติดตาม', FOLLOW_UP_ADVANCE: 'ใกล้ถึงรอบติดตาม', APPOINTMENT_REMINDER: 'ใกล้ถึงวันนัด', NO_ASSESSMENT_RESPONSE: 'รอผู้ป่วยตอบกลับ',
    FOLLOW_UP_COMPLETED: 'ติดตามเสร็จสิ้น', FOLLOW_UP_RECORDED: 'บันทึกติดตามตามรอบ',
    SSI_RISK_FOUND: 'พบความเสี่ยง SSI', SSI_SENT_TO_DOCTOR: 'ส่งให้แพทย์ตรวจสอบ', SSI_CONFIRMED: 'ยืนยัน SSI', SSI_NOT_CONFIRMED: 'ไม่พบการติดเชื้อ SSI', SSI_RECOVERED: 'หายจาก SSI', SSI_SUSPECTED: 'ส่งให้แพทย์ตรวจสอบ',
    ADDITIONAL_ACTIVITY: 'เพิ่มกิจกรรมแทรก', EVALUATION_SAVED: 'บันทึกติดตามตามรอบ', CASE_TRANSFERRED: 'ย้ายเคส', DOCUMENT_UPLOADED: 'เพิ่มเอกสาร',
  }
  const notifications = useMemo(() => notificationData.map((item) => {
    return {
      ...item, id: item.notification_key, unread: !item.read_at,
      type: typeLabels[item.notification_type] || 'การแจ้งเตือน', detail: item.detail || '-',
      patient: { name: [item.first_name, item.last_name].filter(Boolean).join(' ') || '-', hn: item.hn || '-', or: item.operation_no },
      time: item.event_at ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(item.event_at)) : '-',
    }
  }).filter((item) => {
    const typeMatch = notifType === 'ทั้งหมด' || item.type === notifType
    const statusMatch = status === 'ทั้งหมด' || (status === 'ยังไม่ได้อ่าน' ? item.unread : !item.unread)
    const importanceMatch = importance === 'ทั้งหมด' || (importance === 'สำคัญ' ? item.priority === 'HIGH' : item.priority !== 'HIGH')
    const patientMatch = patientType === 'คนไข้ทั้งหมด' || String(item.patient_type || '').toUpperCase() === patientType
    return typeMatch && statusMatch && importanceMatch && patientMatch && (!dateRange || String(item.event_at || '').slice(0, 10) === dateRange)
  }), [notificationData, notifType, status, importance, patientType, dateRange])

  const handleOpenDetail = async (notif) => {
    setSelectedNotification(notif)
    if (!notif.unread) return
    try {
      await api.markNotificationRead(notif.notification_key)
      await refetch()
      window.dispatchEvent(new Event('operations-updated'))
    } catch (error) { window.alert(error.message) }
  }

  const handleOpenCase = (notif) => {
    if (!notif?.hn) return
    navigate(`${notif.follow_up_id ? '/follow-ups' : '/cases'}/${encodeURIComponent(notif.hn)}?from=notifications`)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Section */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73] mb-4">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูล
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
              <option>รับเคสใหม่</option>
              <option>บันทึกติดตามตามรอบ</option>
              <option>พบความเสี่ยง SSI</option>
              <option>ส่งให้แพทย์ตรวจสอบ</option>
              <option>ยืนยัน SSI</option>
              <option>ไม่พบการติดเชื้อ SSI</option>
              <option>หายจาก SSI</option>
              <option>ถึงรอบติดตาม</option>
              <option>ใกล้ถึงรอบติดตาม</option>
              <option>ติดตามเกินกำหนด</option>
              <option>เพิ่มกิจกรรมแทรก</option>
              <option>ย้ายเคส</option>
              <option>เพิ่มเอกสาร</option>
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
            <label className="text-[13px] font-medium text-slate-600">ประเภทผู้ป่วย</label>
            <select
              value={patientType}
              onChange={e => setPatientType(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>คนไข้ทั้งหมด</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
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
              {loading && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>}
              {!loading && notifications.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">ไม่มีรายการแจ้งเตือนตามเงื่อนไข</td></tr>}
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
                        <CheckCircle2 size={15} />
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
                      <Eye size={14} className={notif.unread ? 'text-blue-600' : 'text-slate-400'} />
                      เปิดดู
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>แสดง {notifications.length} จาก {notifications.length} รายการ</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

      {selectedNotification && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setSelectedNotification(null)}>
          <section className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-[12px] font-medium text-blue-600">รายละเอียดการแจ้งเตือน</p>
                <h3 className="mt-1 text-[19px] font-semibold text-[#002d73]">{selectedNotification.type}</h3>
              </div>
              <button type="button" onClick={() => setSelectedNotification(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิด">
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 px-6 py-5">
              <div className={`rounded-xl border p-4 ${selectedNotification.priority === 'HIGH' ? 'border-orange-200 bg-orange-50/60' : 'border-blue-100 bg-blue-50/50'}`}>
                <p className="text-[12px] font-semibold text-slate-500">รายละเอียด</p>
                <p className="mt-2 text-[14px] leading-6 text-slate-800">{selectedNotification.detail}</p>
              </div>

              <div className="grid gap-x-8 gap-y-4 text-[13px] sm:grid-cols-2">
                <div><p className="text-slate-400">ผู้ป่วย</p><p className="mt-1 font-semibold text-slate-800">{selectedNotification.patient.name}</p></div>
                <div><p className="text-slate-400">HN</p><p className="mt-1 font-semibold text-slate-800">{selectedNotification.patient.hn}</p></div>
                <div><p className="text-slate-400">เลขที่เคส</p><p className="mt-1 font-semibold text-slate-800">{selectedNotification.patient.or || '-'}</p></div>
                <div><p className="text-slate-400">วันและเวลา</p><p className="mt-1 font-semibold text-slate-800">{selectedNotification.time}</p></div>
                <div><p className="text-slate-400">ประเภทผู้ป่วย</p><p className="mt-1 font-semibold text-slate-800">{selectedNotification.patient_type || '-'}</p></div>
                <div><p className="text-slate-400">ระดับความสำคัญ</p><p className={`mt-1 font-semibold ${selectedNotification.priority === 'HIGH' ? 'text-orange-600' : 'text-slate-800'}`}>{selectedNotification.priority === 'HIGH' ? 'สำคัญ' : 'ปกติ'}</p></div>
              </div>
            </div>

            <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" className="btn-outlined-primary" onClick={() => setSelectedNotification(null)}>ปิด</button>
              <button type="button" disabled={!selectedNotification.hn} className="btn-filled-primary disabled:cursor-not-allowed disabled:opacity-50" onClick={() => handleOpenCase(selectedNotification)}>
                <Eye size={16} /> ดูรายละเอียดทั้งหมด
              </button>
            </footer>
          </section>
        </div>
      )}

    </div>
  );
}

const DoctorIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {/* Head */}
    <circle cx="12" cy="7.5" r="4" />
    {/* Shoulders */}
    <path d="M12 13.5c-4.42 0-8 2.68-8 6v1.5h16v-1.5c0-3.32-3.58-6-8-6z" />
    {/* Stethoscope loop around neck */}
    <path d="M9 13.2v1.5a3 3 0 0 0 6 0v-1.5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    {/* Earpieces loop ends */}
    <circle cx="9" cy="13.2" r="0.8" fill="white" />
    <circle cx="15" cy="13.2" r="0.8" fill="white" />
    {/* Stethoscope chestpiece stem and head */}
    <path d="M12 15.5v2" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="18.5" r="1.1" fill="white" />
  </svg>
);

const StaffIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {/* Head */}
    <circle cx="12" cy="7.5" r="4" />
    {/* Shoulders */}
    <path d="M12 13.5c-4.42 0-8 2.68-8 6v1.5h16v-1.5c0-3.32-3.58-6-8-6z" />
    {/* Medical Cross on Chest */}
    <path d="M12 15.5v3.5M10.25 17.25h3.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function CentralSearchPage() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('ทั้งหมด');
  const [searchCount, setSearchCount] = useState(0);
  const navigate = useNavigate();
  const { data: searchRecords, loading } = useApiQuery(api.getSearchRecords);

  const categoryNames = ['ทั้งหมด', 'ผู้ป่วย', 'หัตถการ', 'การติดตาม', 'เอกสาร', 'การส่งต่อ', 'SSI', 'แพทย์', 'แผนก'];
  const categories = categoryNames.map((label) => ({ label, count: label === 'ทั้งหมด' ? searchRecords.length : searchRecords.filter((row) => row.type === label).length }));

  const popularKeywords = [...new Set(searchRecords.flatMap((row) => [row.title, row.department]).filter((value) => value && value !== '-'))].slice(0, 8);

  const iconByType = { ผู้ป่วย: UserRound, หัตถการ: Stethoscope, การติดตาม: History, เอกสาร: File, การส่งต่อ: ArrowLeftRight, SSI: AlertTriangle, แพทย์: DoctorIcon, แผนก: Layers };
  const results = searchRecords.map((record) => ({
    ...record, icon: iconByType[record.type] || Database, code: record.hn || '-', name: record.patient_name || '-',
    sub: record.operation_no || '-', found: record.title || record.detail || '-', dept: record.department || record.patient_type || '-',
    date: record.updated_at ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(record.updated_at)) : '-',
    statusType: /CONFIRMED|SUSPECT|SSI|รอ/i.test(record.status || '') ? 'purple-pill' : /COMPLETED|สำเร็จ|ACTIVE/i.test(record.status || '') ? 'green-pill' : 'blue-pill',
  }));

  const filteredResults = useMemo(() => {
    return results.filter(item => {
      const matchQuery = [item.code, item.name, item.found, item.dept].some(val =>
        String(val || '').toLowerCase().includes(appliedQuery.toLowerCase())
      );
      if (activeTab === 'ทั้งหมด') return matchQuery;
      return matchQuery && item.type === activeTab;
    });
  }, [appliedQuery, activeTab, results]);

  const submitSearch = () => {
    const keyword = query.trim();
    if (!keyword) return;
    setAppliedQuery(keyword);
    setHasSearched(true);
    setSearchCount((count) => count + 1);
  };

  const clearSearch = () => {
    setQuery('');
    setAppliedQuery('');
    setActiveTab('ทั้งหมด');
    setHasSearched(false);
  };

  return (
    <div className="space-y-4">
      {/* Top metrics summary */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex min-h-[132px] items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[15px] font-semibold text-[#175beb]">การค้นหาวันนี้</p>
            <p className="mt-6 text-[30px] font-bold leading-none text-[#175beb]">{searchCount}</p>
            <p className="mt-1.5 text-[13px] font-medium text-slate-500">ครั้ง</p>
          </div>
          <span className="grid size-11 place-items-center rounded-lg bg-blue-50 text-[#3181ee]">
            <Search size={25} />
          </span>
        </div>

        <div className="flex min-h-[132px] items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[15px] font-semibold text-[#00966d]">ผลลัพธ์ทั้งหมด</p>
            <p className="mt-6 text-[30px] font-bold leading-none text-[#00966d]">{hasSearched ? filteredResults.length : 0}</p>
            <p className="mt-1.5 text-[13px] font-medium text-slate-500">รายการ</p>
          </div>
          <span className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-[#10b981]">
            <Layers size={25} />
          </span>
        </div>
      </div>

      {/* Main Search Panel Card */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2.5 text-[18px] font-semibold text-[#171c25]">
          <Search size={22} className="text-[#00468b]" />
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
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="ค้นหา HN, AN, ชื่อผู้ป่วย, เบอร์โทร, หัตถการ, แพทย์, แผนก, เอกสาร, หมายเหตุ, ประวัติติดตาม..."
              className="h-[44px] flex-1 rounded-lg border border-slate-200 px-4 text-[14px] text-slate-600 outline-none focus:border-[#175beb]"
            />
            <button onClick={submitSearch} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-[14px] font-bold text-white transition hover:bg-blue-700">
              <Search size={17}/>ค้นหา
            </button>
            <button
              onClick={clearSearch}
              className="inline-flex h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Categories Tabs Selector */}
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(cat.label)}
              className={`inline-flex h-[40px] items-center justify-start gap-2 rounded-lg border px-4 text-[13px] font-semibold transition ${activeTab === cat.label
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
      <section className={`${hasSearched ? 'block' : 'hidden'} overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm`}>
        <header className="flex h-[54px] items-center justify-between px-5 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-[#002d73]">ผลการค้นหา ({filteredResults.length} รายการ)</h2>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans border-collapse">
            <thead className="h-[42px] bg-[#f8fafc] font-bold text-[#1e293b]">
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
              {loading && <tr><td colSpan="9" className="py-12 text-center text-slate-400">กำลังค้นหาข้อมูล...</td></tr>}
              {!loading && filteredResults.length === 0 && <tr><td colSpan="9" className="py-12 text-center text-slate-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>}
              {filteredResults.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.id} className="h-[60px] hover:bg-slate-50/60 transition">
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
                      <button onClick={() => row.hn && navigate(`/cases/${row.hn}`)} disabled={!row.hn} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#175beb] hover:bg-slate-50 transition disabled:opacity-40">
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
          <span>แสดง {filteredResults.length} จาก {results.length} รายการ</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

    </div>
  );
}

function HisSyncPage() {
  const [dateRange, setDateRange] = useState('');
  const [db, setDb] = useState('ทั้งหมด');
  const [syncStatus, setSyncStatus] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [sources, setSources] = useState([]);

  const triggerSync = (id, type) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(`ซิงค์ข้อมูลประเภท "${type}" สำเร็จเรียบร้อยแล้ว!`);
      // Update last sync time
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear() + 543} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setSources(prev => prev.map(item => item.id === id ? { ...item, lastSync: formattedDate } : item));
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top sync summaries */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="flex min-h-[160px] items-start justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[16px] font-medium text-[#175beb]">ซิงค์ล่าสุดสำเร็จ</p>
            <p className="mt-10 text-[34px] font-medium leading-none text-[#175beb]">-</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw size={26} className={isSyncing ? 'animate-spin' : ''} />
          </span>
        </div>

        <div className="flex min-h-[160px] items-start justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[16px] font-medium text-[#00966d]">ซิงค์สำเร็จ</p>
            <p className="mt-10 text-[34px] font-medium leading-none text-[#00966d]">0</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={26} />
          </span>
        </div>

        <div className="flex min-h-[160px] items-start justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[16px] font-medium text-red-600">ซิงค์ล้มเหลว</p>
            <p className="mt-10 text-[34px] font-medium leading-none text-red-600">0</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-red-600">
            <AlertCircle size={26} />
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
              {sources.length === 0 && <tr><td colSpan="7" className="px-6 py-14 text-center text-slate-400">ยังไม่มีแหล่งข้อมูลที่เชื่อมต่อกับ HIS / TrackCare</td></tr>}
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
          <span>แสดง {sources.length} จาก {sources.length} รายการ</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

    </div>
  );
}
