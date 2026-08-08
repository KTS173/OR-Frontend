import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Copy, Info, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { PatientInfoCard } from './CaseDetailPage.jsx'

export default function CreateFollowUpPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [selectedTemplate, setSelectedTemplate] = useState('30')
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    api.getPatient(id)
      .then((data) => active && setPatient(data))
      .catch((error) => active && setLoadError(error.message || 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">กำลังโหลดข้อมูลผู้ป่วย...</div>
  if (loadError || !patient) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{loadError || 'ไม่พบข้อมูลผู้ป่วย'}</div>

  return (
    <div className="space-y-4">
      {/* Stepper Header */}
      <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-[#175beb] font-semibold text-white">{step > 1 ? <Check size={16} /> : '1'}</span>
              <div>
                <p className="text-[14px] font-medium text-[#175beb]">เลือกหัตถการและรอบติดตาม</p>
                <p className="text-[16px] text-slate-400">Step 1 / 3</p>
              </div>
            </div>

            <div className="mx-6 h-[1px] flex-1 border-b border-dashed border-slate-300"></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${step === 1 ? 'opacity-50' : ''}`}>
              <span className={`grid size-8 place-items-center rounded-full font-semibold ${step >= 2 ? 'bg-[#175beb] text-white' : 'border border-slate-300 bg-slate-100 text-slate-500'}`}>{step > 2 ? <Check size={16} /> : '2'}</span>
              <div>
                <p className={`text-[14px] font-medium ${step === 2 ? 'text-[#175beb]' : 'text-slate-700'}`}>กำหนดเฝ้าติดตามอาการ</p>
                <p className="text-[16px] text-slate-400">Step 2 / 3</p>
              </div>
            </div>

            <div className="mx-6 h-[1px] flex-1 border-b border-dashed border-slate-300"></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 ${step < 3 ? 'opacity-50' : ''}`}>
              <span className={`grid size-8 place-items-center rounded-full font-semibold ${step === 3 ? 'bg-[#175beb] text-white' : 'border border-slate-300 bg-slate-100 text-slate-500'}`}>3</span>
              <div>
                <p className={`text-[14px] font-medium ${step === 3 ? 'text-[#175beb]' : 'text-slate-700'}`}>ยืนยันการสร้าง</p>
                <p className="text-[16px] text-slate-400">Step 3 / 3</p>
              </div>
            </div>
          </div>

          <button onClick={() => navigate(-1)} className="ml-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50">
            <X size={14} /> ยกเลิก
          </button>
        </div>
      </section>

      {/* Shared patient summary used by Case Detail and Create Follow-up */}
      <PatientInfoCard patient={patient}/>

      {step === 1 && <>
        {/* 1. Select Procedure Section */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-[15px] font-semibold text-slate-800">1. เลือกหัตถการที่จะติดตาม (Select Procedure)</h3>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[#1e293b]">
                <tr className="h-10">
                  <th className="w-16 text-center">เลือก</th>
                  <th className="w-16 text-center">ลำดับ</th>
                  <th className="text-left">หัตถการ</th>
                  <th className="text-left">ศัลยแพทย์</th>
                  <th className="w-32 text-center">สถานะ SSI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-12 border-t border-slate-100">
                  <td className="text-center"><input type="checkbox" defaultChecked className="size-4 accent-blue-600" /></td>
                  <td className="text-center font-medium">1</td>
                  <td className="font-medium text-slate-800">TKA (เข่าขวา)</td>
                  <td>นพ อธิวัฒน์ ศรีกมล</td>
                  <td className="text-center"><span className="inline-flex items-center gap-1 text-emerald-600 font-medium"><i className="size-2 rounded-full bg-emerald-500" /> เข้าเกณฑ์</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[12px] text-blue-700">
            <Info size={16} /> เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up
          </div>
        </section>
      </>}

      {step === 2 && <StepTwo />}
      {step === 3 && <StepThree patient={patient} />}

      {step === 1 && <>
        {/* 2. Select Template & 3. Follow-up Schedule Grid */}
        <section className="grid items-start gap-3 xl:grid-cols-[340fr_776fr]">
          {/* 2. Select Template */}
          <div className="space-y-3"><article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-[15px] font-semibold text-slate-800">2. เลือก Template Follow-up</h3>
            <div className="mt-4 space-y-3">
              <label onClick={() => setSelectedTemplate('30')} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selectedTemplate === '30' ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200'}`}>
                <input type="radio" name="template" checked={selectedTemplate === '30'} onChange={() => setSelectedTemplate('30')} className="mt-1 size-4 accent-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[14px] font-semibold text-slate-800">Follow-up Day 30</strong>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[16px] font-medium text-emerald-700">มาตรฐาน</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">ชุดการติดตามมาตรฐานสำหรับหัตถการทางออร์โธปิดิกส์ (CDC SSI Guideline) (30 วัน)</p>
                </div>
              </label>

              <label onClick={() => setSelectedTemplate('90')} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selectedTemplate === '90' ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200'}`}>
                <input type="radio" name="template" checked={selectedTemplate === '90'} onChange={() => setSelectedTemplate('90')} className="mt-1 size-4 accent-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[14px] font-semibold text-slate-800">Follow-up Day 90</strong>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[16px] font-medium text-emerald-700">มาตรฐาน</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">ชุดการติดตามมาตรฐานสำหรับหัตถการทางออร์โธปิดิกส์ (CDC SSI Guideline) (90 วัน)</p>
                </div>
              </label>
            </div>
          </article><FollowUpCalendar /></div>

          {/* 3. Follow-up Schedule Grid */}
          <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-800">3. เลือกรอบติดตาม (Follow-up Schedule)</h3>
              <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                <span>คำนวณวันอัตโนมัติ</span>
                <input type="checkbox" checked={autoCalculate} onChange={(e) => setAutoCalculate(e.target.checked)} className="toggle accent-blue-600 size-4" />
              </label>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50 text-[#1e293b]">
                  <tr className="h-10">
                    <th className="w-12 text-center"></th>
                    <th className="text-left">รอบ</th>
                    <th className="text-left">วันที่ติดตาม</th>
                    <th className="text-left">เวลา</th>
                    <th className="text-left">วิธีติดตาม</th>
                    <th className="text-left">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Day 1', '16 มิ.ย.2569', '09:00', 'โทรศัพท์ + ส่งรูปแผล', 'โทรติดตามอาการ/แผล'],
                    ['Day 7', '22 มิ.ย.2569', '09:00', 'โทรศัพท์ + ส่งรูปแผล', 'โทรติดตามอาการ/แผล'],
                    ['Day 14', '29 มิ.ย.2569', '09:00', 'โทรศัพท์ + ส่งรูปแผล', 'โทรติดตามอาการ/แผล'],
                    ['Day 21', '6 ก.ค.2569', '09:00', 'โทรศัพท์ + ส่งรูปแผล', 'โทรติดตามอาการ/แผล'],
                  ].map(([round, date, time, method, note]) => (
                    <tr key={round} className="h-12">
                      <td className="text-center text-slate-400">::</td>
                      <td>
                        <label className="flex items-center gap-2 font-medium text-slate-800">
                          <input type="checkbox" defaultChecked className="size-4 accent-blue-600" /> {round}
                        </label>
                      </td>
                      <td>
                        <input type="text" defaultValue={date} className="h-8 rounded border border-slate-200 px-2 text-[12px] text-slate-700" />
                      </td>
                      <td>
                        <select defaultValue={time} className="h-8 rounded border border-slate-200 px-2 text-[12px] text-slate-700">
                          <option>09:00</option>
                          <option>10:00</option>
                          <option>14:00</option>
                        </select>
                      </td>
                      <td>
                        <select defaultValue={method} className="h-8 rounded border border-slate-200 px-2 text-[12px] text-slate-700">
                          <option>โทรศัพท์ + ส่งรูปแผล</option>
                          <option>โทรศัพท์</option>
                          <option>LINE</option>
                        </select>
                      </td>
                      <td>
                        <input type="text" defaultValue={note} className="h-8 w-full rounded border border-slate-200 px-2 text-[12px] text-slate-700" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="flex w-full items-center justify-center gap-2 border-t border-dashed border-slate-200 py-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50/50">
                <Plus size={16} /> เพิ่มรอบติดตาม
              </button>
            </div>

          {/* Status Legend */}
          <div className="mt-4 flex gap-[18px] text-[14px] font-medium text-[#424752]">
            <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#16a34a]" /> ดำเนินการสำเร็จ</span>
            <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#3b82f6]" /> อยู่ระหว่างติดตามดำเนินการ</span>
            <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#6b7280]" /> ยังไม่เริ่มติดตาม</span>
            <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#ef4444]" /> เกินกำหนด</span>
          </div>

          {/* Template Info Banner */}
          <div className="mt-4 flex h-[52px] items-center justify-between rounded-xl bg-[#eff6ff] px-5 text-[14px]">
            <span className="text-[#424752]">
              <strong className="font-semibold text-[#175beb]">Template : Orthopedic Standard</strong> (ตามแนวทาง CDC SSI SurveillanceGuideline)
            </span>
            <span className="font-semibold text-[#175beb]">
              รวมทั้งหมด 6 รอบติดตาม
            </span>
          </div>
          </article>
        </section>
      </>}

      {/* Bottom Action Footer */}
      <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-6 text-[14px] font-medium text-slate-700 hover:bg-slate-50">
          <ArrowLeft size={15} />ย้อนกลับ
        </button>
        <button onClick={() => step < 3 ? setStep(step + 1) : setSaved(true)} className="h-10 rounded-xl bg-[#175beb] px-8 text-[14px] font-medium text-white hover:bg-blue-700 shadow-sm">
          <span className="inline-flex items-center gap-2">{step === 3 ? 'ส่งข้อมูล/บันทึก' : 'ถัดไป'} <ArrowRight size={15} /></span>
        </button>
      </div>
      {saved && <FollowUpSuccessModal onClose={() => navigate(`/cases/${patient.id}`)} onView={() => navigate('/my-follow-ups')} />}
    </div>
  )
}

function FollowUpSuccessModal({ onClose, onView }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#334155]/45 p-4" onMouseDown={onClose}><section role="dialog" aria-modal="true" className="relative w-full max-w-[512px] rounded-[18px] bg-white px-8 pb-9 pt-12 shadow-2xl" onMouseDown={event => event.stopPropagation()}><button onClick={onClose} className="absolute right-6 top-5 text-[#9ca3af]"><X size={22} strokeWidth={2.5} /></button><div className="mx-auto grid size-[86px] place-items-center rounded-full border-[10px] border-[#e5f9f1] bg-[#d1fae5] text-[#10b981]"><Check size={34} strokeWidth={3} /></div><h2 className="mt-6 text-center text-[25px] font-semibold text-[#172033]">บันทึกข้อมูลสำเร็จ</h2><p className="mt-2 text-center text-[17px] text-[#64748b]">บันทึกข้อมูล Follow-up เรียบร้อยแล้ว</p><div className="my-6 border-t border-[#e5e7eb]" /><div className="space-y-4 text-[15px] text-[#334155]"><div className="flex items-center justify-between"><span>หมายเลข Follow-up</span><strong className="inline-flex items-center gap-2 text-[17px] text-[#075acb]">SUR-2026-000125 <Copy size={16} /></strong></div><div className="flex justify-between"><span>วันที่สร้าง</span><strong className="font-medium">15 มิ.ย. 2569 10:45 น.</strong></div><div className="flex justify-between gap-6"><span>ผู้รับผิดชอบ</span><strong className="text-right font-medium">น.ส มัลลิกา คุรุครุภาคุล (OPD Nurse)</strong></div></div><div className="mt-8 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-[14px] leading-6 text-[#075acb]"><Info size={18} className="mt-1 shrink-0" fill="currentColor" />ระบบได้สร้างรอบติดตามและมอบหมายงานเรียบร้อยแล้ว สามารถตรวจสอบรายการได้ที่เมนู “ติดตามแผลผ่าตัด”</div><div className="mt-7 grid grid-cols-2 gap-3"><button onClick={onClose} className="h-[46px] rounded-lg border border-[#cbd5e1] text-[16px] font-medium text-[#334155]">ปิด</button><button onClick={onView} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-[#075acb] text-[16px] font-medium text-white">ไปยังรายการติดตามของฉัน <ArrowRight size={18} /></button></div></section></div>
}

function StepTwo() {
  const field = 'mt-2 h-[38px] w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-[13px] text-[#374151] outline-none focus:border-[#175beb]'
  return <>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-[15px] font-semibold text-[#002d73]">ผู้รับผิดชอบหลัก (Case Owner)</h3><div className="my-5 border-t border-slate-200" /><div className="grid grid-cols-[194px_194px_1fr] gap-2"><label className="text-[12px] font-medium">แผนกผู้ดูแลติดตามคนไข้ <span className="text-red-500">*</span><input className={field} defaultValue="" /></label><label className="text-[12px] font-medium">แผนกผู้ดูแลติดตามคนไข้ <span className="text-red-500">*</span><input className={field} defaultValue="" /></label><label className="text-[12px] font-medium">ชื่อ-นามสกุลผู้รับผิดชอบ <span className="text-red-500">*</span><input className={field} defaultValue="" /></label></div><p className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-[16px] text-blue-700"><strong>หมายเหตุ:</strong> ผู้รับผิดชอบหลักจะเป็นผู้ดูแลการติดตามผลและประเมินผู้ป่วยในทุกรอบ Follow-up</p></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-[15px] font-semibold text-[#002d73]">ข้อมูลเพิ่มเติม</h3><div className="my-5 border-t border-slate-200" /><div className="grid grid-cols-2 gap-6"><label className="text-[12px] font-medium">ความสำคัญ (Priority)<select className={field} defaultValue="Medium"><option>Medium</option><option>High</option><option>Low</option></select></label><label className="text-[12px] font-medium">วันที่เริ่มติดตาม<input className={field} defaultValue="15 มิ.ย. 2569" /></label></div><label className="mt-6 block text-[12px] font-medium">หมายเหตุ<textarea className="mt-2 h-[234px] w-full resize-none rounded-lg border border-[#cbd5e1] p-4 text-[13px] outline-none focus:border-[#175beb]" placeholder="เพิ่มหมายเหตุ (ถ้ามี)" /></label></section>
  </>
}

function StepThree({ patient }) {
  const infoRows = [['หมายเหตุ', '-'], ['ความสำคัญ(Priority)', '-'], ['หัตถการ', patient.procedure || '-'], ['ศัลยแพทย์', patient.surgeon || '-'], ['ช่องทางติดต่อผู้ป่วยหลัก', '-'], ['วันที่เริ่มติดตาม', '-'], ['หน่วยงาน', '-'], ['แผนกติดตามคนไข้', patient.patientType?.toUpperCase() || '-'], ['สร้างโดย', '-'], ['หน่วยงาน', patient.department || '-']]
  const schedule = []
  return <>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="text-[14px] font-semibold text-[#002d73]">รายการหัตถการในเคส (มี 2 รายการ) <Info size={15} className="inline text-slate-400" /></h3><div className="mt-3 overflow-hidden border border-slate-200"><table className="w-full text-[12px]"><thead className="h-10 bg-slate-50"><tr><th>ลำดับ</th><th>หัตถการ</th><th>ศัลยแพทย์</th><th>สถานะ SSI</th></tr></thead><tbody><tr className="h-12 text-center"><td>1</td><td>{patient.procedure || '-'}</td><td>{patient.surgeon}</td><td className="text-emerald-600">● เข้าเกณฑ์</td></tr></tbody></table></div><p className="mt-3 rounded bg-blue-50 px-3 py-2 text-[16px] text-blue-700"><Info size={14} className="mr-2 inline" />เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up</p></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-[15px] font-semibold text-[#002d73]">ข้อมูลเพิ่มเติม</h3><div className="my-4 border-t border-slate-200" /><div className="space-y-3">{infoRows.map(([label, value]) => <div key={`${label}-${value}`} className="flex justify-between text-[12px]"><span>{label}</span><strong className={`font-medium ${value.includes('Medium') ? 'text-orange-500' : ''}`}>{value}</strong></div>)}</div></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-[15px] font-semibold text-[#002d73]">การแจ้งเตือน (Notification)</h3><div className="my-4 border-t border-slate-200" /><p className="text-[12px] font-medium">● แจ้งเตือนผู้ป่วย</p><label className="mt-4 block text-[12px]">ช่วงเวลาแจ้งเตือน <span className="text-red-500">*</span><select className="mt-2 h-[38px] w-full rounded-lg border border-slate-200 px-3"><option>ก่อนถึงเวลา 24 ชั่วโมง</option></select></label><label className="mt-4 block text-[12px]">เบอร์แจ้งเตือนคนไข้ SMS <span className="text-red-500">*</span><select className="mt-2 h-[38px] w-full rounded-lg border border-slate-200 px-3"><option>-</option></select></label><label className="mt-6 flex items-center gap-3 text-[12px]"><input type="checkbox" defaultChecked className="size-4 accent-emerald-600" />ช่องทางแจ้งเตือน<br />SMS</label></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-[15px] font-semibold text-[#191c1e]">การติดตามที่แนะนำ <span className="ml-2 text-[13px] font-normal text-[#6b7280]">(Follow-up Schedule)</span></h3>
      <p className="mt-1 text-[13px] text-[#6b7280]">ระบบแนะนำรอบการติดตามมาตรฐานสำหรับหัตถการนี้</p>
      <div className="relative mt-8 flex justify-between before:absolute before:top-2 before:right-5 before:left-5 before:h-0.5 before:bg-[#175beb]">
        {schedule.map(([day, date], index) => (
          <div key={day} className="relative z-10 text-center">
            <i className={`mx-auto block size-4 rounded-full ${index === 0 ? 'bg-[#3b82f6]' : 'bg-[#6b7280]'} shadow-[0_0_0_4px_white]`} />
            <strong className="mt-3 block text-[13px] font-semibold text-[#175beb]">{day}</strong>
            <span className="block text-[16px] text-[#424752]">{date}</span>
            <span className="block text-[16px] text-[#424752]">09:00</span>
          </div>
        ))}
      </div>

      {/* Status Legend */}
      <div className="mt-6 flex gap-[18px] text-[14px] font-medium text-[#424752]">
        <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#16a34a]" /> ดำเนินการสำเร็จ</span>
        <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#3b82f6]" /> อยู่ระหว่างติดตามดำเนินการ</span>
        <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#6b7280]" /> ยังไม่เริ่มติดตาม</span>
        <span className="flex items-center gap-2"><i className="size-[10px] rounded-full bg-[#ef4444]" /> เกินกำหนด</span>
      </div>

      {/* Template Info Banner */}
      <div className="mt-4 flex h-[52px] items-center justify-between rounded-xl bg-[#eff6ff] px-5 text-[14px]">
        <span className="text-[#424752]">
          <strong className="font-semibold text-[#175beb]">Template : Orthopedic Standard</strong> (ตามแนวทาง CDC SSI SurveillanceGuideline)
        </span>
        <span className="font-semibold text-[#175beb]">
          รวมทั้งหมด 6 รอบติดตาม
        </span>
      </div>
    </section>
    <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-[#bfdbfe]/60 bg-[#eff6ff] px-5 py-3 text-[14px] leading-6 text-[#175beb]">
      <Info size={18} className="shrink-0 text-[#175beb]" />
      <span>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการสร้าง เมื่อยืนยันแล้วระบบจะไม่สามารถแก้ไขรายการหัตถการและรอบติดตามได้ (สามารถแก้ไขได้เฉพาะข้อมูลผู้รับผิดชอบและสถานะ)</span>
    </div>
  </>
}

function FollowUpCalendar() {
  const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
  const dates = [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8]
  const active = new Set([16, 22, 29, 6])
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-[13px] font-semibold"><ChevronLeft size={15} className="text-slate-400" /><span>มิ.ย.2569</span><ChevronRight size={15} className="text-slate-400" /></div><div className="mt-4 grid grid-cols-7 gap-y-3 text-center text-[16px]">{days.map(day => <span key={day} className="text-slate-400">{day}</span>)}{dates.map((date, index) => <span key={`${date}-${index}`} className={`mx-auto grid size-6 place-items-center rounded-full ${active.has(date) && index > 10 ? 'bg-[#175beb] text-white' : 'text-slate-600'} ${index < 3 || index > 33 ? 'text-slate-300' : ''}`}>{date}</span>)}</div></article>
}
