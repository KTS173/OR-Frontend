import { Search, RotateCcw, Upload, FileText } from 'lucide-react'
import { useState } from 'react'

export default function DocsView({ selectedPatient }) {
  const [docType, setDocType] = useState('all');
  const [docRound, setDocRound] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const DOCS_LIST = [
    {
      name: 'DischargeSummary.pdf',
      type: 'PDF',
      uploadedBy: '(ชื่อ-นามสกุลเจ้าหน้าที่)',
      dept: 'OPD - ศัลยกรรม',
      date: '15 มิ.ย. 2569 10:30',
      size: '245KB'
    },
    {
      name: 'OperativeNote.pdf',
      type: 'PDF',
      uploadedBy: '(ชื่อ-นามสกุลเจ้าหน้าที่)',
      dept: 'OPD - ศัลยกรรม',
      date: '15 มิ.ย. 2569 10:30',
      size: '245KB'
    },
    {
      name: 'OperativeNote1.pdf',
      type: 'PDF',
      uploadedBy: '(ชื่อ-นามสกุลเจ้าหน้าที่)',
      dept: 'OPD - ศัลยกรรม',
      date: '15 มิ.ย. 2569 10:30',
      size: '245KB'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
      
      {/* ค้นหาข้อมูล */}
      <div className="sub-info-card" style={{ padding: '20px', textAlign: 'left' }}>
        <h4 className="sub-info-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14.5px' }}>
          <Search size={16} />
          <span>ค้นหาข้อมูล</span>
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group">
            <label>ประเภทเอกสาร</label>
            <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="discharge">Discharge Summary</option>
              <option value="op-note">Operative Note</option>
            </select>
          </div>
          <div className="form-group">
            <label>รอบติดตามเอกสาร</label>
            <select className="form-select" value={docRound} onChange={(e) => setDocRound(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="day1">Day 1</option>
              <option value="day7">Day 7</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>คำค้นหา</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
          <button 
            type="button" 
            className="btn-filled-primary"
            style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}
            onClick={() => alert('ค้นหาข้อมูลเอกสาร')}
          >
            <Search size={15} />
            <span>ค้นหา</span>
          </button>
          <button 
            type="button" 
            className="clear-btn" 
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', minWidth: 'auto' }}
            onClick={() => {
              setDocType('all');
              setDocRound('all');
              setSearchQuery('');
            }}
          >
            <RotateCcw size={15} />
            <span>ล้างตัวกรอง</span>
          </button>
        </div>
      </div>

      {/* เอกสารแนบ */}
      <div className="sub-info-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h4 className="sub-info-card-title" style={{ margin: 0 }}>เอกสารแนบ</h4>
          <button 
            type="button" 
            className="btn-filled-primary"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            onClick={() => alert('เปิดหน้าต่างอัปโหลดเอกสาร')}
          >
            <Upload size={14} />
            <span>อัปโหลดเอกสาร</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>ชื่อเอกสาร</th>
                <th>ประเภทไฟล์</th>
                <th>อัปโหลดโดย</th>
                <th>แผนก</th>
                <th>วันที่อัปโหลด</th>
                <th>ขนาด</th>
              </tr>
            </thead>
            <tbody>
              {DOCS_LIST.map((doc, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                        <FileText size={16} />
                      </div>
                      <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: '500' }}>
                        {doc.name}
                      </a>
                    </div>
                  </td>
                  <td>{doc.type}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>{doc.dept}</td>
                  <td>{doc.date}</td>
                  <td>{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'left' }}>Showing 10 of 10 Historical Log</span>
          <div className="pagination-buttons">
            <button className="page-btn" disabled>Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
