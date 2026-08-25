import { Bell, Calendar, CheckCircle2, Database, Edit2, Info, Plus, RefreshCw, Save, Settings, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import { api } from '../services/api.js'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [ssiSubTab, setSsiSubTab] = useState('no') // 'no' (ไม่มี) or 'yes' (มี)
  const [notifSubTab, setNotifSubTab] = useState('pre') // 'pre' (ตั้งค่าแจ้งเตือนล่วงหน้า) or 'template' (จัดการ Template แจ้งเตือน)

  // 1. SSI Criteria State
  const [ssiCriteria, setSsiCriteria] = useState([
    { id: 1, name: 'มีไข้ (อุณหภูมิ ≥ 38°C)', score: 0, enabled: true, selection: 0 },
    { id: 2, name: 'ปวดแผล/เจ็บแผลเพิ่มขึ้น', score: 0, enabled: true, selection: 0 },
    { id: 3, name: 'แผลบวม', score: 0, enabled: true, selection: 0 },
    { id: 4, name: 'แผลแดง', score: 0, enabled: true, selection: 0 },
    { id: 5, name: 'มีน้ำเหลือง/หนองจากแผล', score: 0, enabled: true, selection: 0 },
    { id: 6, name: 'กลิ่นผิดปกติจากแผล', score: 0, enabled: true, selection: 0 },
    { id: 7, name: 'แผลแยก', score: 0, enabled: true, selection: 0 },
    { id: 8, name: 'แผลแยก', score: 0, enabled: true, selection: 0 },
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

  // 3. HIS Sync Settings State
  const [syncFreq, setSyncFreq] = useState('ทุก 15 นาที')
  const [syncStart, setSyncStart] = useState('05:00')
  const [syncEnd, setSyncEnd] = useState('05:00')
  const [syncEnabled, setSyncEnabled] = useState(true)

  // 4. SMS Alerts Config State
  const [alertTypes, setAlertTypes] = useState({
    followUpDue: true,
    appointmentReminder: true,
    noAssessmentResponse: true,
    overdue: true,
    prepAlert: true,
    others: true
  })

  const [staffRoles, setStaffRoles] = useState({
    orStaff: true,
    physician: true,
    ipdNurse: true,
    opdNurse: true,
    admin: true
  })

  const [staffChannels, setStaffChannels] = useState({
    sms: true,
    dashboard: true
  })

  const [staffConditions, setStaffConditions] = useState({
    hasPhone: true,
    noResponseOnly: true
  })

  const [patientChannels, setPatientChannels] = useState({
    sms: true
  })

  const [patientConditions, setPatientConditions] = useState({
    hasPhone: true
  })

  // SMS Pre-alert Table Interval Times State
  const [intervals, setIntervals] = useState([
    { id: 1, type: 'ติดตามผู้ป่วย (Follow-up Due)', desc: 'แจ้งเตือนก่อนถึงวันติดตาม', val1: '3 วัน', val2: '1 วัน', val3: '4 ชั่วโมง', val4: '1 ชั่วโมง', enabled: true },
    { id: 2, type: 'นัดหมายติดตาม (Appointment)', desc: 'แจ้งเตือนก่อนวันนัดหมาย', val1: '3 วัน', val2: '1 วัน', val3: '4 ชั่วโมง', val4: '1 ชั่วโมง', enabled: true },
    { id: 3, type: 'ผู้ป่วยยังไม่ตอบแบบประเมิน', desc: 'แจ้งเตือนซ้ำเมื่อผู้ป่วยยังไม่ตอบ', val1: '2 วัน', val2: '1 วัน', val3: '', val4: '', enabled: true },
    { id: 4, type: 'ติดตามเกินกำหนด (Overdue)', desc: 'แจ้งเตือนเมื่อเกินกำหนด', val1: '1 วัน', val2: '3 วัน', val3: '7 วัน', val4: '', enabled: true },
    { id: 5, type: 'อื่นๆ (กำหนดเอง)', desc: 'กำหนดช่วงเวลาเอง', selection: 'เลือกช่วงเวลา', enabled: true }
  ])

  // Notification Template State
  const [selectedTemplate, setSelectedTemplate] = useState('Follow-up')
  const [templateText, setTemplateText] = useState(`มีผู้ป่วยครบกำหนดติดตามอาการหลังผ่าตัด

ผู้ป่วย: {{patient_name}}
HN: {{hn}}
หัตถการ: {{procedure}}
รอบติดตาม: {{follow_up_day}}
กำหนดติดตาม: {{due_date}} {{due_time}}
ระดับความเสี่ยง: {{risk_level}}

กรุณาดำเนินการติดตามและบันทึกผลในระบบ`)

  useEffect(() => {
    api.getSettings().then((saved) => {
      if (saved.ssiCriteria) setSsiCriteria(saved.ssiCriteria)
      if (saved.schedules) setSchedules(saved.schedules)
      if (saved.methods) setMethods(saved.methods)
      if (saved.sync) { setSyncFreq(saved.sync.freq); setSyncStart(saved.sync.start); setSyncEnd(saved.sync.end); setSyncEnabled(saved.sync.enabled) }
      if (saved.alertTypes) setAlertTypes(saved.alertTypes)
      if (saved.staffRoles) setStaffRoles(saved.staffRoles)
      if (saved.staffChannels) setStaffChannels(saved.staffChannels)
      if (saved.staffConditions) setStaffConditions(saved.staffConditions)
      if (saved.patientChannels) setPatientChannels(saved.patientChannels)
      if (saved.patientConditions) setPatientConditions(saved.patientConditions)
      if (saved.intervals) setIntervals(saved.intervals)
      if (saved.notificationTemplate) { setSelectedTemplate(saved.notificationTemplate.name); setTemplateText(saved.notificationTemplate.text) }
    }).catch((error) => alert(error.message))
  }, [])

  const handleToggleSsi = (id) => {
    setSsiCriteria(prev =>
      prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    )
  }

  const handleSelectionChange = (id, val) => {
    setSsiCriteria(prev =>
      prev.map(item => item.id === id ? { ...item, selection: val } : item)
    )
  }

  const handleScoreChange = (id, val) => {
    setSsiCriteria(prev =>
      prev.map(item => item.id === id ? { ...item, score: Number(val) || 0 } : item)
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

  const addSsiCriterion = () => {
    const name = prompt('กรอกชื่ออาการ/อาการแสดง:')
    if (name) {
      setSsiCriteria(prev => [
        ...prev,
        { id: Date.now(), name, score: 0, enabled: true, selection: 0 }
      ])
    }
  }

  const addScheduleDay = () => {
    const dayName = prompt('กรอกวันติดตาม (เช่น Day 45):')
    const desc = prompt('กรอกคำอธิบาย:')
    if (dayName && desc) {
      setSchedules(prev => [
        ...prev,
        { id: Date.now(), order: String(prev.length + 1), day: dayName, desc, enabled: true }
      ])
    }
  }

  const addMethod = () => {
    const name = prompt('กรอกวิธีติดตาม:')
    if (name) {
      setMethods(prev => [
        ...prev,
        { id: Date.now(), name }
      ])
    }
  }

  const addInterval = () => {
    const name = prompt('กรอกประเภทการแจ้งเตือน:')
    const desc = prompt('กรอกคำอธิบาย:')
    if (name && desc) {
      setIntervals(prev => [
        ...prev,
        { id: Date.now(), type: name, desc, val1: '1 วัน', val2: '', val3: '', val4: '', enabled: true }
      ])
    }
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
      await api.saveSettings({ ssiCriteria, schedules, methods, sync: { freq: syncFreq, start: syncStart, end: syncEnd, enabled: syncEnabled }, alertTypes, staffRoles, staffChannels, staffConditions, patientChannels, patientConditions, intervals, notificationTemplate: { name: selectedTemplate, text: templateText } })
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว!')
    } catch (error) { alert(error.message) }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="ตั้งค่าระบบ (Settings)"
        description="ตั้งค่าระบบ"
      />

      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        {/* Left Tabs Sidebar */}
        <aside className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm h-fit">
          <div className="px-3 py-2.5 border-b border-slate-100 mb-1 text-left">
            <h3 className="font-bold text-[16px] text-slate-800">ตั้งค่าระบบ</h3>
          </div>
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

                {/* Sub tabs "ไม่มี" / "มี" */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex border-b border-slate-100">
                    <button
                      onClick={() => setSsiSubTab('no')}
                      className={`pb-3 px-6 text-[15px] font-semibold transition ${
                        ssiSubTab === 'no' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-slate-400'
                      }`}
                    >
                      ไม่มี
                    </button>
                    <button
                      onClick={() => setSsiSubTab('yes')}
                      className={`pb-3 px-6 text-[15px] font-semibold transition ${
                        ssiSubTab === 'yes' ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-slate-400'
                      }`}
                    >
                      มี
                    </button>
                  </div>
                </div>

                {/* Table list of SSI Symptoms */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left">
                  <div className="flex items-center justify-between pb-3 text-[14px] font-semibold text-slate-500 border-b border-slate-100 font-sans">
                    <span className="flex-1">รายการ</span>
                    <div className="flex items-center gap-12">
                      <span className="w-16 text-center">คะแนน</span>
                      <span className="w-24 text-right flex items-center justify-end gap-2">
                        เปิดใช้งานทั้งหมด
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 font-sans">
                    {ssiCriteria.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between py-4 text-[14px]">
                        <span className="flex-1 font-medium text-slate-700 flex items-center gap-3">
                          <span className="text-slate-400 w-5">{idx + 1}.</span>
                          {item.name}
                        </span>

                        <div className="flex items-center gap-12">
                          {/* 3 Circular Radio Buttons */}
                          <div className="flex items-center gap-3">
                            {[0, 1, 2].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectionChange(item.id, val)}
                                className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
                                  item.selection === val
                                    ? 'border-[#175beb] bg-[#175beb]/10'
                                    : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                              >
                                {item.selection === val && (
                                  <span className="h-2.5 w-2.5 rounded-full bg-[#175beb]" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Score Input */}
                          <input
                            type="number"
                            value={item.score}
                            onChange={(e) => handleScoreChange(item.id, e.target.value)}
                            className="w-16 h-9 rounded-lg border border-slate-200 text-center font-semibold text-slate-700 outline-none focus:border-[#175beb] focus:ring-1 focus:ring-[#175beb]"
                          />

                          {/* Toggle Switch */}
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
                        </div>
                      </div>
                    ))}
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
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-[#ecfdf5] px-2 py-0.5 text-xs text-[#10b981]">ปกติ (Low)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">0 - 20%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-600">เฝ้าระวัง (Moderate)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">21 - 50%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-600">เสี่ยง (High)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">51 - 80%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-600">ติดเชื้อ (Critical)</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">&gt; 80%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Legend dots */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />ต่ำ (0-24)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />ปานกลาง (25-49)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />สูง (50-74)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-950" />สูงมาก (75-100)</span>
                  </div>
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
                              <button className="hover:text-blue-600 transition">
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
                          <button className="hover:text-blue-600 transition">
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
                        เชื่อมต่อแล้ว
                      </span>
                    </div>
                    <div className="space-y-2 text-[13px] font-medium text-slate-600">
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
                        เชื่อมต่อแล้ว
                      </span>
                    </div>
                    <div className="space-y-2 text-[13px] font-medium text-slate-600">
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
                        {[
                          { sys: 'HIS', info: 'ข้อมูลผู้ป่วย', status: 'สำเร็จ', detail: 'HN 66012345', date: '15 มิ.ย. 2569 10:15 น.' },
                          { sys: 'HIS', info: 'ข้อมูลการผ่าตัด', status: 'สำเร็จ', detail: 'CASE-2569-000123', date: '15 มิ.ย. 2569 10:14 น.' },
                          { sys: 'HIS', info: 'ข้อมูลการจำหน่าย', status: 'สำเร็จ', detail: 'DIS-2569-000456', date: '15 มิ.ย. 2569 10:13 น.' },
                          { sys: 'TrackCare', info: 'ข้อมูลนัดหมาย', status: 'สำเร็จ', detail: 'APT-2569-000789', date: '15 มิ.ย. 2569 10:16 น.' },
                          { sys: 'TrackCare', info: 'ข้อมูลทีมแพทย์', status: 'สำเร็จ', detail: 'DR-2569-001234', date: '15 มิ.ย. 2569 10:16 น.' }
                        ].map((row, idx) => (
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
                  <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm text-left space-y-6 font-sans">
                    {/* Header Details */}
                    <div>
                      <h3 className="text-[15px] font-bold text-[#002d73]">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า</h3>
                      <p className="text-[12px] text-[#64748b] mt-1">เปิด/ปิด การส่ง SMS ล่วงหน้าก่อนถึงกำหนดนัดติดตามหรือเหตุการณ์สำคัญ</p>
                    </div>

                    {/* Alert Types Checkboxes */}
                    <div className="space-y-2">
                      <p className="text-[13px] font-semibold text-[#002d73]">ประเภทการแจ้งเตือน</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { key: 'followUpDue', label: 'ติดตามผู้ป่วย (Follow-up Due)' },
                          { key: 'appointmentReminder', label: 'นัดหมายติดตาม (Appointment Reminder)' },
                          { key: 'noAssessmentResponse', label: 'ผู้ป่วยยังไม่ตอบแบบประเมิน' },
                          { key: 'overdue', label: 'ติดตามเกินกำหนด (Overdue)' },
                          { key: 'prepAlert', label: 'คิว/นัดหมายที่ต้องเตรียมตัวล่วงหน้า' },
                          { key: 'others', label: 'อื่นๆ (กำหนดเอง)' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alertTypes[item.key]}
                              onChange={(e) => setAlertTypes({ ...alertTypes, [item.key]: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-[#175beb] accent-[#175beb]"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Checkbox Config Panels (Staff & Patients) */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Staff Card */}
                      <div className="rounded-xl border border-slate-100 p-5 space-y-4">
                        <h4 className="font-bold text-[#002d73] text-[14px]">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า (ผู้รับ (เจ้าหน้าที่))</h4>
                        
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-400">ผู้รับ (เจ้าหน้าที่)</p>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input type="radio" checked readOnly className="h-4 w-4 border-slate-300 text-[#175beb] accent-[#175beb]" />
                            ตามบทบาท (Role)
                          </label>

                          <div className="flex flex-wrap gap-3 pl-6">
                            {[
                              { key: 'orStaff', label: 'OR Staff' },
                              { key: 'physician', label: 'Physician' },
                              { key: 'ipdNurse', label: 'IPD Nurse' },
                              { key: 'opdNurse', label: 'OPD Nurse' },
                              { key: 'admin', label: 'Admin' }
                            ].map((role) => (
                              <label key={role.key} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={staffRoles[role.key]}
                                  onChange={(e) => setStaffRoles({ ...staffRoles, [role.key]: e.target.checked })}
                                  className="h-3.5 w-3.5 rounded text-[#175beb] accent-[#175beb]"
                                />
                                {role.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-xs font-semibold text-slate-400">ช่องทาง</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffChannels.sms}
                                onChange={(e) => setStaffChannels({ ...staffChannels, sms: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              SMS
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
                          <p className="text-xs font-semibold text-slate-400">เงื่อนไขการส่ง</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={staffConditions.hasPhone}
                                onChange={(e) => setStaffConditions({ ...staffConditions, hasPhone: e.target.checked })}
                                className="h-4 w-4 rounded text-[#175beb] accent-[#175beb]"
                              />
                              ส่งเฉพาะผู้ที่มีเบอร์โทร
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
                      <div className="rounded-xl border border-slate-100 p-5 space-y-4 h-fit">
                        <h4 className="font-bold text-[#002d73] text-[14px]">เปิดใช้งานการแจ้งเตือน SMS ล่วงหน้า (ผู้รับ (คนไข้))</h4>
                        
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-400">ผู้รับ (คนไข้)</p>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input type="radio" checked readOnly className="h-4 w-4 border-slate-300 text-[#175beb] accent-[#175beb]" />
                            ผู้ป่วย (เบอร์โทรหลัก)
                          </label>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-xs font-semibold text-slate-400">ช่องทาง</p>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
                          <p className="text-xs font-semibold text-slate-400">เงื่อนไขการส่ง</p>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[13px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                              <th className="px-4 py-3">ประเภทการแจ้งเตือน</th>
                              <th className="px-4 py-3">คำอธิบาย</th>
                              <th className="px-4 py-3">ช่วงเวลาล่วงหน้า (ก่อนถึงกำหนด)</th>
                              <th className="px-4 py-3 text-center">เปิดใช้งาน</th>
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
                                      {row.val1 && <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{row.val1}</span>}
                                      {row.val2 && <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{row.val2}</span>}
                                      {row.val3 && <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{row.val3}</span>}
                                      {row.val4 && <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{row.val4}</span>}
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Add pre-alert button */}
                      <button
                        onClick={addInterval}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-3 text-[14px] font-semibold text-slate-500 hover:bg-slate-50 transition"
                      >
                        <Plus size={16} /> เพิ่มช่วงเวลาล่วงหน้า
                      </button>
                    </div>
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

          {/* Warning Notification Banner */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-slate-600">
            <span className="text-[14px]">📅 15 มิ.ย. 2569</span>
            <div className="flex-1 font-medium leading-5">
              ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
