import { ArrowLeft, Check, ChevronLeft, ChevronRight, Info, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { PatientInfoCard } from './CaseDetailPage.jsx'

const DAY_TEMPLATES = {
  30: [1, 7, 14, 21, 30],
  90: [1, 7, 14, 21, 30, 60, 90],
}

const toDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (value, days) => {
  const date = new Date(value)
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days - 1)
  return toDateInput(date)
}

const dayNumberOf = item => Number(String(item.day || '').match(/\d+/)?.[0])
const makeSchedule = (baseDate, templateDays, configuredSchedules = [], defaultMethod = '') => (configuredSchedules.length
  ? configuredSchedules.filter(item => item.enabled !== false && dayNumberOf(item) <= templateDays).map(dayNumberOf)
  : DAY_TEMPLATES[templateDays]).map((day) => ({
  id: crypto.randomUUID(),
  day: `Day ${day}`,
  dayNumber: day,
  date: addDays(baseDate, day),
  time: '09:00',
  method: defaultMethod,
  note: '',
  status: 'PENDING',
}))

const ssiPresentation = (result) => {
  if (!result) return { text: 'ยังไม่ประเมิน', className: 'text-slate-500', dot: 'bg-slate-400' }
  if (/suspect/i.test(result)) return { text: 'สงสัย SSI', className: 'text-orange-500', dot: 'bg-orange-500' }
  if (/confirmed|positive|infected_ssi|^ssi$/i.test(result)) return { text: 'เข้าเกณฑ์', className: 'text-red-600', dot: 'bg-red-600' }
  return { text: 'ไม่เข้าเกณฑ์', className: 'text-emerald-600', dot: 'bg-emerald-500' }
}

export default function CreateFollowUpPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [templateDays, setTemplateDays] = useState(30)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [schedule, setSchedule] = useState([])
  const [selectedProcedureIds, setSelectedProcedureIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [configuredSchedules, setConfiguredSchedules] = useState([])
  const [configuredMethods, setConfiguredMethods] = useState([])

  // Day 1 starts on the calendar date that the patient leaves the operating room.
  // Older records may not have endAt, so retain surgery time/date as a safe fallback.
  const baseDate = useMemo(() => patient?.endAt || patient?.startAt || patient?.episodeDate || new Date().toISOString(), [patient])
  const status = ssiPresentation(evaluationResult)
  const procedures = useMemo(() => patient ? [
    { id: 'primary', name: patient.procedure, surgeon: patient.surgeon },
    ...(patient.secondaryOperation ? [{ id: 'secondary', name: patient.secondaryOperation, surgeon: patient.secondSurgeon || patient.surgeon }] : []),
  ].filter((item) => item.name) : [], [patient])

  useEffect(() => {
    let active = true
    api.getPatient(id)
      .then(async (data) => {
        if (!active) return
        setPatient(data)
        setSelectedProcedureIds(data.procedure ? ['primary'] : [])
        const evaluations = await api.getEvaluations(data.operationNo)
        if (active) setEvaluationResult(evaluations[0]?.result || null)
      })
      .catch((reason) => active && setError(reason.message || 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  useEffect(() => {
    api.getSettings().then(settings => {
      setConfiguredSchedules((settings.schedules || []).filter(item => item.enabled !== false))
      setConfiguredMethods((settings.methods || []).filter(item => item.name))
    }).catch(() => { setConfiguredSchedules([]); setConfiguredMethods([]) })
  }, [])

  useEffect(() => {
    if (patient && autoCalculate) setSchedule(makeSchedule(baseDate, templateDays, configuredSchedules, configuredMethods[0]?.name))
  }, [patient, baseDate, templateDays, autoCalculate, configuredSchedules, configuredMethods])

  const updateRow = (rowId, field, value) => setSchedule((rows) => rows.map((row) => row.id === rowId ? { ...row, [field]: value } : row))

  const addRound = () => setSchedule((rows) => [...rows, {
    id: crypto.randomUUID(), day: 'รอบกำหนดเอง', dayNumber: null,
    date: '', time: '09:00', method: configuredMethods[0]?.name || '', note: '', status: 'PENDING',
  }])

  const save = async () => {
    setSaving(true)
    try {
      const selectedProcedures = procedures.filter((item) => selectedProcedureIds.includes(item.id))
      await api.createFollowUp(patient.operationNo, { templateDays, autoCalculate, schedule, selectedProcedures })
      window.dispatchEvent(new Event('operations-updated'))
      navigate('/my-follow-ups')
    } catch (reason) {
      setError(reason.message || 'สร้าง Follow-up ไม่สำเร็จ')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="rounded-xl border bg-white p-10 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
  if (error && !patient) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>

  return <div className="space-y-4">
    <header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold text-[#175beb]">สร้างบันทึกการเฝ้าระวัง (Create Follow-up)</h1><p className="mt-1 text-sm text-slate-500">วันติดตามคำนวณจากวันที่ออกจากห้องผ่าตัด {new Date(baseDate).toLocaleDateString('th-TH')}</p></div><button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={15} />กลับ</button></header>
    <PatientInfoCard patient={patient} />

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-[15px] font-semibold">1. เลือกหัตถการที่จะติดตาม</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200"><table className="w-full text-[13px]"><thead className="h-11 bg-slate-50"><tr><th className="w-20 px-4 text-center">เลือก</th><th className="w-20 px-4 text-center">ลำดับ</th><th className="px-4 text-left">หัตถการ/ตำแหน่งแผล</th><th className="px-4 text-left">ศัลยแพทย์</th><th className="px-4 text-left">สถานะ SSI</th></tr></thead><tbody>{procedures.map((procedure, index) => <tr key={procedure.id} className="h-14 border-t"><td className="px-4 text-center"><input type="checkbox" checked={selectedProcedureIds.includes(procedure.id)} onChange={(event) => setSelectedProcedureIds((ids) => event.target.checked ? [...ids, procedure.id] : ids.filter((item) => item !== procedure.id))} className="size-4 accent-blue-600" /></td><td className="px-4 text-center font-medium">{index + 1}</td><td className="px-4">{procedure.name}</td><td className="px-4">{procedure.surgeon || '-'}</td><td className={`px-4 font-medium ${status.className}`}><span className={`mr-2 inline-block size-2 rounded-full ${status.dot}`} />{status.text}</td></tr>)}</tbody></table></div>
      <p className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700"><Info size={15} />สถานะ SSI จะเปลี่ยนตามผลประเมินจริงเท่านั้น</p>
    </section>

    <section className="grid gap-4 xl:grid-cols-[330px_1fr]">
      <div className="space-y-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold">2. เลือก Template Follow-up</h2>
          {[30, 90].map((days) => <label key={days} className={`mt-4 flex cursor-pointer gap-3 rounded-xl border p-4 ${templateDays === days ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200'}`}><input type="radio" checked={templateDays === days} onChange={() => setTemplateDays(days)} className="mt-1 accent-blue-600" /><span><strong>Follow-up Day {days}</strong><small className="mt-1 block text-slate-500">{(configuredSchedules.length ? configuredSchedules.map(dayNumberOf).filter(day => day <= days) : DAY_TEMPLATES[days]).map((day) => `Day ${day}`).join(', ') || 'ยังไม่มีรอบที่เปิดใช้งาน'}</small></span></label>)}
        </article>
        <ScheduleCalendar baseDate={baseDate} schedule={schedule} />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">3. กำหนดรอบติดตาม</h2><label className="flex items-center gap-2 text-sm"><span>คำนวณวันอัตโนมัติ</span><input type="checkbox" checked={autoCalculate} onChange={(event) => { const enabled = event.target.checked; setAutoCalculate(enabled); setSchedule(enabled ? makeSchedule(baseDate, templateDays, configuredSchedules, configuredMethods[0]?.name) : []) }} className="size-4 accent-blue-600" /></label></div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[800px] text-[13px]"><thead className="h-11 bg-slate-50"><tr><th className="px-3 text-left">รอบ</th><th className="px-3 text-left">วันที่ติดตาม</th><th className="px-3 text-left">เวลา</th><th className="px-3 text-left">วิธีติดตาม</th><th className="px-3 text-left">หมายเหตุ</th><th /></tr></thead><tbody>{schedule.map((row) => <tr key={row.id} className="h-14 border-t border-slate-100"><td className="px-3"><input value={row.day} onChange={(e) => updateRow(row.id, 'day', e.target.value)} className="field h-9 w-32" /></td><td className="px-3"><input type="date" value={row.date} onChange={(e) => updateRow(row.id, 'date', e.target.value)} className="field h-9" /></td><td className="px-3"><input type="time" value={row.time} onChange={(e) => updateRow(row.id, 'time', e.target.value)} className="field h-9" /></td><td className="px-3"><select value={row.method} onChange={(e) => updateRow(row.id, 'method', e.target.value)} className="field h-9"><option>โทรศัพท์ + ส่งรูปแผล</option><option>โทรศัพท์</option><option>LINE</option><option>พบแพทย์</option></select></td><td className="px-3"><input value={row.note} onChange={(e) => updateRow(row.id, 'note', e.target.value)} className="field h-9 w-full" placeholder="หมายเหตุ" /></td><td className="px-3"><button onClick={() => setSchedule((rows) => rows.filter((item) => item.id !== row.id))} className="text-red-500"><Trash2 size={16} /></button></td></tr>)}</tbody></table><button onClick={addRound} className="flex w-full items-center justify-center gap-2 border-t border-dashed py-3 text-sm font-medium text-blue-600"><Plus size={16} />เพิ่มรอบติดตามเอง</button></div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700"><span>Template {templateDays} วัน</span><strong>รวม {schedule.length} รอบติดตาม</strong></div>
      </article>
    </section>

    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <footer className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4"><button onClick={() => navigate(-1)} className="btn-secondary">ยกเลิก</button><button disabled={saving || !schedule.length || !selectedProcedureIds.length} onClick={save} className="btn-primary disabled:opacity-50"><Check size={15} />{saving ? 'กำลังบันทึก...' : 'สร้าง Follow-up'}</button></footer>
  </div>
}

function ScheduleCalendar({ baseDate, schedule }) {
  const initial = new Date(baseDate)
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
  useEffect(() => {
    const date = new Date(baseDate)
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }, [baseDate])

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const previousMonthDays = new Date(year, month, 0).getDate()
  const highlighted = new Set(schedule.map((item) => item.date))
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstWeekday + 1
    if (dayOffset < 1) return { day: previousMonthDays + dayOffset, date: new Date(year, month - 1, previousMonthDays + dayOffset), outside: true }
    if (dayOffset > daysInMonth) return { day: dayOffset - daysInMonth, date: new Date(year, month + 1, dayOffset - daysInMonth), outside: true }
    return { day: dayOffset, date: new Date(year, month, dayOffset), outside: false }
  })
  const monthLabel = new Intl.DateTimeFormat('th-TH', { month: 'short', year: 'numeric' }).format(visibleMonth)

  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><button type="button" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))} className="text-slate-400"><ChevronLeft size={17} /></button><strong className="text-sm">{monthLabel}</strong><button type="button" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))} className="text-slate-400"><ChevronRight size={17} /></button></div>
    <div className="mt-5 grid grid-cols-7 gap-y-3 text-center text-xs">{['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => <span key={day} className="font-medium text-slate-400">{day}</span>)}{cells.map((cell, index) => { const key = toDateInput(cell.date); const active = highlighted.has(key); return <span key={`${key}-${index}`} className={`mx-auto grid size-7 place-items-center rounded-full ${active ? 'bg-blue-600 font-semibold text-white' : cell.outside ? 'text-slate-300' : 'text-slate-700'}`}>{cell.day}</span> })}</div>
    {!schedule.length && <p className="mt-4 text-center text-xs text-slate-400">เพิ่มรอบติดตามเพื่อแสดงวันที่บนปฏิทิน</p>}
  </article>
}
