import { useMemo, useState } from 'react'
import './RisEntryPage.css'

const TextField = ({ id, label, type = 'text', ...props }) => <label className="ris-field"><span>{label}</span><input id={id} type={type} {...props} /></label>
const SelectField = ({ id, label, children }) => <label className="ris-field"><span>{label}</span><select id={id} defaultValue="">{children}</select></label>
const TextArea = ({ id, label, className = '' }) => <label className={`ris-field ${className}`}><span>{label}</span><textarea id={id} rows="3" /></label>

export default function RisEntryPage() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')

  const bmi = useMemo(() => Number(height) > 0 && Number(weight) > 0 ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(2) : '', [height, weight])
  const duration = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) return ''
    const minutes = Math.round((new Date(`${endDate}T${endTime}`) - new Date(`${startDate}T${startTime}`)) / 60000)
    return minutes >= 0 ? String(minutes) : ''
  }, [startDate, startTime, endDate, endTime])

  return (
    <main className="ris-page">
      <header className="ris-topbar"><div className="ris-brand">RIS</div><div><h1>RIS</h1><p>Operation Record Entry</p></div><span>DATA ENTRY</span></header>
      <form onSubmit={(event) => event.preventDefault()}>
        <RisPanel number="01" title="Patient Header">
          <div className="ris-grid ris-patient-grid">
            <TextField id="hn" label="HN *" placeholder="e.g. HN000123" /><TextField id="firstName" label="First Name" /><TextField id="lastName" label="Last Name" />
            <TextField id="dateOfBirth" label="Date of Birth" type="date" /><TextField id="age" label="Age" type="number" min="0" />
            <SelectField id="sex" label="Sex"><option value="">Select</option><option>MALE</option><option>FEMALE</option><option>OTHER</option><option>UNKNOWN</option></SelectField>
            <label className="ris-field"><span>Height (cm)</span><input id="heightCm" type="number" min="0" step="0.01" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
            <label className="ris-field"><span>Weight (kg)</span><input id="weightKg" type="number" min="0" step="0.01" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
            <label className="ris-field"><span>BMI</span><input id="bmi" value={bmi} readOnly placeholder="Auto" /></label>
            <TextField id="episodeNo" label="Episode Number *" /><TextField id="episodeDate" label="Episode Date" type="date" />
            <TextField id="wardName" label="Ward" /><TextField id="bedNo" label="Bed" />
          </div>
        </RisPanel>
        <RisPanel number="02" title="Operation Record">
          <div className="ris-grid">
            <TextField id="operationNo" label="Operation Number *" /><TextField id="surgeon" label="Surgeon" /><TextField id="secondSurgeon" label="Second Surgeon" /><TextField id="operationDepartment" label="Operation Department" />
            <TextField id="operationLocation" label="Operation Location" /><TextField id="operatingRoom" label="Resource / Operating Room" />
            <SelectField id="urgency" label="Elective or Emergency"><option value="">Select</option><option value="ELECTIVE">Elective</option><option value="EMERGENCY">Emergency</option></SelectField>
            <SelectField id="operationType" label="Operation Type"><option value="">Select</option><option value="MAJOR">Major</option><option value="MINOR">Minor</option><option value="DIAGNOSTIC">Diagnostic</option></SelectField>
            <TextArea id="preoperativeDiagnosis" label="Pre-operative Diagnosis" /><TextArea id="procedureName" label="Operation / Procedure Name *" /><TextArea id="procedureFreeText" label="Procedure Free Text" />
            <TextField id="primaryBodySite" label="Primary Operation Body Site" />
            <SelectField id="laterality" label="Laterality"><option value="">Select</option><option>LEFT</option><option>RIGHT</option><option>BILATERAL</option><option>NOT_APPLICABLE</option></SelectField>
            <TextField id="secondaryOperation" label="Secondary Operation" />
            <SelectField id="operationStatus" label="Status"><option value="">Select</option><option>PLANNED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></SelectField>
          </div>
        </RisPanel>
        <RisPanel number="03" title="Operation Notes">
          <div className="ris-grid ris-notes-grid">
            <label className="ris-field"><span>Operation Start Date</span><input id="operationStartDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label className="ris-field"><span>Operation Start Time</span><input id="operationStartTime" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
            <label className="ris-field"><span>Operation End Date</span><input id="operationEndDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            <label className="ris-field"><span>Operation End Time</span><input id="operationEndTime" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
            <label className="ris-field"><span>Operation Duration (minutes)</span><input id="operationDuration" value={duration} readOnly type="number" /></label>
          </div>
          <fieldset className="ris-outcomes"><legend>Operation Outcome</legend><div>{['NOT_SELECTED','CARDIAC_ARREST','CHANGE_TO_OTHER_OPERATION','DISCHARGE','DOT','INTRAOPERATIVE_HAEMORRHAGE','PACU','TRANSFER_TO_ICU','WARD'].map((value) => <label key={value}><input type="radio" name="operationOutcome" id={value === 'NOT_SELECTED' ? 'operationOutcome' : undefined} value={value} defaultChecked={value === 'NOT_SELECTED'} /><span>{value.replaceAll('_', ' ')}</span></label>)}</div></fieldset>
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
