import { AlertTriangle, ArrowLeft, ArrowRight, Check, Eye, Info, MinusCircle, RefreshCw, Send, UserRound, Users, X, Plus, Calendar, Clock, Save, Search, File } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { patients } from '../data/mockData.js'

// Import subcomponents copied from OR project
import EvaluationForm from '../components/EvaluationForm.jsx'
import TimelineView from '../components/TimelineView.jsx'
import TransferCareView from '../components/TransferCareView.jsx'
import DocsView from '../components/DocsView.jsx'
import SetupFollowUpView from '../components/SetupFollowUpView.jsx'
import EvaluationHistory from '../components/EvaluationHistory.jsx'

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

  if (pathname.startsWith('/follow-ups/')) return <FollowUpCaseDetail patient={patient} />
  if (pathname.startsWith('/suspected-cases/')) return <SuspectedCaseDetail patient={patient} />

  return (
    <>
      <div className="flex h-6 items-center justify-between"><Link to="/or-validation" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12} />กลับไปหน้ารายการ</Link><div className="flex items-center gap-2"><span className="rounded-full bg-blue-50 px-2 py-1 text-[13px] text-blue-600">ข้อมูลจาก HIS / TrackCare</span><StatusBadge>{patient.status}</StatusBadge></div></div>
      <PatientSummary patient={patient} />
      <nav className="mt-3 flex h-[73px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px]"><div className="flex h-[39px] gap-6 border-b border-[#e2e8f0]"><button className="border-b-2 border-[#175beb] text-[16px] font-medium text-[#175beb]">ข้อมูลคนไข้</button><button className="text-[16px] text-[#424752]">เอกสารอ้างอิง</button></div><button className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px]"><RefreshCw size={14} />รีเฟรช</button></nav>
      <SurgerySection patient={patient} />
      <ContactAndProcedures patient={patient} />
      <FollowUpTimeline />
      <ActionBar onExclude={() => setExcludeOpen(true)} onQueue={() => setQueueOpen(true)} />
      {queueOpen && <QueueModal patient={patient} onClose={() => setQueueOpen(false)} onSend={handleSend} />}
      {successOpen && <SuccessModal patient={patient} onClose={() => setSuccessOpen(false)} />}
      {excludeOpen && <ExcludeCaseModal patient={patient} onClose={() => setExcludeOpen(false)} />}
    </>
  )
}

function FollowUpCaseDetail({ patient }) {
  const [activeDetailTab, setActiveDetailTab] = useState('info')
  const [isActivityAdded, setIsActivityAdded] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [isSetupFollowUpOpen, setIsSetupFollowUpOpen] = useState(false)
  const [isTransferCompleted, setIsTransferCompleted] = useState(false)

  return (
    <>
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        <Link to="/my-follow-ups" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12} />กลับไปหน้ารายการ</Link>
        <div className="flex items-center gap-2">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[13px] text-emerald-600">สร้าง Follow-up สำเร็จ</span>
          <span className="rounded border border-orange-200 bg-orange-50 px-2.5 py-1 text-[13px] text-orange-500">ต้องติดตามวันนี้</span>
        </div>
      </div>

      <PatientSummary patient={patient} />

      <FollowUpTabs
        activeDetailTab={activeDetailTab}
        setActiveDetailTab={(tabId) => {
          setActiveDetailTab(tabId);
          setIsSetupFollowUpOpen(false);
        }}
        setIsActivityModalOpen={setIsActivityModalOpen}
      />

      {isSetupFollowUpOpen ? (
        <div className="mt-3">
          <SetupFollowUpView
            selectedPatient={patient}
            onClose={() => setIsSetupFollowUpOpen(false)}
          />
        </div>
      ) : (
        <>
          {!(activeDetailTab === 'transfer' && isTransferCompleted) && (
            <FollowUpTimeline isActivityAdded={isActivityAdded} />
          )}

          <div className="mt-3">
            {activeDetailTab === 'info' && (
              <>
                <SurgerySection patient={patient} />
                <ContactAndProcedures patient={patient} />
              </>
            )}
            {activeDetailTab === 'evaluation' && (
              <EvaluationForm selectedPatient={patient} />
            )}
            {activeDetailTab === 'timeline' && (
              <TimelineView
                selectedPatient={patient}
                isActivityAdded={isActivityAdded}
                setActiveDetailTab={setActiveDetailTab}
                onSetupFollowUpClick={() => setIsSetupFollowUpOpen(true)}
              />
            )}
            {activeDetailTab === 'transfer' && (
              <TransferCareView
                selectedPatient={patient}
                isTransferCompleted={isTransferCompleted}
                setIsTransferCompleted={setIsTransferCompleted}
              />
            )}
            {activeDetailTab === 'docs' && (
              <DocsView selectedPatient={patient} />
            )}
          </div>
        </>
      )}

      {isActivityModalOpen && (
        <AddActivityModal
          onClose={() => setIsActivityModalOpen(false)}
          onSave={() => {
            setIsActivityAdded(true);
            setIsActivityModalOpen(false);
            setActiveDetailTab('timeline');
          }}
        />
      )}
    </>
  )
}

function FollowUpTabs({ activeDetailTab, setActiveDetailTab, setIsActivityModalOpen }) {
  const tabs = [
    { id: 'info', name: 'ข้อมูลคนไข้' },
    { id: 'evaluation', name: 'ประเมินตามรอบ (รอบที่ 1)' },
    { id: 'timeline', name: 'การติดตาม / Timeline' },
    { id: 'transfer', name: 'ย้ายเคส / ส่งต่อการดูแล' },
    { id: 'docs', name: 'เอกสาร' }
  ]
  return <nav className="mt-3 flex min-h-[73px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white px-[17px] py-2 shadow-sm">
    <div className="flex min-w-0 items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} className={`h-12 shrink-0 text-[14px] font-medium ${activeDetailTab === tab.id ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>{tab.name}</button>)}
    </div>
    <button onClick={() => setIsActivityModalOpen(true)} className="inline-flex h-[42px] shrink-0 items-center gap-2 rounded-lg bg-[#175beb] px-5 text-[14px] font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"><span className="text-lg leading-none">+</span>เพิ่มกิจกรรมแทรก</button>
  </nav>
}

function ActionBar({ onExclude, onQueue }) {
  return <section className="mt-3 flex h-[62px] items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-6 shadow-sm">
    <button onClick={onExclude} className="inline-flex h-[37px] items-center justify-center gap-2 rounded-xl border border-red-400 bg-white px-5 text-[14px] font-medium text-red-500 transition hover:bg-red-50"><MinusCircle size={16} />ตัดเคสออก</button>
    <div className="flex w-[291px] items-center gap-3">
      <button className="inline-flex h-[37px] w-[133px] items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] font-medium text-[#424752]"><Check size={14} />บันทึกข้อมูล</button>
      <button onClick={onQueue} className="inline-flex h-[38px] w-[146px] items-center justify-center gap-2 rounded-lg bg-[#175beb] text-[14px] font-medium text-white shadow-sm"><Send size={14} />ส่งเข้า Queue</button>
    </div>
  </section>
}

function PatientSummary({ patient }) {
  return <section className="mt-3 grid gap-3 xl:grid-cols-[827fr_273fr]"><PatientInfoCard patient={patient} /><aside className="h-[273px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h2 className="text-[16px] font-medium leading-7 text-[#424752]">สถานะข้อมูล (Validation)</h2><div className="mt-2 space-y-2">{validationItems.map(item => <p key={item} className="flex items-center gap-2 text-[14px] leading-5 text-[#424752]"><span className="grid size-[18px] place-items-center rounded-full bg-[#16a34a] text-white"><Check size={12} strokeWidth={3} /></span>{item}</p>)}</div><div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-[5px] text-center text-[13px] leading-6 text-emerald-700">ข้อมูลพร้อมสำหรับสร้าง Follow-up</div></aside></section>
}

export function PatientInfoCard({ patient }) {
  return <article className="flex min-h-[273px] items-center gap-[31px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] pb-[25px] pt-[13px] shadow-sm">
    <div className="grid size-[98px] shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50/40 text-[#175beb]"><UserRound size={60} strokeWidth={1.4} /></div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[14px] font-medium leading-7 text-[#424752]">HN <span className="ml-1">{patient.id}</span></p><h2 className="text-[24px] font-semibold leading-8 text-[#191c1e]">{patient.name}</h2></div>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px] text-[#424752]"><span>ประเภทผู้ป่วย</span><span className="rounded-md bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-[#175beb]">OPD</span><span className="ml-2">สถานะเคส</span><span className="rounded-md bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-[#175beb]">ติดตามโดยOPD</span></div>
      </div>
      <div className="mt-[11px] grid grid-cols-[177px_161px_1fr]">
        <div className="space-y-2"><DetailRow label="เพศ" value={patient.sex ?? 'ชาย'} /><DetailRow label="อายุ" value={`${patient.age ?? 68} ปี`} /><DetailRow label="เบอร์โทร" value="081-234-5678" /><DetailRow label="วันเกิด" value="17 ม.ค. 2501" /></div>
        <div className="ml-2 space-y-2 border-l border-black/10 px-3"><DetailRow label="เชื้อชาติ" value="ไทย" /><DetailRow label="สัญชาติ" value="ไทย" /><DetailRow label="สิทธิการรักษา" value="-" /></div>
        <div className="ml-2 border-l border-black/10 pl-3 text-[14px] text-[#424752]"><p>ที่อยู่</p><strong className="mt-2 block font-medium">99/9 หมู่ 4 จ.เชียงใหม่ 5100</strong></div>
      </div>
    </div>
  </article>
}

function SurgerySection({ patient }) {
  const surgery = [['วันที่ผ่าตัด', patient.surgeryDate], ['วันที่จำหน่าย', '15 มิ.ย. 2569'], ['เวลาเริ่มผ่าตัด', '10:10 น.'], ['เวลาสิ้นสุดผ่าตัด', '12:10 น.'], ['ระยะเวลาผ่าตัด', '2 ชม. 40 นาที'], ['ประเภทผู้ป่วย', 'OPD'], ['หัตถการ', patient.procedure]]
  return <section className="mt-3 grid gap-3 xl:grid-cols-[740fr_360fr]"><article className="h-[274px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลการผ่าตัด (Surgery Information)</h3><div className="mt-3 grid grid-cols-2 gap-x-6"><div className="space-y-2">{surgery.map(([l, v]) => <DetailRow key={l} label={l} value={v} />)}</div><div className="space-y-2 border-l border-black/10 pl-6">{[['ศัลยแพทย์', patient.surgeon], ['แผนก', patient.department], ['ห้องผ่าตัด', 'OR 4'], ['ประเภทแผล', 'Clean wound'], ['ASA Class', 'Class II'], ['Implant', 'Total knee prosthesis'], ['Diagnosis', 'Primary osteoarthritis']].map(([l, v]) => <DetailRow key={l} label={l} value={v} />)}</div></div></article><article className="h-[274px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm"><h3 className="px-6 py-[13px] text-[16px] font-medium text-[#002d73]">ปัจจัยเสี่ยง SSI</h3>{[['อายุ > 60 ปี', 'มี'], ['เบาหวาน', 'มี'], ['การติดเชื้อก่อนผ่าตัด', 'ไม่มี']].map(([l, v]) => <div key={l} className="flex h-[42px] items-center justify-between border-t border-slate-100 px-6 text-[14px] text-[#424752]"><span>{l}</span><span className="inline-flex items-center gap-2"><span className={`grid size-[18px] place-items-center rounded-full text-white ${v === 'มี' ? 'bg-[#16a34a]' : 'bg-slate-400'}`}><Check size={12} /></span>{v}</span></div>)}<div className="flex h-[58px] items-center justify-between border-t border-black/10 px-6 text-[14px] font-medium"><span>Risk Score</span><span className="flex items-center gap-3 font-semibold">72 % <i className="size-[7px] rounded-full bg-[#f57e0c]" />ปานกลาง</span></div></article></section>
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
      <div className="mt-3 space-y-3">{contacts.map(([icon, label, value]) => <div key={label} className="flex items-center justify-between text-[14px] leading-5 text-[#424752]"><span className="inline-flex items-center gap-2"><img src={icon} alt="" className="h-5 w-5 shrink-0 object-contain" />{label}</span><strong className="font-medium">{value}</strong></div>)}</div>
    </article>
    <article className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-[13px] shadow-sm">
      <h3 className="inline-flex items-center gap-1 text-[16px] font-medium leading-7 text-[#002d73]">รายการหัตถการในเคส (มี 1 รายการ)<Info size={17} className="text-[#64748b]" /></h3>
      <div className="overflow-hidden border border-black/10 shadow-sm"><table className="w-full table-fixed text-[13px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold uppercase tracking-[.6px] text-[#1e293b]"><tr><th className="w-[110px] text-center">ลำดับ</th><th className="text-left">หัตถการ</th><th className="text-left">ศัลยแพทย์</th><th className="w-[140px] text-center">สถานะ SSI</th></tr></thead><tbody><tr className="h-[57px]"><td className="text-center font-medium">1</td><td>TKA (เข่าขวา)</td><td>{patient.surgeon.replace('นพ.', 'นพ')}</td><td className="text-center"><span className="inline-flex items-center gap-1 text-[#16a34a]"><i className="size-[7px] rounded-full bg-[#16a34a]" />เข้าเกณฑ์</span></td></tr></tbody></table></div>
      <div className="flex min-h-[34px] items-center gap-2 rounded border border-[#0057b8]/10 bg-[#eff6ff] px-[13px] py-[5px] text-[13px] leading-6 text-[#0057b8]"><Info size={17} className="shrink-0" />เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up</div>
    </article>
  </section>
}

function FollowUpTimeline({ isActivityAdded }) {
  return (
    <div className="timeline-card mt-3">
      <div className="timeline-card-header">
        <div className="timeline-title-container">
          <h4 className="timeline-title">ช่วงเวลาติดตามอาการคนไข้</h4>
          <span className="timeline-subtitle">รอบการติดตามมาตรฐานสำหรับหัตถการนี้</span>
        </div>
        <select className="form-select" style={{ width: 'auto', fontSize: '13px' }}>
          <option value="15/06/2569">15 / 06 / 2569</option>
          <option value="all">แสดงทั้งหมด</option>
        </select>
      </div>

      <div className="timeline-track-container">
        <div className="timeline-line"></div>
        <div className="timeline-line-progress" style={{ width: isActivityAdded ? '42%' : '20%' }}></div>
        <div className="timeline-steps">
          <div className="timeline-step">
            <div className="timeline-dot completed"></div>
            <span className="timeline-step-name">Day 1</span>
            <span className="timeline-step-date">16 มิ.ย. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>

          {isActivityAdded && (
            <div className="timeline-step">
              <div className="timeline-dot" style={{ backgroundColor: 'var(--color-orange)', boxShadow: '0 0 0 2px #ffedd5' }}></div>
              <span className="timeline-step-name" style={{ color: 'var(--color-orange)' }}>กิจกรรมแทรก</span>
              <span className="timeline-step-date">18 มิ.ย. 2569</span>
              <span className="timeline-step-time">09:00</span>
            </div>
          )}

          <div className="timeline-step">
            <div className="timeline-dot active-tracking"></div>
            <span className="timeline-step-name">Day 7</span>
            <span className="timeline-step-date">22 มิ.ย. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>

          {isActivityAdded && (
            <div className="timeline-step">
              <div className="timeline-dot" style={{ backgroundColor: 'var(--color-orange)', boxShadow: '0 0 0 2px #ffedd5' }}></div>
              <span className="timeline-step-name" style={{ color: 'var(--color-orange)' }}>กิจกรรมแทรก</span>
              <span className="timeline-step-date">23 มิ.ย. 2569</span>
              <span className="timeline-step-time">13:30</span>
            </div>
          )}

          <div className="timeline-step">
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name">Day 14</span>
            <span className="timeline-step-date">29 มิ.ย. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>
          <div className="timeline-step">
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name">Day 21</span>
            <span className="timeline-step-date">6 ก.ค. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>
          <div className="timeline-step">
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name">Day 28</span>
            <span className="timeline-step-date">13 ก.ค. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>
          <div className="timeline-step">
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name">Day 30</span>
            <span className="timeline-step-date">15 ก.ค. 2569</span>
            <span className="timeline-step-time">09:00</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '16px', marginBottom: '4px' }}>
        หมายเหตุ: วันที่อาจเปลี่ยนแปลงได้ตามการกำหนดของโรงพยาบาล
      </div>

      <div className="timeline-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-success)' }}></span>
          <span>ดำเนินการสำเร็จ</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-info)' }}></span>
          <span>อยู่ระหว่างติดตามดำเนินการ</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-orange)' }}></span>
          <span>กิจกรรมแทรก</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#cbd5e1' }}></span>
          <span>ยังไม่เริ่มติดตาม</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
          <span>เกินกำหนด</span>
        </div>
      </div>
    </div>
  )
}

function ExcludeCaseModal({ patient, onClose }) {
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const canSubmit = reason && confirmed
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#334155]/45 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="exclude-title" className="relative flex w-full max-w-[512px] max-h-[90vh] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <button onClick={onClose} className="absolute right-6 top-6 z-10 text-[#9ca3af]"><X size={22} strokeWidth={2.4} /></button>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-5 pt-8 text-center">
        <div className="mx-auto grid size-[64px] place-items-center rounded-full border-4 border-[#fda4af] bg-[#fee2e2] text-[#ef191f]"><AlertTriangle size={25} strokeWidth={2.5} /></div>
        <h2 id="exclude-title" className="mt-4 text-[24px] font-semibold leading-8 text-[#202124]">ไม่เข้าเงื่อนไขการเฝ้าระวัง SSI</h2>
        <p className="mt-2 text-[16px] text-[#6b7280]">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>
        <div className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-left text-[#20242b]"><div className="flex items-baseline gap-x-5"><strong className="text-[17px]">HN {patient.id}</strong><strong className="text-[18px]">{patient.name}</strong></div><p className="mt-2 text-[14px] font-medium text-[#4b5563]">{patient.sex} • อายุ {patient.age} ปี (17 ม.ค. 2501)</p><p className="mt-2 text-[14px] font-medium text-[#4b5563]">หัตถการ: TKA (เข่าขวา)</p><div className="mt-2 flex gap-x-6 text-[14px] font-medium text-[#4b5563]"><span>วันที่ผ่าตัด: 10 มิ.ย. 2569</span><span>วันที่จำหน่าย: 15 มิ.ย. 2569</span></div></div>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">เหตุผลที่ไม่เข้าเงื่อนไข <span className="text-red-500">*</span><select value={reason} onChange={event => setReason(event.target.value)} className="mt-2 h-[44px] w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#64748b] shadow-sm outline-none focus:border-[#175beb]"><option value="">เลือกเหตุผล</option><option>หัตถการไม่เข้าเกณฑ์ SSI Surveillance</option><option>ข้อมูลผู้ป่วยซ้ำ</option><option>ยกเลิกการผ่าตัด</option><option>เหตุผลอื่น</option></select></label>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">รายละเอียดเพิ่มเติม (ถ้ามี)<textarea className="mt-2 h-[78px] w-full resize-none rounded-lg border border-[#cbd5e1] p-3 text-[14px] shadow-sm outline-none focus:border-[#175beb]" placeholder="ระบุรายละเอียดเพิ่มเติม" /></label>
        <label className="mt-4 flex items-center gap-3 text-left text-[14px] font-medium text-[#334155]"><input checked={confirmed} onChange={event => setConfirmed(event.target.checked)} type="checkbox" className="size-5 rounded accent-[#175beb]" />ยืนยันว่าข้อมูลถูกต้องและไม่เข้าเกณฑ์การเฝ้าระวัง</label>
      </div>
      <footer className="grid h-[82px] shrink-0 grid-cols-2 gap-3 border-t border-[#f1f5f9] bg-[#fafafa] px-8 py-4"><button onClick={onClose} className="rounded-lg border border-[#cbd5e1] bg-white text-[16px] font-semibold text-[#374151] shadow-sm">ยกเลิก</button><button disabled={!canSubmit} onClick={onClose} className={`rounded-lg text-[16px] font-semibold text-white shadow-sm ${canSubmit ? 'bg-[#e92323] hover:bg-red-700' : 'cursor-not-allowed bg-[#f87171]'}`}>ยืนยันการยกออก</button></footer>
    </section>
  </div>
}

function QueueModal({ patient, onClose, onSend }) {
  return <div className="fixed inset-0 z-50 bg-slate-950/45" onMouseDown={onClose}><aside className="absolute inset-y-0 right-0 w-full max-w-[708px] overflow-y-auto bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
    <header className="flex h-[85px] items-center justify-between border-b border-slate-200 px-6"><div><h2 className="text-[20px] font-semibold text-[#1f2937]">ส่งเคสไปยัง OPD/IPD Queue</h2><p className="mt-1 text-[14px] text-slate-500">กำหนดปลายทางและแผนการติดตามเบื้องต้นก่อนส่งต่อ</p></div><button onClick={onClose}><X size={20} className="text-slate-400" /></button></header>
    <div className="space-y-6 p-6">
      <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-[17px]"><h3 className="flex items-center gap-2 text-[16px] font-semibold text-blue-800"><Users size={20} />สรุปข้อมูลเคส</h3><div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">{[['ชื่อผู้ป่วย', patient.name], ['แผนกต้นทาง', patient.department], ['HN', `HN${patient.id}`], ['หัตถการ', patient.procedure], ['ความเสี่ยง SSI', patient.risk], ['ศัลยแพทย์', patient.surgeon]].map(([k, v]) => <div key={k} className="grid grid-cols-[89px_1fr]"><span className="text-slate-500">{k}</span><strong className="font-medium">{v}</strong></div>)}</div></section>
      <section className="space-y-5">{[['เลือกปลายทาง *', 'tabs'], ['เลือกแผนก *', 'select'], ['กำหนดระดับความสำคัญ *', 'priority']].map(([label, type]) => <div key={label} className="grid grid-cols-[209px_1fr] items-center"><label className="text-[14px]">{label}</label>{type === 'tabs' ? <div className="grid h-[38px] grid-cols-2 overflow-hidden rounded-lg border border-slate-300"><button className="border-r border-blue-400 bg-blue-50 text-blue-600">OPD</button><button>IPD</button></div> : type === 'select' ? <select className="field h-[39px]"><option>ศัลยกรรมทั่วไป (General Surgery)</option></select> : <div className="grid grid-cols-3 gap-2"><button className="h-[38px] rounded-lg border border-blue-400 bg-blue-50 text-blue-600">ปกติ</button><button className="h-[38px] rounded-lg border border-slate-300">ด่วน</button><button className="h-[38px] rounded-lg border border-slate-300">เร่งด่วน</button></div>}</div>)}
        <div className="grid grid-cols-[209px_1fr]"><label className="pt-2 text-[14px]">บันทึกเบื้องต้นจาก OR</label><textarea className="h-[78px] rounded-lg border border-slate-300 p-3 text-[14px]" placeholder="กรอกบันทึกเบื้องต้น..." /></div>
      </section>
      <div className="flex h-[46px] items-center gap-3 rounded-lg bg-blue-50 px-3 text-[14px] text-blue-700"><Info size={16} />หลังจากส่งเคส ระบบจะแสดงประวัติการส่งข้อมูลในส่วนนี้</div>
      <div className="flex justify-end gap-3 border-b border-slate-200 pb-5">
        <button onClick={onClose} className="btn-secondary h-[38px] px-6">ยกเลิก</button>
        <button onClick={onSend} className="btn-primary inline-flex h-[38px] items-center gap-2 px-6"><Send size={14} />ส่งเคส</button>
      </div>
      <section><h3 className="mb-4 text-[16px] font-semibold">ประวัติการส่งข้อมูล</h3><div className="overflow-hidden rounded-lg border border-slate-200"><table className="w-full text-[13px]"><thead className="h-10 bg-slate-50"><tr>{['ส่งโดย', 'วันที่/เวลา', 'ปลายทาง', 'สถานะปัจจุบัน', 'แผนกรับเคส'].map(h => <th key={h} className="px-4 text-left">{h}</th>)}</tr></thead><tbody>{Array.from({ length: 4 }).map((_, i) => <tr key={i} className="h-[61px] border-t border-slate-100"><td className="px-4">พญ.อัญชลีกิตติวรานันท์</td><td className="px-4">08/05/2567<br /><span className="text-slate-400">14:20 น.</span></td><td className="px-4">{i ? 'IPD' : 'OPD'}</td><td className="px-4"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">{i ? 'ส่งสำเร็จ' : 'รอรับเคส'}</span></td><td className="px-4">ศัลยกรรมทั่วไป</td></tr>)}</tbody></table></div></section>
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
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>

        {/* Double-ring checkmark */}
        <div className="flex justify-center">
          <div className="grid h-[80px] w-[80px] place-items-center rounded-full border-[8px] border-blue-100">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-blue-600">
              <Check size={26} className="text-white" strokeWidth={3} />
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

        <hr className="my-4 border-slate-100" />

        {/* Info rows */}
        <div className="space-y-3 text-[14px]">
          {[['วันที่สร้าง', '15 มิ.ย. 2569 10:45 น.'], ['ผู้สร้าง', 'AdminHospitalBK (OR Nurse)'], ['ปลายทาง', 'OPD'], ['แผนก', 'OPD A']].map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span>{v}</span></div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>ระบบได้ส่งมอบหมายงานเรียบร้อยแล้ว<br />สามารถตรวจสอบรายการได้ที่เมนู "รายการส่งไป OPD/IPD"</p>
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
            ไปหน้ารายการ OPD/IPD <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}

function AddActivityModal({ onClose, onSave }) {
  const [date, setDate] = useState('โทรติดตามอาการ')
  const [time, setTime] = useState('13:30')
  const [type, setType] = useState('โทรติดตามอาการ')
  const [purpose, setPurpose] = useState('ติดตามอาการหลังผ่าตัด')
  const [location, setLocation] = useState('')
  const [staff, setStaff] = useState('OPD Nurse B')
  const [contact1, setContact1] = useState('081-234-5678')
  const [contact2, setContact2] = useState('-')
  const [detail, setDetail] = useState('คนไข้แจ้งปวดแผลบริเวณเข่าขวาเพิ่มขึ้นเล็กน้อย ต้องการติดตามอาการก่อนถึง Day 7')
  const [notifyPeriod, setNotifyPeriod] = useState('ก่อนถึงเวลานัด 24 ชั่วโมง')

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-4">
      <section className="relative w-full max-w-[820px] max-h-[96vh] rounded-2xl bg-white p-6 shadow-2xl text-left overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <h2 className="text-[20px] font-semibold text-[#1e293b]">
          สร้างกิจกรรมเพิ่ม (ก่อนรอบนัดถัดไป)
        </h2>
        <p className="text-[13px] text-slate-500 mt-1">
          กำหนดกิจกรรมเพิ่มเติมในช่วงระหว่างรอบติดตาม
        </p>

        {/* Patient Summary Card with Exact Design */}
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-4 flex gap-4 items-center text-[13px] text-[#424752] shadow-sm">
          {/* Avatar Icon */}
          <div className="grid size-[64px] shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-[#175beb]">
            <UserRound size={32} strokeWidth={1.8} />
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
            <div>
              <p className="text-[11px] text-slate-400">HN 0123456</p>
              <strong className="text-[15px] font-semibold text-[#191c1e]">นายสมชาย ใจดี</strong>
              <p className="text-[12px] text-slate-500 mt-1">ชาย • อายุ 68 ปี (17 ม.ค. 2501)</p>
              <p className="text-[12px] text-slate-500">เบอร์โทร 081-234-5678</p>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-6">
              <p className="flex justify-between"><span className="text-slate-400">หัตถการ</span> <strong className="font-medium text-[#191c1e]">TKA</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">ศัลยแพทย์</span> <strong className="font-medium text-[#191c1e]">นพ อธิวัฒน์ ศรีกมล</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">แผนก</span> <strong className="font-medium text-[#191c1e]">Orthopedic OR</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">ความเสี่ยง SSI</span> <strong className="font-medium text-orange-500">● ปานกลาง</strong></p>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-6 col-span-1">
              <p className="flex justify-between"><span className="text-slate-400">วันเริ่มติดตาม</span> <strong className="font-medium text-[#191c1e]">15 มิ.ย.2569</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">รอบติดตาม</span> <strong className="font-medium text-[#191c1e]">Day 30 (6 รอบ)</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">รอบปัจจุบัน</span> <strong className="font-medium text-[#191c1e]">Day 1 (รอบที่ 1/6)</strong></p>
              <p className="flex justify-between"><span className="text-slate-400">นัดติดตามถัดไป</span> <strong className="font-medium text-[#191c1e]">Day 7 (22 มิ.ย.2569)</strong></p>
            </div>
          </div>
        </div>

        {/* รายละเอียดกิจกรรม */}
        <h3 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-2 mt-5">
          รายละเอียดกิจกรรม
        </h3>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">ประเภทกิจกรรม <span className="text-red-500">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="form-select mt-1">
              <option value="โทรติดตามอาการ">โทรติดตามอาการ</option>
              <option value="ส่งแบบประเมิน">ส่งแบบประเมิน</option>
              <option value="พบแพทย์ที่รพ.">พบแพทย์ที่รพ.</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">วัตถุประสงค์ <span className="text-red-500">*</span></label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="form-select mt-1">
              <option value="ติดตามอาการหลังผ่าตัด">ติดตามอาการหลังผ่าตัด</option>
              <option value="ประเมินอาการสงสัย SSI">ประเมินอาการสงสัย SSI</option>
              <option value="ทำแผลผ่าตัด">ทำแผลผ่าตัด</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">วันที่นัดหมายกิจกรรม <span className="text-red-500">*</span></label>
            <select value={date} onChange={(e) => setDate(e.target.value)} className="form-select mt-1">
              <option value="โทรติดตามอาการ">โทรติดตามอาการ</option>
              <option value="22 มิ.ย. 2569">22 มิ.ย. 2569</option>
              <option value="23 มิ.ย. 2569">23 มิ.ย. 2569</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">เวลานัดหมาย <span className="text-red-500">*</span></label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="form-select mt-1">
              <option value="13:30">13:30</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">สถานที่ (ถ้ามี)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input mt-1"
              placeholder="เช่น โรงพยาบาล / ที่บ้าน / อื่นๆ"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">ผู้รับผิดชอบกิจกรรม <span className="text-red-500">*</span></label>
            <select value={staff} onChange={(e) => setStaff(e.target.value)} className="form-select mt-1">
              <option value="OPD Nurse B">OPD Nurse B</option>
              <option value="OPD Nurse A">OPD Nurse A</option>
              <option value="IPD Staff">IPD Staff</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">ช่องทางการติดต่อที่ 1 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={contact1}
              onChange={(e) => setContact1(e.target.value)}
              className="form-input mt-1"
            />
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">ช่องทางการติดต่อสำรอง <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={contact2}
              onChange={(e) => setContact2(e.target.value)}
              className="form-input mt-1"
            />
          </div>
        </div>

        <div className="mt-4 relative">
          <label className="text-[13px] font-medium text-slate-700">รายละเอียดกิจกรรม <span className="text-red-500">*</span></label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="form-input mt-1 min-h-[90px] resize-none pr-16"
            maxLength={500}
          />
          <span className="absolute right-3 bottom-2 text-[11px] text-slate-400">
            {detail.length}/500
          </span>
        </div>

        {/* การแจ้งเตือน */}
        <h3 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-2 mt-5">
          การแจ้งเตือน
        </h3>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
            <span className="text-orange-500 text-[16px] leading-none">●</span>
            <span>แจ้งเตือนผู้ป่วย</span>
          </div>

          <div className="form-group max-w-[400px]">
            <label className="text-[13px] font-medium text-slate-700">ช่วงเวลาแจ้งเตือน <span className="text-red-500">*</span></label>
            <select value={notifyPeriod} onChange={(e) => setNotifyPeriod(e.target.value)} className="form-select mt-1 h-9 py-1">
              <option value="ก่อนถึงเวลานัด 24 ชั่วโมง">ก่อนถึงเวลานัด 24 ชั่วโมง</option>
              <option value="ก่อนถึงเวลานัด 12 ชั่วโมง">ก่อนถึงเวลานัด 12 ชั่วโมง</option>
              <option value="ก่อนถึงเวลานัด 2 ชั่วโมง">ก่อนถึงเวลานัด 2 ชั่วโมง</option>
            </select>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <div className="grid size-5 shrink-0 place-items-center rounded bg-[#10b981] text-white">
              <Check size={14} strokeWidth={3} />
            </div>
            <div>
              <span className="text-[13px] font-medium text-slate-700">ช่องทางแจ้งเตือนผู้ป่วย</span>
              <p className="text-[12px] text-slate-500 mt-0.5">SMS</p>
            </div>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-blue-300 my-6"></div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-[#f8fafc] px-6 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-100">
            ยกเลิก
          </button>
          <button onClick={onSave} className="rounded-xl bg-[#175beb] px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            <Save size={16} />
            บันทึกกิจกรรม
          </button>
        </div>
      </section>
    </div>
  )
}

function SuspectedCaseDetail({ patient }) {
  const { id, subtab } = useParams()
  const navigate = useNavigate()

  const tabs = [
    { id: 'info', name: 'ข้อมูลคนไข้' },
    { id: 'evaluations', name: 'ประวัติการประเมินล่าสุด' },
    { id: 'docs', name: 'เอกสาร' }
  ]

  // Image source path mock (using placeholders or styled empty image divs)
  const woundPhotos = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    time: '22 มิ.ย. 2569 09:06น.'
  }))

  const cdcChecklist = [
    { label: 'มีไข้ (อุณหภูมิ ≥ 38°C)', status: 'has' },
    { label: 'ปวดแผล/เจ็บแผลเพิ่มขึ้น', status: 'has' },
    { label: 'แผลบวม', status: 'has' },
    { label: 'แผลแดง', status: 'no' },
    { label: 'มีน้ำเหลือง/หนองจากแผล', status: 'has' },
    { label: 'กลิ่นผิดปกติจากแผล', status: 'has' },
    { label: 'แผลแยก', status: 'no' },
    { label: 'อื่นๆ (ระบุ: แผลมีอาการเลือดไหล)', status: 'has' },
    { label: 'มีจุดเลือดออก/เลือดซึม', status: 'has' }
  ]
  const [checklist, setChecklist] = useState(cdcChecklist)
  const [otherSymptoms, setOtherSymptoms] = useState({ nausea: false, jointPain: false, other: true })
  const [otherSymptomsText, setOtherSymptomsText] = useState('แผลมีอาการเลือดไหล')
  const [dischargeTreatment, setDischargeTreatment] = useState('visited')
  const [showToast, setShowToast] = useState(false)

  const mockEvaluations = [
    {
      roundNumber: 1,
      dayLabel: 'Day 1',
      date: '15 มิ.ย. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'completed',
      sspiFlag: false,
      woundCondition: 'แผลปกติ ไม่บวมแดง ไม่มีน้ำเหลือง',
      riskLevel: 'ปานกลาง',
      otherSymptoms: 'ไม่มีไข้, ไม่ปวดแผล',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 1, imageCount: 5 }
    },
    {
      roundNumber: 2,
      dayLabel: 'กิจกรรมแทรก',
      date: '18 มิ.ย. 2569',
      time: '13:30 น.',
      nurseName: 'OPD Nurse B',
      status: 'interrupt_activity',
      sspiFlag: false,
      woundCondition: 'โทรติดตามอาการ เนื่องจากผู้ป่วยแจ้งปวดแผล',
      riskLevel: '',
      otherSymptoms: '',
      reason: 'ปวดแผลและบวมมากขึ้น',
      contactChannel: { hasPhone: true, fileCount: 0, imageCount: 0 }
    },
    {
      roundNumber: 2,
      dayLabel: 'Day 7',
      date: '22 มิ.ย. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'completed',
      sspiFlag: true,
      woundCondition: 'แผลบวมแดง มีน้ำเหลือง',
      riskLevel: 'ปานกลาง',
      otherSymptoms: 'ไม่มีไข้, ไม่ปวดแผล',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 1, imageCount: 5 }
    },
    {
      roundNumber: 2,
      dayLabel: 'Day 14',
      date: '29 มิ.ย. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'pending',
      sspiFlag: false,
      woundCondition: '',
      riskLevel: '',
      otherSymptoms: '',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 0, imageCount: 0 }
    },
    {
      roundNumber: 2,
      dayLabel: 'Day 21',
      date: '6 ก.ค. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'pending',
      sspiFlag: false,
      woundCondition: '',
      riskLevel: '',
      otherSymptoms: '',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 0, imageCount: 0 }
    },
    {
      roundNumber: 2,
      dayLabel: 'Day 28',
      date: '15 มิ.ย. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'pending',
      sspiFlag: false,
      woundCondition: '',
      riskLevel: '',
      otherSymptoms: '',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 0, imageCount: 0 }
    },
    {
      roundNumber: 2,
      dayLabel: 'Day 30',
      date: '15 มิ.ย. 2569',
      time: '09:00 น.',
      nurseName: 'OPD Nurse B',
      status: 'pending',
      sspiFlag: false,
      woundCondition: '',
      riskLevel: '',
      otherSymptoms: '',
      reason: null,
      contactChannel: { hasPhone: true, fileCount: 0, imageCount: 0 }
    }
  ]

  return (
    <div className="text-left pb-10">
      {/* Back button and badges */}
      <div className="flex h-6 items-center justify-between">
        <Link to="/suspected-ssi" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]">
          <ArrowLeft size={12} />กลับไปหน้ารายการ
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[13px] text-emerald-600">สร้าง Follow-up สำเร็จ</span>
          <span className="rounded border border-orange-200 bg-orange-50 px-2.5 py-1 text-[13px] text-orange-500">ต้องติดตามวันนี้</span>
        </div>
      </div>

      {/* Patient info summary with Validation */}
      <PatientSummary patient={patient} />

      {/* Tabs Menu */}
      <nav className="mt-3 flex h-[73px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-5 shadow-sm">
        <div className="flex h-full items-center gap-6">
          {tabs.map((tab) => {
            const isActive = subtab === tab.id || (tab.id === 'evaluations' && subtab === 'eval-detail');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/suspected-cases/${id}/${tab.id}`)}
                className={`h-12 text-[14px] font-medium transition-all ${isActive ? 'border-b-2 border-[#175beb] text-[#175beb] font-semibold' : 'text-[#424752] hover:text-slate-700'
                  }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Timeline */}
      <FollowUpTimeline isActivityAdded={false} />

      {/* Content */}
      <div className="mt-3">
        {subtab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Col (8 spans) */}
            <div className="lg:col-span-8 space-y-4">
              <SurgerySection patient={patient} />

              {/* Contact info card */}
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4">
                  <h4 className="sub-info-card-title flex items-center gap-2 text-[#002d73] font-semibold">
                    ข้อมูลติดต่อ (Contact)
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[13.5px]">
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">เบอร์โทรหลัก</span>
                    <strong className="text-slate-700">081-234-5678</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">เบอร์โทร 2</span>
                    <strong className="text-slate-700">-</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">Line</span>
                    <strong className="text-slate-700">Somchai_jaidee</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">SMS</span>
                    <strong className="text-slate-700">081-234-5678</strong>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-slate-400">อีเมล</span>
                    <strong className="text-slate-700">-</strong>
                  </div>
                </div>
              </div>

              {/* Procedures table */}
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">
                    รายการหัตถการในเคส (มี 2 รายการ)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-slate-600">
                    <thead className="h-9 bg-slate-50 font-medium text-slate-700">
                      <tr>
                        <th className="px-4 text-left">ลำดับ</th>
                        <th className="px-4 text-left">หัตถการ</th>
                        <th className="px-4 text-left">ศัลยแพทย์</th>
                        <th className="px-4 text-left">สถานะ SSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-10 border-t border-slate-100">
                        <td className="px-4">1</td>
                        <td className="px-4 font-medium text-slate-800">TKA (เข่าขวา)</td>
                        <td className="px-4">นพ อธิวัฒน์ ศรีกมล</td>
                        <td className="px-4 text-emerald-600 font-semibold">● เข้าเกณฑ์</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 p-3 bg-blue-50/50 rounded-lg text-[12px] text-blue-600 flex items-center gap-1.5">
                  <Info size={14} />
                  <span>เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up</span>
                </div>
              </div>
            </div>

            {/* Right Col (4 spans) */}
            <div className="lg:col-span-4">
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">
                    ความเสี่ยง SSI เบื้องต้น
                  </h4>
                  <a href="#" className="text-[12px] font-semibold text-blue-600 hover:underline">ดูรายการทั้งหมด</a>
                </div>

                <div className="space-y-3 text-[13.5px]">
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-500">อายุ &gt; 60 ปี</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">✓ มี</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-500">เบาหวาน</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">✓ มี</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-500">การติดเชื้อก่อนผ่าตัด</span>
                    <span className="text-slate-400 flex items-center gap-1">✕ ไม่มี</span>
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <strong className="text-slate-800">Risk Score</strong>
                    <div className="flex items-center gap-2">
                      <strong className="text-[20px] text-slate-800">72 %</strong>
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[12px] font-semibold text-orange-500">● ปานกลาง</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* evaluations list tab */}
        {subtab === 'evaluations' && (
          <EvaluationHistory
            evaluations={mockEvaluations}
            activeCardIndex={2}
            onViewDetail={() => navigate(`/suspected-cases/${id}/eval-detail`)}
            onEvaluate={() => { }}
          />
        )}

        {/* detailed evaluation card view */}
        {subtab === 'eval-detail' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-[13px]">
            {/* Left Column (7 spans) */}
            <div className="lg:col-span-7 space-y-4">

              {/* Attachments */}
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">เอกสาร/ไฟล์แนบ</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg .jpeg .png ขนาดไม่เกิน 5 MB</p>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left flex-1 max-w-[400px]">
                        <div className="color-red bg-red-100 p-2 rounded text-red-500">
                          <File size={16} />
                        </div>
                        <div>
                          <strong className="text-slate-800">Discharge Summary.pdf</strong>
                          <span className="block text-[11px] text-slate-400 mt-0.5">15 มิ.ย. 2569 10:10 • 245 KB</span>
                        </div>
                      </div>
                      <a href="#" className="text-slate-400 ml-4">
                        <Send size={18} className="rotate-90" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wound photos */}
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">รูปภาพแผล</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg .jpeg .png ขนาดไม่เกิน 5 MB</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {woundPhotos.map((photo) => (
                    <div key={photo.id} className="flex flex-col items-center">
                      <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center relative overflow-hidden">
                        <img src="/surgical_suture_healing.png" className="absolute inset-0 w-full h-full object-cover" alt="wound photo" />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">{photo.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (5 spans) */}
            <div className="lg:col-span-5 space-y-4">

              {/* CDC Symptoms Checklist Form */}
              <div className="sub-info-card p-5">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">แบบประเมินอาการ (CDC SSI)</h4>
                </div>

                <table className="w-full text-slate-700">
                  <thead>
                    <tr className="text-[12px] text-slate-400 border-b border-slate-100">
                      <th className="py-2 text-left font-medium">อาการ/อาการแสดง</th>
                      <th className="py-2 text-center font-medium" style={{ width: '50px' }}>ไม่มี</th>
                      <th className="py-2 text-center font-medium" style={{ width: '50px' }}>มี</th>
                      <th className="py-2 text-center font-medium" style={{ width: '60px' }}>ไม่ทราบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100/50 hover:bg-slate-50/40">
                        <td className="py-2.5 text-left font-medium text-slate-700">{item.label}</td>
                        <td className="py-2.5 text-center">
                          <input
                            type="radio"
                            name={`cdc-${idx}`}
                            checked={item.status === 'no'}
                            onChange={() => {
                              const updated = [...checklist]
                              updated[idx].status = 'no'
                              setChecklist(updated)
                            }}
                            className="accent-slate-500 scale-110 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="radio"
                            name={`cdc-${idx}`}
                            checked={item.status === 'has'}
                            onChange={() => {
                              const updated = [...checklist]
                              updated[idx].status = 'has'
                              setChecklist(updated)
                            }}
                            className="accent-blue-600 scale-110 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="radio"
                            name={`cdc-${idx}`}
                            checked={item.status === 'unknown'}
                            onChange={() => {
                              const updated = [...checklist]
                              updated[idx].status = 'unknown'
                              setChecklist(updated)
                            }}
                            className="accent-slate-400 scale-110 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Additional symptoms check */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                  <strong className="text-[#002d73] block mb-2">อาการอื่นๆ</strong>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={otherSymptoms.nausea}
                        onChange={(e) => setOtherSymptoms({ ...otherSymptoms, nausea: e.target.checked })}
                        className="accent-blue-600 cursor-pointer"
                      />
                      คลื่นไส้ / อาเจียน
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={otherSymptoms.jointPain}
                        onChange={(e) => setOtherSymptoms({ ...otherSymptoms, jointPain: e.target.checked })}
                        className="accent-blue-600 cursor-pointer"
                      />
                      ปวดข้อ/ปวดกล้ามเนื้อ
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={otherSymptoms.other}
                        onChange={(e) => setOtherSymptoms({ ...otherSymptoms, other: e.target.checked })}
                        className="accent-blue-600 cursor-pointer"
                      />
                      อื่นๆ
                    </label>
                    <input
                      type="text"
                      className="form-input mt-1 h-9 py-1 text-[13px] bg-slate-50 border border-slate-200 rounded px-2 w-full font-medium"
                      value={otherSymptomsText}
                      onChange={(e) => setOtherSymptomsText(e.target.value)}
                      placeholder="ระบุอาการอื่นๆ"
                      disabled={!otherSymptoms.other}
                    />
                  </div>
                </div>

                {/* post discharge check */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                  <strong className="text-[#002d73] block mb-2">การมารับการรักษาหลังจำหน่าย</strong>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="radio"
                        name="discharge-treatment"
                        checked={dischargeTreatment === 'not_visited'}
                        onChange={() => setDischargeTreatment('not_visited')}
                        className="accent-blue-600 cursor-pointer"
                      />
                      ไม่ได้ไปพบแพทย์
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="radio"
                        name="discharge-treatment"
                        checked={dischargeTreatment === 'visited'}
                        onChange={() => setDischargeTreatment('visited')}
                        className="accent-blue-600 cursor-pointer"
                      />
                      ไปพบแพทย์แล้ว (OPD/IPD)
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer select-none">
                      <input
                        type="radio"
                        name="discharge-treatment"
                        checked={dischargeTreatment === 'other'}
                        onChange={() => setDischargeTreatment('other')}
                        className="accent-blue-600 cursor-pointer"
                      />
                      อื่นๆ
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* Chats Container (Full width) */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Patient AI Chat log */}
              <div className="sub-info-card p-5 flex flex-col h-full">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4 shrink-0">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">ประวัติการพูดคุยตอบกลับผู้ป่วย (AI)</h4>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 flex-1">
                  <div className="flex gap-2.5 items-start">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">🤖</div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 max-w-[80%] text-left">
                      สวัสดีค่ะ ฉันจะช่วยถามอาการเพิ่มเติมเพื่อให้ทีมพยาบาลประเมินได้แม่นยำขึ้นนะคะ
                      <span className="block text-[10px] text-slate-400 mt-1 text-right">09:41</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">🤖</div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 max-w-[80%] text-left">
                      วันนี้คุณมีไข้หรือไม่?
                      <span className="block text-[10px] text-slate-400 mt-1 text-right">09:41</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 items-start">
                    <div className="bg-blue-50 text-blue-800 rounded-2xl rounded-tr-none p-3 max-w-[80%] text-left">
                      ไม่มีไข้
                      <span className="block text-[10px] text-blue-400 mt-1 text-right">09:41</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 items-start">
                    <div className="bg-blue-50 text-blue-800 rounded-2xl rounded-tr-none p-3 max-w-[80%] text-left">
                      มีไข้
                      <span className="block text-[10px] text-blue-400 mt-1 text-right">09:41</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">🤖</div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 max-w-[80%] text-left flex gap-2 items-center">
                      <span>มีไข้</span>
                      <Check size={14} className="text-emerald-500" strokeWidth={3} />
                      <span className="text-[10px] text-slate-400 ml-auto">09:42</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nurse Chat log */}
              <div className="sub-info-card p-5 flex flex-col h-full">
                <div className="sub-info-card-header border-b border-slate-100 pb-3 mb-4 shrink-0">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">ประวัติการพูดคุยตอบกลับจากผู้ป่วย (เจ้าหน้าที่ ประเมิน)</h4>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 flex-1">
                  <div className="flex gap-2.5 items-start">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">👩🏻‍⚕️</div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 max-w-[80%] text-left">
                      วันนี้คุณมีไข้หรือไม่?
                      <span className="block text-[10px] text-slate-400 mt-1 text-right">09:41</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 items-start">
                    <div className="bg-[#175beb] text-white rounded-2xl rounded-tr-none p-3 max-w-[80%] text-left">
                      มีไข้ต่ำ ๆ 37.8°C
                      <span className="block text-[10px] text-blue-200 mt-1 text-right">09:42</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 items-start">
                    <div className="border border-slate-200 rounded-lg p-2 bg-[#f8fafc] max-w-[200px] flex flex-col items-center">
                      <div className="w-[120px] aspect-[4/3] rounded border border-slate-200 flex items-center justify-center overflow-hidden relative">
                        <img src="/surgical_suture_healing.png" className="absolute inset-0 w-full h-full object-cover" alt="wound attachment" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">รูปภาพแผลแนบ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {subtab === 'docs' && (
          <DocsView selectedPatient={patient} />
        )}
      </div>

    </div>
  );
}
