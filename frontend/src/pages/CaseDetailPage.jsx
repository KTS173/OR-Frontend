import { AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, ChevronDown, Edit2, Eye, Info, MinusCircle, RefreshCw, Send, UserRound, Users, X, Plus, Calendar, Clock, Save, Search, File } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { api } from '../services/api.js'

// Import subcomponents copied from OR project
import EvaluationForm from '../components/EvaluationForm.jsx'
import TimelineView from '../components/TimelineView.jsx'
import TransferCareView from '../components/TransferCareView.jsx'
import DocsView from '../components/DocsView.jsx'
import SetupFollowUpView from '../components/SetupFollowUpView.jsx'
import EvaluationHistory from '../components/EvaluationHistory.jsx'


function DetailRow({ label, value, keepLabelOnOneLine = false }) {
  if (keepLabelOnOneLine) return <div className="flex min-h-5 min-w-0 items-start justify-between gap-3 text-[14px] leading-5"><span className="shrink-0 whitespace-nowrap text-slate-500">{label}</span><strong className="min-w-0 whitespace-normal [overflow-wrap:anywhere] text-right font-medium text-slate-700">{value}</strong></div>
  return <div className="flex min-h-5 items-start justify-between gap-4 text-[14px] leading-5"><span className="text-slate-500">{label}</span><strong className="text-right font-medium text-slate-700">{value}</strong></div>
}

const EditPatientFieldContext = createContext(null)

function formatThaiPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10)
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`
  }
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidThaiPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return value === '' || /^0\d{8,9}$/.test(digits)
}

function Field({ label, name, type = 'text', required = false, readOnly = false }) {
  const { patient, update, fieldClass } = useContext(EditPatientFieldContext)
  const rawValue = patient[name] ?? ''
  const isPhone = name === 'phonePrimary' || name === 'phoneSecondary'
  const value = isPhone ? formatThaiPhoneNumber(rawValue) : type === 'date' ? String(rawValue).slice(0, 10) : type === 'datetime-local' ? String(rawValue).slice(0, 16) : rawValue
  return <label className="text-[13px] font-medium text-slate-600">{label}{required && <span className="text-red-500"> *</span>}<input type={isPhone ? 'tel' : type} inputMode={isPhone ? 'numeric' : undefined} maxLength={isPhone ? 12 : undefined} placeholder={isPhone ? '0XX-XXX-XXXX' : undefined} readOnly={readOnly} className={`${fieldClass} ${readOnly ? 'bg-slate-50 text-slate-500' : ''}`} value={value} onChange={event => update(name, isPhone ? formatThaiPhoneNumber(event.target.value) : event.target.value)} /></label>
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const [patient, setPatient] = useState(null)
  const [patientOperations, setPatientOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [queueOpen, setQueueOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [excludeOpen, setExcludeOpen] = useState(false)
  const [excludeOperation, setExcludeOperation] = useState(null)
  const [draft, setDraft] = useState(null)
  const [savingPatient, setSavingPatient] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [editPatientOpen, setEditPatientOpen] = useState(false)
  const [queueOperation, setQueueOperation] = useState(null)
  const [activePatientTab, setActivePatientTab] = useState('info')

  useEffect(() => {
    let active = true
    api.getPatientGroup(id)
      .then((operations) => { if (active) { const selected = operations.find((item) => item.operationNo === id) || operations[0]; setPatient(selected); setDraft(selected); setPatientOperations(operations) } })
      .catch((error) => active && setLoadError(error.message || 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const handleSend = async (patientType, department, note) => {
    if (!queueOperation) return
    try {
      await api.assignPatientType(queueOperation.operationNo, patientType, department, note)
      const updateOperation = (item) => item.operationNo === queueOperation.operationNo ? { ...item, patientType: patientType.toLowerCase(), receivingDepartment: department, orHandoverNote: note, workflowStatus: 'QUEUED' } : item
      setPatientOperations((current) => current.map(updateOperation))
      setPatient((current) => updateOperation(current))
      window.dispatchEvent(new Event('operations-updated'))
      setQueueOpen(false)
      setQueueOperation((current) => current ? updateOperation(current) : current)
      setSuccessOpen(true)
    } catch (error) {
      window.alert(error.message || 'ส่งเคสไม่สำเร็จ')
    }
  }

  const savePatient = async () => {
    if (!draft?.id?.trim() || !draft?.episodeNo?.trim() || !draft?.procedure?.trim()) { setSaveMessage('กรุณาระบุ HN, Episode No. และหัตถการ'); return false }
    if (!isValidThaiPhoneNumber(draft.phonePrimary) || !isValidThaiPhoneNumber(draft.phoneSecondary)) { setSaveMessage('กรุณาระบุเบอร์โทรศัพท์ไทยให้ครบ 9 หรือ 10 หลัก โดยขึ้นต้นด้วย 0'); return false }
    setSavingPatient(true); setSaveMessage('')
    try {
      await api.updateOperation(patient.operationNo, {
        hn: draft.id, firstName: draft.firstName, lastName: draft.lastName, dateOfBirth: draft.dateOfBirth,
        age: draft.age, sex: draft.sex, heightCm: draft.heightCm, weightKg: draft.weightKg, bmi: draft.bmi,
        patientPhoto: draft.patientPhoto,
        phonePrimary: draft.phonePrimary, phoneSecondary: draft.phoneSecondary, lineId: draft.lineId, email: draft.email,
        ethnicity: draft.ethnicity, nationality: draft.nationality, insurance: draft.insurance, address: draft.address,
        episodeNo: draft.episodeNo, episodeDate: draft.episodeDate, wardName: draft.wardName, bedNo: draft.bedNo,
        patientType: draft.patientType?.toUpperCase(), surgeon: draft.surgeon, secondSurgeon: draft.secondSurgeon,
        operationDepartment: draft.department, operationLocation: draft.location, operatingRoom: draft.operatingRoom,
        urgency: draft.urgency, operationType: draft.operationType, preoperativeDiagnosis: draft.diagnosis,
        procedureName: draft.procedure, procedureFreeText: draft.procedureFreeText, primaryBodySite: draft.bodySite,
        laterality: draft.laterality, secondaryOperation: draft.secondaryOperation, startAt: draft.startAt,
        endAt: draft.endAt, durationMinutes: draft.durationMinutes, outcome: draft.outcome, status: draft.status,
        dischargeDate: draft.dischargeDate, woundClass: draft.woundClass, asaClass: draft.asaClass, implant: draft.implant,
        implantPresent: draft.implantPresent, anesthesiologist: draft.anesthesiologist, anesthesiaType: draft.anesthesiaType,
        specialEquipment: draft.specialEquipment, scrubNurse: draft.scrubNurse, circulatingNurse: draft.circulatingNurse,
        anesthesiaNurse: draft.anesthesiaNurse, comorbidities: draft.comorbidities, smokingStatus: draft.smokingStatus,
        woundAtDischarge: draft.woundAtDischarge, woundDischargeNotes: draft.woundDischargeNotes
      })
      const refreshed = await api.getPatient(patient.operationNo)
      setPatient(refreshed); setDraft(refreshed)
      setPatientOperations((current) => current.map((item) => item.operationNo === refreshed.operationNo ? refreshed : item))
      setQueueOperation((current) => current?.operationNo === refreshed.operationNo ? refreshed : current)
      setSaveMessage('บันทึกข้อมูลคนไข้เรียบร้อยแล้ว')
      window.dispatchEvent(new Event('operations-updated'))
      return true
    } catch (error) { setSaveMessage(error.message || 'บันทึกข้อมูลไม่สำเร็จ'); return false }
    finally { setSavingPatient(false) }
  }

  const pendingOperations = patientOperations.filter((operation) => operation.workflowStatus === 'OR_PENDING')

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">กำลังโหลดข้อมูลผู้ป่วย...</div>
  if (loadError || !patient) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{loadError || 'ไม่พบข้อมูลผู้ป่วย'}</div>
  if (pathname.startsWith('/follow-ups/')) return <FollowUpCaseDetail patient={patient} operations={[patient]} />
  if (pathname.startsWith('/suspected-cases/')) return <SuspectedCaseDetail patient={patient} operations={[patient]} />

  return (
    <>
      <div className="flex h-6 items-center justify-between"><Link to="/or-validation" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12} />กลับไปหน้ารายการ</Link><div className="flex items-center gap-2"><button onClick={() => { setDraft({ ...patient }); setSaveMessage(''); setEditPatientOpen(true) }} className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-blue-50" aria-label="แก้ไขข้อมูลคนไข้" title="แก้ไขข้อมูลคนไข้"><Edit2 size={15} /></button><span className="rounded-full bg-blue-50 px-2 py-1 text-[13px] text-blue-600">ข้อมูลจาก HIS / TrackCare</span><StatusBadge>{patient.status}</StatusBadge></div></div>
      {saveMessage && <div className={`mt-3 rounded-lg px-4 py-3 text-[13px] ${saveMessage.includes('เรียบร้อย') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{saveMessage}</div>}
      <PatientSummary patient={patient} />
      <nav className="mt-3 flex h-[73px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px]"><div className="flex h-[39px] gap-6 border-b border-[#e2e8f0]"><button onClick={() => setActivePatientTab('info')} className={`text-[16px] font-medium ${activePatientTab === 'info' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>ข้อมูลคนไข้</button><button onClick={() => setActivePatientTab('documents')} className={`text-[16px] font-medium ${activePatientTab === 'documents' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>เอกสารอ้างอิง</button></div><button onClick={() => window.dispatchEvent(new Event('documents-updated'))} className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px]"><RefreshCw size={14} />รีเฟรช</button></nav>
      {activePatientTab === 'info' ? <>
        <SurgerySection patient={patient} />
        <ContactAndProcedures patient={patient} operations={pendingOperations} />
        <OperationCaseBlocks operations={pendingOperations} onSend={(operation) => { setQueueOperation(operation); setQueueOpen(true) }} onExclude={(operation) => { setExcludeOperation(operation); setExcludeOpen(true) }} />
        <FollowUpTimeline patient={patient} />
      </> : <DocsView key={`${patient.id}-${patient.episodeNo}`} selectedPatient={patient} operations={patientOperations} referenceMode />}
      {queueOpen && queueOperation && <QueueModal patient={queueOperation} onClose={() => setQueueOpen(false)} onSend={handleSend} />}
      {successOpen && queueOperation && <SuccessModal patient={queueOperation} onClose={() => setSuccessOpen(false)} />}
      {excludeOpen && excludeOperation && <ExcludeCaseModal patient={excludeOperation} onClose={() => { setExcludeOpen(false); setExcludeOperation(null) }} />}
      {editPatientOpen && <EditPatientModal patient={draft} onChange={setDraft} saving={savingPatient} error={saveMessage && !saveMessage.includes('เรียบร้อย') ? saveMessage : ''} onClose={() => { setDraft(patient); setSaveMessage(''); setEditPatientOpen(false) }} onSave={async () => { if (await savePatient()) setEditPatientOpen(false) }} />}
    </>
  )
}

function FollowUpCaseDetail({ patient, operations }) {
  const { search } = useLocation()
  const [activeDetailTab, setActiveDetailTab] = useState(() => new URLSearchParams(search).get('tab') === 'history' ? 'history' : 'info')
  const [isActivityAdded, setIsActivityAdded] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [isSetupFollowUpOpen, setIsSetupFollowUpOpen] = useState(false)
  const [isTransferCompleted, setIsTransferCompleted] = useState(false)
  const [hasFollowUp, setHasFollowUp] = useState(Boolean(patient.followUpId))
  const [followUpChecked, setFollowUpChecked] = useState(false)

  useEffect(() => {
    let active = true
    api.getFollowUps(patient.operationNo)
      .then((items) => { if (active) setHasFollowUp(items.length > 0) })
      .catch(() => { if (active) setHasFollowUp(Boolean(patient.followUpId)) })
      .finally(() => { if (active) setFollowUpChecked(true) })
    return () => { active = false }
  }, [patient.operationNo, patient.followUpId])

  return (
    <div className="follow-up-case-page">
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
        <Link to="/my-follow-ups" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]"><ArrowLeft size={12} />กลับไปหน้ารายการ</Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!followUpChecked ? <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[13px] text-slate-500">กำลังตรวจสอบ Follow-up...</span> : hasFollowUp ? <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[13px] text-emerald-600">มีแผน Follow-up แล้ว</span> : <><span className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[13px] text-amber-700">ยังไม่ได้กำหนด Follow-up</span><button type="button" onClick={() => setIsSetupFollowUpOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#175beb] px-3 text-[13px] font-medium text-white shadow-sm hover:bg-blue-700"><Calendar size={15} />กำหนดรอบติดตาม</button></>}
          <span className={`rounded border px-2.5 py-1 text-[13px] ${patient.ssiStatus === 'SUSPECTED_SSI' ? 'border-orange-200 bg-orange-50 text-orange-600' : patient.ssiStatus === 'CONFIRMED_SSI' ? 'border-red-200 bg-red-50 text-red-600' : patient.ssiStatus === 'NOT_SSI' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{patient.ssiStatus === 'SUSPECTED_SSI' ? 'สงสัย SSI' : patient.ssiStatus === 'CONFIRMED_SSI' ? 'ยืนยัน SSI' : patient.ssiStatus === 'NOT_SSI' ? 'ไม่เข้าข่าย SSI' : 'ยังไม่ประเมิน SSI'}</span>
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
            onSaved={() => {
              setHasFollowUp(true)
              setFollowUpChecked(true)
              setIsSetupFollowUpOpen(false)
              setActiveDetailTab('timeline')
            }}
          />
        </div>
      ) : (
        <>
          {!['history', 'transfer', 'docs', 'images'].includes(activeDetailTab) && (
            <FollowUpTimeline patient={patient} />
          )}

          <div className="mt-3">
            {activeDetailTab === 'info' && (
              <>
                <OperationSurgerySections operations={operations} />
                <ContactAndProcedures patient={patient} operations={operations} />
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
            {activeDetailTab === 'history' && <AllEvaluationHistory patient={patient} />}
            {activeDetailTab === 'transfer' && (
              <TransferCareView
                selectedPatient={patient}
                isTransferCompleted={isTransferCompleted}
                setIsTransferCompleted={setIsTransferCompleted}
              />
            )}
            {activeDetailTab === 'docs' && (
              <DocsView selectedPatient={patient} operations={operations} viewMode="documents" />
            )}
            {activeDetailTab === 'images' && (
              <DocsView selectedPatient={patient} operations={operations} viewMode="images" />
            )}
          </div>
        </>
      )}

      {isActivityModalOpen && (
        <AddActivityModal
          patient={patient}
          onClose={() => setIsActivityModalOpen(false)}
          onSave={async (activity) => {
            try {
              const { assessment, ...activityData } = activity
              const savedActivity = await api.createActivity(patient.operationNo, activityData)
              if (assessment) await api.createActivityEvaluation(patient.operationNo, { ...assessment, activityId: savedActivity.id })
              setIsActivityAdded(true); setIsActivityModalOpen(false); setActiveDetailTab('timeline'); window.dispatchEvent(new Event('activities-updated')); window.dispatchEvent(new Event('operations-updated'))
            } catch (error) { alert(error.message) }
          }}
        />
      )}
    </div>
  )
}

function AllEvaluationHistory({ patient }) {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    Promise.all([api.getEvaluations(patient.operationNo), api.getActivities(patient.operationNo), api.getCaseDocuments(patient.operationNo)])
      .then(([evaluations, activities, documents]) => {
        if (!active) return
        const activityMap = new Map(activities.map(item => [`ACTIVITY:${item.id}`, item]))
        const historyRows = evaluations.flatMap(evaluation => {
          const activity = activityMap.get(String(evaluation.round_key))
          const data = evaluation.data || {}
          const attachments = documents.filter(doc => doc.follow_up_round === (activity ? 'กิจกรรมแทรก' : evaluation.round_key))
          const isRecovery = evaluation.result === 'recovery_clear' || evaluation.evaluation_type === 'SSI_RECOVERY'
          const assessmentRow = { ...evaluation, data, activity, attachments, kind: isRecovery ? 'ยืนยันหาย' : activity ? 'นอกรอบ' : 'ตามรอบ' }
          if (!evaluation.doctor_decision || !evaluation.doctor_reviewed_at) return [assessmentRow]
          const decisionRow = {
            ...evaluation,
            id: `doctor-${evaluation.id}`,
            evaluated_at: evaluation.doctor_reviewed_at,
            evaluated_by: evaluation.doctor_reviewed_by || 'แพทย์ผู้ตรวจสอบ',
            result: evaluation.doctor_decision,
            round_key: 'ผลวินิจฉัยจากแพทย์',
            data: { doctorNote: evaluation.doctor_note || 'ไม่มีหมายเหตุเพิ่มเติม' },
            activity: null,
            attachments: [],
            kind: 'ผลวินิจฉัยแพทย์',
          }
          return [assessmentRow, decisionRow]
        }).sort((a, b) => new Date(b.evaluated_at) - new Date(a.evaluated_at))
        setRows(historyRows)
      }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [patient.operationNo])
  const resultText = value => value === 'recovery_clear' ? 'ประเมินว่าหายจากการติดเชื้อ' : /suspect/i.test(value || '') ? 'สงสัย SSI' : /confirmed|positive/i.test(value || '') ? 'ยืนยัน SSI' : 'ไม่เข้าเกณฑ์ SSI'
  const resultClass = value => /suspect/i.test(value || '') ? 'bg-orange-50 text-orange-600' : /confirmed|positive/i.test(value || '') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
  const kindClass = kind => kind === 'ผลวินิจฉัยแพทย์' ? 'bg-red-50 text-red-600' : kind === 'ยืนยันหาย' ? 'bg-emerald-50 text-emerald-600' : kind === 'นอกรอบ' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="border-b border-slate-200 px-6 py-5"><h2 className="text-[17px] font-semibold text-[#002d73]">ประวัติการประเมินทั้งหมด</h2><p className="mt-1 text-[12px] text-slate-500">รวมผลประเมิน ผลวินิจฉัยจากแพทย์ และการยืนยันหายของ Operation Number {patient.operationNo}</p></header><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-[13px]"><thead className="h-12 bg-slate-50 text-left font-semibold text-slate-700"><tr><th className="px-5">วันที่และเวลา</th><th className="px-5">ประเภท</th><th className="px-5">รอบ/กิจกรรม</th><th className="px-5">ผู้ดำเนินการ</th><th className="px-5">ผล</th><th className="px-5">คะแนน</th><th className="px-5 text-center">รายละเอียด</th></tr></thead><tbody>{loading && <tr><td colSpan="7" className="py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>}{!loading && !rows.length && <tr><td colSpan="7" className="py-12 text-center text-slate-400">ยังไม่มีประวัติการประเมิน</td></tr>}{rows.map(row => <tr key={row.id} className="h-16 border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5">{new Date(row.evaluated_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</td><td className="px-5"><span className={`whitespace-nowrap rounded-md px-2.5 py-1 font-medium ${kindClass(row.kind)}`}>{row.kind}</span></td><td className="px-5 font-medium text-slate-700">{row.activity?.activity_type || row.round_key || '-'}</td><td className="px-5 text-slate-600">{row.evaluated_by || '-'}</td><td className="px-5"><span className={`whitespace-nowrap rounded-md px-2.5 py-1 font-semibold ${resultClass(row.result)}`}>{resultText(row.result)}</span></td><td className="px-5 font-semibold text-slate-700">{row.kind === 'ผลวินิจฉัยแพทย์' ? '-' : row.score != null ? `${row.score}%` : '-'}</td><td className="px-5 text-center"><button type="button" onClick={() => setSelected(row)} className="inline-grid size-9 place-items-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50" aria-label="ดูรายละเอียด"><Eye size={16}/></button></td></tr>)}</tbody></table></div>{selected && <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4" onMouseDown={() => setSelected(null)}><section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}><header className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><p className={`text-[12px] font-medium ${selected.kind === 'ผลวินิจฉัยแพทย์' ? 'text-red-600' : selected.kind === 'ยืนยันหาย' ? 'text-emerald-600' : 'text-blue-600'}`}>{selected.kind}</p><h3 className="mt-1 text-[18px] font-semibold text-[#002d73]">{selected.activity?.activity_type || selected.round_key}</h3></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button></header><div className="space-y-5 px-6 py-5 text-[13px]"><div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><DetailRow label="ผล" value={resultText(selected.result)} /><DetailRow label="คะแนนความเสี่ยง" value={selected.kind === 'ผลวินิจฉัยแพทย์' ? '-' : selected.score != null ? `${selected.score}%` : '-'} /><DetailRow label="ผู้ดำเนินการ" value={selected.evaluated_by || '-'} /><DetailRow label="วันที่ดำเนินการ" value={new Date(selected.evaluated_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} /></div><div><h4 className="mb-3 font-semibold text-[#002d73]">รายละเอียด</h4><div className="divide-y divide-slate-100 rounded-xl border border-slate-200">{Object.entries(selected.data || {}).filter(([, value]) => value !== '' && value != null && typeof value !== 'object').map(([key, value]) => <div key={key} className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-4 py-3"><span className="text-slate-500">{key === 'doctorNote' ? 'หมายเหตุแพทย์' : key}</span><span className="break-words font-medium text-slate-700">{String(value)}</span></div>)}{Object.entries(selected.data?.symptoms || {}).map(([key, value]) => <div key={key} className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-4 py-3"><span className="text-slate-500">{key}</span><span className="font-medium text-slate-700">{value === 'yes' || value === 'has' ? 'มี' : value === 'no' ? 'ไม่มี' : 'ไม่ทราบ'}</span></div>)}</div></div>{selected.activity && <div><h4 className="mb-3 font-semibold text-[#002d73]">รายละเอียดกิจกรรม</h4><div className="space-y-2 rounded-xl border border-slate-200 p-4"><DetailRow label="วัตถุประสงค์" value={selected.activity.purpose || '-'} /><DetailRow label="รายละเอียด" value={selected.activity.detail || '-'} /></div></div>}</div><footer className="flex justify-end border-t border-slate-200 px-6 py-4"><button type="button" onClick={() => setSelected(null)} className="btn-filled-primary">ปิด</button></footer></section></div>}</section>
}

function FollowUpTabs({ activeDetailTab, setActiveDetailTab, setIsActivityModalOpen }) {
  const tabs = [
    { id: 'info', name: 'ข้อมูลคนไข้' },
    { id: 'evaluation', name: 'ประเมินตามรอบ' },
    { id: 'timeline', name: 'การติดตาม / Timeline' },
    { id: 'history', name: 'ประวัติการประเมินทั้งหมด' },
    { id: 'transfer', name: 'ย้ายเคส / ส่งต่อการดูแล' },
    { id: 'docs', name: 'เอกสาร' },
    { id: 'images', name: 'รูปภาพ' }
  ]
  return <nav className="mt-3 flex min-h-[73px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white px-[17px] py-2 shadow-sm">
    <div className="flex min-w-0 items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} className={`h-12 shrink-0 text-[14px] font-medium ${activeDetailTab === tab.id ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}>{tab.name}</button>)}
    </div>
    <button onClick={() => setIsActivityModalOpen(true)} className="inline-flex h-[42px] shrink-0 items-center gap-2 rounded-lg bg-[#175beb] px-5 text-[14px] font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"><span className="text-lg leading-none">+</span>เพิ่มกิจกรรมแทรก</button>
  </nav>
}

function EditableOrCase({ patient, onChange }) {
  if (!patient) return null
  const update = (key, value) => onChange(current => {
    const next = { ...current, [key]: value }
    if (key === 'dateOfBirth') {
      const birthDate = value ? new Date(`${value}T12:00:00`) : null
      const today = new Date()
      if (birthDate && !Number.isNaN(birthDate.getTime()) && birthDate <= today) {
        let age = today.getFullYear() - birthDate.getFullYear()
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1
        next.age = age
      } else next.age = ''
    }
    if (key === 'heightCm' || key === 'weightKg') {
      const height = Number(key === 'heightCm' ? value : next.heightCm)
      const weight = Number(key === 'weightKg' ? value : next.weightKg)
      next.bmi = height > 0 && weight > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(2)) : ''
    }
    return next
  })
  const fieldClass = 'mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-[#175beb] focus:ring-2 focus:ring-blue-50'
  const areaClass = `${fieldClass} min-h-20 resize-y py-2`
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.alert('กรุณาเลือกรูปประเภท JPG, PNG หรือ WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert('รูปผู้ป่วยต้องมีขนาดไม่เกิน 5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('patientPhoto', reader.result)
    reader.onerror = () => window.alert('ไม่สามารถอ่านไฟล์รูปได้ กรุณาลองใหม่')
    reader.readAsDataURL(file)
  }
  return <EditPatientFieldContext.Provider value={{ patient, update, fieldClass }}><div className="mt-3 space-y-3">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="border-b border-slate-100 pb-3 text-[16px] font-semibold text-[#002d73]">ข้อมูลผู้ป่วย</h3>
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        {patient.patientPhoto
          ? <img src={patient.patientPhoto} alt="รูปผู้ป่วย" className="size-32 shrink-0 rounded-xl border border-slate-200 bg-white object-cover" />
          : <div className="grid size-32 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-[#175beb]"><UserRound size={64} strokeWidth={1.4} /></div>}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-slate-700">รูปผู้ป่วย</p>
          <p className="mt-1 text-[12px] text-slate-500">รองรับไฟล์ JPG, PNG และ WebP ขนาดไม่เกิน 5 MB</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#175beb] px-3 text-[13px] font-medium text-white hover:bg-blue-700">
              <Camera size={15} />{patient.patientPhoto ? 'เปลี่ยนรูป' : 'เพิ่มรูป'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
            </label>
            {patient.patientPhoto && <button type="button" onClick={() => update('patientPhoto', null)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 hover:bg-slate-100"><X size={15} />ลบรูป</button>}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Field label="HN" name="id" required /><Field label="ชื่อ" name="firstName" /><Field label="นามสกุล" name="lastName" />
        <label className="text-[13px] font-medium text-slate-600">เพศ<select className={fieldClass} value={patient.sex || ''} onChange={event => update('sex', event.target.value)}><option value="">ไม่ระบุ</option><option value="MALE">ชาย</option><option value="FEMALE">หญิง</option><option value="OTHER">อื่นๆ</option></select></label>
        <Field label="วันเกิด" name="dateOfBirth" type="date" /><Field label="อายุ (คำนวณอัตโนมัติ)" name="age" type="number" readOnly /><Field label="ส่วนสูง (ซม.)" name="heightCm" type="number" /><Field label="น้ำหนัก (กก.)" name="weightKg" type="number" />
        <Field label="BMI (คำนวณอัตโนมัติ)" name="bmi" type="number" readOnly /><Field label="เชื้อชาติ" name="ethnicity" /><Field label="สัญชาติ" name="nationality" /><Field label="สิทธิการรักษา" name="insurance" />
        <label className="text-[13px] font-medium md:col-span-3 xl:col-span-4">ที่อยู่<textarea className={areaClass} value={patient.address || ''} onChange={event => update('address', event.target.value)} /></label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-[13px] font-medium text-slate-600">การสูบบุหรี่<select className={fieldClass} value={patient.smokingStatus || ''} onChange={event => update('smokingStatus', event.target.value)}><option value="">ไม่ระบุ</option><option value="YES">สูบ</option><option value="NO">ไม่สูบ</option><option value="FORMER">เคยสูบ</option></select></label>
        <label className="text-[13px] font-medium text-slate-600">ประเภทแผล (Wound Class)
          <select className={fieldClass} value={patient.woundClass || ''} onChange={event => update('woundClass', event.target.value)}>
            <option value="">ไม่ระบุ</option>
            {patient.woundClass && !['No wound', 'Clean wound', 'Clean contaminated wound', 'Contaminated wound', 'Dirty wound'].includes(patient.woundClass) && <option value={patient.woundClass}>{patient.woundClass} (ข้อมูลเดิม)</option>}
            {['No wound', 'Clean wound', 'Clean contaminated wound', 'Contaminated wound', 'Dirty wound'].map(woundClass => <option key={woundClass} value={woundClass}>{woundClass}</option>)}
          </select>
        </label>
        <label className="text-[13px] font-medium text-slate-600 md:col-span-2">โรคร่วม/ปัจจัยเสี่ยง<textarea className={areaClass} value={patient.comorbidities || ''} onChange={event => update('comorbidities', event.target.value)} placeholder="เช่น DM, HT หรืออื่นๆ" /></label>
        <label className="text-[13px] font-medium text-slate-600 md:col-span-2">รายละเอียดสภาพแผล<textarea className={areaClass} value={patient.woundDischargeNotes || ''} onChange={event => update('woundDischargeNotes', event.target.value)} /></label>
      </div>
      <p className="mt-4 text-[12px] text-slate-500">รูปแผลสามารถเพิ่มในแท็บเอกสารอ้างอิง โดยเลือกประเภท Image และ Operation Number ที่เกี่ยวข้อง</p>
    </section>
    <section className="grid gap-3 xl:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="border-b border-slate-100 pb-3 text-[16px] font-semibold text-[#002d73]">ข้อมูลติดต่อ</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="เบอร์โทรหลัก" name="phonePrimary" /><Field label="เบอร์โทร 2" name="phoneSecondary" /><Field label="Line ID" name="lineId" /><Field label="อีเมล" name="email" type="email" /></div>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="border-b border-slate-100 pb-3 text-[16px] font-semibold text-[#002d73]">ข้อมูลการรับบริการ</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Episode No." name="episodeNo" required /><Field label="วันที่ Admit" name="episodeDate" type="date" /><Field label="Ward" name="wardName" /><Field label="เตียง" name="bedNo" /></div>
      </article>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="border-b border-slate-100 pb-3 text-[16px] font-semibold text-[#002d73]">ข้อมูลการผ่าตัด</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Field label="หัตถการ" name="procedure" required /><Field label="ศัลยแพทย์" name="surgeon" /><Field label="ศัลยแพทย์คนที่ 2" name="secondSurgeon" /><Field label="ศัลยแพทย์คนที่ 3" name="thirdSurgeon" />
        <Field label="วิสัญญีแพทย์" name="anesthesiologist" /><Field label="ประเภทการระงับความรู้สึก" name="anesthesiaType" /><Field label="แผนก" name="department" /><Field label="อุปกรณ์พิเศษ" name="specialEquipment" />
        <Field label="Scrub Nurse" name="scrubNurse" /><Field label="Circulating Nurse" name="circulatingNurse" /><Field label="Anesthesia Nurse" name="anesthesiaNurse" />
        <Field label="สถานที่ผ่าตัด" name="location" /><Field label="ห้องผ่าตัด" name="operatingRoom" /><Field label="ความเร่งด่วน" name="urgency" /><Field label="ประเภทการผ่าตัด" name="operationType" />
        <Field label="เวลาเริ่มผ่าตัด" name="startAt" type="datetime-local" /><Field label="เวลาสิ้นสุดผ่าตัด" name="endAt" type="datetime-local" /><Field label="ระยะเวลา (นาที)" name="durationMinutes" type="number" />
        <Field label="ตำแหน่งผ่าตัด" name="bodySite" /><Field label="ข้าง" name="laterality" /><Field label="ASA Class" name="asaClass" />
        <label className="text-[13px] font-medium text-slate-600">มี Implant<select className={fieldClass} value={patient.implantPresent == null ? '' : String(patient.implantPresent)} onChange={event => update('implantPresent', event.target.value === '' ? null : event.target.value === 'true')}><option value="">ไม่ระบุ</option><option value="true">มี</option><option value="false">ไม่มี</option></select></label><Field label="รายละเอียด Implant" name="implant" /><Field label="ผลลัพธ์" name="outcome" />
        <label className="text-[13px] font-medium text-slate-600 md:col-span-3 xl:col-span-4">Diagnosis<textarea className={areaClass} value={patient.diagnosis || ''} onChange={event => update('diagnosis', event.target.value)} /></label>
        <label className="text-[13px] font-medium text-slate-600 md:col-span-3 xl:col-span-4">รายละเอียดหัตถการเพิ่มเติม<textarea className={areaClass} value={patient.procedureFreeText || ''} onChange={event => update('procedureFreeText', event.target.value)} /></label>
      </div>
      <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-[12px] text-blue-700">ข้อมูลที่แก้ไขในหน้านี้จะยังไม่เปลี่ยนในระบบจนกดปุ่ม “บันทึกข้อมูล” ด้านล่าง</p>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="border-b border-slate-100 pb-3 text-[16px] font-semibold text-[#002d73]">ข้อมูลติดตามหลังจำหน่าย</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="วันที่จำหน่าย" name="dischargeDate" type="date" />
        <label className="text-[13px] font-medium text-slate-600">สภาพแผลตอนจำหน่าย<select className={fieldClass} value={patient.woundAtDischarge || ''} onChange={event => update('woundAtDischarge', event.target.value)}><option value="">ไม่ระบุ</option><option value="NORMAL">ปกติ</option><option value="SWELLING">บวม</option><option value="REDNESS">แดง</option><option value="DISCHARGE">มีน้ำซึม/สิ่งคัดหลั่ง</option><option value="OTHER">อื่นๆ</option></select></label>
      </div>
    </section>
  </div></EditPatientFieldContext.Provider>
}

function EditPatientModal({ patient, onChange, onClose, onSave, saving, error }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="edit-patient-title" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div><h2 id="edit-patient-title" className="text-[20px] font-semibold text-slate-900">แก้ไขข้อมูลคนไข้</h2><p className="mt-1 text-[13px] text-slate-500">ข้อมูลจะเปลี่ยนในระบบเมื่อกดบันทึกการแก้ไขเท่านั้น</p></div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิด"><X size={20} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {error && <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}
        <EditableOrCase patient={patient} onChange={onChange} />
      </div>
      <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
        <button disabled={saving} onClick={onClose} className="btn-secondary">ยกเลิก</button>
        <button disabled={saving} onClick={onSave} className="btn-primary disabled:opacity-50"><Save size={15} />{saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
      </footer>
    </section>
  </div>
}

function OperationCaseBlocks({ operations, onSend, onExclude }) {
  return <section className="mt-5 space-y-3">
    <div className="flex items-center justify-between px-1"><h3 className="text-[16px] font-medium text-[#002d73]">รายการ Operation Number</h3><span className="text-[13px] text-slate-500">{operations.length} รายการ</span></div>
    {operations.length === 0 && <p className="rounded-lg bg-slate-50 px-6 py-5 text-[14px] text-slate-500">ไม่มี Operation Number ที่รอส่งจาก OR</p>}
    {operations.map((operation, index) => <article key={operation.operationNo} className="overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#175beb] text-sm font-semibold text-white">{index + 1}</span><div><p className="text-[11px] font-medium text-slate-400">OPERATION NUMBER</p><h4 className="text-lg font-semibold text-[#002d73]">{operation.operationNo || '-'}</h4></div></div>
        <div className="flex flex-wrap items-center gap-2"><StatusBadge>รอตรวจสอบ</StatusBadge><button onClick={() => onExclude(operation)} className="inline-flex h-8 items-center gap-2 rounded-lg border border-red-300 bg-white px-3 text-sm font-medium text-red-500 hover:bg-red-50"><MinusCircle size={15} />ตัดเคสออก</button><button onClick={() => onSend(operation)} className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#175beb] px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"><Send size={15} />ส่ง Case</button></div>
      </header>
      <div className="grid gap-6 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 space-y-2"><DetailRow keepLabelOnOneLine label="หัตถการ" value={operation.procedure || '-'} /><DetailRow keepLabelOnOneLine label="Diagnosis" value={operation.diagnosis || '-'} /><DetailRow keepLabelOnOneLine label="ตำแหน่งผ่าตัด" value={operation.bodySite || '-'} /></div>
        <div className="min-w-0 space-y-2"><DetailRow keepLabelOnOneLine label="ศัลยแพทย์" value={operation.surgeon || '-'} /><DetailRow keepLabelOnOneLine label="ศัลยแพทย์คนที่ 2" value={operation.secondSurgeon || '-'} /><DetailRow keepLabelOnOneLine label="ศัลยแพทย์คนที่ 3" value={operation.thirdSurgeon || '-'} /></div>
        <div className="min-w-0 space-y-2"><DetailRow keepLabelOnOneLine label="แผนกต้นทาง" value={operation.department || '-'} /><DetailRow keepLabelOnOneLine label="ห้องผ่าตัด" value={operation.operatingRoom || '-'} /><DetailRow keepLabelOnOneLine label="วันที่ผ่าตัด" value={operation.surgeryDate || '-'} /><DetailRow keepLabelOnOneLine label="แผนกปลายทาง" value={operation.receivingDepartment || '-'} /></div>
        <div className="min-w-0 space-y-2"><DetailRow keepLabelOnOneLine label="วิสัญญีแพทย์" value={operation.anesthesiologist || '-'} /><DetailRow keepLabelOnOneLine label="ประเภทวิสัญญี" value={operation.anesthesiaType || '-'} /><DetailRow keepLabelOnOneLine label="ทีม OR" value={[operation.scrubNurse, operation.circulatingNurse, operation.anesthesiaNurse].filter(Boolean).join(' / ') || '-'} /><DetailRow keepLabelOnOneLine label="Implant" value={operation.implantPresent === false ? 'ไม่มี' : operation.implant || (operation.implantPresent ? 'มี' : '-')} /></div>
      </div>
    </article>)}
  </section>
}

function PatientSummary({ patient }) {
  return <section className="mt-3"><PatientInfoCard patient={patient} /></section>
}

export function PatientInfoCard({ patient }) {
  const birthDate = patient.dateOfBirth ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date(patient.dateOfBirth)) : 'ไม่ระบุ'
  const demographics = [
    ['เพศ', ({ MALE: 'ชาย', FEMALE: 'หญิง', OTHER: 'อื่นๆ' })[patient.sex] || patient.sex],
    ['อายุ', patient.age != null ? `${patient.age} ปี` : null],
    ['วันเกิด', birthDate], ['เบอร์โทร', patient.phonePrimary],
    ['เชื้อชาติ', patient.ethnicity], ['สัญชาติ', patient.nationality], ['สิทธิการรักษา', patient.insurance],
  ]
  const health = [
    ['ส่วนสูง', patient.heightCm != null && patient.heightCm !== '' ? `${patient.heightCm} ซม.` : null],
    ['น้ำหนัก', patient.weightKg != null && patient.weightKg !== '' ? `${patient.weightKg} กก.` : null],
    ['BMI', patient.bmi],
    ['การสูบบุหรี่', ({ YES: 'สูบ', NO: 'ไม่สูบ', FORMER: 'เคยสูบ' })[patient.smokingStatus] || patient.smokingStatus],
    ['ประเภทแผล (Wound Class)', patient.woundClass],
  ]
  return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center gap-4 px-5 py-5 sm:px-6">
      {patient.patientPhoto
        ? <img src={patient.patientPhoto} alt={`รูปผู้ป่วย ${patient.name || ''}`} className="size-28 shrink-0 rounded-xl border border-slate-200 object-cover sm:size-36" />
        : <div className="grid size-28 shrink-0 place-items-center sm:size-36 rounded-xl border border-blue-100 bg-blue-50/50 text-[#175beb]"><UserRound size={64} strokeWidth={1.4} /></div>}
      <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-slate-500">HN <span className="ml-1 text-slate-700">{patient.id}</span></p><h2 className="mt-1 break-words text-[22px] font-semibold leading-8 text-slate-900">{patient.name}</h2></div>
      <div className="flex flex-wrap gap-4 text-[12px] text-slate-500">
        <div><p className="mb-1.5">ประเภทผู้ป่วย</p><span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 font-medium text-[#175beb]">{patient.patientType?.toUpperCase() || 'ไม่ระบุ'}</span></div>
        <div><p className="mb-1.5">สถานะเคส</p><span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 font-medium text-[#175beb]">{patient.workflowStatus === 'CASE' ? 'ส่ง case แล้ว' : 'รอตรวจสอบ'}</span></div>
      </div>
    </header>
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 pb-5 pt-2 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-3">
      {[...demographics, ['ที่อยู่', patient.address], ...health, ['โรคร่วม/ปัจจัยเสี่ยง', patient.comorbidities]].map(([label, value]) => (
        <div key={label} className="flex min-w-0 items-start justify-between gap-4">
          <dt className="shrink-0 text-[14px] text-slate-500">{label}</dt>
          <dd className="min-w-0 whitespace-pre-wrap break-words text-right text-[14px] font-medium text-slate-800">{value === '' || value == null ? 'ไม่ระบุ' : value}</dd>
        </div>
      ))}
      <div className="col-span-full min-w-0">
        <dt className="text-[14px] text-slate-500">รายละเอียดสภาพแผล</dt>
        <dd className="mt-2 whitespace-pre-wrap break-words text-[14px] font-medium leading-6 text-slate-800">{patient.woundDischargeNotes || 'ไม่ระบุ'}</dd>
      </div>
    </dl>
  </article>
}

function SurgerySection({ patient, hideRisk = false }) {
  const formatDate = (value) => value ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date(value)) : '-'
  const formatTime = (value) => value ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }).format(new Date(value)) : '-'
  const outcomeLabel = ({ DISCHARGE: 'จำหน่ายกลับบ้าน', PACU: 'พักฟื้นที่ PACU', ICU: 'ย้ายไปหอผู้ป่วยวิกฤต', TRANSFER_TO_ICU: 'ย้ายไปหอผู้ป่วยวิกฤต', NURSERY: 'ย้ายไปหอทารกแรกเกิด', NICU: 'ย้ายไปหอผู้ป่วยวิกฤตทารกแรกเกิด' })[patient.outcome] || patient.outcome || '-'
  const operationNoteGroups = [
    [['วันที่เริ่มผ่าตัด', formatDate(patient.startAt)], ['เวลาเริ่มผ่าตัด', formatTime(patient.startAt)]],
    [['วันที่สิ้นสุดผ่าตัด', formatDate(patient.endAt)], ['เวลาสิ้นสุดผ่าตัด', formatTime(patient.endAt)]],
    [['ระยะเวลาผ่าตัด', patient.durationMinutes != null ? `${patient.durationMinutes} นาที` : '-'], ['ผลลัพธ์หลังผ่าตัด', outcomeLabel]]
  ]
  return <section className={`mt-3 grid items-stretch gap-3 ${hideRisk ? '' : 'xl:grid-cols-[2fr_1fr]'}`}><article className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm"><h3 className="text-[16px] font-medium text-[#002d73]">ข้อมูลการผ่าตัด</h3><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">{operationNoteGroups.map((items, index) => <div key={index} className={`space-y-3 ${index ? 'border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0' : ''}`}>{items.map(([label, value]) => <DetailRow key={label} label={label} value={value || '-'} />)}</div>)}</div></article>{!hideRisk && <article className="flex min-h-[170px] flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm"><h3 className="border-b border-slate-100 px-6 py-4 text-[16px] font-medium text-[#002d73]">ปัจจัยเสี่ยง SSI</h3><div className="grid flex-1 place-items-center px-6 py-6 text-sm text-slate-400">ยังไม่มีข้อมูลการประเมินความเสี่ยง</div></article>}</section>
}

function OperationSurgerySections({ operations = [] }) {
  const formatDate = value => value ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date(value)) : '-'
  const formatTime = value => value ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }).format(new Date(value)) : '-'
  const outcomeLabel = value => ({ DISCHARGE: 'จำหน่ายกลับบ้าน', PACU: 'พักฟื้นที่ PACU', ICU: 'ย้ายไปหอผู้ป่วยวิกฤต', TRANSFER_TO_ICU: 'ย้ายไปหอผู้ป่วยวิกฤต', NURSERY: 'ย้ายไปหอทารกแรกเกิด', NICU: 'ย้ายไปหอผู้ป่วยวิกฤตทารกแรกเกิด' })[value] || value || '-'

  return <section className="mt-3 space-y-3">
    {operations.map(operation => <article key={operation.operationNo} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h3 className="text-[16px] font-semibold text-[#002d73]">ข้อมูลการผ่าตัด</h3><p className="mt-1 text-[12px] text-slate-500">Operation Number <strong className="ml-1 font-semibold text-blue-700">{operation.operationNo || '-'}</strong></p></div>
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-blue-700">{operation.patientType?.toUpperCase() || '-'}</span>
      </header>
      <div className="grid gap-0 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-3 pb-4 sm:pr-5 xl:pb-0"><DetailRow label="หัตถการ" value={operation.procedure || '-'} /><DetailRow label="Diagnosis" value={operation.diagnosis || '-'} /><DetailRow label="ศัลยแพทย์" value={operation.surgeon || '-'} /></div>
        <div className="space-y-3 border-t border-slate-100 py-4 sm:border-l sm:border-t-0 sm:py-0 sm:pl-5 xl:pr-5"><DetailRow label="แผนก" value={operation.department || '-'} /><DetailRow label="ห้องผ่าตัด" value={operation.operatingRoom || '-'} /><DetailRow label="ประเภทการผ่าตัด" value={operation.operationType || '-'} /></div>
        <div className="space-y-3 border-t border-slate-100 py-4 xl:border-l xl:border-t-0 xl:py-0 xl:pl-5 xl:pr-5"><DetailRow label="วันที่เริ่มผ่าตัด" value={formatDate(operation.startAt)} /><DetailRow label="เวลาเริ่มผ่าตัด" value={formatTime(operation.startAt)} /><DetailRow label="ระยะเวลาผ่าตัด" value={operation.durationMinutes != null ? `${operation.durationMinutes} นาที` : '-'} /></div>
        <div className="space-y-3 border-t border-slate-100 pt-4 sm:border-l sm:pl-5 xl:border-t-0 xl:pt-0"><DetailRow label="วันที่สิ้นสุดผ่าตัด" value={formatDate(operation.endAt)} /><DetailRow label="เวลาสิ้นสุดผ่าตัด" value={formatTime(operation.endAt)} /><DetailRow label="ผลลัพธ์หลังผ่าตัด" value={outcomeLabel(operation.outcome)} /></div>
      </div>
      {operation.orHandoverNote && <div className="mx-5 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><p className="text-[12px] font-semibold text-amber-700">บันทึกส่งต่อจาก OR</p><p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-6 text-slate-700">{operation.orHandoverNote}</p></div>}
    </article>)}
  </section>
}

function ContactAndProcedures({ patient, operations = [patient] }) {
  const [evaluationStatuses, setEvaluationStatuses] = useState({})
  useEffect(() => {
    let active = true
    Promise.all(operations.map(async (operation) => {
      try {
        const rows = await api.getEvaluations(operation.operationNo)
        return [operation.operationNo, rows[0]?.result || 'ยังไม่ประเมิน']
      } catch {
        return [operation.operationNo, 'ยังไม่ประเมิน']
      }
    })).then((statuses) => active && setEvaluationStatuses(Object.fromEntries(statuses)))
    return () => { active = false }
  }, [operations])
  const evaluationPresentation = (operationNo) => {
    const status = evaluationStatuses[operationNo]
    return !status || status === 'ยังไม่ประเมิน'
      ? { text: 'ยังไม่ประเมิน', color: 'text-slate-500', dot: 'bg-slate-400' }
      : /suspect/i.test(status)
      ? { text: 'สงสัย SSI', color: 'text-orange-500', dot: 'bg-orange-500' }
      : /confirmed|positive|infected_ssi|^ssi$/i.test(status)
        ? { text: 'เข้าเกณฑ์', color: 'text-red-600', dot: 'bg-red-600' }
        : { text: 'ไม่เข้าเกณฑ์', color: 'text-emerald-600', dot: 'bg-emerald-500' }
  }
  const contacts = [
    ['/assets/icon/dashboard/phone.png', 'เบอร์โทรหลัก', formatThaiPhoneNumber(patient.phonePrimary) || '-'],
    ['/assets/icon/dashboard/phone.png', 'เบอร์โทร 2', formatThaiPhoneNumber(patient.phoneSecondary) || '-'],
    ['/assets/icon/user info/line_svgrepo.com.png', 'Line', patient.lineId || '-'],
    ['/assets/icon/user info/email.png', 'อีเมล', patient.email || '-'],
  ]
  return <section className="mt-5 grid min-h-[216px] gap-3 xl:grid-cols-[332fr_740fr]">
    <article className="rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[16px] shadow-sm">
      <h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลติดต่อ (Contact)</h3>
      <div className="mt-5 space-y-3">{contacts.map(([icon, label, value]) => <div key={label} className="flex items-center justify-between text-[14px] leading-5"><span className="inline-flex items-center gap-2 text-slate-500"><img src={icon} alt="" className="h-5 w-5 shrink-0 object-contain" />{label}</span><strong className="font-medium text-slate-700">{value}</strong></div>)}</div>
    </article>
    <article className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm sm:px-6">
      <h3 className="inline-flex items-center gap-2 text-[16px] font-medium leading-7 text-[#002d73]">รายการหัตถการในเคส <span className="text-[13px] font-normal text-slate-500">({operations.length} รายการ)</span><Info size={17} className="text-[#64748b]" /></h3>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200"><table className="w-full table-fixed text-[13px] text-[#434651]"><colgroup><col className="w-[8%]" /><col className="w-[18%]" /><col className="w-[30%]" /><col className="w-[26%]" /><col className="w-[18%]" /></colgroup><thead className="h-11 bg-[#f8fafc] font-semibold uppercase tracking-[.6px] text-[#1e293b]"><tr><th className="px-3 text-center align-middle">ลำดับ</th><th className="px-3 text-center align-middle">Operation Number</th><th className="px-3 text-center align-middle">หัตถการ</th><th className="px-3 text-center align-middle">ศัลยแพทย์</th><th className="px-3 text-center align-middle">สถานะ SSI</th></tr></thead><tbody>{operations.map((operation, index) => { const presentation = evaluationPresentation(operation.operationNo); return <tr key={operation.operationNo} className="min-h-16 border-t border-slate-100"><td className="px-3 py-5 text-center align-middle font-medium">{index + 1}</td><td className="break-words px-3 py-5 text-center align-middle font-medium text-blue-700">{operation.operationNo || '-'}</td><td className="break-words px-3 py-5 text-center align-middle">{operation.procedure || '-'}</td><td className="break-words px-3 py-5 text-center align-middle">{operation.surgeon || '-'}</td><td className="px-3 py-5 text-center align-middle"><span className={`inline-flex items-center justify-center gap-1.5 ${presentation.color}`}><i className={`size-[7px] shrink-0 rounded-full ${presentation.dot}`} />{presentation.text}</span></td></tr> })}</tbody></table></div>
    </article>
  </section>
}

function FollowUpTimeline({ patient }) {
  const [schedule, setSchedule] = useState([])
  const [activities, setActivities] = useState([])
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const load = () => Promise.all([api.getFollowUps(patient.operationNo), api.getActivities(patient.operationNo)])
      .then(([rows, activityRows]) => { if (active) { setSchedule(Array.isArray(rows[0]?.schedule) ? rows[0].schedule : []); setCurrentRoundIndex(rows[0]?.current_round_index || 0); setActivities(activityRows) } })
      .catch(() => { if (active) { setSchedule([]); setActivities([]) } })
      .finally(() => active && setLoading(false))
    load()
    const refresh = () => load()
    window.addEventListener('activities-updated', refresh)
    return () => { active = false; window.removeEventListener('activities-updated', refresh) }
  }, [patient.operationNo])

  const positionForDate = (value) => {
    if (schedule.length < 2 || !value) return 0
    const dates = schedule.map((item) => new Date(`${String(item.date || item.scheduledAt).slice(0, 10)}T00:00:00`).getTime())
    const target = new Date(value).getTime()
    if (!Number.isFinite(target) || dates.some((date) => !Number.isFinite(date))) return 0
    if (target <= dates[0]) return 7.5
    if (target >= dates[dates.length - 1]) return 92.5
    const nextIndex = dates.findIndex((date) => date > target)
    const previousIndex = Math.max(0, nextIndex - 1)
    const fraction = (target - dates[previousIndex]) / Math.max(1, dates[nextIndex] - dates[previousIndex])
    return ((previousIndex + fraction) / (schedule.length - 1)) * 100
  }

  const progress = (() => {
    if (schedule.length < 2) return schedule[0]?.status === 'COMPLETED' ? 100 : 0
    const toLocalDay = (value) => {
      if (!value) return Number.NaN
      const date = new Date(value)
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    }
    const dates = schedule.map((item) => toLocalDay(item.date || item.scheduledAt))
    if (dates.some((date) => !Number.isFinite(date))) return 0
    const today = new Date()
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    if (currentDay <= dates[0]) return 0
    if (currentDay >= dates[dates.length - 1]) return 100

    const nextIndex = dates.findIndex((date) => date > currentDay)
    const previousIndex = Math.max(0, nextIndex - 1)
    const elapsedDays = Math.floor((currentDay - dates[previousIndex]) / 86400000)
    const intervalDays = Math.max(1, Math.round((dates[nextIndex] - dates[previousIndex]) / 86400000))
    const segmentProgress = Math.min(1, elapsedDays / intervalDays)
    return ((previousIndex + segmentProgress) / (schedule.length - 1)) * 100
  })()

  return (
    <div className="timeline-card mt-3">
      <div className="timeline-card-header">
        <div className="timeline-title-container">
          <h4 className="timeline-title">ช่วงเวลาติดตามอาการคนไข้</h4>
          <span className="timeline-subtitle">รอบการติดตามมาตรฐานสำหรับหัตถการนี้</span>
        </div>
        {schedule.length > 0 && <button type="button" className="inline-flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 shadow-sm"><span>{new Date(patient.followUpCreatedAt || schedule[0].date || schedule[0].scheduledAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span><ChevronDown size={15} className="text-slate-400" /></button>}
      </div>
      {loading ? <div className="py-10 text-center text-sm text-slate-400">กำลังโหลดข้อมูลติดตาม...</div> : !schedule.length ? <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีการกำหนดรอบติดตามอาการ</div> : <><div className="timeline-track-container" style={{ paddingTop: 56, paddingBottom: 10, marginBottom: 48 }}><div className="timeline-line" style={{ top: 66, height: 4, background: '#e2e8f0' }} /><div className="timeline-line-progress" style={{ top: 66, height: 4, width: `calc((100% - 80px) * ${progress / 100})`, background: '#3b82f6' }} />{activities.map((activity) => { const position = positionForDate(activity.activity_at || activity.created_at); const at = new Date(activity.activity_at || activity.created_at); return <div key={activity.id} className="absolute z-20 -translate-x-1/2 text-center" style={{ left: `calc(40px + (100% - 80px) * ${position / 100})`, top: 17 }} title={activity.detail || activity.purpose || ''}><span className="block whitespace-nowrap text-[10px] leading-4 text-slate-500">{at.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}<br />{at.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span><span className="mx-auto mt-1 block size-[14px] rounded-full border-2 border-white bg-orange-500" /></div> })}<div className="timeline-steps">{schedule.map((item, index) => { const completed = item.status === 'COMPLETED'; const current = !completed && index === currentRoundIndex; const scheduledDate = item.date || item.scheduledAt; return <div className="timeline-step" key={item.id || `${item.day || item.round}-${index}`}>{completed ? <div className="mb-3 grid size-6 place-items-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm"><Check size={14} strokeWidth={3.5} /></div> : <div className={`mb-3 size-6 rounded-full border-[3px] border-white shadow-sm ${current ? 'bg-blue-500' : 'bg-[#666]'}`} />}<span className="timeline-step-name">{item.day || item.round || `รอบที่ ${index + 1}`}</span><span className="timeline-step-date">{scheduledDate ? new Date(`${String(scheduledDate).slice(0, 10)}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span><span className="timeline-step-time">{item.time || '-'}</span></div> })}</div></div><div className="rounded-lg bg-slate-100 px-4 py-3 text-[12px] text-slate-500">หมายเหตุ: วันที่อาจเปลี่ยนแปลงได้ตามการกำหนดของโรงพยาบาล</div><div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] text-slate-600"><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-600" />ดำเนินการสำเร็จ</span><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-blue-500" />อยู่ระหว่างติดตามดำเนินการ</span><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-orange-500" />กิจกรรมแทรก</span><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#666]" />ยังไม่เริ่มติดตาม</span><span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-red-500" />เกินกำหนด</span></div></>}
    </div>
  )
}

function ExcludeCaseModal({ patient, onClose }) {
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const canSubmit = reason && confirmed
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#334155]/45 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="exclude-title" className="relative flex w-full max-w-[512px] max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <button onClick={onClose} className="absolute right-5 top-5 z-10 rounded-lg p-1 text-[#9ca3af] hover:bg-slate-100"><X size={20} /></button>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full border-4 border-[#fda4af] bg-[#fee2e2] text-[#ef191f]"><AlertTriangle size={23} strokeWidth={2.5} /></div>
        <h2 id="exclude-title" className="mt-4 text-[20px] font-semibold leading-7 text-[#202124]">ไม่เข้าเงื่อนไขการเฝ้าระวัง SSI</h2>
        <p className="mt-2 text-[14px] text-[#6b7280]">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>
        <div className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-left text-[#20242b]"><div className="flex items-baseline gap-x-5"><strong className="text-[17px]">HN {patient.id}</strong><strong className="text-[18px]">{patient.name}</strong></div><p className="mt-2 text-[14px] font-medium text-[#4b5563]">{patient.sex || '-'} • อายุ {patient.age ?? '-'} ปี {patient.dateOfBirth ? `(${new Date(patient.dateOfBirth).toLocaleDateString('th-TH')})` : ''}</p><p className="mt-2 text-[14px] font-medium text-[#4b5563]">หัตถการ: {patient.procedure || '-'}</p><div className="mt-2 flex gap-x-6 text-[14px] font-medium text-[#4b5563]"><span>วันที่ผ่าตัด: {patient.surgeryDate || '-'}</span></div></div>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">เหตุผลที่ไม่เข้าเงื่อนไข <span className="text-red-500">*</span><select value={reason} onChange={event => setReason(event.target.value)} className="mt-2 h-[44px] w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#64748b] shadow-sm outline-none focus:border-[#175beb]"><option value="">เลือกเหตุผล</option><option>หัตถการไม่เข้าเกณฑ์ SSI Surveillance</option><option>ข้อมูลผู้ป่วยซ้ำ</option><option>ยกเลิกการผ่าตัด</option><option>เหตุผลอื่น</option></select></label>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">รายละเอียดเพิ่มเติม (ถ้ามี)<textarea className="mt-2 h-[78px] w-full resize-none rounded-lg border border-[#cbd5e1] p-3 text-[14px] shadow-sm outline-none focus:border-[#175beb]" placeholder="ระบุรายละเอียดเพิ่มเติม" /></label>
        <label className="mt-4 flex items-center gap-3 text-left text-[14px] font-medium text-[#334155]"><input checked={confirmed} onChange={event => setConfirmed(event.target.checked)} type="checkbox" className="size-5 rounded accent-[#175beb]" />ยืนยันว่าข้อมูลถูกต้องและไม่เข้าเกณฑ์การเฝ้าระวัง</label>
      </div>
      <footer className="grid min-h-[72px] shrink-0 grid-cols-2 gap-3 border-t border-[#f1f5f9] bg-[#fafafa] px-6 py-4"><button onClick={onClose} className="rounded-lg border border-[#cbd5e1] bg-white text-[14px] font-medium text-[#374151] shadow-sm">ยกเลิก</button><button disabled={!canSubmit} onClick={onClose} className={`rounded-lg text-[14px] font-medium text-white shadow-sm ${canSubmit ? 'bg-[#e92323] hover:bg-red-700' : 'cursor-not-allowed bg-[#f87171]'}`}>ยืนยันการยกออก</button></footer>
    </section>
  </div>
}

const hospitalDepartments = [
  'ศัลยกรรมทั่วไป (General Surgery)',
  'อายุรกรรม (Internal Medicine)',
  'ศัลยกรรมกระดูกและข้อ (Orthopedics)',
  'สูติ-นรีเวชกรรม (Obstetrics & Gynecology)',
  'กุมารเวชกรรม (Pediatrics)',
  'หู คอ จมูก (ENT)',
  'จักษุวิทยา (Ophthalmology)',
  'ระบบประสาทและสมอง (Neurology)',
  'ศัลยกรรมประสาท (Neurosurgery)',
  'โรคหัวใจและหลอดเลือด (Cardiology)',
  'ศัลยกรรมหัวใจและทรวงอก (Cardiothoracic Surgery)',
  'ระบบทางเดินปัสสาวะ (Urology)',
  'โรคไต (Nephrology)',
  'ระบบทางเดินอาหาร (Gastroenterology)',
  'โรคปอดและระบบทางเดินหายใจ (Pulmonology)',
  'ผิวหนัง (Dermatology)',
  'เวชศาสตร์ฟื้นฟู (Rehabilitation Medicine)',
  'เวชศาสตร์ฉุกเฉิน (Emergency Medicine)',
  'ผู้ป่วยนอกทั่วไป (General OPD)',
  'หอผู้ป่วยวิกฤต (ICU)',
]

function QueueModal({ patient, onClose, onSend }) {
  const [patientType, setPatientType] = useState(patient.patientType?.toUpperCase() || 'OPD')
  const [department, setDepartment] = useState('ศัลยกรรมทั่วไป (General Surgery)')
  const [note, setNote] = useState(patient.orHandoverNote || '')
  return <div className="fixed inset-0 z-50 bg-slate-950/45" onMouseDown={onClose}><aside className="absolute inset-y-0 right-0 w-full max-w-[708px] overflow-y-auto bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
    <header className="flex h-[85px] items-center justify-between border-b border-slate-200 px-6"><div><h2 className="text-[20px] font-semibold text-[#1f2937]">ส่งเคสไปยัง OPD/IPD Queue</h2><p className="mt-1 text-[14px] text-slate-500">กำหนดปลายทางและแผนการติดตามเบื้องต้นก่อนส่งต่อ</p></div><button onClick={onClose}><X size={20} className="text-slate-400" /></button></header>
    <div className="space-y-6 p-6">
      <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-[17px]"><h3 className="flex items-center gap-2 text-[16px] font-semibold text-blue-800"><Users size={20} />สรุปข้อมูลเคส</h3><div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">{[['ชื่อผู้ป่วย', patient.name], ['แผนกต้นทาง', patient.department], ['HN', `HN${patient.id}`], ['หัตถการ', patient.procedure], ['ความเสี่ยง SSI', patient.risk], ['ศัลยแพทย์', patient.surgeon]].map(([k, v]) => <div key={k} className="grid grid-cols-[89px_1fr]"><span className="text-slate-500">{k}</span><strong className="font-medium">{v}</strong></div>)}</div></section>
      <section className="space-y-5">{[['เลือกปลายทาง *', 'tabs'], ['เลือกแผนก *', 'select'], ['กำหนดระดับความสำคัญ *', 'priority']].map(([label, type]) => <div key={label} className="grid grid-cols-[209px_1fr] items-center"><label className="text-[14px]">{label}</label>{type === 'tabs' ? <div className="grid h-[38px] grid-cols-2 overflow-hidden rounded-lg border border-slate-300"><button type="button" onClick={() => setPatientType('OPD')} className={`border-r border-blue-400 ${patientType === 'OPD' ? 'bg-blue-50 text-blue-600' : ''}`}>OPD</button><button type="button" onClick={() => setPatientType('IPD')} className={patientType === 'IPD' ? 'bg-blue-50 text-blue-600' : ''}>IPD</button></div> : type === 'select' ? <select value={department} onChange={(event) => setDepartment(event.target.value)} className="field h-[39px]">{hospitalDepartments.map((item) => <option key={item} value={item}>{item}</option>)}</select> : <div className="grid grid-cols-3 gap-2"><button type="button" className="h-[38px] rounded-lg border border-blue-400 bg-blue-50 text-blue-600">ปกติ</button><button type="button" className="h-[38px] rounded-lg border border-slate-300">ด่วน</button><button type="button" className="h-[38px] rounded-lg border border-slate-300">เร่งด่วน</button></div>}</div>)}
        <div className="grid grid-cols-[209px_1fr]"><label className="pt-2 text-[14px]">บันทึกเบื้องต้นจาก OR</label><textarea value={note} onChange={event => setNote(event.target.value)} maxLength={1000} className="h-[96px] resize-none rounded-lg border border-slate-300 p-3 text-[14px] outline-none focus:border-[#175beb] focus:ring-2 focus:ring-blue-50" placeholder="กรอกรายละเอียดสำคัญที่ต้องการส่งต่อให้ OPD/IPD..." /></div>
      </section>
      <div className="flex h-[46px] items-center gap-3 rounded-lg bg-blue-50 px-3 text-[14px] text-blue-700"><Info size={16} />เลือกปลายทางและแผนกรับเคสก่อนส่งข้อมูล</div>
      <div className="flex justify-end gap-3 border-b border-slate-200 pb-5">
        <button onClick={onClose} className="btn-secondary h-[38px] px-6">ยกเลิก</button>
        <button onClick={() => onSend(patientType, department, note.trim())} className="btn-primary inline-flex h-[38px] items-center gap-2 px-6"><Send size={14} />ส่งเคส</button>
      </div>
      <section><h3 className="mb-4 text-[16px] font-semibold">ประวัติการส่งข้อมูล</h3><div className="rounded-lg border border-slate-200 px-4 py-10 text-center text-[13px] text-slate-400">ยังไม่มีประวัติการส่งข้อมูล</div></section>
    </div>
  </aside>
  </div>
}

function SuccessModal({ patient, onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <section role="dialog" aria-modal="true" className="relative w-full max-w-[480px] rounded-xl bg-white px-6 pb-6 pt-6 shadow-2xl">
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

        <h2 className="mt-4 text-center text-[20px] font-semibold text-[#191c1e]">ส่งข้อมูลสำเร็จ</h2>
        <p className="mt-1 text-center text-[14px] text-slate-500">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>

        {/* Patient info card */}
        <div className="mt-5 rounded-xl bg-blue-50/60 p-4 text-[14px]">
          <p className="font-semibold text-[#191c1e]">HN {patient.id}&nbsp;&nbsp;{patient.name}</p>
          <p className="mt-1 text-slate-600">{patient.sex || '-'} • อายุ {patient.age ?? '-'} ปี {patient.dateOfBirth ? `(${patient.dateOfBirth})` : ''}</p>
          <p className="mt-0.5 text-slate-600">หัตถการ: <strong className="font-semibold">{patient.procedure || '-'}</strong></p>
          <div className="mt-1 flex flex-wrap gap-x-6 text-slate-600">
            <span>วันที่ผ่าตัด: {patient.surgeryDate}</span>
            <span>วันที่จำหน่าย: -</span>
          </div>
        </div>

        <hr className="my-4 border-slate-100" />

        {/* Info rows */}
        <div className="space-y-3 text-[14px]">
          {[['วันที่ส่ง', new Date().toLocaleString('th-TH')], ['ปลายทาง', patient.patientType?.toUpperCase() || '-'], ['แผนกรับเคส', patient.receivingDepartment || '-']].map(([k, v]) => (
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
            onClick={() => { navigate(`/${patient.patientType || 'opd'}-queue`); onClose() }}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#002d73] text-[14px] font-medium text-white hover:bg-[#001d52]"
          >
            ไปหน้าคิว {patient.patientType?.toUpperCase() || 'OPD'} <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}

function AddActivityModal({ patient, onClose, onSave }) {
  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { return null } })()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [purpose, setPurpose] = useState('')
  const [location, setLocation] = useState('')
  const [staff, setStaff] = useState(currentUser?.name || '')
  const [contact1, setContact1] = useState('')
  const [contact2, setContact2] = useState('')
  const [detail, setDetail] = useState('')
  const [notifyPeriod, setNotifyPeriod] = useState('')
  const [notifyBySms, setNotifyBySms] = useState(true)
  const isAssessment = type === 'ประเมินนอกเวลาตามรอบ'
  const canSave = Boolean(date && time && type && purpose && staff && contact1 && detail)

  if (isAssessment) return <div className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-slate-900/60 p-4"><section className="out-of-round-modal flex w-full flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl" style={{ maxWidth: '1180px', maxHeight: 'calc(100vh - 32px)' }}><header className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-5 py-4"><div><h2 className="text-[20px] font-semibold text-[#1e293b]">ประเมินนอกเวลาตามรอบ</h2><p className="mt-1 text-[13px] text-slate-500">ใช้แบบประเมินเดียวกับการประเมินตามรอบ โดยไม่เปลี่ยนรอบนัดเดิม</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="ปิด"><X size={20}/></button></header><div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-5"><EvaluationForm selectedPatient={patient} mode="out-of-round" onCompleted={({ cancelled, failedUploads, result }) => { if (cancelled) { setType(''); return } if (failedUploads) alert(`บันทึกผลแล้ว แต่มีไฟล์แนบ ${failedUploads} ไฟล์ที่อัปโหลดไม่สำเร็จ`); if (result === 'suspect_ssi') alert('บันทึกผลสงสัย SSI และส่งเคสไปยังรายการเคสสงสัยแล้ว'); onClose() }} /></div></section></div>

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

        <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-4 flex gap-4 items-center text-[13px] text-[#424752] shadow-sm">
          <div className="grid size-[64px] shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-[#175beb]">
            <UserRound size={32} strokeWidth={1.8} />
          </div>
          <div className="flex-1"><p className="text-[11px] text-slate-400">HN {patient.id}</p><strong className="text-[15px] font-semibold text-[#191c1e]">{patient.name}</strong><p className="mt-1 text-[12px] text-slate-500">{patient.sex || '-'} • อายุ {patient.age ?? '-'} ปี</p><p className="mt-1 text-[12px] text-slate-500">หัตถการ: {patient.procedure || '-'}</p></div>
          <div className="text-right text-[12px] text-slate-500"><p>ศัลยแพทย์: {patient.surgeon || '-'}</p><p className="mt-1">แผนกติดตาม: {patient.receivingDepartment || patient.patientType?.toUpperCase() || '-'}</p></div>
        </div>

        {/* รายละเอียดกิจกรรม */}
        <h3 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-2 mt-5">
          รายละเอียดกิจกรรม
        </h3>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">ประเภทกิจกรรม <span className="text-red-500">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="form-select mt-1">
              <option value="">เลือกประเภทกิจกรรม</option>
              <option value="โทรติดตามอาการ">โทรติดตามอาการ</option>
              <option value="ส่งแบบประเมิน">ส่งแบบประเมิน</option>
              <option value="พบแพทย์ที่รพ.">พบแพทย์ที่รพ.</option>
              <option value="ประเมินนอกเวลาตามรอบ">ประเมินนอกเวลาตามรอบ</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">วัตถุประสงค์ <span className="text-red-500">*</span></label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="form-select mt-1">
              <option value="">เลือกวัตถุประสงค์</option>
              <option value="ติดตามอาการหลังผ่าตัด">ติดตามอาการหลังผ่าตัด</option>
              <option value="ประเมินอาการสงสัย SSI">ประเมินอาการสงสัย SSI</option>
              <option value="ทำแผลผ่าตัด">ทำแผลผ่าตัด</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">วันที่นัดหมายกิจกรรม <span className="text-red-500">*</span></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input mt-1" />
          </div>

          <div className="form-group">
            <label className="text-[13px] font-medium text-slate-700">เวลานัดหมาย <span className="text-red-500">*</span></label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-input mt-1" />
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
            <input type="text" value={staff} onChange={(e) => setStaff(e.target.value)} className="form-input mt-1" placeholder="ชื่อผู้รับผิดชอบ" />
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
            <label className="text-[13px] font-medium text-slate-700">ช่องทางการติดต่อสำรอง</label>
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
            <label className="text-[13px] font-medium text-slate-700">ช่วงเวลาแจ้งเตือน</label>
            <select disabled={!notifyBySms} value={notifyPeriod} onChange={(e) => setNotifyPeriod(e.target.value)} className="form-select mt-1 h-9 py-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">ไม่แจ้งเตือน</option>
              <option value="ก่อนถึงเวลานัด 24 ชั่วโมง">ก่อนถึงเวลานัด 24 ชั่วโมง</option>
              <option value="ก่อนถึงเวลานัด 12 ชั่วโมง">ก่อนถึงเวลานัด 12 ชั่วโมง</option>
              <option value="ก่อนถึงเวลานัด 2 ชั่วโมง">ก่อนถึงเวลานัด 2 ชั่วโมง</option>
            </select>
          </div>

          <label className="flex w-fit cursor-pointer items-start gap-2 pt-2 select-none">
            <input
              type="checkbox"
              checked={notifyBySms}
              onChange={(event) => {
                setNotifyBySms(event.target.checked)
                if (!event.target.checked) setNotifyPeriod('')
              }}
              className="sr-only"
            />
            <span className={`grid size-5 shrink-0 place-items-center rounded border transition-colors ${notifyBySms ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
              <Check size={14} strokeWidth={3} />
            </span>
            <div>
              <span className="text-[13px] font-medium text-slate-700">ช่องทางแจ้งเตือนผู้ป่วย</span>
              <p className="text-[12px] text-slate-500 mt-0.5">SMS</p>
            </div>
          </label>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-blue-300 my-6"></div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-[#f8fafc] px-6 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-100">
            ยกเลิก
          </button>
          <button disabled={!canSave} onClick={() => onSave({ activityType: type, activityAt: `${date}T${time}:00+07:00`, purpose, location, staff, contactPrimary: contact1, contactSecondary: contact2 || null, detail, notifyPeriod: notifyBySms ? (notifyPeriod || null) : null })} className="rounded-xl bg-[#175beb] px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={16} />
            บันทึกกิจกรรม
          </button>
        </div>
      </section>
    </div>
  )
}

function SuspectedCaseDetail({ patient, operations = [patient] }) {
  const { id, subtab } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  const source = new URLSearchParams(search).get('from') || 'doctor'
  const backPath = source === 'confirmed' ? '/confirmed-ssi' : source === 'suspected' ? '/suspected-ssi' : '/doctor-review'

  const tabs = [
    { id: 'info', name: 'ข้อมูลคนไข้' },
    { id: 'evaluations', name: 'ประวัติการประเมินล่าสุด' },
    { id: 'docs', name: 'เอกสาร' },
    { id: 'images', name: 'รูปภาพ' }
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
  const [assessmentItems, setAssessmentItems] = useState([])
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false)
  const [evaluationHistory, setEvaluationHistory] = useState([])
  const [selectedHistory, setSelectedHistory] = useState(null)
  const caseProcedures = operations.map(operation => ({ operationNo: operation.operationNo, name: operation.procedure, surgeon: operation.surgeon }))
  const ssiText = patient.ssiStatus === 'CONFIRMED_SSI' ? 'ยืนยัน SSI' : patient.ssiStatus === 'SUSPECTED_SSI' ? 'สงสัย SSI' : patient.ssiStatus === 'NOT_SSI' ? 'ไม่เข้าเกณฑ์ SSI' : 'ยังไม่ประเมิน'

  useEffect(() => {
    let active = true
    Promise.all([api.getEvaluations(patient.operationNo), api.getSettings(), api.getFollowUps(patient.operationNo), api.getActivities(patient.operationNo), api.getCaseDocuments(patient.operationNo)])
      .then(([evaluations, settings, followUps, activities, documents]) => {
        if (!active) return
        const latestScheduledEvaluation = evaluations.find(item => !String(item.round_key || '').startsWith('ACTIVITY:'))
        const data = latestScheduledEvaluation?.data || {}
        const defaultSymptomNames = { fever: 'มีไข้ (อุณหภูมิ ≥ 38°C)', pain: 'ปวดแผล/เจ็บแผลเพิ่มขึ้น', swell: 'แผลบวม', red: 'แผลแดง', pus: 'มีน้ำเหลือง/หนองจากแผล', smell: 'กลิ่นผิดปกติจากแผล', gap: 'แผลแยก' }
        const symptomNames = new Map([...Object.entries(defaultSymptomNames), ...(settings.ssiCriteria || []).map(item => [String(item.id), item.name])])
        const statusText = { has: 'มี', yes: 'มี', no: 'ไม่มี', unknown: 'ไม่ทราบ' }
        const items = Object.entries(data.symptoms || {})
          .filter(([, value]) => value)
          .map(([key, value]) => ({ label: symptomNames.get(String(key)) || key, value: statusText[value] || String(value) }))
        if (data.otherSymptom) items.push({ label: 'อาการอื่นๆ', value: data.otherSymptom })
        const otherLabels = { nausea: 'คลื่นไส้ / อาเจียน', musclePain: 'ปวดข้อ/ปวดกล้ามเนื้อ', other: 'อาการอื่นๆ เพิ่มเติม' }
        Object.entries(data.otherCheckboxes || {}).filter(([, value]) => value).forEach(([key]) => items.push({ label: otherLabels[key] || key, value: key === 'other' && data.otherCheckboxesText ? data.otherCheckboxesText : 'มี' }))
        const treatmentLabels = { none: 'ไม่ได้ไปพบแพทย์', metDoctor: 'ไปพบแพทย์แล้ว (OPD/IPD)', other: data.dischargeTreatmentText || 'อื่นๆ' }
        if (data.dischargeTreatment) items.push({ label: 'การรักษาหลังจำหน่าย', value: treatmentLabels[data.dischargeTreatment] || data.dischargeTreatment })
        if (data.followUpMethod) items.push({ label: 'วิธีการติดตาม', value: data.followUpMethod })
        if (data.followerName) items.push({ label: 'ผู้ติดตาม', value: data.followerName })
        if (data.contactPhone) items.push({ label: 'เบอร์ของเจ้าหน้าที่ที่ติดตาม', value: data.contactPhone })
        if (data.remarks) items.push({ label: 'หมายเหตุการติดตาม', value: data.remarks })
        if (data.evalRemarks) items.push({ label: 'การจัดการ/คำแนะนำ', value: data.evalRemarks })
        setAssessmentItems(items)

        const thaiDateTime = value => { if (!value) return { date: '-', time: '-' }; const parsed = new Date(value); return { date: parsed.toLocaleDateString('th-TH'), time: parsed.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) } }
        const resultText = result => result === 'recovery_clear' ? 'ประเมินว่าหายจากการติดเชื้อ' : /suspect/i.test(result || '') ? 'สงสัย SSI' : /confirmed|positive/i.test(result || '') ? 'ยืนยัน SSI' : 'ไม่เข้าเกณฑ์ SSI'
        const detailsFrom = evaluation => {
          const saved = evaluation?.data || {}
          const detailRows = Object.entries(saved.symptoms || {}).filter(([, value]) => value).map(([key, value]) => ({ label: symptomNames.get(String(key)) || key, value: statusText[value] || String(value) }))
          if (saved.otherSymptom) detailRows.push({ label: 'อาการอื่นๆ', value: saved.otherSymptom })
          if (saved.followUpMethod) detailRows.push({ label: 'วิธีการติดตาม', value: saved.followUpMethod })
          if (saved.followerName) detailRows.push({ label: 'ผู้ติดตาม', value: saved.followerName })
          if (saved.contactPhone) detailRows.push({ label: 'เบอร์ของเจ้าหน้าที่ที่ติดตาม', value: saved.contactPhone })
          if (saved.remarks) detailRows.push({ label: 'หมายเหตุการติดตาม', value: saved.remarks })
          if (saved.evalRemarks) detailRows.push({ label: 'การจัดการ/คำแนะนำ', value: saved.evalRemarks })
          if (saved.dischargeTreatment) detailRows.push({ label: 'การรักษาหลังจำหน่าย', value: treatmentLabels[saved.dischargeTreatment] || saved.dischargeTreatment })
          return detailRows
        }
        const schedule = Array.isArray(followUps[0]?.schedule) ? followUps[0].schedule : []
        const scheduledRows = schedule.map((round, index) => {
          const evaluation = evaluations.find(item => String(item.round_key) === String(round.id || round.day))
          const when = evaluation ? thaiDateTime(evaluation.evaluated_at) : { date: round.date || '-', time: round.time || '-' }
          const saved = evaluation?.data || {}
          const roundDocuments = (documents || []).filter(doc => !doc.follow_up_round || doc.follow_up_round === round.day)
          const flaggedForSsi = /suspect|confirmed|positive/i.test(evaluation?.result || '')
          return { id: `round-${round.id || index}`, sortAt: evaluation?.evaluated_at || `${round.date || '9999-12-31'}T${round.time || '23:59'}`, roundNumber: index + 1, dayLabel: round.day || `รอบที่ ${index + 1}`, date: when.date, time: when.time, nurseName: evaluation?.evaluated_by || followUps[0]?.assigned_to || '-', status: evaluation ? 'completed' : 'pending', sspiFlag: flaggedForSsi, ssiStatus: flaggedForSsi ? patient.ssiStatus : null, woundCondition: evaluation ? (saved.evalRemarks || saved.remarks || saved.otherSymptom || 'บันทึกผลการประเมินแล้ว') : '', riskLevel: evaluation ? resultText(evaluation.result) : '', otherSymptoms: saved.otherSymptom || '-', reason: null, contactChannel: { hasPhone: /โทร|phone/i.test(saved.followUpMethod || ''), fileCount: roundDocuments.filter(doc => !String(doc.mime_type || '').startsWith('image/')).length, imageCount: roundDocuments.filter(doc => String(doc.mime_type || '').startsWith('image/')).length }, details: evaluation ? detailsFrom(evaluation) : [], rawResult: evaluation?.result || null }
        })
        const activityRows = (activities || []).map((activity, index) => { const when = thaiDateTime(activity.activity_at || activity.created_at); const evaluation = evaluations.find(item => String(item.round_key) === `ACTIVITY:${activity.id}`); const flaggedForSsi = /suspect|confirmed|positive/i.test(evaluation?.result || ''); return { id: `activity-${activity.id}`, sortAt: activity.activity_at || activity.created_at, roundNumber: index + 1, dayLabel: 'กิจกรรมแทรก', date: when.date, time: when.time, nurseName: evaluation?.evaluated_by || activity.staff || '-', status: 'interrupt_activity', sspiFlag: flaggedForSsi, recoveryFlag: evaluation?.result === 'recovery_clear', ssiStatus: flaggedForSsi ? patient.ssiStatus : null, woundCondition: activity.purpose || activity.activity_type || 'กิจกรรมแทรก', riskLevel: evaluation ? resultText(evaluation.result) : '', otherSymptoms: '', reason: activity.detail || '-', contactChannel: { hasPhone: Boolean(activity.contact_primary), fileCount: 0, imageCount: 0 }, details: evaluation ? [...detailsFrom(evaluation), { label: 'ประเภทกิจกรรม', value: activity.activity_type || '-' }] : [{ label: 'ประเภทกิจกรรม', value: activity.activity_type || '-' }, { label: 'วัตถุประสงค์', value: activity.purpose || '-' }, { label: 'รายละเอียด', value: activity.detail || '-' }, { label: 'สถานที่', value: activity.location || '-' }, { label: 'ผู้ดำเนินการ', value: activity.staff || '-' }] } })
        setEvaluationHistory([...scheduledRows, ...activityRows].sort((a, b) => String(a.sortAt).localeCompare(String(b.sortAt))))
      })
      .catch(() => { if (active) { setAssessmentItems([]); setEvaluationHistory([]) } })
    return () => { active = false }
  }, [patient.operationNo, patient.ssiStatus])

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
        <Link to={backPath} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]">
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
                onClick={() => navigate(`/suspected-cases/${id}/${tab.id}?from=${source}`)}
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
      {!['docs', 'images'].includes(subtab) && <FollowUpTimeline patient={patient} />}

      {/* Content */}
      <div className="mt-3">
        {subtab === 'info' && (
          <>
          <OperationSurgerySections operations={operations} />
          <div className="mt-3 grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
            <div className="contents">
              {/* Contact info card */}
              <div className="sub-info-card order-2 h-full p-5">
                <div className="sub-info-card-header mb-4 border-b border-slate-100 pb-3">
                  <h4 className="sub-info-card-title flex items-center gap-2 font-semibold text-[#002d73]">
                    ข้อมูลติดต่อ (Contact)
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">เบอร์โทรหลัก</span>
                    <strong className="text-slate-700">{formatThaiPhoneNumber(patient.phonePrimary) || '-'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">เบอร์โทร 2</span>
                    <strong className="text-slate-700">{formatThaiPhoneNumber(patient.phoneSecondary) || '-'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2">
                    <span className="text-slate-400">Line</span>
                    <strong className="text-slate-700">{patient.lineId || '-'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-2 sm:col-span-2">
                    <span className="text-slate-400">อีเมล</span>
                    <strong className="text-slate-700">{patient.email || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Procedures table */}
              <div className="sub-info-card order-3 p-5 lg:col-span-2">
                <div className="sub-info-card-header mb-4 border-b border-slate-100 pb-3">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">
                    รายการหัตถการในเคส (มี {caseProcedures.length} รายการ)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-slate-600">
                    <thead className="h-9 bg-slate-50 font-medium text-slate-700">
                      <tr>
                        <th className="px-4 text-left">ลำดับ</th>
                        <th className="px-4 text-left">Operation Number</th>
                        <th className="px-4 text-left">หัตถการ</th>
                        <th className="px-4 text-left">ศัลยแพทย์</th>
                        <th className="px-4 text-left">สถานะ SSI</th>
                      </tr>
                    </thead>
                    <tbody>{caseProcedures.map((procedure, index) => <tr key={procedure.operationNo || `${procedure.name}-${index}`} className="h-12 border-t border-slate-100"><td className="px-4">{index + 1}</td><td className="px-4 font-medium text-blue-700">{procedure.operationNo || '-'}</td><td className="px-4 font-medium text-slate-800">{procedure.name || '-'}</td><td className="px-4">{procedure.surgeon || '-'}</td><td className={`px-4 font-semibold ${patient.ssiStatus === 'SUSPECTED_SSI' ? 'text-orange-500' : patient.ssiStatus === 'CONFIRMED_SSI' ? 'text-red-600' : patient.ssiStatus === 'NOT_SSI' ? 'text-emerald-600' : 'text-slate-400'}`}>● {ssiText}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="order-1">
              <div className="sub-info-card h-full p-5">
                <div className="sub-info-card-header mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="sub-info-card-title text-[#002d73] font-semibold">
                    ความเสี่ยง SSI เบื้องต้น
                  </h4>
                  {assessmentItems.length > 5 && <button type="button" onClick={() => setAssessmentModalOpen(true)} className="text-[12px] font-semibold text-blue-600 hover:underline">ดูรายการทั้งหมด</button>}
                </div>

                <div className="space-y-3 text-[13.5px]">
                  {!assessmentItems.length && <p className="py-6 text-center text-[13px] text-slate-400">ยังไม่มีข้อมูลจากแบบประเมิน</p>}
                  {assessmentItems.slice(0, 5).map((item, index) => <div key={`${item.label}-${index}`} className="flex justify-between gap-4 border-b border-slate-100/50 pb-2"><span className="text-slate-500">{item.label}</span><span className="text-right font-semibold text-slate-700">{item.value}</span></div>)}
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {/* evaluations list tab */}
        {subtab === 'evaluations' && (
          evaluationHistory.length ? <EvaluationHistory
            evaluations={evaluationHistory}
            activeCardIndex={null}
            onViewDetail={(item) => setSelectedHistory(item)}
            onEvaluate={() => { }}
            showLegend={false}
          /> : <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">ยังไม่มีรอบติดตามหรือกิจกรรมที่บันทึกไว้</div>
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
          <DocsView selectedPatient={patient} operations={operations} viewMode="documents" />
        )}

        {subtab === 'images' && (
          <DocsView selectedPatient={patient} operations={operations} viewMode="images" />
        )}
      </div>

      {assessmentModalOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setAssessmentModalOpen(false)}><section className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}><header className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="text-[18px] font-semibold text-[#002d73]">ข้อมูลแบบประเมินทั้งหมด</h3><p className="mt-1 text-[12px] text-slate-500">ข้อมูลล่าสุดที่เจ้าหน้าที่บันทึกในระบบ</p></div><button type="button" onClick={() => setAssessmentModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิด"><X size={20} /></button></header><div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto px-6">{assessmentItems.map((item, index) => <div key={`${item.label}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 py-4 text-[14px]"><span className="text-slate-500">{item.label}</span><strong className="text-right font-medium text-slate-800">{item.value}</strong></div>)}</div><footer className="flex justify-end border-t border-slate-200 px-6 py-4"><button type="button" className="btn-primary" onClick={() => setAssessmentModalOpen(false)}>ปิด</button></footer></section></div>}
      {selectedHistory && <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setSelectedHistory(null)}><section className="max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}><header className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="text-[18px] font-semibold text-[#002d73]">{selectedHistory.status === 'interrupt_activity' ? 'รายละเอียดกิจกรรมแทรก' : `รายละเอียดการประเมิน ${selectedHistory.dayLabel}`}</h3><p className="mt-1 text-[12px] text-slate-500">{selectedHistory.date} | {selectedHistory.time} โดย {selectedHistory.nurseName}</p></div><button type="button" onClick={() => setSelectedHistory(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิด"><X size={20} /></button></header><div className="max-h-[62vh] overflow-y-auto px-6"><div className="grid grid-cols-2 gap-4 border-b border-slate-100 py-4 text-[14px]"><span className="text-slate-500">สถานะ</span><strong className={selectedHistory.sspiFlag ? 'text-orange-500' : 'text-emerald-600'}>{selectedHistory.status === 'interrupt_activity' ? 'กิจกรรมเสร็จสิ้น' : selectedHistory.riskLevel || 'ประเมินเสร็จสิ้น'}</strong></div>{selectedHistory.details?.length ? selectedHistory.details.map((detail, index) => <div key={`${detail.label}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 border-b border-slate-100 py-4 text-[14px]"><span className="text-slate-500">{detail.label}</span><strong className="text-right font-medium text-slate-800">{detail.value}</strong></div>) : <p className="py-8 text-center text-sm text-slate-400">ไม่มีรายละเอียดเพิ่มเติม</p>}</div><footer className="flex justify-end border-t border-slate-200 px-6 py-4"><button type="button" className="btn-primary" onClick={() => setSelectedHistory(null)}>ปิด</button></footer></section></div>}

    </div>
  );
}
