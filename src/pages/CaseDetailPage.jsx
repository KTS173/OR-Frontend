import { AlertTriangle, ArrowLeft, ArrowRight, Check, Info, Mail, MessageSquare, MinusCircle, Phone, RefreshCw, Send, UserRound, Users, X, Plus, Calendar, Clock, CheckCircle2, User, Save } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { patients } from '../data/mockData.js'

// Import sub-views
import EvaluationForm from '../components/EvaluationForm'
import TimelineView from '../components/TimelineView'
import TransferCareView from '../components/TransferCareView'
import DocsView from '../components/DocsView'
import SetupFollowUpView from '../components/SetupFollowUpView'

const validationItems = ['ข้อมูลผู้ป่วยครบถ้วน', 'มีข้อมูลหัตถการ', 'มีศัลยแพทย์', 'มีข้อมูลวันผ่าตัด', 'มีวันจำหน่าย', 'มีเบอร์โทรศัพท์พร้อมใช้งาน']

function DetailRow({ label, value }) {
  return <div className="flex min-h-5 items-start justify-between gap-4 text-[14px] leading-5 text-[#424752]"><span>{label}</span><strong className="text-right font-medium">{value}</strong></div>
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const patient = patients.find((item) => item.id === id) ?? patients[0]
  
  const [queueOpen, setQueueOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [excludeOpen, setExcludeOpen] = useState(false)

  // Tab state & activities
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isActivityAdded, setIsActivityAdded] = useState(false);
  const [isSetupFollowUpOpen, setIsSetupFollowUpOpen] = useState(false);

  // Form states for Add Activity Modal
  const [activityType, setActivityType] = useState('phone');
  const [purpose, setPurpose] = useState('follow_up_post_surgery');
  const [activityDate, setActivityDate] = useState('18 มิ.ย. 2569');
  const [activityTime, setActivityTime] = useState('13:30');
  const [location, setLocation] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('OPD Nurse B');
  const [primaryPhone, setPrimaryPhone] = useState(patient?.phone || '081-234-5678');
  const [secondaryPhone, setSecondaryPhone] = useState('-');
  const [activityRemarks, setActivityRemarks] = useState('คนไข้แจ้งปวดแผลบริเวณเข่าขวาเพิ่มขึ้นเล็กน้อย ต้องการติดตามอาการก่อนถึง Day 7');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [notifyTiming, setNotifyTiming] = useState('before_24h');
  const [notifySMS, setNotifySMS] = useState(true);

  const handleSend = () => {
    setQueueOpen(false)
    setSuccessOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-6 items-center justify-between">
        <Link to="/or-validation" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#175beb]">
          <ArrowLeft size={12}/>กลับไปหน้ารายการ
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[12px] text-blue-600">ข้อมูลจาก HIS / TrackCare</span>
          <StatusBadge>{patient.status}</StatusBadge>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <h1 className="header-title" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--or-navy)' }}>
          {isSetupFollowUpOpen ? 'ตั้งค่ารอบ Follow-up' : 'รายละเอียดเคสผ่าตัด (Case Detail)'}
        </h1>
      </div>

      {/* Patient horizontal profile summary & Validation status card */}
      <PatientSummary patient={patient}/>

      {/* Sub Tabs within Case Detail */}
      <nav className="mt-3 flex h-[73px] items-center justify-between rounded-lg border border-[#e2e8f0] bg-white px-[17px]">
        <div className="flex h-[39px] gap-6 border-b border-[#e2e8f0]">
          <button 
            className={`text-[16px] font-medium ${activeDetailTab === 'info' && !isSetupFollowUpOpen ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}
            onClick={() => {
              setActiveDetailTab('info');
              setIsSetupFollowUpOpen(false);
            }}
          >
            ข้อมูลคนไข้
          </button>
          <button 
            className={`text-[16px] font-medium ${activeDetailTab === 'evaluation' && !isSetupFollowUpOpen ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}
            onClick={() => {
              setActiveDetailTab('evaluation');
              setIsSetupFollowUpOpen(false);
            }}
          >
            ประเมินตามรอบ (รอบที่ 1)
          </button>
          <button 
            className={`text-[16px] font-medium ${activeDetailTab === 'timeline' && !isSetupFollowUpOpen ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}
            onClick={() => {
              setActiveDetailTab('timeline');
              setIsSetupFollowUpOpen(false);
            }}
          >
            การติดตาม / Timeline
          </button>
          <button 
            className={`text-[16px] font-medium ${activeDetailTab === 'transfer' && !isSetupFollowUpOpen ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}
            onClick={() => {
              setActiveDetailTab('transfer');
              setIsSetupFollowUpOpen(false);
            }}
          >
            ย้ายเคส / ส่งต่อการดูแล
          </button>
          <button 
            className={`text-[16px] font-medium ${activeDetailTab === 'docs' && !isSetupFollowUpOpen ? 'border-b-2 border-[#175beb] text-[#175beb]' : 'text-[#424752]'}`}
            onClick={() => {
              setActiveDetailTab('docs');
              setIsSetupFollowUpOpen(false);
            }}
          >
            เอกสาร
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-[#175beb] text-white px-[13px] text-[14px] hover:bg-blue-700 transition-colors"
            onClick={() => setIsAddActivityModalOpen(true)}
          >
            <Plus size={16} />
            <span>เพิ่มกิจกรรมแทรก</span>
          </button>
          <button className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] px-[13px] text-[14px] bg-white"><RefreshCw size={14}/>รีเฟรช</button>
        </div>
      </nav>

      {/* Timeline track (Day 1 - Day 30 status line) */}
      <div className="timeline-card" style={{ marginTop: '12px' }}>
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

        <div style={{ fontSize: '16px', color: 'var(--text-light)', marginTop: '12px' }}>
          หมายเหตุ: วันที่อาจเปลี่ยนแปลงได้ตามการกำหนดของโรงพยาบาล
        </div>
      </div>

      {/* Conditionally render SetupFollowUpView or the regular sub-tabs */}
      {isSetupFollowUpOpen ? (
        <SetupFollowUpView 
          selectedPatient={patient}
          onClose={() => setIsSetupFollowUpOpen(false)}
        />
      ) : (
        <>
          {activeDetailTab === 'info' && (
            <>
              <SurgerySection patient={patient}/>
              <ContactAndProcedures patient={patient}/>
            </>
          )}

          {activeDetailTab === 'evaluation' && (
            <EvaluationForm 
              selectedPatient={patient}
              setSelectedPatient={() => {}}
            />
          )}

          {activeDetailTab === 'timeline' && (
            <TimelineView 
              selectedPatient={patient}
              setActiveDetailTab={setActiveDetailTab}
              isActivityAdded={isActivityAdded}
              onSetupFollowUpClick={() => setIsSetupFollowUpOpen(true)}
            />
          )}

          {activeDetailTab === 'transfer' && (
            <TransferCareView 
              selectedPatient={patient}
              isActivityAdded={isActivityAdded}
            />
          )}

          {activeDetailTab === 'docs' && (
            <DocsView 
              selectedPatient={patient}
            />
          )}
        </>
      )}

      {/* Bottom control bar (shows only on Info tab) */}
      {activeDetailTab === 'info' && !isSetupFollowUpOpen && (
        <ActionBar onExclude={() => setExcludeOpen(true)} onQueue={() => setQueueOpen(true)}/>
      )}

      {/* Modals */}
      {queueOpen && <QueueModal patient={patient} onClose={() => setQueueOpen(false)} onSend={handleSend} />}
      {successOpen && <SuccessModal patient={patient} onClose={() => setSuccessOpen(false)} />}
      {excludeOpen && <ExcludeCaseModal patient={patient} onClose={() => setExcludeOpen(false)} />}

      {/* Add Intervening Activity Modal */}
      {isAddActivityModalOpen && patient && (
        <div className="modal-overlay">
          <div className="activity-modal">
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 className="modal-title" style={{ margin: 0, textAlign: 'left' }}>สร้างกิจกรรมเพิ่ม (ก่อนรอบนัดถัดไป)</h3>
                <p className="modal-subtitle" style={{ margin: 0, textAlign: 'left' }}>กำหนดกิจกรรมเพิ่มเติมในช่วงระหว่างรอบติดตาม</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddActivityModalOpen(false)} style={{ top: '24px', right: '24px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Patient Horizontal profile grid */}
            <div className="modal-patient-info-horizontal">
              <div className="patient-info-left-side" style={{ textAlign: 'left' }}>
                <div className="modal-patient-avatar" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#dbeafe', color: 'var(--color-primary)', marginRight: '16px', float: 'left' }}>
                  <User size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '16px', color: 'var(--text-light)' }}>HN {patient.id}</span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{patient.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                    ชาย • อายุ {patient.age} ปี (17 ม.ค. 2501)
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                    เบอร์โทร {patient.phone || '081-234-5678'}
                  </span>
                </div>
              </div>

              <div className="patient-info-right-side">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>สิทธิ์การรักษา</span>
                  <strong>ชำระเงินเอง</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>หัตถการผ่าตัด</span>
                  <strong>{patient.procedure} (เข่าขวา)</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>ศัลยแพทย์ผู้ผ่าตัด</span>
                  <strong>{patient.surgeon}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>ความเสี่ยง SSI</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="dot dot-orange"></span>
                    <strong>{patient.risk}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>รอบติดตาม</span>
                  <strong>Day 30 (6 รอบ)</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>รอบปัจจุบัน</span>
                  <strong>Day 1 (รอบที่ 1/6)</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-light)', fontSize: '16px' }}>นัดติดตามถัดไป</span>
                  <strong style={{ color: 'var(--color-primary)' }}>Day 7 (22 มิ.ย. 2569)</strong>
                </div>
              </div>
            </div>

            {/* Form Fields: รายละเอียดกิจกรรม */}
            <div style={{ textAlign: 'left', width: '100%' }}>
              <h4 className="modal-section-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>รายละเอียดกิจกรรม</h4>
              
              <div className="form-grid-three-cols">
                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>ประเภทกิจกรรม *</label>
                    <select className="form-select" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                      <option value="phone">โทรติดตามอาการ</option>
                      <option value="sms">SMS ติดตามอาการ</option>
                      <option value="visit">พบที่โรงพยาบาล</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>วัตถุประสงค์ *</label>
                    <select className="form-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                      <option value="follow_up_post_surgery">ติดตามอาการหลังผ่าตัด</option>
                      <option value="routine_check">ตรวจตามรอบนัด</option>
                    </select>
                  </div>
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>วันที่นัดหมายกิจกรรม *</label>
                    <select className="form-select" value={activityDate} onChange={(e) => setActivityDate(e.target.value)}>
                      <option value="18 มิ.ย. 2569">18 มิ.ย. 2569</option>
                      <option value="19 มิ.ย. 2569">19 มิ.ย. 2569</option>
                      <option value="20 มิ.ย. 2569">20 มิ.ย. 2569</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label>เวลานัดหมาย *</label>
                      <select className="form-select" value={activityTime} onChange={(e) => setActivityTime(e.target.value)}>
                        <option value="13:30">13:30</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>สถานที่ (ถ้ามี)</label>
                      <input 
                        type="text" 
                        placeholder="เช่น โรงพยาบาล / ที่บ้าน / อื่นๆ" 
                        className="form-input" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>ผู้รับผิดชอบกิจกรรม *</label>
                    <select className="form-select" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)}>
                      <option value="OPD Nurse B">OPD Nurse B</option>
                      <option value="OPD Staff A">OPD Staff A</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label>ช่องทางการติดต่อที่ 1 *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={primaryPhone} 
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>ช่องทางการติดต่อสำรอง *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={secondaryPhone} 
                        onChange={(e) => setSecondaryPhone(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Textarea */}
              <div className="form-group" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>รายละเอียดกิจกรรม *</label>
                  <span className="char-counter">{activityRemarks.length}/500</span>
                </div>
                <textarea 
                  className="form-input" 
                  style={{ height: '70px', resize: 'vertical', fontSize: '13px' }}
                  maxLength={500}
                  value={activityRemarks}
                  onChange={(e) => setActivityRemarks(e.target.value)}
                />
              </div>
            </div>

            {/* Notification Section */}
            <div style={{ textAlign: 'left', width: '100%', marginTop: '16px' }}>
              <h4 className="modal-section-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>การแจ้งเตือน</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="checkbox-label" style={{ fontWeight: '600' }}>
                  <input 
                    type="checkbox" 
                    className="checkbox-input"
                    checked={notifyPatient}
                    onChange={(e) => setNotifyPatient(e.target.checked)}
                  />
                  <span>แจ้งเตือนผู้ป่วย</span>
                </label>

                {notifyPatient && (
                  <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                      <label style={{ fontSize: '16px', color: 'var(--text-medium)', fontWeight: '500' }}>ช่วงเวลาแจ้งเตือน *</label>
                      <select className="form-select" value={notifyTiming} onChange={(e) => setNotifyTiming(e.target.value)} style={{ fontSize: '13px' }}>
                        <option value="before_24h">ก่อนถึงเวลานัด 24 ชั่วโมง</option>
                        <option value="before_12h">ก่อนถึงเวลานัด 12 ชั่วโมง</option>
                        <option value="before_1h">ก่อนถึงเวลานัด 1 ชั่วโมง</option>
                      </select>
                    </div>

                    <label className="checkbox-label" style={{ fontSize: '12.5px' }}>
                      <input 
                        type="checkbox" 
                        className="checkbox-input"
                        checked={notifySMS}
                        onChange={(e) => setNotifySMS(e.target.checked)}
                      />
                      <span>ช่องทางแจ้งเตือนผู้ป่วย SMS</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-action-row" style={{ marginTop: '24px', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="clear-btn" 
                style={{ padding: '12px 24px', flex: 'none', minWidth: '100px' }}
                onClick={() => setIsAddActivityModalOpen(false)}
              >
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="btn-filled-primary"
                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 'none', minWidth: '150px' }}
                onClick={() => {
                  alert('สร้างกิจกรรมแทรกเพิ่มเติมเรียบร้อยแล้ว');
                  setIsAddActivityModalOpen(false);
                  setIsActivityAdded(true);
                  setActiveDetailTab('timeline'); // Switch to Timeline view so the user sees the newly added activity
                }}
              >
                <Save size={16} />
                <span>บันทึกกิจกรรม</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

function ActionBar({ onExclude, onQueue }) {
  return <section className="mt-3 flex h-[62px] items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-6 shadow-sm">
    <button onClick={onExclude} className="inline-flex h-[37px] items-center justify-center gap-2 rounded-xl border border-red-400 bg-white px-5 text-[14px] font-medium text-red-500 transition hover:bg-red-50"><MinusCircle size={16}/>ตัดเคสออก</button>
    <div className="flex w-[291px] items-center gap-3">
      <button className="inline-flex h-[37px] w-[133px] items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-white text-[14px] font-medium text-[#424752]"><Check size={14}/>บันทึกข้อมูล</button>
      <button onClick={onQueue} className="inline-flex h-[38px] w-[146px] items-center justify-center gap-2 rounded-lg bg-[#175beb] text-[14px] font-medium text-white shadow-sm"><Send size={14}/>ส่งเข้า Queue</button>
    </div>
  </section>
}

function PatientSummary({ patient }) {
  return <section className="mt-3 grid gap-3 xl:grid-cols-[827fr_273fr]"><article className="flex h-[273px] items-center gap-[31px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] pb-[25px] pt-[13px] shadow-sm"><div className="grid size-[98px] shrink-0 place-items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"><UserRound size={60} strokeWidth={1.4}/></div><div className="min-w-0 flex-1"><p className="text-[14px] font-medium leading-7 text-[#424752]">HN <span className="ml-1">{patient.id}</span></p><h2 className="text-[24px] font-semibold leading-8 text-[#191c1e]">{patient.name}</h2><div className="mt-[11px] grid grid-cols-[177px_161px_1fr]"><div className="space-y-2"><DetailRow label="เพศ" value={patient.sex}/><DetailRow label="อายุ" value={`${patient.age} ปี`}/><DetailRow label="เบอร์โทร" value="081-234-5678"/><DetailRow label="วันเกิด" value="17 ม.ค. 2501"/></div><div className="ml-2 space-y-2 border-l border-black/10 px-3"><DetailRow label="เชื้อชาติ" value="ไทย"/><DetailRow label="สัญชาติ" value="ไทย"/><DetailRow label="สิทธิการรักษา" value="-"/></div><div className="ml-2 border-l border-black/10 pl-3 text-[14px] text-[#424752]"><p>ที่อยู่</p><strong className="mt-2 block font-medium">99/9 หมู่ 4 จ.เชียงใหม่ 5100</strong></div></div></div></article><aside className="h-[273px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h2 className="text-[16px] font-medium leading-7 text-[#424752]">สถานะข้อมูล (Validation)</h2><div className="mt-2 space-y-2">{validationItems.map(item=><p key={item} className="flex items-center gap-2 text-[14px] leading-5 text-[#424752]"><span className="grid size-[18px] place-items-center rounded-full bg-[#16a34a] text-white"><Check size={12} strokeWidth={3}/></span>{item}</p>)}</div><div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-[5px] text-center text-[12px] leading-6 text-emerald-700">ข้อมูลพร้อมสำหรับสร้าง Follow-up</div></aside></section>
}

function SurgerySection({ patient }) {
  const surgery = [['วันที่ผ่าตัด',patient.surgeryDate],['วันที่จำหน่าย','15 มิ.ย. 2569'],['เวลาเริ่มผ่าตัด','10:10 น.'],['เวลาสิ้นสุดผ่าตัด','12:10 น.'],['ระยะเวลาผ่าตัด','2 ชม. 40 นาที'],['ประเภทผู้ป่วย','OPD'],['หัตถการ',patient.procedure]]
  return <section className="mt-3 grid gap-3 xl:grid-cols-[740fr_360fr]"><article className="h-[274px] rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm"><h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลการผ่าตัด (Surgery Information)</h3><div className="mt-3 grid grid-cols-2 gap-x-6"><div className="space-y-2">{surgery.map(([l,v])=><DetailRow key={l} label={l} value={v}/>)}</div><div className="space-y-2 border-l border-black/10 pl-6">{[['ศัลยแพทย์',patient.surgeon],['แผนก',patient.department],['ห้องผ่าตัด','OR 4'],['ประเภทแผล','Clean wound'],['ASA Class','Class II'],['Implant','Total knee prosthesis'],['Diagnosis','Primary osteoarthritis']].map(([l,v])=><DetailRow key={l} label={l} value={v}/>)}</div></div></article><article className="h-[274px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm"><h3 className="px-6 py-[13px] text-[16px] font-medium text-[#002d73]">ปัจจัยเสี่ยง SSI</h3>{[['อายุ > 60 ปี','มี'],['เบาหวาน','มี'],['การติดเชื้อก่อนผ่าตัด','ไม่มี']].map(([l,v])=><div key={l} className="flex h-[42px] items-center justify-between border-t border-slate-100 px-6 text-[14px] text-[#424752]"><span>{l}</span><span className="inline-flex items-center gap-2"><span className={`grid size-[18px] place-items-center rounded-full text-white ${v==='มี'?'bg-[#16a34a]':'bg-slate-400'}`}><Check size={12}/></span>{v}</span></div>)}<div className="flex h-[58px] items-center justify-between border-t border-black/10 px-6 text-[14px] font-medium"><span>Risk Score</span><span className="flex items-center gap-3 font-semibold">72 % <i className="size-[7px] rounded-full bg-[#f57e0c]"/>ปานกลาง</span></div></article></section>
}

function ContactAndProcedures({ patient }) {
  const contacts = [
    [Phone, 'เบอร์โทรหลัก', '081-234-5678', 'text-[#175beb]'],
    [Phone, 'เบอร์โทร 2', '-', 'text-[#175beb]'],
    [MessageSquare, 'Line', 'Somchai_jaidee', 'text-[#16a34a]'],
    [MessageSquare, 'SMS', '081-234-5678', 'text-[#475569]'],
    [Mail, 'อีเมล', '-', 'text-[#475569]'],
  ]
  return <section className="mt-3 grid min-h-[216px] gap-3 xl:grid-cols-[332fr_740fr]">
    <article className="rounded-xl border border-[#e2e8f0] bg-white px-[25px] py-[13px] shadow-sm">
      <h3 className="text-[16px] font-medium leading-7 text-[#002d73]">ข้อมูลติดต่อ (Contact)</h3>
      <div className="mt-3 space-y-3">{contacts.map(([Icon,label,value,color])=><div key={label} className="flex items-center justify-between text-[14px] leading-5 text-[#424752]"><span className="inline-flex items-center gap-1"><Icon size={20} className={color}/>{label}</span><strong className="font-medium">{value}</strong></div>)}</div>
    </article>
    <article className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-[13px] shadow-sm">
      <h3 className="inline-flex items-center gap-1 text-[16px] font-medium leading-7 text-[#002d73]">รายการหัตถการในเคส (มี 1 รายการ)<Info size={17} className="text-[#64748b]"/></h3>
      <div className="overflow-hidden border border-black/10 shadow-sm"><table className="w-full table-fixed text-[12px] text-[#434651]"><thead className="h-[40px] bg-[#f8fafc] font-semibold uppercase tracking-[.6px] text-[#1e293b]"><tr><th className="w-[110px] text-center">ลำดับ</th><th className="text-left">หัตถการ</th><th className="text-left">ศัลยแพทย์</th><th className="w-[140px] text-center">สถานะ SSI</th></tr></thead><tbody><tr className="h-[57px]"><td className="text-center font-medium">1</td><td>TKA (เข่าขวา)</td><td>{patient.surgeon.replace('นพ.', 'นพ')}</td><td className="text-center"><span className="inline-flex items-center gap-1 text-[#16a34a]"><i className="size-[7px] rounded-full bg-[#16a34a]"/>เข้าเกณฑ์</span></td></tr></tbody></table></div>
      <div className="flex min-h-[34px] items-center gap-2 rounded border border-[#0057b8]/10 bg-[#eff6ff] px-[13px] py-[5px] text-[12px] leading-6 text-[#0057b8]"><Info size={17} className="shrink-0"/>เฉพาะหัตถการที่เข้าเกณฑ์ SSI Surveillance เท่านั้นที่ต้องสร้าง Follow-up</div>
    </article>
  </section>
}

function ExcludeCaseModal({ patient, onClose }) {
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const canSubmit = reason && confirmed
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#334155]/45 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="exclude-title" className="relative flex w-full max-w-[512px] max-h-[90vh] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl" onMouseDown={event=>event.stopPropagation()}>
      <button onClick={onClose} className="absolute right-6 top-6 z-10 text-[#9ca3af]"><X size={22} strokeWidth={2.4}/></button>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-5 pt-8 text-center">
        <div className="mx-auto grid size-[64px] place-items-center rounded-full border-4 border-[#fda4af] bg-[#fee2e2] text-[#ef191f]"><AlertTriangle size={25} strokeWidth={2.5}/></div>
        <h2 id="exclude-title" className="mt-4 text-[24px] font-semibold leading-8 text-[#202124]">ไม่เข้าเงื่อนไขการเฝ้าระวัง SSI</h2>
        <p className="mt-2 text-[16px] text-[#6b7280]">คุณต้องการนำผู้ป่วยออกจากระบบการเฝ้าระวังหรือไม่</p>
        <div className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-left text-[#20242b]"><div className="flex items-baseline gap-x-5"><strong className="text-[17px]">HN {patient.id}</strong><strong className="text-[18px]">{patient.name}</strong></div><p className="mt-2 text-[14px] font-medium text-[#4b5563]">{patient.sex} • อายุ {patient.age} ปี (17 ม.ค. 2501)</p><p className="mt-2 text-[14px] font-medium text-[#4b5563]">หัตถการ: TKA (เข่าขวา)</p><div className="mt-2 flex gap-x-6 text-[14px] font-medium text-[#4b5563]"><span>วันที่ผ่าตัด: {patient.surgeryDate}</span><span>วันที่จำหน่าย: 15 มิ.ย. 2569</span></div></div>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">เหตุผลที่ไม่เข้าเงื่อนไข <span className="text-red-500">*</span><select value={reason} onChange={event=>setReason(event.target.value)} className="mt-2 h-[44px] w-full rounded-lg border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#64748b] shadow-sm outline-none focus:border-[#175beb]"><option value="">เลือกเหตุผล</option><option>หัตถการไม่เข้าเกณฑ์ SSI Surveillance</option><option>ข้อมูลผู้ป่วยซ้ำ</option><option>ยกเลิกการผ่าตัด</option><option>เหตุผลอื่น</option></select></label>
        <label className="mt-4 block text-left text-[14px] font-medium text-[#334155]">รายละเอียดเพิ่มเติม (ถ้ามี)<textarea className="mt-2 h-[78px] w-full resize-none rounded-lg border border-[#cbd5e1] p-3 text-[14px] shadow-sm outline-none focus:border-[#175beb]" placeholder="ระบุรายละเอียดเพิ่มเติม"/></label>
        <label className="mt-4 flex items-center gap-3 text-left text-[14px] font-medium text-[#334155]"><input checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} type="checkbox" className="size-5 rounded accent-[#175beb]"/>ยืนยันว่าข้อมูลถูกต้องและไม่เข้าเกณฑ์การเฝ้าระวัง</label>
      </div>
      <footer className="grid h-[82px] shrink-0 grid-cols-2 gap-3 border-t border-[#f1f5f9] bg-[#fafafa] px-8 py-4"><button onClick={onClose} className="rounded-lg border border-[#cbd5e1] bg-white text-[16px] font-semibold text-[#374151] shadow-sm">ยกเลิก</button><button disabled={!canSubmit} onClick={onClose} className={`rounded-lg text-[16px] font-semibold text-white shadow-sm ${canSubmit?'bg-[#e92323] hover:bg-red-700':'cursor-not-allowed bg-[#f87171]'}`}>ยืนยันการยกออก</button></footer>
    </section>
  </div>
}

function QueueModal({ patient, onClose, onSend }) {
  return <div className="fixed inset-0 z-50 bg-slate-950/45" onMouseDown={onClose}><aside className="absolute inset-y-0 right-0 w-full max-w-[708px] overflow-y-auto bg-white shadow-2xl" onMouseDown={(e)=>e.stopPropagation()}>
    <header className="flex h-[85px] items-center justify-between border-b border-slate-200 px-6"><div><h2 className="text-[20px] font-semibold text-[#1f2937]">ส่งเคสไปยัง OPD/IPD Queue</h2><p className="mt-1 text-[14px] text-slate-500">กำหนดปลายทางและแผนการติดตามเบื้องต้นก่อนส่งต่อ</p></div><button onClick={onClose}><X size={20} className="text-slate-400"/></button></header>
    <div className="space-y-6 p-6">
      <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-[17px]"><h3 className="flex items-center gap-2 text-[16px] font-semibold text-blue-800"><Users size={20}/>สรุปข้อมูลเคส</h3><div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">{[['ชื่อผู้ป่วย',patient.name],['แผนกต้นทาง',patient.department],['HN',`HN${patient.id}`],['หัตถการ',patient.procedure],['ความเสี่ยง SSI',patient.risk],['ศัลยแพทย์',patient.surgeon]].map(([k,v])=><div key={k} className="grid grid-cols-[89px_1fr]"><span className="text-slate-500">{k}</span><strong className="font-medium">{v}</strong></div>)}</div></section>
      <section className="space-y-5">{[['เลือกปลายทาง *','tabs'],['เลือกแผนก *','select'],['กำหนดระดับความสำคัญ *','priority']].map(([label,type])=><div key={label} className="grid grid-cols-[209px_1fr] items-center"><label className="text-[14px]">{label}</label>{type==='tabs'?<div className="grid h-[38px] grid-cols-2 overflow-hidden rounded-lg border border-slate-300"><button className="border-r border-blue-400 bg-blue-50 text-blue-600">OPD</button><button>IPD</button></div>:type==='select'?<select className="field h-[39px]"><option>ศัลยกรรมทั่วไป (General Surgery)</option></select>:<div className="grid grid-cols-3 gap-2"><button className="h-[38px] rounded-lg border border-blue-400 bg-blue-50 text-blue-600">ปกติ</button><button className="h-[38px] rounded-lg border border-slate-300">ด่วน</button><button className="h-[38px] rounded-lg border border-slate-300">เร่งด่วน</button></div>}</div>)}
        <div className="grid grid-cols-[209px_1fr]"><label className="pt-2 text-[14px]">บันทึกเบื้องต้นจาก OR</label><textarea className="h-[78px] rounded-lg border border-slate-300 p-3 text-[14px]" placeholder="กรอกบันทึกเบื้องต้น..."/></div>
      </section>
      <div className="flex h-[46px] items-center gap-3 rounded-lg bg-blue-50 px-3 text-[14px] text-blue-700"><Info size={16}/>หลังจากส่งเคส ระบบจะแสดงประวัติการส่งข้อมูลในส่วนนี้</div>
      <div className="flex justify-end gap-3 border-b border-slate-200 pb-5">
        <button onClick={onClose} className="btn-secondary h-[38px] px-6">ยกเลิก</button>
        <button onClick={onSend} className="btn-primary inline-flex h-[38px] items-center gap-2 px-6"><Send size={14}/>ส่งเคส</button>
      </div>
      <section><h3 className="mb-4 text-[16px] font-semibold">ประวัติการส่งข้อมูล</h3><div className="overflow-hidden rounded-lg border border-slate-200"><table className="w-full text-[12px]"><thead className="h-10 bg-slate-50"><tr>{['ส่งโดย','วันที่/เวลา','ปลายทาง','สถานะปัจจุบัน','แผนกรับเคส'].map(h=><th key={h} className="px-4 text-left">{h}</th>)}</tr></thead><tbody>{Array.from({length:4}).map((_,i)=><tr key={i} className="h-[61px] border-t border-slate-100"><td className="px-4">พญ.อัญชลีกิตติวรานันท์</td><td className="px-4">08/05/2567<br/><span className="text-slate-400">14:20 น.</span></td><td className="px-4">{i?'IPD':'OPD'}</td><td className="px-4"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">{i?'ส่งสำเร็จ':'รอรับเคส'}</span></td><td className="px-4">ศัลยกรรมทั่วไป</td></tr>)}</tbody></table></div></section>
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
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>

        {/* Double-ring checkmark */}
        <div className="flex justify-center">
          <div className="grid h-[80px] w-[80px] place-items-center rounded-full border-[8px] border-blue-100">
            <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-blue-600">
              <Check size={26} className="text-white" strokeWidth={3}/>
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

        <hr className="my-4 border-slate-100"/>

        {/* Info rows */}
        <div className="space-y-3 text-[14px]">
          {[['วันที่สร้าง','15 มิ.ย. 2569 10:45 น.'],['ผู้สร้าง','AdminHospitalBK (OR Nurse)'],['ปลายทาง','OPD'],['แผนก','OPD A']].map(([k,v])=>(
            <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span>{v}</span></div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
          <Info size={18} className="mt-0.5 shrink-0"/>
          <p>ระบบได้ส่งมอบหมายงานเรียบร้อยแล้ว<br/>สามารถตรวจสอบรายการได้ที่เมนู "รายการส่งไป OPD/IPD"</p>
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
            ไปหน้ารายการ OPD/IPD <ArrowRight size={16}/>
          </button>
        </div>
      </section>
    </div>
  )
}
