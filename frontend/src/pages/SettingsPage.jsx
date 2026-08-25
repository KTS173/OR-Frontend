import { Bell, Calendar, CheckCircle2, Database, Edit2, Info, Plus, RefreshCw, Save, Settings, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [notifSubTab, setNotifSubTab] = useState('pre') // 'pre' (ตั้งค่าแจ้งเตือนล่วงหน้า) or 'template' (จัดการ Template แจ้งเตือน)
  const [editor, setEditor] = useState(null)
  const [notice, setNotice] = useState(null)

  // 1. SSI Criteria State
  const [ssiCriteria, setSsiCriteria] = useState([
    { id: 'fever', name: 'มีไข้ (อุณหภูมิ ≥ 38°C)', enabled: true },
    { id: 'pain', name: 'ปวดแผล/เจ็บแผลเพิ่มขึ้น', enabled: true },
    { id: 'swell', name: 'แผลบวม', enabled: true },
    { id: 'red', name: 'แผลแดง', enabled: true },
    { id: 'pus', name: 'มีน้ำเหลือง/หนองจากแผล', enabled: true },
    { id: 'smell', name: 'กลิ่นผิดปกติจากแผล', enabled: true },
    { id: 'gap', name: 'แผลแยก', enabled: true },
  ])

  // 2. Follow-up Schedule State
  const [schedules, setSchedules] = useState([
    { id: 1, order: '1', day: 'Day 1', desc: 'โทรประเมินครั้งแรก', enabled: true },
    { id: 2, order: '2', day: 'Day 7', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 3, order: '3', day: 'Day 14', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 4, order: '4', day: 'Day 21', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 5, order: '5', day: 'Day 28', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 6, order: '6', day: 'Day 30', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 7, order: '6', day: 'Day 60', desc: 'ประเมินอาการและรูปแผล', enabled: true },
    { id: 8, order: '6', day: 'Day 90', desc: 'ประเมินอาการและรูปแผล', enabled: true },
  ])

  const [methods, setMethods] = useState([
    { id: 1, name: 'โทรศัพท์ + Patient Portal' },
    { id: 2, name: 'ประเมินอาการและรูปแผล' },
    { id: 3, name: 'แพทย์เรียกพบเข้าตรวจ' },
  ])
  const [riskLevels, setRiskLevels] = useState([
    { id: 'low', name: 'ต่ำ', min: 0, max: 24, color: '#10b981' },
    { id: 'moderate', name: 'ปานกลาง', min: 25, max: 50, color: '#f59e0b' },
    { id: 'high', name: 'สูง', min: 51, max: 74, color: '#ef4444' },
    { id: 'critical', name: 'สูงมาก', min: 75, max: 100, color: '#7f1d1d' },
  ])

  // 3. HIS Sync Settings State
  const [syncFreq, setSyncFreq] = useState('')
  const [syncStart, setSyncStart] = useState('')
  const [syncEnd, setSyncEnd] = useState('')
  const [syncEnabled, setSyncEnabled] = useState(false)

  // 4. SMS Alerts Config State
  const [alertTypes, setAlertTypes] = useState({
    followUpDue: false, appointmentReminder: false, noAssessmentResponse: false,
    overdue: false, prepAlert: false, others: false
  })

  const [staffRoles, setStaffRoles] = useState({
    orStaff: false, physician: false, ipdNurse: false, opdNurse: false, admin: false
  })

  const [staffChannels, setStaffChannels] = useState({
    sms: false, dashboard: false
  })

  const [staffConditions, setStaffConditions] = useState({
    hasPhone: false, noResponseOnly: false
  })

  const [patientChannels, setPatientChannels] = useState({
    sms: false
  })

  const [patientConditions, setPatientConditions] = useState({
    hasPhone: false
  })
  const [staffRecipientEnabled, setStaffRecipientEnabled] = useState(false)
  const [patientRecipientEnabled, setPatientRecipientEnabled] = useState(false)
  const [footerAnnouncement, setFooterAnnouncement] = useState({ date: '', message: '', enabled: false })

  // SMS Pre-alert Table Interval Times State
  const [intervals, setIntervals] = useState([
    { id: 'follow-up-due', type: 'ติดตามผู้ป่วย (Follow-up Due)', desc: 'แจ้งเตือนก่อนถึงวันติดตาม', val1: '3 วัน', val2: '1 วัน', val3: '4 ชั่วโมง', val4: '1 ชั่วโมง', enabled: false },
    { id: 'appointment', type: 'นัดหมายติดตาม (Appointment)', desc: 'แจ้งเตือนก่อนวันนัดหมาย', val1: '3 วัน', val2: '1 วัน', val3: '4 ชั่วโมง', val4: '1 ชั่วโมง', enabled: false },
    { id: 'no-assessment', type: 'ผู้ป่วยยังไม่ตอบแบบประเมิน', desc: 'แจ้งเตือนซ้ำเมื่อผู้ป่วยยังไม่ตอบ', val1: '2 วัน', val2: '1 วัน', val3: '', val4: '', enabled: false },
    { id: 'overdue', type: 'ติดตามเกินกำหนด (Overdue)', desc: 'แจ้งเตือนเมื่อเกินกำหนด', val1: '1 วัน', val2: '3 วัน', val3: '7 วัน', val4: '', enabled: false },
    { id: 'custom', type: 'อื่นๆ (กำหนดเอง)', desc: 'กำหนดช่วงเวลาเอง', val1: 'เลือกช่วงเวลา', val2: '', val3: '', val4: '', enabled: false },
  ])

  // Notification Template State
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateText, setTemplateText] = useState('')

  useEffect(() => {
    api.getSettings().then((saved) => {
      if (saved.ssiCriteria) setSsiCriteria(saved.ssiCriteria)
      if (saved.schedules) setSchedules(saved.schedules)
      if (saved.methods) setMethods(saved.methods)
      if (Array.isArray(saved.riskLevels) && saved.riskLevels.length) setRiskLevels(saved.riskLevels.map(level => level.id === 'moderate' && Number(level.max) === 49 ? { ...level, max: 50 } : level.id === 'high' && Number(level.min) === 50 ? { ...level, min: 51 } : level))
      if (saved.sync) { setSyncFreq(saved.sync.freq); setSyncStart(saved.sync.start); setSyncEnd(saved.sync.end); setSyncEnabled(saved.sync.enabled) }
      if (saved.notificationPreferencesConfigured === true) {
        if (saved.alertTypes) setAlertTypes(saved.alertTypes)
        if (saved.staffRoles) setStaffRoles({ ...saved.staffRoles, physician: false })
        if (saved.staffChannels) setStaffChannels(saved.staffChannels)
        if (saved.staffConditions) setStaffConditions(saved.staffConditions)
        if (saved.patientChannels) setPatientChannels(saved.patientChannels)
        if (saved.patientConditions) setPatientConditions(saved.patientConditions)
        if (saved.intervals) setIntervals(saved.intervals)
        setStaffRecipientEnabled(saved.staffRecipientEnabled === true)
        setPatientRecipientEnabled(saved.patientRecipientEnabled === true)
      }
      if (saved.notificationTemplate) { setSelectedTemplate(saved.notificationTemplate.name); setTemplateText(saved.notificationTemplate.text) }
      if (saved.footerAnnouncement) setFooterAnnouncement({ date: '', message: '', enabled: false, ...saved.footerAnnouncement })
    }).catch((error) => setNotice({ type: 'error', text: error.message }))
  }, [])

  const handleToggleSsi = (id) => {
    setSsiCriteria(prev =>
      prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    )
  }

  const handleToggleSchedule = (id) => {
    setSchedules(prev =>
      prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    )
  }

  const handleToggleInterval = (id) => {
    setIntervals(prev =>
      prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    )
  }
  const updateIntervalValue = (id, key, value) => setIntervals(items => items.map(item => item.id === id ? { ...item, [key]: value } : item))

  const addSsiCriterion = () => {
    setEditor({ type: 'symptom', title: 'เพิ่มอาการ/อาการแสดง', values: { name: '' } })
  }

  const editSsiCriterion = (id) => {
    const current = ssiCriteria.find(item => item.id === id)
    setEditor({ type: 'symptom', id, title: 'แก้ไขอาการ/อาการแสดง', values: { name: current.name } })
  }

  const addScheduleDay = () => {
    setEditor({ type: 'schedule', title: 'เพิ่มวันติดตาม', values: { day: '', desc: '' } })
  }

  const addMethod = () => {
    setEditor({ type: 'method', title: 'เพิ่มวิธีติดตาม', values: { name: '' } })
  }

  const editSchedule = (id) => {
    const current = schedules.find(item => item.id === id)
    setEditor({ type: 'schedule', id, title: 'แก้ไขวันติดตาม', values: { day: current.day, desc: current.desc } })
  }

  const editMethod = (id) => {
    const current = methods.find(item => item.id === id)
    setEditor({ type: 'method', id, title: 'แก้ไขวิธีติดตาม', values: { name: current.name } })
  }

  const addInterval = () => {
    setEditor({ type: 'interval', title: 'เพิ่มช่วงเวลาการแจ้งเตือน', values: { type: '', desc: '', val1: '' } })
  }

  const editInterval = (id) => {
    const current = intervals.find(item => item.id === id)
    setEditor({ type: 'interval', id, title: 'แก้ไขช่วงเวลาการแจ้งเตือน', values: { type: current.type, desc: current.desc || '', val1: current.val1 || '' } })
  }

  const updateEditor = (key, value) => setEditor(current => ({ ...current, values: { ...current.values, [key]: value } }))
  const saveEditor = () => {
    const { type, id, values } = editor
    if (type === 'symptom' && values.name.trim()) setSsiCriteria(items => id ? items.map(item => item.id === id ? { ...item, name: values.name.trim() } : item) : [...items, { id: `symptom-${Date.now()}`, name: values.name.trim(), enabled: true }])
    if (type === 'schedule' && values.day.trim() && values.desc.trim()) setSchedules(items => id ? items.map(item => item.id === id ? { ...item, ...values } : item) : [...items, { id: Date.now(), order: String(items.length + 1), ...values, enabled: true }])
    if (type === 'method' && values.name.trim()) setMethods(items => id ? items.map(item => item.id === id ? { ...item, name: values.name.trim() } : item) : [...items, { id: Date.now(), name: values.name.trim() }])
    if (type === 'interval' && values.type.trim() && values.desc.trim() && values.val1.trim()) setIntervals(items => id ? items.map(item => item.id === id ? { ...item, ...values } : item) : [...items, { id: Date.now(), ...values, val2: '', val3: '', val4: '', enabled: true }])
    else if ((type === 'symptom' && !values.name.trim()) || (type === 'schedule' && (!values.day.trim() || !values.desc.trim())) || (type === 'method' && !values.name.trim()) || (type === 'interval' && (!values.type.trim() || !values.desc.trim() || !values.val1.trim()))) return
    setEditor(null)
  }

  const tabsConfig = [
    {
      title: 'ตั้งค่าเกณฑ์ SSI',
      subtitle: 'กำหนดเกณฑ์การวินิจฉัย SSI',
      icon: SlidersHorizontal
    },
    {
      title: 'ตั้งค่ารอบ follow-up',
      subtitle: 'กำหนดช่วงเวลาและรูปแบบการติดตาม',
      icon: Calendar
    },
    {
      title: 'ตั้งค่าการเชื่อมต่อ HIS / TrackCare',
      subtitle: 'ตั้งค่าการเชื่อมต่อและซิงค์ข้อมูล',
      icon: Database
    },
    {
      title: 'ตั้งค่าการแจ้งเตือน',
      subtitle: 'กำหนดกฎและช่องทางการแจ้งเตือน',
      icon: Bell
    }
  ]

  const handleSave = async () => {
    try {
      await api.saveSettings({ ssiCriteria, riskLevels, schedules, methods, sync: { freq: syncFreq, start: syncStart, end: syncEnd, enabled: syncEnabled }, notificationPreferencesConfigured: true, alertTypes, staffRoles: { ...staffRoles, physician: false }, staffChannels, staffConditions, patientChannels, patientConditions, staffRecipientEnabled, patientRecipientEnabled, intervals, notificationTemplate: { name: selectedTemplate, text: templateText }, footerAnnouncement })
      window.dispatchEvent(new Event('footer-announcement-updated'))
      setNotice({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' })
    } catch (error) { setNotice({ type: 'error', text: error.message }) }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        {/* Left Tabs Sidebar */}
        <aside className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm h-fit">
          {tabsConfig.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === index
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex w-full items-start gap-4 rounded-xl py-3.5 pr-4 pl-3 text-left transition ${
                  isActive
                    ? 'bg-blue-50 border border-blue-100 border-l-4 border-l-blue-600 pl-2 text-[#175beb]'
                    : 'border border-transparent text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl transition ${
                  isActive ? 'bg-[#175beb] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] font-semibold leading-5 ${isActive ? 'text-[#175beb]' : 'text-slate-800'}`}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-400 font-medium truncate">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </aside>

        {/* Right Tab Content */}
        <section className="flex flex-col gap-6">
          {/* Active Tab Panel */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Tab 0: SSI Criteria Setting */}
            {activeTab === 0 && (
              <div className="flex flex-col gap-6">
                {/* Header card */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-left">
                  <h2 className="text-[18px] font-semibold text-[#002d73]">ตั้งค่าเกณฑ์ SSI <span className="text-[14px] text-slate-400 font-normal ml-2">(SSI Criteria Setting)</span></h2>
                </div>

                {/* Table list of SSI Symptoms */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left">
                  <h3 className="mb-4 text-[17px] font-bold text-slate-800">แบบประเมินอาการ (CDC SSI)</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-[1fr_80px_80px_80px_150px] items-center bg-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-600">
                      <span>อาการ/อาการแสดง</span><span className="text-center">ไม่มี</span><span className="text-center">มี</span><span className="text-center">ไม่ทราบ</span><span className="text-center">ดำเนินการ</span>
                    </div>
                  <div className="divide-y divide-slate-200 font-sans">
                    {ssiCriteria.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-[1fr_80px_80px_80px_150px] items-center px-4 py-4 text-[14px]">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        {[0, 1, 2].map(value => <span key={value} className="mx-auto h-5 w-5 rounded-full border border-slate-400" />)}
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSsi(item.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.enabled ? 'bg-[#10b981]' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <button type="button" onClick={() => editSsiCriterion(item.id)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" aria-label={`แก้ไข ${item.name}`}><Edit2 size={16} /></button>
                          <button type="button" onClick={() => setSsiCriteria(items => items.filter(current => current.id !== item.id))} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label={`ลบ ${item.name}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>

                  {/* Add Symptom Button */}
                  <button
                    onClick={addSsiCriterion}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-3 text-[14px] font-semibold text-slate-500 hover:bg-slate-50 transition"
                  >
                    <Plus size={16} /> เพิ่มอาการ/อาการแสดง
                  </button>
                </div>

                {/* Risk Level Setting Section */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left">
                  <h3 className="text-[15px] font-semibold text-slate-800 mb-4 flex items-center gap-1.5">
                    ระดับความเสี่ยง (Risk Level)
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold cursor-pointer">?</span>
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                          <th className="px-4 py-3">ระดับ</th>
                          <th className="px-4 py-3 text-right">ช่วงคะแนน (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">{riskLevels.map(level => <tr key={level.id}><td className="px-4 py-3"><span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs" style={{ color: level.color, backgroundColor: `${level.color}12` }}><i className="size-2 rounded-full" style={{ backgroundColor: level.color }} />{level.name}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><input type="number" min="0" max="100" value={level.min} onChange={event => setRiskLevels(items => items.map(item => item.id === level.id ? { ...item, min: Number(event.target.value) } : item))} className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-center" /><span>-</span><input type="number" min="0" max="100" value={level.max} onChange={event => setRiskLevels(items => items.map(item => item.id === level.id ? { ...item, max: Number(event.target.value) } : item))} className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-center" /><span>%</span></div></td></tr>)}</tbody>
                    </table>
                  </div>

                  {/* Legend dots */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-slate-500 font-semibold">{riskLevels.map(level => <span key={level.id} className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ backgroundColor: level.color }} />{level.name} ({level.min}–{level.max}%)</span>)}</div>
                </div>
              </div>
            )}

            {/* Tab 1: Follow-up Schedule Setting */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-6">
                {/* Header card */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-left">
                  <h2 className="text-[18px] font-semibold text-[#002d73]">ตั้งค่าการติดตามมาตรฐาน <span className="text-[14px] text-slate-400 font-normal ml-2">(Follow-up Schedule)</span></h2>
                </div>

                {/* Follow-up round schedule card */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-4">
                  <h3 className="text-[15px] font-bold text-[#002d73]">ตารางติดตามมาตรฐาน (Follow-up Schedule)</h3>

                  {/* Table of Follow-up Schedule */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 text-[12px]">
                        <th className="px-4 py-3 font-semibold">ลำดับ</th>
                        <th className="px-4 py-3 font-semibold">วันที่ติดตาม</th>
                        <th className="px-4 py-3 font-semibold">คำอธิบาย</th>
                        <th className="px-4 py-3 text-center font-semibold">เปิดใช้งาน</th>
                        <th className="px-4 py-3 text-right font-semibold">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {schedules.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3.5 text-slate-400">{item.order}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">{item.day}</td>
                          <td className="px-4 py-3.5 text-slate-500">{item.desc}</td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSchedule(item.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                item.enabled ? 'bg-[#10b981]' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  item.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex justify-end gap-3 text-slate-400">
                              <button onClick={() => editSchedule(item.id)} className="hover:text-blue-600 transition">
                                <Edit2 size={15} className="text-blue-600 hover:text-blue-800" />
                              </button>
                              <button
                                onClick={() => setSchedules(prev => prev.filter(s => s.id !== item.id))}
                                className="hover:text-red-500 transition"
                              >
                                <Trash2 size={15} className="text-red-500 hover:text-red-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Follow-up Day Button */}
                <button
                  onClick={addScheduleDay}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50/50 py-3.5 text-[14px] font-semibold transition bg-blue-50/20"
                >
                  <Plus size={16} /> เพิ่มวันติดตาม
                </button>
              </div>

                {/* Follow-up Method section */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-4">
                  <h3 className="text-[15px] font-bold text-[#002d73]">วิธีติดตาม (Follow-up Method)</h3>
                  
                  <div className="space-y-2 font-sans">
                    {methods.map((method, index) => (
                      <div key={method.id} className="flex items-center justify-between py-3 px-4 bg-slate-50/50 rounded-xl border border-slate-100 text-[13px] font-medium">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 w-6 text-center font-semibold">{index + 1}</span>
                          <span className="font-semibold text-slate-800">{method.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <button onClick={() => editMethod(method.id)} className="hover:text-blue-600 transition">
                            <Edit2 size={15} className="text-blue-600 hover:text-blue-800" />
                          </button>
                          <button
                            onClick={() => setMethods(prev => prev.filter(m => m.id !== method.id))}
                            className="hover:text-red-500 transition"
                          >
                            <Trash2 size={15} className="text-red-500 hover:text-red-700" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Method Button */}
                  <button
                    onClick={addMethod}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50/50 py-3.5 text-[14px] font-semibold transition bg-blue-50/20"
                  >
                    <Plus size={16} /> เพิ่มวิธีติดตาม
                  </button>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="flex flex-col gap-6">
                {/* Header card */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-left">
                  <h2 className="text-[18px] font-semibold text-[#002d73]">ตั้งค่าการเชื่อมต่อระบบ HIS / TrackCare</h2>
                  <p className="text-[12px] text-[#64748b] mt-1">กำหนดค่าและจัดการการเชื่อมต่อระบบภายนอก (Integration)</p>
                </div>

                {/* Connection Status Cards (HIS & TrackCare) */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* HIS Card */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#002d73] text-[16px]">HIS</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-600">
                        ยังไม่ได้เชื่อมต่อ
                      </span>
                    </div>
                    <div className="hidden space-y-2 text-[13px] font-medium text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ระบบ</span>
                        <span className="text-slate-800">Bangkok Hospital HIS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ประเภท</span>
                        <span className="text-slate-800">HL7 FHIR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เวอร์ชัน API</span>
                        <span className="text-slate-800 font-semibold">R4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เชื่อมต่อล่าสุด</span>
                        <span className="text-slate-800 font-semibold">15 มิ.ย. 2569 10:15 น.</span>
                      </div>
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-xs font-semibold hover:bg-blue-700 transition">
                      <Settings size={14} /> จัดการการเชื่อมต่อ
                    </button>
                  </div>

                  {/* TrackCare Card */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#002d73] text-[16px]">TrackCare</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-600">
                        ยังไม่ได้เชื่อมต่อ
                      </span>
                    </div>
                    <div className="hidden space-y-2 text-[13px] font-medium text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ระบบ</span>
                        <span className="text-slate-800">TrackCare</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ประเภท</span>
                        <span className="text-slate-800">REST API</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เวอร์ชัน API</span>
                        <span className="text-slate-800 font-semibold">v2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เชื่อมต่อล่าสุด</span>
                        <span className="text-slate-800 font-semibold">15 มิ.ย. 2569 10:16 น.</span>
                      </div>
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-xs font-semibold hover:bg-blue-700 transition">
                      <Settings size={14} /> จัดการการเชื่อมต่อ
                    </button>
                  </div>
                </div>

                {/* Section: Latest Sync Status */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-3">
                  <h3 className="text-[15px] font-bold text-[#002d73]">สถานะการซิงค์ข้อมูลล่าสุด</h3>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[13px] font-sans">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                          <th className="px-4 py-3">ระบบ</th>
                          <th className="px-4 py-3">ข้อมูล</th>
                          <th className="px-4 py-3">สถานะ</th>
                          <th className="px-4 py-3">รายการล่าสุด</th>
                          <th className="px-4 py-3 text-right">วันที่ซิงค์ล่าสุด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {[].map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-slate-900 font-bold">{row.sys}</td>
                            <td className="px-4 py-3 text-slate-600">{row.info}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs">
                                <CheckCircle2 size={13} className="text-emerald-500" />
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{row.detail}</td>
                            <td className="px-4 py-3 text-right text-slate-500 font-semibold">{row.date}</td>
                          </tr>
                        ))}
                        <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">ยังไม่มีข้อมูลการซิงค์ เนื่องจากยังไม่ได้เชื่อมต่อระบบ</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section: Sync Timing Configuration */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-4">
                  <h3 className="text-[15px] font-bold text-[#002d73]">การตั้งค่าเวลาซิงค์ข้อมูล</h3>
                  
                  <div className="grid gap-6 lg:grid-cols-[1fr_260px] items-start">
                    <div className="rounded-xl border border-slate-100 p-5 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="text-[13px] font-semibold text-[#002d73]">
                          ความถี่ในการซิงค์
                          <select
                            value={syncFreq}
                            onChange={(e) => setSyncFreq(e.target.value)}
                            className="field mt-2"
                          >
                            <option>ทุก 15 นาที</option>
                            <option>ทุก 30 นาที</option>
                            <option>ทุก 1 ชั่วโมง</option>
                          </select>
                        </label>

                        <label className="text-[13px] font-semibold text-[#002d73]">
                          เวลาเริ่มต้น
                          <select
                            value={syncStart}
                            onChange={(e) => setSyncStart(e.target.value)}
                            className="field mt-2"
                          >
                            <option>05:00</option>
                            <option>06:00</option>
                            <option>07:00</option>
                          </select>
                        </label>

                        <label className="text-[13px] font-semibold text-[#002d73]">
                          เวลาสิ้นสุด
                          <select
                            value={syncEnd}
                            onChange={(e) => setSyncEnd(e.target.value)}
                            className="field mt-2"
                          >
                            <option>05:00</option>
                            <option>06:00</option>
                            <option>07:00</option>
                          </select>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-50 mt-4">
                        <span className="text-xs font-semibold text-[#002d73]">เปิดใช้งานการดึงข้อมูลอัตโนมัติ</span>
                        <button
                          type="button"
                          onClick={() => setSyncEnabled(!syncEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            syncEnabled ? 'bg-[#10b981]' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              syncEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Note Card */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2 text-xs text-blue-700">
                      <p className="font-bold flex items-center gap-1.5"><Info size={14} /> หมายเหตุ</p>
                      <ul className="list-disc pl-4 space-y-1.5 font-medium leading-relaxed">
                        <li>ข้อมูลผู้ป่วยจะถูกดึงแบบอัตโนมัติตามความถี่ที่กำหนด</li>
                        <li>หากการเชื่อมต่อผิดพลาด ระบบจะพยายามซิงค์ซ้ำโดยอัตโนมัติ</li>
                        <li>ข้อมูลสำคัญจะถูกดึงแบบ Real-time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Notification Rules */}
            {activeTab === 3 && (
              <div className="flex flex-col gap-6">
                {/* Header card */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-left">
                  <h2 className="text-[18px] font-semibold text-[#002d73]">ตั้งค่าการแจ้งเตือน</h2>
                </div>

                {/* Sub-tabs under Notification */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex border-b border-slate-100">
                    <button
                      onClick={() => setNotifSubTab('pre')}
                      className={`pb-3 px-6 text-[15px] font-semibold transition ${
                        notifSubTab === 'pre' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-slate-400'
                      }`}
                    >
                      ตั้งค่าแจ้งเตือนล่วงหน้า
                    </button>
                    <button
                      onClick={() => setNotifSubTab('template')}
                      className={`pb-3 px-6 text-[15px] font-semibold transition ${
                        notifSubTab === 'template' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-slate-400'
                      }`}
                    >
                      จัดการ Template แจ้งเตือน
                    </button>
                  </div>
                </div>

                {notifSubTab === 'pre' && (
                  <div className="space-y-6 text-left font-sans">
                    <section className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
                    {/* Header Details */}
                    <div>
                      <h3 className="text-[20px] font-semibold text-slate-900">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า</h3>
                      <p className="mt-2 text-[14px] text-slate-500">เปิด/ปิด การส่ง SMS ล่วงหน้าก่อนถึงกำหนดนัดติดตามหรือเหตุการณ์สำคัญ</p>
                    </div>

                    {/* Alert Types Checkboxes */}
                    <div className="mt-6 space-y-3">
                      <p className="text-[15px] font-semibold text-slate-800">ประเภทการแจ้งเตือน</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { key: 'followUpDue', label: 'ติดตามผู้ป่วย (Follow-up Due)' },
                          { key: 'appointmentReminder', label: 'นัดหมายติดตาม (Appointment Reminder)' },
                          { key: 'noAssessmentResponse', label: 'ผู้ป่วยยังไม่ตอบแบบประเมิน' },
                          { key: 'overdue', label: 'ติดตามเกินกำหนด (Overdue)' },
                          { key: 'prepAlert', label: 'คิว/นัดหมายที่ต้องเตรียมตัวล่วงหน้า' },
                          { key: 'others', label: 'อื่นๆ (กำหนดเอง)' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 text-[14px] font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alertTypes[item.key]}
                              onChange={(e) => setAlertTypes({ ...alertTypes, [item.key]: e.target.checked })}
                              className="h-5 w-5 rounded border-slate-300 text-[#175beb] accent-[#175beb]"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    </section>

                    {/* Checkbox Config Panels (Staff & Patients) */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Staff Card */}
                      <div className="min-h-[420px] rounded-2xl border border-black/10 bg-white p-7 shadow-sm space-y-6">
                        <h4 className="text-[20px] font-semibold text-slate-900">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า</h4>
                        
                        <div className="space-y-3">
                          <p className="text-[15px] font-semibold text-slate-800">ผู้รับ (เจ้าหน้าที่)</p>
                          <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={staffRecipientEnabled} onChange={event => setStaffRecipientEnabled(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-[#175beb] accent-[#175beb]" />
                            ตามบทบาท (Role)
                          </label>

                          <div className="flex flex-wrap gap-3 pl-6">
                            {[
                              { key: 'orStaff', label: 'OR Staff' },
                              { key: 'ipdNurse', label: 'IPD Nurse' },
                              { key: 'opdNurse', label: 'OPD Nurse' },
                              { key: 'admin', label: 'Admin' }
                            ].map((role) => (
                              <label key={role.key} className="flex items-center gap-2 text-[14px] font-medium text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={staffRoles[role.key]}
                                  onChange={(e) => setStaffRoles({ ...staffRoles, [role.key]: e.target.checked })}
                                  className="h-5 w-5 rounded text-[#175beb] accent-[#175beb]"
                                />
                                {role.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-[15px] font-semibold text-slate-800">ช่องทาง</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffChannels.sms}
                                onChange={(e) => setStaffChannels({ ...staffChannels, sms: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              SMS
                            </label>
                            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffChannels.dashboard}
                                onChange={(e) => setStaffChannels({ ...staffChannels, dashboard: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              (Dashboard) Notification
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-[15px] font-semibold text-slate-800">เงื่อนไขการส่ง</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffConditions.hasPhone}
                                onChange={(e) => setStaffConditions({ ...staffConditions, hasPhone: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              ส่งเฉพาะผู้ที่มีเบอร์โทร
                            </label>
                            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffConditions.noResponseOnly}
                                onChange={(e) => setStaffConditions({ ...staffConditions, noResponseOnly: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              ส่งเฉพาะผู้ที่ยังไม่ตอบแบบประเมิน
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Patient Card */}
                      <div className="min-h-[420px] rounded-2xl border border-black/10 bg-white p-7 shadow-sm space-y-6">
                        <h4 className="text-[20px] font-semibold text-slate-900">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า</h4>
                        
                        <div className="space-y-3">
                          <p className="text-[15px] font-semibold text-slate-800">ผู้รับ (คนไข้)</p>
                          <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={patientRecipientEnabled} onChange={event => setPatientRecipientEnabled(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-[#175beb] accent-[#175beb]" />
                            ผู้ป่วย (เบอร์โทรหลัก)
                          </label>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-[15px] font-semibold text-slate-800">ช่องทาง</p>
                          <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={patientChannels.sms}
                              onChange={(e) => setPatientChannels({ ...patientChannels, sms: e.target.checked })}
                              className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                            />
                            SMS
                          </label>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-[15px] font-semibold text-slate-800">เงื่อนไขการส่ง</p>
                          <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={patientConditions.hasPhone}
                              onChange={(e) => setPatientConditions({ ...patientConditions, hasPhone: e.target.checked })}
                              className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                            />
                            ส่งเฉพาะผู้ที่มีเบอร์โทร
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Pre-alert Times Table */}
                    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[14px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                              <th className="px-4 py-3">ประเภทการแจ้งเตือน</th>
                              <th className="px-4 py-3">คำอธิบาย</th>
                              <th className="px-4 py-3">ช่วงเวลาล่วงหน้า (ก่อนถึงกำหนด)</th>
                              <th className="px-4 py-3 text-center">เปิดใช้งาน</th>
                              <th className="px-4 py-3 text-right">ดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {intervals.map((row) => (
                              <tr key={row.id}>
                                <td className="px-4 py-3.5 font-semibold text-slate-800">{row.type}</td>
                                <td className="px-4 py-3.5 text-slate-500 text-xs">{row.desc}</td>
                                <td className="px-4 py-3.5">
                                  {row.selection ? (
                                    <select className="h-8 rounded border border-slate-200 px-2 text-xs text-slate-600 bg-white">
                                      <option>{row.selection}</option>
                                    </select>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {['val1', 'val2', 'val3', 'val4'].map(key => row[key] ? <select key={key} value={row[key]} onChange={event => updateIntervalValue(row.id, key, event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option>{row[key]}</option><option>1 ชั่วโมง</option><option>4 ชั่วโมง</option><option>1 วัน</option><option>2 วัน</option><option>3 วัน</option><option>7 วัน</option></select> : null)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInterval(row.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                      row.enabled ? 'bg-[#10b981]' : 'bg-slate-200'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        row.enabled ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </td>
                                <td className="px-4 py-3.5"><div className="flex justify-end gap-3"><button onClick={() => editInterval(row.id)} aria-label="แก้ไข"><Edit2 size={15} className="text-blue-600" /></button><button onClick={() => setIntervals(items => items.filter(item => item.id !== row.id))} aria-label="ลบ"><Trash2 size={15} className="text-red-500" /></button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Add pre-alert button */}
                      <button
                        onClick={addInterval}
                        className="flex w-full items-center justify-center gap-2 border-t border-slate-200 bg-slate-50/60 py-4 text-[14px] font-semibold text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Plus size={16} /> เพิ่มช่วงเวลาล่วงหน้า
                      </button>
                    </div>

                    <section className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
                      <div className="flex flex-col gap-5">
                        <div>
                          <h3 className="text-[20px] font-semibold text-slate-900">ประกาศท้ายหน้า</h3>
                          <p className="mt-2 text-[14px] text-slate-500">กำหนดประกาศที่แสดงบริเวณ Footer ของทุกหน้าในระบบ</p>
                        </div>
                        <label className="flex items-center gap-3 text-[14px] font-medium text-slate-700">
                          <input type="checkbox" checked={footerAnnouncement.enabled} onChange={event => setFooterAnnouncement(current => ({ ...current, enabled: event.target.checked }))} className="h-5 w-5 rounded border-slate-300 accent-[#175beb]" />
                          เปิดใช้งานประกาศ
                        </label>
                        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                          <label className="text-[15px] font-semibold text-slate-800">
                            วันที่ประกาศ
                            <input type="date" value={footerAnnouncement.date} onChange={event => setFooterAnnouncement(current => ({ ...current, date: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 outline-none focus:border-[#175beb]" />
                          </label>
                          <label className="text-[15px] font-semibold text-slate-800">
                            ข้อความประกาศ
                            <textarea rows={3} value={footerAnnouncement.message} onChange={event => setFooterAnnouncement(current => ({ ...current, message: event.target.value }))} placeholder="ระบุข้อความประกาศ..." className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] font-medium text-slate-700 outline-none focus:border-[#175beb]" />
                          </label>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {notifSubTab === 'template' && (
                  <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-6 font-sans">
                    {/* Template Card Content */}
                    <div className="rounded-xl border border-slate-100 p-5 space-y-4">
                      <div>
                        <h3 className="text-[16px] font-bold text-[#002d73]">ข้อความแจ้งเตือน (Template)</h3>
                        <p className="text-[12px] text-[#64748b] mt-1">จัดการข้อความที่ใช้ส่งให้ผู้ป่วย</p>
                      </div>

                      {/* Select Dropdown */}
                      <label className="block text-[13px] font-semibold text-[#002d73]">
                        เลือก Template
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="field mt-2 font-semibold"
                        >
                          <option value="">เลือก Template</option>
                          <option value="Follow-up">ถึงกำหนดติดตาม (Follow-up)</option>
                          <option value="Reminder">แจ้งเตือนก่อนวันนัดหมาย</option>
                          <option value="Warning">แจ้งเตือนแผลอักเสบ/สงสัย SSI</option>
                        </select>
                      </label>

                      {/* Textarea Template Preview */}
                      <label className="block text-[13px] font-semibold text-[#002d73]">
                        ตัวอย่างข้อความ
                        <textarea
                          rows={11}
                          value={templateText}
                          onChange={(e) => setTemplateText(e.target.value)}
                          className="w-full mt-2 rounded-xl border border-slate-200 p-4 text-[13px] text-slate-600 font-semibold leading-6 focus:border-[#175beb] outline-none"
                        />
                      </label>

                      <p className="text-[11px] text-slate-400 font-bold leading-5">
                        ตัวแปรที่ใช้ได้: <span className="text-[#175beb] font-semibold">{"{{patient_name}} {{follow_up_day}} {{portal_link}} {{hospital_phone}} {{due_date}}"}</span>
                      </p>
                    </div>

                    {/* Bottom Info Box */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-2 text-xs text-blue-700">
                      <p className="font-bold flex items-center gap-1.5"><Info size={14} /> ข้อมูลสำคัญ</p>
                      <ul className="list-disc pl-4 space-y-2 font-semibold leading-relaxed">
                        <li>SMS จะถูกส่งเฉพาะผู้รับที่มีเบอร์โทรถูกต้องในระบบเท่านั้น</li>
                        <li>ทุกการส่ง SMS จะถูกบันทึกใน Audit Log</li>
                        <li>SMS อาจมีค่าใช้จ่ายตามผู้ให้บริการ</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-4">
            <button className="btn-secondary h-11 px-6">
              ปิด
            </button>
            <button onClick={handleSave} className="btn-primary h-11 px-6 bg-[#002d73] hover:bg-[#001d52]">
              <Save size={16} /> บันทึกการตั้งค่า
            </button>
          </div>

        </section>
      </div>

      {editor && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setEditor(null)}>
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">{editor.title}</h3>
            <button type="button" onClick={() => setEditor(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="ปิด"><X size={20} /></button>
          </div>
          <div className="space-y-4 px-6 py-5">
            {editor.type === 'symptom' && <label className="block text-sm font-medium text-slate-700">อาการ/อาการแสดง <span className="text-red-500">*</span><input autoFocus className="field mt-2" value={editor.values.name} onChange={event => updateEditor('name', event.target.value)} placeholder="กรอกชื่ออาการ" /></label>}
            {editor.type === 'schedule' && <><label className="block text-sm font-medium text-slate-700">วันที่ติดตาม <span className="text-red-500">*</span><input autoFocus className="field mt-2" value={editor.values.day} onChange={event => updateEditor('day', event.target.value)} placeholder="เช่น Day 45" /></label><label className="block text-sm font-medium text-slate-700">คำอธิบาย <span className="text-red-500">*</span><textarea className="field mt-2 min-h-24" value={editor.values.desc} onChange={event => updateEditor('desc', event.target.value)} placeholder="รายละเอียดการติดตาม" /></label></>}
            {editor.type === 'method' && <label className="block text-sm font-medium text-slate-700">วิธีติดตาม <span className="text-red-500">*</span><input autoFocus className="field mt-2" value={editor.values.name} onChange={event => updateEditor('name', event.target.value)} placeholder="เช่น โทรศัพท์ + ส่งรูปแผล" /></label>}
            {editor.type === 'interval' && <><label className="block text-sm font-medium text-slate-700">ประเภทการแจ้งเตือน <span className="text-red-500">*</span><input autoFocus className="field mt-2" value={editor.values.type} onChange={event => updateEditor('type', event.target.value)} /></label><label className="block text-sm font-medium text-slate-700">คำอธิบาย <span className="text-red-500">*</span><input className="field mt-2" value={editor.values.desc} onChange={event => updateEditor('desc', event.target.value)} /></label><label className="block text-sm font-medium text-slate-700">ช่วงเวลาล่วงหน้า <span className="text-red-500">*</span><input className="field mt-2" value={editor.values.val1} onChange={event => updateEditor('val1', event.target.value)} placeholder="เช่น 1 วัน หรือ 4 ชั่วโมง" /></label></>}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" className="btn-secondary" onClick={() => setEditor(null)}>ยกเลิก</button><button type="button" className="btn-primary" onClick={saveEditor}><Save size={16} />บันทึก</button></div>
        </div>
      </div>}

      {notice && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={() => setNotice(null)}><div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onMouseDown={event => event.stopPropagation()}>{notice.type === 'success' ? <CheckCircle2 className="mx-auto text-emerald-500" size={48} /> : <Info className="mx-auto text-red-500" size={48} />}<h3 className="mt-4 text-lg font-semibold text-slate-900">{notice.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</h3><p className="mt-2 text-sm text-slate-600">{notice.text}</p><button type="button" className="btn-primary mt-5 w-full" onClick={() => setNotice(null)}>ตกลง</button></div></div>}
    </div>
  )
}
