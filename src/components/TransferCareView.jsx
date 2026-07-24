import { useState } from 'react'
import { Send, FileText, Paperclip, X, File, CheckCircle2, ChevronRight, Calendar, Info, Check } from 'lucide-react'

export default function TransferCareView({ selectedPatient, isActivityAdded }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);

  // Form states matching user's screenshot
  const [currentDept, setCurrentDept] = useState('IPD - ห้องศัลยกรรมชาย 2');
  const [targetDept, setTargetDept] = useState('OPD - คลินิกศัลยกรรม');
  const [reason, setReason] = useState('จำหน่ายออกจาก รพ. เพื่อฟื้นฟูที่บ้าน');
  const [startDate, setStartDate] = useState('18 มิ.ย. 2569 (Day 7)');
  const [notes, setNotes] = useState('แผลผ่าตัดแห้งดี ไม่มีไข้ แนะนำติดตามอาการตามรอบ');

  // Submit handler
  const handleNextStep = () => {
    if (wizardStep === 1) {
      setWizardStep(2);
    } else {
      setIsTransferCompleted(true);
      setIsDrawerOpen(false);
      alert('ส่งต่อเคสไปยังแผนกรับเรียบร้อยแล้ว');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
      
      {/* ข้อมูลการส่งต่อปัจจุบัน */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div className="sub-info-card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="sub-info-card-title">ข้อมูลการส่งต่อปัจจุบัน</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่ส่งต่อ</span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-dark)' }}>
              {isTransferCompleted ? '15 มิ.ย. 2569 10:15' : 'ไม่มีข้อมูล'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>เหตุผลการส่งต่อ</span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-dark)' }}>
              {isTransferCompleted ? reason : 'ไม่มีข้อมูล'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่เริ่มติดตามโดยแผนกรับ</span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-dark)' }}>
              {isTransferCompleted ? startDate : 'ไม่มีข้อมูล'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>สถานะการส่งต่อ</span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: isTransferCompleted ? 'var(--color-primary)' : 'var(--text-medium)' }}>
              {isTransferCompleted ? 'รอแผนกรับการดูแล' : 'ไม่มีข้อมูล'}
            </span>
          </div>
        </div>
      </div>

      {/* ประวัติการส่งต่อ */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div className="sub-info-card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="sub-info-card-title">ประวัติการส่งต่อ</h4>
        </div>
        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>วันที่/เวลา</th>
                <th>จากแผนก</th>
                <th>ไปแผนก</th>
                <th>ผู้ส่งต่อ</th>
                <th>ผู้รับเคส</th>
              </tr>
            </thead>
            <tbody>
              {isTransferCompleted ? (
                <tr>
                  <td>15 มิ.ย. 2569 10:15</td>
                  <td>{currentDept}</td>
                  <td>{targetDept}</td>
                  <td>อรวรรณดี จ. (IPD Staff)</td>
                  <td><span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>รอแผนกรับการดูแล</span></td>
                </tr>
              ) : (
                <tr>
                  <td>ไม่มีข้อมูล</td>
                  <td>ไม่มีข้อมูล</td>
                  <td>ไม่มีข้อมูล</td>
                  <td>ไม่มีข้อมูล</td>
                  <td>ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Showing {isTransferCompleted ? '1' : '10'} of 10 Historical Log</span>
          <div className="pagination-buttons">
            <button className="page-btn" disabled>Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* เอกสารแนบ (ถ้ามี) */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div className="sub-info-card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="sub-info-card-title">เอกสารแนบ (ถ้ามี)</h4>
        </div>
        {isTransferCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left', maxWidth: '360px' }}>
            <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
              <File size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-dark)' }}>Discharge Summary.pdf</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>15 มิ.ย. 2569 10:10 • 245 KB</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-light)', fontSize: '13.5px' }}>
            ไม่มีข้อมูล
          </div>
        )}
      </div>

      {/* Alert bar */}
      {!isTransferCompleted && (
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderLeft: '4px solid var(--color-orange)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: '#b45309', textAlign: 'left' }}>
          <span>⚠️</span>
          <span>ยังไม่ได้ส่งไปยังแผนก OPD กรุณาตรวจสอบข้อมูลก่อนยืนยันการส่งต่อ</span>
        </div>
      )}

      {/* Action button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          className="btn-filled-primary"
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', borderRadius: '8px' }}
          onClick={() => {
            setWizardStep(1);
            setIsDrawerOpen(true);
          }}
        >
          <Send size={16} />
          <span>ย้ายเคส / ส่งต่อการดูแล</span>
        </button>
      </div>

      {/* Side Drawer Modal */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="drawer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-dark)' }}>ย้ายเคส / ส่งต่อการดูแล</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-medium)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area */}
            <div className="drawer-content">
              {/* Step indicator */}
              <div className="step-wizard" style={{ marginBottom: '24px' }}>
                <div className={`wizard-step ${wizardStep >= 1 ? 'active' : ''}`}>
                  <div className="wizard-circle" style={{ backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}>
                    {wizardStep >= 1 ? <Check size={14} /> : '1'}
                  </div>
                  <span style={{ fontSize: '11px', color: wizardStep >= 1 ? 'var(--color-primary)' : 'var(--text-light)' }}>ระบุข้อมูลการส่งต่อ</span>
                </div>
                <div className="wizard-line" style={{ backgroundColor: wizardStep >= 2 ? 'var(--color-primary)' : 'var(--border-color)' }}></div>
                <div className={`wizard-step ${wizardStep >= 2 ? 'active' : ''}`}>
                  <div className="wizard-circle" style={{ backgroundColor: wizardStep >= 2 ? 'var(--color-primary)' : '#f1f5f9', color: wizardStep >= 2 ? 'white' : 'var(--text-medium)', borderColor: wizardStep >= 2 ? 'var(--color-primary)' : 'var(--border-color)' }}>
                    {wizardStep >= 2 ? <Check size={14} /> : '2'}
                  </div>
                  <span style={{ fontSize: '11px', color: wizardStep >= 2 ? 'var(--color-primary)' : 'var(--text-light)' }}>ตรวจสอบข้อมูล</span>
                </div>
              </div>

              {wizardStep === 1 ? (
                <>
                  {/* Step 1: Form Inputs */}
                  
                  {/* ข้อมูลผู้ป่วย */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-medium)', marginBottom: '12px' }}>ข้อมูลผู้ป่วย</h5>
                    <div className="patient-info-summary">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>HN</span>
                        <strong>{selectedPatient.hn}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>ชื่อ-สกุล</span>
                        <strong>{selectedPatient.name}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่ผ่าตัด</span>
                        <strong>10 มิ.ย. 2569</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่จำหน่าย</span>
                        <strong>15 มิ.ย. 2569</strong>
                      </div>
                    </div>
                  </div>

                  {/* ข้อมูลการส่งต่อ */}
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-medium)', marginBottom: '12px' }}>ข้อมูลการส่งต่อ</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group">
                        <label>แผนกปัจจุบัน (ผู้ส่งต่อ)</label>
                        <select className="form-select" value={currentDept} onChange={(e) => setCurrentDept(e.target.value)}>
                          <option value="IPD - ห้องศัลยกรรมชาย 2">IPD - ห้องศัลยกรรมชาย 2</option>
                          <option value="OPD - (ชื่อแผนก)">OPD - (ชื่อแผนก)</option>
                          <option value="OR - (ชื่อแผนก)">OR - (ชื่อแผนก)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ส่งต่อไปยังแผนก *</label>
                        <select className="form-select" value={targetDept} onChange={(e) => setTargetDept(e.target.value)}>
                          <option value="OPD - คลินิกศัลยกรรม">OPD - คลินิกศัลยกรรม</option>
                          <option value="IPD - (ชื่อแผนก)">IPD - (ชื่อแผนก)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>เหตุผลการส่งต่อ *</label>
                        <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                          <option value="จำหน่ายออกจาก รพ. เพื่อฟื้นฟูที่บ้าน">จำหน่ายออกจาก รพ. เพื่อฟื้นฟูที่บ้าน</option>
                          <option value="จำหน่ายเข้าพักรพ.">จำหน่ายเข้าพักรพ.</option>
                          <option value="ติดตามต่อที่คลินิก">ติดตามต่อที่คลินิก</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>วันที่เริ่มติดตามโดยแผนกรับ *</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ paddingRight: '36px' }}
                          />
                          <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>หมายเหตุเพิ่มเติม</label>
                        <textarea 
                          className="form-input" 
                          style={{ height: '70px', resize: 'vertical' }}
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* แนบเอกสาร */}
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-medium)', marginBottom: '8px' }}>แนบเอกสาร (ถ้ามี)</h5>
                    <button 
                      type="button" 
                      className="clear-btn" 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)', padding: '8px 16px', fontSize: '13px' }}
                    >
                      <Paperclip size={14} />
                      <span>แนบไฟล์</span>
                    </button>
                    
                    <div className="file-box-item">
                      <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                        <File size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <strong style={{ fontSize: '12.5px', color: 'var(--text-dark)' }}>Discharge Summary.pdf</strong>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>15 มิ.ย. 2569 10:10 • 245 KB</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: Review and Validation Confirmation */}
                  
                  {/* ข้อมูลผู้ป่วย */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-medium)', marginBottom: '12px' }}>ข้อมูลผู้ป่วย</h5>
                    <div className="patient-info-summary">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>HN</span>
                        <strong>{selectedPatient.hn}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>ชื่อ-สกุล</span>
                        <strong>{selectedPatient.name}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่ผ่าตัด</span>
                        <strong>10 มิ.ย. 2569</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่จำหน่าย</span>
                        <strong>15 มิ.ย. 2569</strong>
                      </div>
                    </div>
                  </div>

                  {/* สรุปการส่งต่อที่บันทึก */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h5 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>สรุปการส่งต่อที่บันทึก</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>จากแผนก (ผู้ส่งต่อ)</span>
                        <strong>{currentDept}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>ผู้ส่งต่อ</span>
                        <strong>อรวรรณดี จ. (IPD Staff)</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>ไปยังแผนก (ผู้รับเคส)</span>
                        <strong>{targetDept}</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>ผู้รับผิดชอบปลายทาง</span>
                        <strong>-</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>เหตุผลการส่งต่อ</span>
                        <strong>{reason}</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>วันที่เริ่มติดตามโดยแผนกรับ</span>
                        <strong>{startDate}</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>วันที่ส่งต่อ</span>
                        <strong>15 มิ.ย. 2569 10:15</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>เอกสารแนบ (1 ไฟล์)</span>
                        <div className="file-box-item" style={{ marginTop: 0 }}>
                          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                            <File size={18} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <strong style={{ fontSize: '12.5px', color: 'var(--text-dark)' }}>Discharge Summary.pdf</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice bar info */}
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid var(--color-primary)', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12.5px', color: 'var(--color-primary)', textAlign: 'left', marginTop: '12px' }}>
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <span>แผนก OPD จะได้รับแจ้งเตือนและสามารถตรวจสอบข้อมูลเพื่อรับเคสได้จากระบบ</span>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Footer buttons */}
            <div className="drawer-footer">
              <button 
                type="button" 
                className="clear-btn" 
                style={{ padding: '10px 20px', minWidth: '90px' }}
                onClick={() => {
                  if (wizardStep === 2) {
                    setWizardStep(1);
                  } else {
                    setIsDrawerOpen(false);
                  }
                }}
              >
                {wizardStep === 2 ? 'ย้อนกลับ' : 'ยกเลิก'}
              </button>
              
              <button 
                type="button" 
                className="btn-filled-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }}
                onClick={handleNextStep}
              >
                <span>{wizardStep === 1 ? 'ถัดไป' : 'ยืนยันและส่งต่อเคส'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
