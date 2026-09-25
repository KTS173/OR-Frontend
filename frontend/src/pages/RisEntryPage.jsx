import { useMemo, useState } from 'react'
import './RisEntryPage.css'

const TextField = ({ id, label, type = 'text', className = '', ...props }) => <label className={`ris-field ${className}`}><span>{label}</span><input id={id} type={type} {...props} /></label>
const SelectField = ({ id, label, className = '', children, ...props }) => <label className={`ris-field ${className}`}><span>{label}</span><select id={id} {...props}>{children}</select></label>
const TextArea = ({ id, label, className = '', ...props }) => <label className={`ris-field ${className}`}><span>{label}</span><textarea id={id} rows="3" {...props} /></label>

const emptyOperation = () => ({
  operationNo: '', operationDepartment: '', surgeon: '', secondSurgeon: '', thirdSurgeon: '',
  operatingRoom: '', urgency: '', operationType: '', primaryBodySite: '',
  preoperativeDiagnosis: '', procedureName: '', procedureFreeText: '', anesthesiologist: '', anesthesiaType: '',
  specialEquipment: '', scrubNurse: '', circulatingNurse: '', anesthesiaNurse: '', implantPresent: '', implant: '',
})

function OperationFields({ index, operation, onChange }) {
  const suffix = index + 1
  const fieldId = (name) => index === 0 ? name : `${name}-${suffix}`
  const update = (field) => (event) => onChange(index, field, event.target.value)
  return <div className="ris-grid ris-operation-grid">
    <TextField id={fieldId('operationNo')} label="Operation Number *" className="ris-op-span-3" value={operation.operationNo} onChange={update('operationNo')} />
    <TextField id={fieldId('operationDepartment')} label="Operation Department" className="ris-op-span-3" value={operation.operationDepartment} onChange={update('operationDepartment')} />
    <TextField id={fieldId('operatingRoom')} label="Resource / Operating Room" className="ris-op-span-3" value={operation.operatingRoom} onChange={update('operatingRoom')} />
    <SelectField id={fieldId('operationType')} label="Operation Type" className="ris-op-span-3" value={operation.operationType} onChange={update('operationType')}><option value="">Select</option><option value="MAJOR">Major</option><option value="MINOR">Minor</option></SelectField>
    <TextField id={fieldId('surgeon')} label="Surgeon" className="ris-op-span-4" value={operation.surgeon} onChange={update('surgeon')} />
    <TextField id={fieldId('secondSurgeon')} label="Second Surgeon" className="ris-op-span-4" value={operation.secondSurgeon} onChange={update('secondSurgeon')} />
    <TextField id={fieldId('thirdSurgeon')} label="Third Surgeon" className="ris-op-span-4" value={operation.thirdSurgeon} onChange={update('thirdSurgeon')} />
    <TextField id={fieldId('anesthesiologist')} label="Anesthesiologist" className="ris-op-span-4" value={operation.anesthesiologist} onChange={update('anesthesiologist')} />
    <TextField id={fieldId('anesthesiaType')} label="Anesthesia Type" className="ris-op-span-4" value={operation.anesthesiaType} onChange={update('anesthesiaType')} />
    <TextField id={fieldId('specialEquipment')} label="Special Equipment" className="ris-op-span-4" value={operation.specialEquipment} onChange={update('specialEquipment')} />
    <TextField id={fieldId('scrubNurse')} label="Scrub Nurse" className="ris-op-span-4" value={operation.scrubNurse} onChange={update('scrubNurse')} />
    <TextField id={fieldId('circulatingNurse')} label="Circulating Nurse" className="ris-op-span-4" value={operation.circulatingNurse} onChange={update('circulatingNurse')} />
    <TextField id={fieldId('anesthesiaNurse')} label="Anesthesia Nurse" className="ris-op-span-4" value={operation.anesthesiaNurse} onChange={update('anesthesiaNurse')} />
    <SelectField id={fieldId('urgency')} label="Elective or Emergency" className="ris-op-span-6" value={operation.urgency} onChange={update('urgency')}><option value="">Select</option><option value="ELECTIVE">Elective</option><option value="EMERGENCY">Emergency</option><option value="ELECTIVE_NOT_PLANNED">Elective Not Planned</option></SelectField>
    <TextField id={fieldId('primaryBodySite')} label="Primary Operation Body Site" className="ris-op-span-6" value={operation.primaryBodySite} onChange={update('primaryBodySite')} />
    <TextArea id={fieldId('preoperativeDiagnosis')} label="Pre-operative Diagnosis" className="ris-op-span-4 ris-op-textarea" value={operation.preoperativeDiagnosis} onChange={update('preoperativeDiagnosis')} />
    <TextArea id={fieldId('procedureName')} label="Operation / Procedure Name *" className="ris-op-span-4 ris-op-textarea" value={operation.procedureName} onChange={update('procedureName')} />
    <TextArea id={fieldId('procedureFreeText')} label="Procedure Free Text" className="ris-op-span-4 ris-op-textarea" value={operation.procedureFreeText} onChange={update('procedureFreeText')} />
    <SelectField id={fieldId('implantPresent')} label="Implant" className="ris-op-span-4" value={operation.implantPresent} onChange={update('implantPresent')}><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></SelectField>
    <TextField id={fieldId('implant')} label="Implant Details" className="ris-op-span-8" value={operation.implant} onChange={update('implant')} />
  </div>
}

export default function RisEntryPage() {
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [operations, setOperations] = useState(() => Array.from({ length: 3 }, emptyOperation))

  const age = useMemo(() => {
    if (!dateOfBirth) return ''
    const [year, month, day] = dateOfBirth.split('-').map(Number)
    const today = new Date()
    let calculatedAge = today.getFullYear() - year
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) calculatedAge -= 1
    return calculatedAge >= 0 ? String(calculatedAge) : ''
  }, [dateOfBirth])
  const bmi = useMemo(() => Number(height) > 0 && Number(weight) > 0 ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(2) : '', [height, weight])
  const duration = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) return ''
    const minutes = Math.round((new Date(`${endDate}T${endTime}`) - new Date(`${startDate}T${startTime}`)) / 60000)
    return minutes >= 0 ? String(minutes) : ''
  }, [startDate, startTime, endDate, endTime])
  const updateOperation = (index, field, value) => setOperations((items) => items.map((item, itemIndex) => (
    itemIndex === index ? { ...item, [field]: value } : item
  )))
  const enteredOperationNumbers = operations.map((item) => item.operationNo.trim()).filter(Boolean)
  const hasDuplicateOperationNo = new Set(enteredOperationNumbers).size !== enteredOperationNumbers.length

  return (
    <main className="ris-page">
      <header className="ris-topbar"><div className="ris-brand">RIS</div><div><h1>RIS</h1><p>Operation Record Entry</p></div><span>DATA ENTRY</span></header>
      <form onSubmit={(event) => event.preventDefault()}>
        <RisPanel number="01" title="Patient Header">
          <div className="ris-grid ris-patient-grid">
            <TextField id="hn" label="HN *" placeholder="e.g. HN000123" /><TextField id="firstName" label="First Name" /><TextField id="lastName" label="Last Name" />
            <TextField id="dateOfBirth" label="Date of Birth" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
            <TextField id="age" label="Age" type="number" value={age} readOnly placeholder="Auto" />
            <SelectField id="sex" label="Sex"><option value="">Select</option><option>MALE</option><option>FEMALE</option><option>OTHER</option><option>UNKNOWN</option></SelectField>
            <label className="ris-field"><span>Height (cm)</span><input id="heightCm" type="number" min="0" step="0.01" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
            <label className="ris-field"><span>Weight (kg)</span><input id="weightKg" type="number" min="0" step="0.01" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
            <label className="ris-field"><span>BMI</span><input id="bmi" value={bmi} readOnly placeholder="Auto" /></label>
            <TextField id="episodeNo" label="Episode Number *" /><TextField id="episodeDate" label="Episode Date" type="date" />
            <TextField id="wardName" label="Ward" />
          </div>
        </RisPanel>
        <RisPanel number="02" title="Operation Record">
          <div className="ris-operation-list">
            {operations.map((operation, index) => <details key={index} className="ris-operation-item">
              <summary><span>Operation Number {index + 1}</span><strong>{operation.operationNo || (index === 0 ? 'Required' : 'Optional')}</strong></summary>
              <OperationFields index={index} operation={operation} onChange={updateOperation} />
            </details>)}
          </div>
          {hasDuplicateOperationNo && <p className="ris-operation-error">Operation Number 1, 2 และ 3 ต้องไม่ซ้ำกัน</p>}
          <input id="operationRecordsPayload" type="hidden" value={JSON.stringify(operations)} readOnly />
        </RisPanel>
        <RisPanel number="03" title="Operation Notes">
          <div className="ris-grid ris-notes-grid">
            <label className="ris-field"><span>Operation Start Date</span><input id="operationStartDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label className="ris-field"><span>Operation Start Time</span><input id="operationStartTime" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
            <label className="ris-field"><span>Operation End Date</span><input id="operationEndDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            <label className="ris-field"><span>Operation End Time</span><input id="operationEndTime" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
            <label className="ris-field ris-span-2"><span>Operation Duration (minutes)</span><input id="operationDuration" value={duration} readOnly type="number" placeholder="Calculated automatically" /></label>
            <label className="ris-field ris-outcome-field ris-span-2"><span>Operation Outcome</span><select id="operationOutcome" defaultValue=""><option value="">Select outcome</option>{['DISCHARGE','PACU','ICU','NURSERY','NICU'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
          </div>
          <TextArea id="operationReportTemplate" label="Operation Report Template" className="ris-wide" />
        </RisPanel>
      </form>
      <div id="extensionStatus" className="ris-extension-status" role="status">Extension status: waiting for data</div>
      <footer>ข้อมูลในแบบฟอร์มนี้จะถูกส่งผ่าน RIS Extension ไปยังระบบฐานข้อมูล</footer>
    </main>
  )
}

function RisPanel({ number, title, children }) {
  return <section className="ris-panel"><div className="ris-panel-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>
}
