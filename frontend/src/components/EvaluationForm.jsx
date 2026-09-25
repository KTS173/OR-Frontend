import { useEffect, useState } from 'react'
import {
  Plus,
  CheckCircle2,
  X,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  FileText,
  ImagePlus,
  Upload
} from 'lucide-react'
import { api } from '../services/api.js'
import { normalizeFollowUpMethod } from '../utils/followUpMethods.js'

const fileToDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const formatThaiMobile = value => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

const isValidThaiMobile = value => /^0[689]\d{8}$/.test(String(value || '').replace(/\D/g, ''))

export default function EvaluationForm({ selectedPatient, setSelectedPatient, mode = 'scheduled', onCompleted }) {
  const isOutOfRound = mode === 'out-of-round'
  const [activeFollowUp, setActiveFollowUp] = useState(null)
  const [symptomConfig, setSymptomConfig] = useState([])
  const [methodConfig, setMethodConfig] = useState([])
  const [dischargeTreatmentConfig, setDischargeTreatmentConfig] = useState([])
  const [riskLevels, setRiskLevels] = useState([
    { id: 'low', name: 'ต่ำ', min: 0, max: 24, color: '#10b981' },
    { id: 'moderate', name: 'ปานกลาง', min: 25, max: 50, color: '#f59e0b' },
    { id: 'high', name: 'สูง', min: 51, max: 74, color: '#ef4444' },
    { id: 'critical', name: 'สูงมาก', min: 75, max: 100, color: '#7f1d1d' },
  ])
  // Evaluation Form States
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpMethod, setFollowUpMethod] = useState(''); // phone, sms, hospital
  const [followerName, setFollowerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactStatus, setContactStatus] = useState(''); // success, failed
  const [remarks, setRemarks] = useState('');

  // CDC Symptoms
  const [symptoms, setSymptoms] = useState({
    fever: '',
    pain: '',
    swell: '',
    red: '',
    pus: '',
    smell: '',
    gap: ''
  });
  const [otherSymptom, setOtherSymptom] = useState('');

  // Post-discharge treatments
  const [dischargeTreatment, setDischargeTreatment] = useState(''); // none, metDoctor, other
  const [dischargeTreatmentText, setDischargeTreatmentText] = useState('');

  // Preliminary Evaluation
  const [evalResult, setEvalResult] = useState(''); // not_infected, suspect_ssi, confirmed_ssi
  const [evalRemarks, setEvalRemarks] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');

  // Modal Visibility State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSubmitToDoctorModalOpen, setIsSubmitToDoctorModalOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState('');

  // Submit to Doctor Notification Options States
  const [notifySurgeon, setNotifySurgeon] = useState(false);
  const [notifyDashboard, setNotifyDashboard] = useState(false);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [attachments, setAttachments] = useState([])
  const [readingFiles, setReadingFiles] = useState(false)

  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null') } catch { return null } })()
  const documentAttachments = attachments.filter(item => !item.isImage)
  const imageAttachments = attachments.filter(item => item.isImage)

  const addAttachments = async (files, imagesOnly = false) => {
    const selected = Array.from(files || [])
    if (!selected.length) return
    const allowedDocuments = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const valid = []
    for (const file of selected) {
      const isImage = file.type.startsWith('image/')
      if (imagesOnly && !isImage) { alert('ส่วนรูปภาพแผลรองรับเฉพาะไฟล์รูปภาพ'); continue }
      if (!imagesOnly && !isImage && !allowedDocuments.includes(file.type)) { alert(`ไม่รองรับไฟล์ ${file.name}`); continue }
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} มีขนาดเกิน 5 MB`); continue }
      if (isImage && imageAttachments.length + valid.filter(item => item.isImage).length >= 5) { alert('แนบรูปภาพได้สูงสุด 5 รูปต่อการประเมิน'); break }
      valid.push({ file, isImage })
    }
    if (!valid.length) return
    setReadingFiles(true)
    try {
      const prepared = await Promise.all(valid.map(async ({ file, isImage }) => ({ id: crypto.randomUUID(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl: await fileToDataUrl(file), isImage })))
      setAttachments(items => [...items, ...prepared])
    } catch { alert('ไม่สามารถอ่านไฟล์แนบได้ กรุณาลองใหม่') }
    finally { setReadingFiles(false) }
  }

  const uploadAttachments = async (roundLabel) => {
    if (!attachments.length) return 0
    const results = await Promise.allSettled(attachments.map(item => api.createCaseDocument(selectedPatient.operationNo, {
      fileName: item.name,
      mimeType: item.type,
      fileSize: item.size,
      fileData: item.dataUrl,
      documentType: item.isImage ? 'FOLLOW_UP_IMAGE' : 'FOLLOW_UP_DOCUMENT',
      followUpRound: roundLabel,
      uploadedBy: currentUser?.name || followerName || null,
      department: currentUser?.department || selectedPatient.receivingDepartment || selectedPatient.department || null,
    })))
    const failed = results.filter(result => result.status === 'rejected').length
    if (failed < attachments.length) window.dispatchEvent(new Event('documents-updated'))
    setAttachments([])
    return failed
  }

  const resetAssessmentFields = () => {
    setFollowUpMethod(''); setFollowerName(''); setContactPhone(''); setContactStatus(''); setRemarks('')
    setSymptoms({ fever: '', pain: '', swell: '', red: '', pus: '', smell: '', gap: '' })
    setOtherSymptom('')
    setDischargeTreatment(''); setDischargeTreatmentText(''); setEvalResult(''); setEvalRemarks(''); setAttachments([])
  }

  useEffect(() => {
    let active = true
    api.getFollowUps(selectedPatient.operationNo).then((rows) => {
      if (!active) return
      const followUp = rows.find((item) => item.status === 'ACTIVE') || (isOutOfRound ? rows[0] : null)
      setActiveFollowUp(followUp)
      const index = followUp?.current_round_index || 0
      const round = followUp?.schedule?.[index]
      const nextRound = followUp?.schedule?.[index + 1]
      if (isOutOfRound) {
        const now = new Date()
        setFollowUpDate(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now))
        setFollowUpTime(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(now))
        setNextAppointment(round?.date || '')
      } else if (round) { setFollowUpDate(round.date || ''); setFollowUpTime(round.time || ''); setNextAppointment(nextRound?.date || '') }
    }).catch(() => setActiveFollowUp(null))
    return () => { active = false }
  }, [selectedPatient.operationNo, isOutOfRound])

  useEffect(() => {
    api.getSettings().then(settings => {
      const configuredSymptoms = (settings.ssiCriteria || []).filter(item => item.enabled !== false)
      setSymptomConfig(configuredSymptoms)
      setSymptoms(Object.fromEntries(configuredSymptoms.map(item => [String(item.id), ''])))
      setMethodConfig((settings.methods || []).map(normalizeFollowUpMethod).filter(item => item.name && item.enabled !== false))
      setDischargeTreatmentConfig((settings.dischargeTreatmentOptions || [
        { id: 'none', name: 'ไม่ได้ไปพบแพทย์', enabled: true },
        { id: 'metDoctor', name: 'ไปพบแพทย์แล้ว (OPD/IPD)', enabled: true },
        { id: 'other', name: 'อื่นๆ', enabled: true },
      ]).filter(item => item.enabled !== false))
      if (Array.isArray(settings.riskLevels) && settings.riskLevels.length) setRiskLevels(settings.riskLevels.map(level => level.id === 'moderate' && Number(level.max) === 49 ? { ...level, max: 50 } : level.id === 'high' && Number(level.min) === 50 ? { ...level, min: 51 } : level))
    }).catch(() => { setSymptomConfig([]); setMethodConfig([]); setDischargeTreatmentConfig([]) })
  }, [])

  const requiredSymptomsAnswered = symptomConfig.length > 0 && symptomConfig.every(item => symptoms[String(item.id)])
  const answeredSymptoms = Object.values(symptoms).filter(Boolean)
  const assessmentPoints = answeredSymptoms.reduce((sum, value) => /^(has|yes|true|มี)$/i.test(String(value)) ? sum + 1 : /^(unknown|unsure|ไม่ทราบ)$/i.test(String(value)) ? sum + 0.5 : sum, 0)
  const calculatedScore = answeredSymptoms.length ? Number(((assessmentPoints / answeredSymptoms.length) * 100).toFixed(2)) : null
  const calculatedRisk = calculatedScore == null ? null : riskLevels.find(level => calculatedScore >= Number(level.min) && calculatedScore <= Number(level.max)) || riskLevels[riskLevels.length - 1]
  const suggestedResult = calculatedScore == null ? '' : calculatedRisk?.id === 'low' ? 'not_infected' : 'suspect_ssi'
  const activeRoundIndex = activeFollowUp?.current_round_index || 0
  const activeRound = activeFollowUp?.schedule?.[activeRoundIndex]
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const scheduledDay = activeRound?.date ? new Date(`${activeRound.date}T00:00:00`) : null
  const roundIsDue = activeRoundIndex === 0 || !scheduledDay || today >= scheduledDay
  const validStaffPhone = isValidThaiMobile(contactPhone)
  const canSave = Boolean((isOutOfRound || roundIsDue) && activeFollowUp && followUpDate && followUpTime && followUpMethod && followerName && validStaffPhone && contactStatus && evalResult && requiredSymptomsAnswered)

  const saveAssessment = async (submittedToDoctor = false) => {
    const data = { followUpDate, followUpTime, followUpMethod, followerName, contactPhone, contactStatus, remarks, symptoms, otherSymptom, dischargeTreatment, dischargeTreatmentText, evalRemarks, nextAppointment, calculatedRisk: calculatedRisk?.id, suggestedResult, attachmentCount: attachments.length, submittedToDoctor, assessmentKind: isOutOfRound ? 'OUT_OF_ROUND' : 'SCHEDULED' }
    if (isOutOfRound) {
      const activity = await api.createActivity(selectedPatient.operationNo, { activityType: 'ประเมินนอกเวลาตามรอบ', activityAt: `${followUpDate}T${followUpTime}:00+07:00`, purpose: evalResult === 'suspect_ssi' ? 'ประเมินอาการสงสัย SSI' : 'ติดตามอาการหลังผ่าตัด', location: null, staff: followerName, contactPrimary: contactPhone, detail: evalRemarks || remarks || 'บันทึกผลประเมินนอกเวลาตามรอบ' })
      await api.createActivityEvaluation(selectedPatient.operationNo, { activityId: activity.id, evaluationType: 'SSI_ACTIVITY', result: evalResult, score: calculatedScore, evaluatedBy: followerName, evaluatedAt: `${followUpDate}T${followUpTime}:00+07:00`, data })
      const failedUploads = await uploadAttachments('กิจกรรมแทรก')
      window.dispatchEvent(new Event('activities-updated')); window.dispatchEvent(new Event('operations-updated'))
      onCompleted?.({ result: evalResult, failedUploads })
      return { failedUploads }
    }
    const completedIndex = activeFollowUp.current_round_index || 0
    const completedRound = activeFollowUp.schedule?.[completedIndex]?.day || `รอบที่ ${completedIndex + 1}`
    const saved = await api.createEvaluation(selectedPatient.operationNo, { evaluationType: 'SSI', result: evalResult, score: calculatedScore, roundIndex: completedIndex, data, evaluatedBy: followerName })
    const failedUploads = await uploadAttachments(completedRound)
    return { saved, failedUploads, completedIndex }
  }

  return (
    <>
      {!activeFollowUp && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">ยังไม่มี Follow-up สำหรับบันทึกผลประเมิน</div>}
      {!isOutOfRound && activeFollowUp && !roundIsDue && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">ยังไม่ถึงวันประเมิน {activeRound?.day || `รอบที่ ${activeRoundIndex + 1}`} กำหนดวันที่ {activeRound?.date} แบบประเมินจะเปิดให้บันทึกเมื่อถึงวันติดตาม</div>}
      <div className="evaluation-form-grid">
        {/* Left Column */}
        <div className="evaluation-left-column">
          {/* ข้อมูลการติดตาม */}
          <div className="sub-info-card evaluation-followup-card">
            <div className="sub-info-card-header">
              <h4 className="sub-info-card-title">{isOutOfRound ? 'ข้อมูลการประเมินนอกเวลาตามรอบ' : `ข้อมูลการติดตาม ${activeFollowUp?.schedule?.[activeFollowUp.current_round_index || 0]?.day || ''}`}</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>วันที่ติดตาม <span className="text-red-500 font-bold">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>เวลาติดตาม <span className="text-red-500 font-bold">*</span></label>
                <input
                  type="time"
                  className="form-input"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>วิธีการติดตาม <span className="text-red-500 font-bold">*</span></label>
              <div className="radio-group-horizontal">
                {methodConfig.map(method => <label key={method.id} className="radio-label">
                  <input type="radio" name="followUpMethod" className="radio-input" checked={followUpMethod === method.name} onChange={() => setFollowUpMethod(method.name)} />
                  <span>{method.name}</span>
                </label>)}
                {!methodConfig.length && <span className="text-sm text-slate-400">ยังไม่ได้ตั้งค่าวิธีติดตาม</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>ผู้ติดตาม <span className="text-red-500 font-bold">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={followerName}
                  onChange={(e) => setFollowerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>เบอร์ของเจ้าหน้าที่ที่ติดตาม <span className="text-red-500 font-bold">*</span></label>
                <input type="tel" inputMode="numeric" maxLength={12} placeholder="0XX-XXX-XXXX" className="form-input" value={contactPhone} onChange={event => setContactPhone(formatThaiMobile(event.target.value))} />
                {contactPhone && !isValidThaiMobile(contactPhone) && <p className="mt-1 text-[11px] leading-4 text-red-500">กรุณากรอกเบอร์มือถือไทย 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09</p>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>ติดต่อได้หรือไม่ <span className="text-red-500 font-bold">*</span></label>
              <div className="radio-group-horizontal">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="contactStatus"
                    className="radio-input"
                    checked={contactStatus === 'success'}
                    onChange={() => setContactStatus('success')}
                  />
                  <span>ติดต่อได้</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="contactStatus"
                    className="radio-input"
                    checked={contactStatus === 'failed'}
                    onChange={() => setContactStatus('failed')}
                  />
                  <span>ติดต่อไม่ได้</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>หมายเหตุ</label>
                <span className="char-counter">{remarks.length}/500</span>
              </div>
              <textarea
                placeholder="บันทึกเพิ่มเติม (ถ้ามี)"
                className="form-input"
                style={{ height: '80px', resize: 'vertical' }}
                maxLength={500}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* เอกสาร/ไฟล์แนบ */}
          <div className="sub-info-card evaluation-documents-card">
            <div className="sub-info-card-header">
              <h4 className="sub-info-card-title">เอกสาร/ไฟล์แนบ (ถ้ามี)</h4>
            </div>
            <label className="drag-drop-zone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addAttachments(event.dataTransfer.files, false) }}>
              <Upload size={24} className="text-slate-400" />
              <div className="drag-drop-title">คลิกหรือลากไฟล์มาวางที่นี่</div>
              <div className="drag-drop-subtitle">รองรับไฟล์ pdf, doc, docx, jpg, png ขนาดไม่เกิน 5 MB</div>
              <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" disabled={readingFiles} onChange={event => { addAttachments(event.target.files, false); event.target.value = '' }} />
            </label>
            {documentAttachments.length > 0 && <div className="mt-3 space-y-2">{documentAttachments.map(item => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px]"><FileText size={17} className="shrink-0 text-blue-600" /><span className="min-w-0 flex-1 truncate text-slate-700">{item.name}</span><span className="text-slate-400">{(item.size / 1024).toFixed(0)} KB</span><button type="button" onClick={() => setAttachments(items => items.filter(file => file.id !== item.id))} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`ลบ ${item.name}`}><X size={15} /></button></div>)}</div>}
          </div>

          {/* รูปภาพแผล */}
          <div className="sub-info-card evaluation-images-card">
            <div className="sub-info-card-header">
              <h4 className="sub-info-card-title">รูปภาพแผล (ถ้ามี)</h4>
            </div>
            <div className="drag-drop-subtitle" style={{ marginBottom: '8px' }}>
              รองรับไฟล์ .jpg .jpeg .png ขนาดไม่เกิน 5 MB (อัปโหลดได้สูงสุด 5 รูป)
            </div>
            <div className="wound-images-grid">
              {imageAttachments.map(item => <div key={item.id} className="wound-image-box"><img src={item.dataUrl} alt={item.name} /><button type="button" onClick={() => setAttachments(items => items.filter(file => file.id !== item.id))} className="wound-image-remove" aria-label={`ลบ ${item.name}`}><X size={13} /></button></div>)}
              {imageAttachments.length < 5 && <label className="wound-image-box wound-image-add"><ImagePlus size={18} /><span className="wound-image-box-label">เพิ่มรูปภาพ</span><input type="file" multiple className="hidden" accept="image/jpeg,image/png,image/webp" disabled={readingFiles} onChange={event => { addAttachments(event.target.files, true); event.target.value = '' }} /></label>}
            </div>
            {readingFiles && <p className="mt-2 text-[12px] text-blue-600">กำลังเตรียมไฟล์...</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="evaluation-right-column">
          {/* แบบประเมินอาการ CDC SSI */}
          <div className="sub-info-card evaluation-symptoms-card">
            <div className="sub-info-card-header">
              <h4 className="sub-info-card-title">แบบประเมินอาการ (CDC SSI)</h4>
            </div>

            <table className="assessment-table">
              <thead>
                <tr>
                  <th>อาการ/อาการแสดง</th>
                  <th className="assessment-table-center" style={{ width: '60px' }}>ไม่มี</th>
                  <th className="assessment-table-center" style={{ width: '60px' }}>มี</th>
                  <th className="assessment-table-center" style={{ width: '60px' }}>ไม่ทราบ</th>
                </tr>
              </thead>
              <tbody>
                {symptomConfig.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="assessment-table-center">
                      <input
                        type="radio"
                        name={item.id}
                        className="radio-input"
                        checked={symptoms[item.id] === 'no'}
                        onChange={() => setSymptoms(prev => ({ ...prev, [item.id]: 'no' }))}
                      />
                    </td>
                    <td className="assessment-table-center">
                      <input
                        type="radio"
                        name={item.id}
                        className="radio-input"
                        checked={symptoms[item.id] === 'yes'}
                        onChange={() => setSymptoms(prev => ({ ...prev, [item.id]: 'yes' }))}
                      />
                    </td>
                    <td className="assessment-table-center">
                      <input
                        type="radio"
                        name={item.id}
                        className="radio-input"
                        checked={symptoms[item.id] === 'unknown'}
                        onChange={() => setSymptoms(prev => ({ ...prev, [item.id]: 'unknown' }))}
                      />
                    </td>
                  </tr>
                ))}
                {!symptomConfig.length && <tr><td colSpan="4" className="py-6 text-center text-slate-400">ยังไม่ได้ตั้งค่าอาการสำหรับแบบประเมิน</td></tr>}
                <tr>
                  <td>อื่นๆ</td>
                  <td colSpan="3">
                    <input
                      type="text"
                      placeholder="ระบุอาการอื่นๆ"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '13px' }}
                      value={otherSymptom}
                      onChange={(e) => setOtherSymptom(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

          {/* การมารับการรักษาหลังจำหน่าย */}
          <div className="sub-info-card evaluation-treatment-card" style={{ padding: '20px' }}>
            <div className="sub-info-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 className="sub-info-card-title">การมารับการรักษาหลังจำหน่าย</h4>
            </div>
            <div className="checkbox-group-vertical">
              {dischargeTreatmentConfig.map(option => <label key={option.id} className="radio-label"><input type="radio" name="dischargeTreatment" className="radio-input" checked={dischargeTreatment === option.id} onChange={() => setDischargeTreatment(option.id)} /><span>{option.name}</span></label>)}
              {dischargeTreatment === 'other' && (
                <input
                  type="text"
                  placeholder="ระบุอาการอื่นๆ"
                  className="form-input"
                  value={dischargeTreatmentText}
                  onChange={(e) => setDischargeTreatmentText(e.target.value)}
                  style={{ fontSize: '13px', padding: '6px 10px', marginTop: '4px' }}
                />
              )}
            </div>
          </div>

          {/* ประเมินเบื้องต้น */}
          <div className="sub-info-card evaluation-result-card">
            <div className="sub-info-card-header">
              <h4 className="sub-info-card-title">ประเมินเบื้องต้น</h4>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>ผลการประเมิน SSI (ระบบคำนวณอัตโนมัติ)</label>
              <div className={`mt-2 rounded-lg border px-3 py-2.5 ${suggestedResult === 'suspect_ssi' ? 'border-orange-200 bg-orange-50' : suggestedResult === 'not_infected' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                {calculatedScore == null ? <p className="text-[12px] text-slate-500">กรุณาตอบแบบประเมินอาการให้ครบ</p> : <div className="flex items-center justify-between gap-3"><div><p className="text-[12px] font-semibold text-slate-700">ผลคำนวณจากแบบประเมิน: <span style={{ color: calculatedRisk?.color }}>{calculatedRisk?.name || '-'}</span></p><p className="mt-0.5 text-[11px] text-slate-500">ระบบใช้เป็นข้อมูลประกอบ ผลที่บันทึกยึดตามเจ้าหน้าที่</p></div><strong className="text-[15px]" style={{ color: calculatedRisk?.color }}>{calculatedScore}%</strong></div>}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setEvalResult('not_infected')} className={`rounded-lg border px-3 py-2.5 text-[13px] font-semibold ${evalResult === 'not_infected' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-600'}`}>ไม่เข้าข่ายการติดเชื้อ</button>
                <button type="button" onClick={() => setEvalResult('suspect_ssi')} className={`rounded-lg border px-3 py-2.5 text-[13px] font-semibold ${evalResult === 'suspect_ssi' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 bg-white text-slate-600'}`}>เข้าข่ายสงสัย SSI</button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>การจัดการ/คำแนะนำ</label>
                <span className="char-counter">{evalRemarks.length}/500</span>
              </div>
              <textarea
                placeholder="ระบุการจัดการหรือคำแนะนำที่ให้กับผู้ป่วย"
                className="form-input"
                style={{ height: '80px', resize: 'vertical' }}
                maxLength={500}
                value={evalRemarks}
                onChange={(e) => setEvalRemarks(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>นัดหมายติดตามครั้งถัดไป <span className="text-red-500 font-bold">*</span></label>
              <div className="relative mt-1">
                <input
                  type="text"
                  className="form-input w-full"
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  value={nextAppointment}
                  readOnly
                  title="ระบบกำหนดให้อัตโนมัติตามรอบ Follow-up"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pinned Action Bar */}
      <div className="form-action-bar">
        <div className="action-bar-left">
          {selectedPatient?.isOverdue ? (
            <span className="badge-outlined" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
              <AlertCircle size={14} />
              <span>เกินกำหนด</span>
            </span>
          ) : <span className="badge-outlined" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', borderColor: '#cbd5e1' }}><Clock size={14} /><span>ยังไม่ประเมิน</span></span>}
        </div>
        <div className="action-bar-right">
          <button
            type="button"
            className="btn-outlined-primary"
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => isOutOfRound ? onCompleted?.({ cancelled: true }) : setSelectedPatient?.(null)}
          >
            ปิด
          </button>
          {evalResult === 'suspect_ssi' && <button
            type="button"
            className="btn-outlined-primary"
            disabled={!canSave}
            onClick={() => setIsSubmitToDoctorModalOpen(true)}
          >
            <span>บันทึกการประเมิน/ส่งให้แพทย์ประเมิน</span>
          </button>}
          <button
            type="button"
            className="btn-filled-primary"
            disabled={!canSave}
            onClick={async () => {
              try {
                const { saved, failedUploads, completedIndex } = await saveAssessment(false)
                if (isOutOfRound) {
                  if (failedUploads) alert(`บันทึกผลประเมินแล้ว แต่มีไฟล์แนบ ${failedUploads} ไฟล์ที่อัปโหลดไม่สำเร็จ`)
                  return
                }
                if (saved.nextRound) {
                  const followingRound = activeFollowUp.schedule?.[completedIndex + 2]
                  setFollowUpDate(saved.nextRound.date || '')
                  setFollowUpTime(saved.nextRound.time || '')
                  setNextAppointment(followingRound?.date || '')
                  setActiveFollowUp((item) => ({ ...item, current_round_index: completedIndex + 1 }))
                  resetAssessmentFields()
                } else if (saved.followUpCompleted) {
                  setActiveFollowUp(null)
                  setNextAppointment('')
                }
                window.dispatchEvent(new Event('operations-updated'))
                setIsSaveModalOpen(true)
                if (failedUploads) alert(`บันทึกผลประเมินแล้ว แต่มีไฟล์แนบ ${failedUploads} ไฟล์ที่อัปโหลดไม่สำเร็จ`)
              } catch (error) { alert(error.message) }
            }}
          >
            <span>บันทึกการประเมิน</span>
          </button>
        </div>
      </div>

      {/* Success Save Modal */}
      {isSaveModalOpen && selectedPatient && (
        <div className="modal-overlay">
          <div className="success-modal">
            <button className="modal-close-btn" onClick={() => setIsSaveModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="success-icon-container">
              <CheckCircle2 size={44} strokeWidth={1.5} />
            </div>
            <h3 className="modal-title">บันทึกการประเมินเรียบร้อยแล้ว</h3>
            <p className="modal-subtitle">บันทึกข้อมูลการประเมิน</p>
            <p className="modal-subtitle-bold">โดยยังไม่ส่งให้แพทย์ตรวจ</p>

            <div className="w-full relative mb-3">
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14.5px] font-semibold text-slate-700 appearance-none outline-none cursor-pointer pr-10 shadow-sm transition hover:border-slate-300"
              >
                <option value="">เลือกการดำเนินการต่อ</option>
                <option value="normal">คนไข้เข้ารับการนัดปกติ</option>
                <option value="followup">ติดตามอาการเพิ่มเติม</option>
                <option value="refer">ส่งต่อแพทย์ผู้เชี่ยวชาญ</option>
                <option value="close">ยุติการติดตาม</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="modal-patient-box">
              <div className="modal-patient-details">
                <div className="modal-patient-avatar">
                  <User size={20} />
                </div>
                <div className="modal-patient-info-list">
                  <span className="modal-patient-hn">HN {selectedPatient.id}</span>
                  <span className="modal-patient-meta">
                    หัตถการ: {selectedPatient.procedure || '-'}
                  </span>
                  <span className="modal-patient-time">
                    วันที่ประเมิน: {followUpDate || '-'} เวลา {followUpTime || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-action-row" style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-outlined-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
                onClick={() => setIsSaveModalOpen(false)}
              >
                ปิด
              </button>
              <button
                type="button"
                className="btn-filled-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSelectedPatient?.(null);
                }}
              >
                <span>ไปยังรายการติดตามของฉัน</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit to Surgeon Modal */}
      {isSubmitToDoctorModalOpen && selectedPatient && (
        <div className="modal-overlay">
          <div className="submit-doctor-modal">
            <button className="modal-close-btn" onClick={() => setIsSubmitToDoctorModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="success-icon-container" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={44} strokeWidth={1.5} />
            </div>
            <h3 className="modal-title">ยืนยันการส่งการประเมินให้ศัลยแพทย์</h3>
            <p
              className="modal-subtitle"
              style={{ padding: '0 16px', marginBottom: '20px' }}
            >
              คุณต้องการส่งผลการติดตามและประเมินอาการ
              <br />
              ให้ศัลยแพทย์ผู้ทำการผ่าตัดตรวจสอบแล้วใช่หรือไม่
            </p>

            <div className="modal-patient-box" style={{ marginBottom: '16px' }}>
              <div className="modal-patient-details">
                <div className="modal-patient-avatar">
                  <User size={20} />
                </div>
                <div className="modal-patient-info-list">
                  <span className="modal-patient-hn">HN {selectedPatient.id}</span>
                  <span className="modal-patient-meta">
                    หัตถการ: {selectedPatient.procedure || '-'}
                  </span>
                  <span className="modal-patient-time">
                    วันที่ประเมิน: {followUpDate || '-'} เวลา {followUpTime || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Stats Grid */}
            <div className="modal-timeline-stats">
              <div className="stats-col">
                <span className="stats-col-label">การผ่าตัด</span>
                <span className="stats-col-value">{selectedPatient.procedure || '-'}</span>
              </div>
              <div className="stats-col">
                <span className="stats-col-label">รอบปัจจุบัน</span>
                <span className="stats-col-value" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{selectedPatient.round || '-'}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 'normal' }}>{followUpDate || '-'}</span>
                </span>
              </div>
              <div className="stats-col">
                <span className="stats-col-label">นัดติดตามถัดไป</span>
                <span className="stats-col-value" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{nextAppointment || '-'}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'normal' }}>ตามรอบที่กำหนดใน Follow-up</span>
                </span>
              </div>
            </div>

            {/* Surgeon Info Box */}
            <div className="modal-surgeon-info">
              <h4 className="modal-section-title">ข้อมูลศัลยแพทย์ผู้ผ่าตัด</h4>
              <div className="surgeon-detail-box">
                <span className="surgeon-name-title">{selectedPatient.surgeon || '-'}</span>
                <span className="surgeon-meta-text">ศัลยแพทย์ผู้ทำหัตถการ</span>
                <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                  <span className="surgeon-meta-text">แผนก: <strong>{selectedPatient.department || '-'}</strong></span>
                  <span className="surgeon-meta-text">เบอร์โทร: <strong>-</strong></span>
                </div>
              </div>
            </div>

            {/* Notification Checkbox Section */}
            <div className="modal-notification-section">
              <label className="checkbox-label" style={{ fontWeight: '600' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={notifySurgeon}
                  onChange={(e) => setNotifySurgeon(e.target.checked)}
                />
                <span>แจ้งเตือนแพทย์</span>
              </label>

              {notifySurgeon && (
                <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="notify-checkbox-row">
                    <label className="checkbox-label" style={{ fontSize: '12.5px' }}>
                      <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={notifyDashboard}
                        onChange={(e) => setNotifyDashboard(e.target.checked)}
                      />
                      <span>แจ้งเตือนในระบบ (Dashboard)</span>
                    </label>
                    <label className="checkbox-label" style={{ fontSize: '12.5px' }}>
                      <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={notifySMS}
                        onChange={(e) => setNotifySMS(e.target.checked)}
                      />
                      <span>ช่องทางแจ้งเตือน SMS</span>
                    </label>
                  </div>

                  {notifySMS && (
                    <div className="form-group" style={{ width: '100%' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '500' }}>แจ้งเตือนแพทย์ผ่านเบอร์ SMS <span className="text-red-500 font-bold">*</span></label>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <select
                          className="form-select"
                          style={{ paddingRight: '36px', fontSize: '13px' }}
                          value={notifyPhone}
                          onChange={(e) => setNotifyPhone(e.target.value)}
                        >
                          <option value="">ยังไม่มีเบอร์โทรศัพท์</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Notice Box */}
            <div className="modal-info-box">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <p>เมื่อส่งแล้ว ศัลยแพทย์จะได้รับการแจ้งเตือนและสามารถตรวจสอบผลการประเมินได้ทันที</p>
            </div>

            {/* Modal Actions */}
            <div className="modal-action-row" style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '24px' }}>
              <button
                type="button"
                className="btn-outlined-primary"
                style={{ padding: '12px 24px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
                onClick={() => setIsSubmitToDoctorModalOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-filled-primary"
                style={{ padding: '12px 24px', flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                onClick={async () => {
                  try {
                    if (isOutOfRound) {
                      const { failedUploads } = await saveAssessment(true)
                      setIsSubmitToDoctorModalOpen(false)
                      if (failedUploads) alert(`บันทึกและส่งให้แพทย์แล้ว แต่มีไฟล์แนบ ${failedUploads} ไฟล์ที่อัปโหลดไม่สำเร็จ`)
                      return
                    }
                    const completedIndex = activeFollowUp.current_round_index || 0
                    const completedRound = activeFollowUp.schedule?.[completedIndex]?.day || `รอบที่ ${completedIndex + 1}`
                    await api.createEvaluation(selectedPatient.operationNo, { evaluationType: 'SSI', result: 'suspect_ssi', roundIndex: completedIndex, data: { followUpDate, followUpTime, followUpMethod, followerName, contactPhone, contactStatus, remarks, symptoms, otherSymptom, dischargeTreatment, dischargeTreatmentText, evalRemarks, nextAppointment, submittedToDoctor: true, attachmentCount: attachments.length }, evaluatedBy: followerName })
                    const failedUploads = await uploadAttachments(completedRound)
                    window.dispatchEvent(new Event('operations-updated'))
                    setIsSubmitToDoctorModalOpen(false)
                    alert(failedUploads ? `บันทึกและส่งให้แพทย์แล้ว แต่มีไฟล์แนบ ${failedUploads} ไฟล์ที่อัปโหลดไม่สำเร็จ` : 'บันทึกลงประวัติและส่งไปที่แพทย์ตรวจสอบ SSI แล้ว')
                  } catch (error) { alert(error.message) }
                }}
              >
                <span>ส่งให้ศัลยแพทย์ (Submit to Surgeon)</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
