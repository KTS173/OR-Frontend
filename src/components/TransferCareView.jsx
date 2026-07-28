import { useState } from 'react'
import { Send, FileText, Paperclip, X, File, CheckCircle2, ChevronRight, Calendar, Info, Check } from 'lucide-react'

export default function TransferCareView({ selectedPatient, isTransferCompleted, setIsTransferCompleted }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form states matching user's screenshot
  const [currentDept, setCurrentDept] = useState('OPD (ชื่อแผนก)');
  const [targetDept, setTargetDept] = useState('IPD (ชื่อแผนก)');
  const [reason, setReason] = useState('จำหน่ายเข้าจากบ้านเพื่อพักฟื้นต่อที่ รพ.');
  const [startDate, setStartDate] = useState('22 มิ.ย. 2569 (Day 7)');
  const [notes, setNotes] = useState('แผลผ่าตัดแห้งดี ไม่มีไข้ แนะนำติดตามอาการตามรอบ');

  // Submit handler
  const handleNextStep = () => {
    if (wizardStep === 1) {
      setWizardStep(2);
    } else {
      setIsTransferCompleted(true);
      setIsDrawerOpen(false);
      alert('ส่งต่อเคสสำเร็จ');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>

      {/* Success Banner when completed */}
      {isTransferCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white' }}>
            <Check size={24} strokeWidth={3} />
          </div>
          <div>
            <strong style={{ fontSize: '17px', fontWeight: '700', color: '#065f46' }}>ส่งต่อเคสสำเร็จ</strong>
            <p style={{ fontSize: '14px', color: '#047857', margin: '4px 0 0 0' }}>ระบบได้ส่งเคสไปยังแผนก IPD เรียบร้อยแล้ว</p>
          </div>
        </div>
      )}

      {/* ข้อมูลการส่งต่อปัจจุบัน */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div className="sub-info-card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="sub-info-card-title">ข้อมูลการส่งต่อปัจจุบัน</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>วันที่ส่งต่อ</span>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-dark)' }}>
              {isTransferCompleted ? '15 มิ.ย. 2569' : 'ไม่มีข้อมูล'}
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
            <div>
              {isTransferCompleted ? (
                <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#175beb', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                  รอการยอมรับ
                </span>
              ) : (
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-medium)' }}>ไม่มีข้อมูล</span>
              )}
            </div>
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
                <th>เหตุผลการส่งต่อ</th>
              </tr>
            </thead>
            <tbody>
              {isTransferCompleted ? (
                <tr>
                  <td>15 มิ.ย.2569<br /><span style={{ fontSize: '11px', color: 'var(--text-light)' }}>10:15</span></td>
                  <td>OPD<br /><span style={{ fontSize: '11px', color: 'var(--text-light)' }}>(ชื่อแผนก)</span></td>
                  <td>IPD<br /><span style={{ fontSize: '11px', color: 'var(--text-light)' }}>(ชื่อแผนก)</span></td>
                  <td>(ชื่อ-นามสกุลเจ้าหน้าที่)</td>
                  <td>-</td>
                  <td>จำหน่ายเข้าจากบ้านเพื่อพักฟื้นต่อที่ รพ.</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)' }}>ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-medium)' }}>แสดง {isTransferCompleted ? '1' : '10'} จาก 10 รายการ</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="page-button w-auto px-3" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button w-auto px-3" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Next</button>
          </div>
        </div>
      </div>

      {/* เอกสารแนบ (ถ้ามี) */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div className="sub-info-card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="sub-info-card-title">เอกสารแนบ</h4>
        </div>
        {isTransferCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left', minWidth: '360px' }}>
              <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                <File size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-dark)' }}>Discharge Summary.pdf</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>15 มิ.ย. 2569 10:10 • 245 KB</span>
              </div>
            </div>
            {/* Download Icon on right */}
            <a href="#" style={{ color: 'var(--text-light)', marginLeft: '12px' }}>
              <Send size={20} className="rotate-90" />
            </a>
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
          <span>ยังไม่ได้ส่งไปยังแผนก OPD/IPD กรุณาตรวจสอบข้อมูลก่อนยืนยันการส่งต่อ</span>
        </div>
      )}

      {/* Action buttons */}
      {isTransferCompleted ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button
            type="button"
            className="clear-btn"
            style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '8px' }}
            onClick={() => setIsTransferCompleted(false)}
          >
            กลับไปหน้ารายการเคส
          </button>
          <button
            type="button"
            className="btn-filled-primary"
            style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '8px', backgroundColor: '#175beb', color: 'white' }}
          >
            ดูประวัติการดำเนินการ
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-filled-primary"
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', borderRadius: '8px', backgroundColor: '#175beb', color: 'white' }}
            onClick={() => {
              setWizardStep(1);
              setIsDrawerOpen(true);
            }}
          >
            <Send size={16} />
            <span>ย้ายเคส / ส่งต่อการดูแล</span>
          </button>
        </div>
      )}

      {/* Horizontal Timeline rendered at the bottom of the TransferCare success page */}
      {isTransferCompleted && (
        <div style={{ marginTop: '20px' }}>
          <LocalTimeline />
        </div>
      )}

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
                          <option value="OPD (ชื่อแผนก)">OPD (ชื่อแผนก)</option>
                          <option value="IPD - ห้องศัลยกรรมชาย 2">IPD - ห้องศัลยกรรมชาย 2</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ส่งต่อไปยังแผนก *</label>
                        <select className="form-select" value={targetDept} onChange={(e) => setTargetDept(e.target.value)}>
                          <option value="IPD (ชื่อแผนก)">IPD (ชื่อแผนก)</option>
                          <option value="OPD - คลินิกศัลยกรรม">OPD - คลินิกศัลยกรรม</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>เหตุผลการส่งต่อ *</label>
                        <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                          <option value="จำหน่ายเข้าจากบ้านเพื่อพักฟื้นต่อที่ รพ.">จำหน่ายเข้าจากบ้านเพื่อพักฟื้นต่อที่ รพ.</option>
                          <option value="จำหน่ายออกจาก รพ. เพื่อฟื้นฟูที่บ้าน">จำหน่ายออกจาก รพ. เพื่อฟื้นฟูที่บ้าน</option>
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
                        <strong>(ชื่อ-นามสกุลเจ้าหน้าที่)</strong>
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
                      <span>แผนก IPD จะได้รับแจ้งเตือนและสามารถตรวจสอบข้อมูลเพื่อรับเคสได้จากระบบ</span>
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
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center', backgroundColor: '#175beb', color: 'white' }}
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

function LocalTimeline() {
  return (
    <div className="timeline-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', boxSizing: 'border-box' }}>
      <div className="timeline-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="timeline-title-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <h4 className="timeline-title" style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-dark)', margin: 0 }}>ช่วงเวลาติดตามอาการคนไข้</h4>
          <span className="timeline-subtitle" style={{ fontSize: '12px', color: 'var(--text-light)' }}>รอบการติดตามมาตรฐานสำหรับหัตถการนี้</span>
        </div>
        <select className="form-select" style={{ width: 'auto', fontSize: '13px' }}>
          <option value="15/06/2569">15 / 06 / 2569</option>
          <option value="all">แสดงทั้งหมด</option>
        </select>
      </div>

      <div className="timeline-track-container" style={{ padding: '20px 0 10px', position: 'relative' }}>
        <div className="timeline-line" style={{ position: 'absolute', top: '26px', left: '40px', right: '40px', height: '3px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
        <div className="timeline-line-progress" style={{ position: 'absolute', top: '26px', left: '40px', width: '22%', height: '3px', backgroundColor: '#3b82f6', zIndex: 2 }}></div>
        <div className="timeline-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            {/* Green dot with checkmark ✓ */}
            <div className="timeline-dot completed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
              ✓
            </div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 1</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>16 มิ.ย. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>

          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot" style={{ backgroundColor: 'var(--color-orange)', boxShadow: '0 0 0 2px #ffedd5' }}></div>
            <span className="timeline-step-name" style={{ color: 'var(--color-orange)', fontSize: '12.5px', fontWeight: '600', marginBottom: '2px' }}>กิจกรรมแทรก</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>18 มิ.ย. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>

          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot active-tracking"></div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 7</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>22 มิ.ย. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>

          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot" style={{ backgroundColor: 'var(--color-orange)', boxShadow: '0 0 0 2px #ffedd5' }}></div>
            <span className="timeline-step-name" style={{ color: 'var(--color-orange)', fontSize: '12.5px', fontWeight: '600', marginBottom: '2px' }}>กิจกรรมแทรก</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>23 มิ.ย. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>

          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 14</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>29 มิ.ย. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>
          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 21</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>6 ก.ค. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>
          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 28</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>13 ก.ค. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>
          <div className="timeline-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
            <div className="timeline-dot pending"></div>
            <span className="timeline-step-name" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '2px' }}>Day 30</span>
            <span className="timeline-step-date" style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>15 ก.ค. 2569</span>
            <span className="timeline-step-time" style={{ fontSize: '10px', color: 'var(--text-light)' }}>09:00</span>
          </div>
        </div>
      </div>

      <div className="timeline-legend" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', marginTop: '20px', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', color: 'var(--text-medium)' }}>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
          <span>ดำเนินการสำเร็จ</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-info)' }}></span>
          <span>อยู่ระหว่างติดตามดำเนินการ</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-orange)' }}></span>
          <span>กิจกรรมแทรก</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
          <span>ยังไม่เริ่มติดตาม</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
          <span>เกินกำหนด</span>
        </div>
      </div>
    </div>
  );
}
