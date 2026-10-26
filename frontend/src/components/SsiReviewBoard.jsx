import { useEffect, useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api.js'
import './SsiReviewBoard.css'
import { prefillSsiReview, mergeSsiReviewPrefill } from '../utils/ssiReviewPrefill.js'

const classifications = [
  ['SUPERFICIAL', 'Superficial Incisional SSI', 'เกี่ยวข้องกับผิวหนังและชั้นไขมันใต้ผิวหนัง'],
  ['DEEP', 'Deep Incisional SSI', 'เกี่ยวข้องกับชั้น deep soft tissue (กล้ามเนื้อ/พังผืด)'],
  ['ORGAN_SPACE', 'Organ/Space SSI', 'เกี่ยวข้องกับอวัยวะ/ช่องว่างภายในที่ถูกเปิดหรือจัดการ'],
]
const risks = ['Age > 60 ปี', 'BMI > 28 kg/m²', 'Diabetes Mellitus (DM)', 'มีการติดเชื้อ/แผลบริเวณใกล้เคียง', 'สูบบุหรี่', 'ดื่ม Alcohol', 'มีโรคประจำตัวที่เพิ่มความเสี่ยง', 'Albumin < 3.5 g/dL', 'Bilirubin > 1.0 mg/dL', 'Admit ก่อนผ่าตัด > 2 วัน']
const bundle = ['เตรียมผิวหนังด้วยน้ำยาฆ่าเชื้อที่เหมาะสม (ระบุหากใช้น้ำยาอื่น)', 'ให้ Antibiotic prophylaxis ภายใน 60 นาที ก่อน Incision', 'Wound classification ถูกต้อง', 'จำกัดจำนวนบุคลากรในห้องผ่าตัด', 'ควบคุมระดับน้ำตาลในเลือด Intra-op < 180 mg/dL', 'ควบคุมอุณหภูมิห้องผ่าตัด 20–24 °C', 'Hair removal ด้วย clippers เท่านั้น', 'Irrigation ช่องท้องด้วยน้ำยาเหมาะสม (กรณีจำเป็น)', 'ใช้ Wound retractor ที่เหมาะสมเพื่อป้องกันแผลผ่าตัดเท่านั้น', 'ปิดแผลตามหลักปราศจากเชื้อ', 'บันทึกเวลา Incision และ Closure ถูกต้องครบถ้วน']
const findings = ['ไม่พบประเด็นความเสี่ยงเพิ่มเติม', 'พบ Risk factor', 'พบ Non-compliance SSI Bundle', 'ต้องติดตาม / ทบทวนเพิ่มเติม', 'ส่งต่อ IC / แจ้งทีมที่เกี่ยวข้อง']
const control = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500'
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const initial = () => ({ classification: '', header: {}, risks: {}, bundle: {}, findings: [], issues: '', correctiveAction: '', reviewer: '', reviewerRole: '', reviewDate: today() })

function Checklist({ title, rows, values, onChange, choices, color, hiddenRows = [] }) {
  return <section className="ssi-checklist-card overflow-hidden rounded-xl border border-slate-200 bg-white"><h3 className={`px-4 py-3 text-base font-semibold ${color}`}>{title}</h3><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-sm"><colgroup><col className="ssi-checklist-label" />{choices.map(([key]) => <col key={key} className="ssi-checklist-choice" />)}<col className="ssi-checklist-note" /></colgroup><thead className="bg-slate-50 text-left"><tr><th className="p-2">ปัจจัย / มาตรการ</th>{choices.map(([key, text]) => <th key={key} className="p-2 text-center">{text}</th>)}<th className="p-2">รายละเอียด / หมายเหตุ</th></tr></thead><tbody>{rows.map((label, index) => hiddenRows.includes(index) ? null : <tr key={label} className="border-t border-slate-100"><td className="p-2">{label}{values[index]?.source && <small className="mt-1 block text-[11px] font-normal text-blue-600">✓ {values[index].source}</small>}</td>{choices.map(([key, text]) => <td key={key} className="p-2 text-center"><label className="ssi-checklist-hit"><input type="radio" name={`${title}-${index}`} aria-label={`${label}: ${text}`} checked={values[index]?.answer === key} onChange={() => onChange(index, 'answer', key)} className="size-4 accent-blue-600" /></label></td>)}<td className="p-2"><input aria-label={`รายละเอียด ${label}`} className={`${control} min-w-32`} value={values[index]?.detail || ''} onChange={event => onChange(index, 'detail', event.target.value)} /></td></tr>)}</tbody></table></div></section>
}

export default function SsiReviewBoard({ patient }) {
  const selected = patient.operationNo
  const [review, setReview] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [savedPatient, setSavedPatient] = useState(null)
  useEffect(() => {
    if (!savedPatient) return
    const previousFocus = document.activeElement
    const button = document.getElementById('ssi-review-save-close')
    button?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') setSavedPatient(null)
      if (event.key === 'Tab') { event.preventDefault(); button?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus() }
  }, [savedPatient])
  const current = patient
  useEffect(() => {
    let active = true; setLoading(true); setMessage(''); setLoadError(''); setDirty(false)
    Promise.all([api.getSsiReview(selected), api.getPatient(selected), api.getEvaluations(selected), api.getSettings()]).then(([saved, source, history, settings]) => {
      if (!active) return
      const prefilled = prefillSsiReview(source, history, settings.ssiCriteria || [])
      setEvidence(prefilled.evidence)
      const { evidence: _evidence, ...fields } = prefilled
      const defaults = { ...initial(), ...fields }
      setReview(mergeSsiReviewPrefill(defaults, saved?.data || {})); setSavedAt(saved?.updated_at)
    }).catch(error => { if (active) setLoadError(error.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [selected])
  useEffect(() => { const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = '' } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [dirty])
  const update = (key, value) => { setReview(old => ({ ...old, [key]: value })); setDirty(true); setMessage('') }
  const updateRow = (section, index, field, value) => update(section, { ...review[section], [index]: { ...review[section][index], [field]: value, source: undefined } })
  const headerFields = [['hn', 'HN', current.id], ['episodeNo', 'EN', current.episodeNo], ['name', 'ชื่อผู้ป่วย', current.name], ['age', 'อายุ', current.age], ['sex', 'เพศ', current.sex], ['diagnosis', 'Diagnosis', current.diagnosis], ['procedure', 'Operation', current.procedure], ['surgeryDate', 'วันที่ / เวลาเริ่มผ่าตัด', current.startAt ? new Date(current.startAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : current.surgeryDate], ['surgeon', 'Surgeon', current.surgeon], ['operatingRoom', 'OR No. / Room', current.operatingRoom], ['scrubNurse', 'Scrub nurse', current.scrubNurse], ['circulatingNurse', 'Circulating nurse', current.circulatingNurse], ['anesthesia', 'Anesthesia team', [current.anesthesiologist, current.anesthesiaNurse].filter(Boolean).join(' / ')], ['bmi', 'BMI', current.bmi], ['comorbidities', 'โรคประจำตัว', current.comorbidities]]
  const save = async () => {
    setSaving(true); setMessage('')
    try {
      const header = Object.fromEntries(headerFields.map(([key, , value]) => [key, review.header[key] ?? value ?? '']))
      const saved = await api.saveSsiReview(selected, { ...review, header })
      setReview(saved.data); setSavedAt(saved.updated_at); setDirty(false); setMessage('บันทึก SSI Review เรียบร้อยแล้ว')
      setSavedPatient({ name: current.name, hn: current.id, episodeNo: current.episodeNo, operation: current.operationLabel || current.operationNo })
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  return <div className="ssi-review-board space-y-3">
    {savedPatient && <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setSavedPatient(null)}>
      <section role="dialog" aria-modal="true" aria-labelledby="ssi-review-save-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" onMouseDown={event => event.stopPropagation()}>
        <div className="px-6 pb-5 pt-6 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
          <h2 id="ssi-review-save-title" className="mt-4 text-lg font-semibold text-[#002d73]">บันทึก SSI Review สำเร็จ</h2>
          <p className="mt-2 text-sm text-slate-500">บันทึกข้อมูลการทบทวนของผู้ป่วยรายนี้เรียบร้อยแล้ว</p>
          <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm">
            {[['ชื่อผู้ป่วย', savedPatient.name], ['HN', savedPatient.hn], ['EN', savedPatient.episodeNo], ['รายการผ่าตัด', savedPatient.operation]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="shrink-0 text-slate-500">{label}</dt><dd className="min-w-0 break-words text-right font-medium text-slate-800">{value || '-'}</dd></div>)}
          </dl>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-4"><button id="ssi-review-save-close" type="button" onClick={() => setSavedPatient(null)} className="btn-primary">ปิด</button></div>
      </section>
    </div>}
    {loading ? <p className="p-6 text-slate-500">กำลังโหลดข้อมูลทบทวน...</p> : loadError ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{loadError}</p> : <>
      {evidence.length > 0 && <details className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm"><summary className="cursor-pointer font-medium text-[#002d73]">ข้อมูลจากประเมินตามรอบ ({evidence.length} รอบล่าสุด) · ติ๊กข้อมูลที่ตรงกันให้แล้ว</summary><div className="mt-3 grid gap-2 md:grid-cols-3">{evidence.map((item, index) => <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-6"><strong>{item.round}</strong> · {new Date(item.date).toLocaleDateString('th-TH')}<p>{({ not_infected: 'ไม่เข้าข่ายการติดเชื้อ', suspect_ssi: 'สงสัย SSI', confirmed_ssi: 'ยืนยัน SSI', CONFIRMED_SSI: 'ยืนยัน SSI', NOT_SSI: 'ไม่เข้าเกณฑ์ SSI' })[item.result] || item.result}</p>{item.symptoms.length > 0 && <p>อาการที่พบ: {item.symptoms.join(', ')}</p>}{item.advice && <p>ให้การรักษา/คำแนะนำ: {item.advice}</p>}</div>)}</div></details>}
      <div className="ssi-review-sheet">
      <section className="ssi-sheet-classification"><h3 className="text-base font-semibold text-indigo-800">SSI Classification (CDC)</h3><div className="ssi-classification-options">{classifications.map(([key, title, detail]) => <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${review.classification === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}><input type="radio" name="ssi-classification" className="mt-1 size-4 shrink-0 accent-indigo-600" checked={review.classification === key} onChange={() => update('classification', key)} /><span><strong className="text-sm">{title}</strong><small className="mt-2 block text-xs leading-5 text-slate-500">{detail}</small></span></label>)}</div></section>
        <div className="ssi-sheet-risks"><Checklist title="2. Pre-operative Risk Factors" color="bg-emerald-50 text-emerald-800" rows={risks} values={review.risks} choices={[['YES', 'Yes'], ['NO', 'No'], ['NA', 'N/A']]} onChange={(index, key, value) => updateRow('risks', index, key, value)} /></div>
        <div className="ssi-sheet-bundle"><Checklist title="3. Intra-operative SSI Prevention Bundle" color="bg-pink-50 text-pink-800" rows={bundle} values={review.bundle} choices={[['COMPLY', 'Comply'], ['NOT_COMPLY', 'Not comply'], ['NA', 'N/A']]} onChange={(index, key, value) => updateRow('bundle', index, key, value)} /></div>
      <section className="ssi-sheet-findings"><h3 className="font-semibold text-purple-800">4. ผลการทบทวน</h3><div className="mt-4 grid gap-3 md:grid-cols-3">{findings.map(text => <label key={text} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" className="mt-1 size-4" checked={review.findings.includes(text)} onChange={event => update('findings', event.target.checked ? [...review.findings, text] : review.findings.filter(item => item !== text))} />{text}</label>)}</div></section>
      <section className="ssi-sheet-plan"><h3 className="font-semibold text-orange-800">5. สรุปและแผนการดำเนินการ</h3><label className="mt-4 block text-sm">ประเด็นที่พบ / ข้อเสนอแนะ<textarea className={control} rows={2} value={review.issues} onChange={event => update('issues', event.target.value)} /></label><label className="mt-4 block text-sm">Corrective Action / การดำเนินการ<textarea className={control} rows={2} value={review.correctiveAction} onChange={event => update('correctiveAction', event.target.value)} /></label><div className="mt-4 grid gap-4 md:grid-cols-3">{[['reviewer', 'ผู้ทบทวน', 'text'], ['reviewerRole', 'ตำแหน่ง', 'text'], ['reviewDate', 'วันที่ทบทวน', 'date']].map(([key, label, type]) => <label key={key} className="text-sm">{label}<input type={type} className={control} value={review[key]} onChange={event => update(key, event.target.value)} /></label>)}</div></section>
      </div>
      <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{dirty ? 'มีข้อมูลที่ยังไม่บันทึก' : savedAt ? `บันทึกล่าสุด ${new Date(savedAt).toLocaleString('th-TH')}` : 'ยังไม่มีข้อมูลการทบทวน'}{message && <p role="status" className="mt-1 text-blue-700">{message}</p>}</div><button type="button" disabled={saving} onClick={save} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"><Save size={16} />{saving ? 'กำลังบันทึก...' : 'บันทึก SSI Review'}</button></footer>
    </>}
  </div>
}
