import { useState } from 'react'
import { Calendar, HelpCircle, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'

export default function SetupFollowUpView({ selectedPatient, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState('day30');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Calendar dates for June 2026
  const calendarDays = [
    { day: 28, muted: true }, { day: 29, muted: true }, { day: 30, muted: true },
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16, highlighted: 'blue' }, { day: 17 }, { day: 18, highlighted: 'orange' },
    { day: 19 }, { day: 20 }, { day: 21 }, { day: 22, highlighted: 'active' }, { day: 23, highlighted: 'orange' }, { day: 24 }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28 }, { day: 29, highlighted: 'active' }, { day: 30, highlighted: 'active' }, { day: 1, muted: true }, { day: 2, muted: true },
    { day: 3, muted: true }, { day: 4, muted: true }, { day: 5, muted: true }, { day: 6, highlighted: 'blue', muted: true }, { day: 7, muted: true }, { day: 8, muted: true }
  ];

  // Mock table rows matching user screenshot
  const initialRows = [
    { round: 'Day 1', date: '16 มิ.ย.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true },
    { round: 'Day 7', date: '22 มิ.ย.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true },
    { round: 'Day 14', date: '29 มิ.ย.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true },
    { round: 'Day 21', date: '6 ก.ค.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true },
    { round: 'Day 28', date: '13 ก.ค.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true },
    { round: 'Day 30', date: '15 ก.ค.2569', time: '09:00', method: 'โทรศัพท์ + ส่งรูปแผล', note: 'โทรติดตามอาการ/แผล', checked: true }
  ];

  const [rows, setRows] = useState(initialRows);

  const handleCheckboxChange = (index) => {
    const updated = [...rows];
    updated[index].checked = !updated[index].checked;
    setRows(updated);
  };

  const handleSave = () => {
    alert('บันทึกการแก้ไขรอบ Follow-up เรียบร้อยแล้ว');
    onClose();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', marginTop: '8px', textAlign: 'left' }}>
      
      {/* Left Column: Template Selection and Calendar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* เลือก Template Follow-up */}
        <div className="sub-info-card" style={{ padding: '16px' }}>
          <h4 className="sub-info-card-title" style={{ fontSize: '13.5px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            เลือก Template Follow-up
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Template 1 */}
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedTemplate === 'day30' ? '#f8fafc' : 'white' }}>
              <input 
                type="radio" 
                name="template" 
                checked={selectedTemplate === 'day30'} 
                onChange={() => setSelectedTemplate('day30')}
                style={{ marginTop: '4px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px' }}>Follow-up Day 30</strong>
                  <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '10px', padding: '2px 6px' }}>มาตรฐาน</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4' }}>
                  ชุดการติดตามมาตรฐานสำหรับหัตถการทางออร์โธปิดิกส์ (CDC SSI Guideline) (30 วัน)
                </span>
              </div>
            </label>

            {/* Template 2 */}
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedTemplate === 'day90' ? '#f8fafc' : 'white' }}>
              <input 
                type="radio" 
                name="template" 
                checked={selectedTemplate === 'day90'} 
                onChange={() => setSelectedTemplate('day90')}
                style={{ marginTop: '4px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px' }}>Follow-up Day 90</strong>
                  <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '10px', padding: '2px 6px' }}>มาตรฐาน</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4' }}>
                  ชุดการติดตามมาตรฐานสำหรับหัตถการทางออร์โธปิดิกส์ (CDC SSI Guideline) (90 วัน)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Calendar widget */}
        <div className="setup-calendar-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-dark)' }}>มิ.ย. 2569</strong>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={16} /></button>
          </div>

          <div className="setup-calendar-grid">
            <span className="calendar-day-header">อา</span>
            <span className="calendar-day-header">จ</span>
            <span className="calendar-day-header">อ</span>
            <span className="calendar-day-header">พ</span>
            <span className="calendar-day-header">พฤ</span>
            <span className="calendar-day-header">ศ</span>
            <span className="calendar-day-header">ส</span>

            {calendarDays.map((item, idx) => (
              <div 
                key={idx} 
                className={`calendar-day-cell ${item.muted ? 'muted' : ''}`}
              >
                <span className={`calendar-day-number ${item.highlighted ? `highlight-${item.highlighted}` : ''}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Schedule Editor Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* เลือกรอบติดตาม */}
        <div className="sub-info-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h4 className="sub-info-card-title" style={{ margin: 0 }}>เลือกรอบติดตาม (Follow-up Schedule)</h4>
            
            <div className="toggle-switch-container">
              <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text-medium)' }}>คำนวณวันอัตโนมัติ</span>
              <HelpCircle size={14} style={{ color: 'var(--text-light)', marginRight: '4px' }} />
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={autoCalculate} 
                  onChange={(e) => setAutoCalculate(e.target.checked)} 
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>รอบ</th>
                  <th>วันที่ติดตาม</th>
                  <th>เวลา</th>
                  <th>วิธีติดตาม</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={row.checked} 
                          onChange={() => handleCheckboxChange(idx)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                        />
                      </label>
                    </td>
                    <td><strong>{row.round}</strong></td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={row.date} 
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].date = e.target.value;
                          setRows(updated);
                        }}
                        style={{ padding: '4px 8px', fontSize: '12.5px', width: '120px' }}
                      />
                    </td>
                    <td>
                      <select 
                        className="form-select" 
                        value={row.time}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].time = e.target.value;
                          setRows(updated);
                        }}
                        style={{ padding: '4px 8px', fontSize: '12.5px', width: '90px' }}
                      >
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-select" 
                        value={row.method}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].method = e.target.value;
                          setRows(updated);
                        }}
                        style={{ padding: '4px 8px', fontSize: '12.5px', width: '160px' }}
                      >
                        <option value="โทรศัพท์ + ส่งรูปแผล">โทรศัพท์ + ส่งรูปแผล</option>
                        <option value="โทรอย่างเดียว">โทรอย่างเดียว</option>
                        <option value="เข้าพบแพทย์">เข้าพบแพทย์</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={row.note} 
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx].note = e.target.value;
                          setRows(updated);
                        }}
                        style={{ padding: '4px 8px', fontSize: '12.5px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add custom follow up row */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
            <button 
              type="button" 
              className="clear-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '13px', padding: '6px 16px', minWidth: 'auto' }}
              onClick={() => alert('เพิ่มรอบติดตามใหม่')}
            >
              <Plus size={14} />
              <span>เพิ่มรอบติดตาม</span>
            </button>
          </div>

          {/* Legend indicator */}
          <div className="timeline-legend" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--color-success)' }}></span>
              <span>กำลังดำเนินการ</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--color-info)' }}></span>
              <span>รอดำเนินการ</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#cbd5e1' }}></span>
              <span>ยังไม่เริ่ม</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
              <span>เกินกำหนด</span>
            </div>
          </div>

          {/* Notice bottom */}
          <div style={{ fontSize: '13px', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
            หมายเหตุ: สามารถปรับเปลี่ยนรอบติดตามภายหลังใน Timeline ของผู้ป่วยได้
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            type="button" 
            className="clear-btn" 
            style={{ padding: '10px 24px', fontSize: '13.5px', minWidth: '100px' }}
            onClick={onClose}
          >
            ปิด
          </button>
          <button 
            type="button" 
            className="btn-filled-primary"
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
            onClick={handleSave}
          >
            <Check size={16} />
            <span>บันทึกการแก้ไข Follow-up</span>
          </button>
        </div>

      </div>

    </div>
  );
}
