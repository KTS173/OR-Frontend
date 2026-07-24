import { ClipboardList, Eye, Pencil, Trash2 } from 'lucide-react'

export default function TimelineView({ selectedPatient, setActiveDetailTab, isActivityAdded, onSetupFollowUpClick }) {
  // Build timeline rows dynamically based on whether activity was added
  const TIMELINE_ROWS = isActivityAdded ? [
    {
      round: '(Day 1)',
      date: '16 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 1',
      status: 'completed',
      statusText: 'เสร็จสิ้น',
      actionType: 'view_edit'
    },
    {
      round: 'กิจกรรมแทรก',
      isIntervening: true,
      date: '18 มิ.ย. 2569',
      time: '13:30',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'นัดประเมินแผลเพิ่มเติมก่อนถึงรอบ Day 7 เนื่องจากมีน้ำเหลืองซึม',
      status: 'completed',
      statusText: 'เสร็จสิ้น',
      actionType: 'view_edit'
    },
    {
      round: '(Day 7)',
      date: '22 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 2',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn'
    },
    {
      round: 'กิจกรรมแทรก',
      isIntervening: true,
      date: '23 มิ.ย. 2569',
      time: '13:30',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการ เนื่องจากผู้ป่วยแจ้งปวดแผลและบวมมากขึ้น',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'edit_delete'
    },
    {
      round: '(Day 14)',
      date: '29 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 3',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn'
    },
    {
      round: '(Day 21)',
      date: '6 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 4',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn'
    },
    {
      round: '(Day 28)',
      date: '13 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 5',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn'
    },
    {
      round: '(Day 30)',
      date: '15 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 6',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn'
    }
  ] : [
    {
      round: 'Day 1',
      date: '16 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 1',
      status: 'success',
      statusText: 'รอดำเนินการ',
      actionType: 'assess_btn',
      isActive: true
    },
    {
      round: 'Day 7',
      date: '22 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 2',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn',
      isActive: false
    },
    {
      round: 'Day 14',
      date: '29 มิ.ย. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 3',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn',
      isActive: false
    },
    {
      round: 'Day 21',
      date: '6 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 4',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn',
      isActive: false
    },
    {
      round: 'Day 28',
      date: '13 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 5',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn',
      isActive: false
    },
    {
      round: 'Day 30',
      date: '15 ก.ค. 2569',
      time: '09:00',
      staffName: 'ชื่อ - นามสกุล',
      staffRole: 'OPD Staff',
      channel: 'โทรติดตาม',
      details: 'โทรติดตามอาการตอบรอบติดตามครั้งที่ 6',
      status: 'pending',
      statusText: 'ยังไม่ถึงกำหนด',
      actionType: 'assess_btn',
      isActive: false
    }
  ];

  return (
    <div className="sub-info-card" style={{ padding: '24px', gap: '20px' }}>
      {/* Header section with dropdown and setup button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h4 className="sub-info-card-title" style={{ fontSize: '15px' }}>กิจกรรมแทรกก่อนถึงรอบติดตาม</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}>
            <option value="all">แสดงทั้งหมด</option>
          </select>
          <button 
            type="button" 
            className="btn-filled-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={onSetupFollowUpClick}
          >
            ตั้งค่ารอบ Follow-up
          </button>
        </div>
      </div>

      {/* Table responsive */}
      <div className="table-responsive">
        <table className="data-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th>รอบ</th>
              <th>เวลา</th>
              <th>ผู้รับผิดชอบ</th>
              <th>ช่องทางการติดตาม</th>
              <th>รายละเอียด/กิจกรรม</th>
              <th>สถานะติดตาม</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {TIMELINE_ROWS.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ color: row.isIntervening ? 'var(--color-orange)' : 'inherit' }}>
                      {row.round}
                    </strong>
                    <span style={{ fontSize: '16px', color: 'var(--text-light)' }}>{row.date}</span>
                  </div>
                </td>
                <td>{row.time}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{row.staffName}</span>
                    <span style={{ fontSize: '16px', color: 'var(--text-light)' }}>{row.staffRole}</span>
                  </div>
                </td>
                <td>
                  <span className="channel-badge">{row.channel}</span>
                </td>
                <td>{row.details}</td>
                <td>
                  <span className={`badge ${
                    row.status === 'completed' ? 'badge-not-infected' :
                    row.status === 'success' ? 'badge-not-infected' : 'badge-pending'
                  }`} style={{ textWrap: 'nowrap' }}>
                    {row.statusText}
                  </span>
                </td>
                <td>
                  {row.actionType === 'assess_btn' && (
                    row.isActive || isActivityAdded ? (
                      <button 
                        type="button" 
                        className="manage-btn-active"
                        onClick={() => {
                          setActiveDetailTab('evaluation');
                          window.scrollTo(0,0);
                        }}
                      >
                        <ClipboardList size={14} />
                        <span>ประเมินอาการคนไข้</span>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="manage-btn-inactive"
                        onClick={() => alert('รอบติดตามนี้ยังไม่ถึงเวลาเปิดให้ประเมิน')}
                      >
                        <ClipboardList size={14} />
                        <span>ประเมินอาการคนไข้</span>
                      </button>
                    )
                  )}

                  {row.actionType === 'view_edit' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="clear-btn" 
                        style={{ padding: '6px 8px', minWidth: 'auto', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                        onClick={() => alert('ดูรายละเอียดกิจกรรม')}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="clear-btn" 
                        style={{ padding: '6px 8px', minWidth: 'auto', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                        onClick={() => alert('แก้ไขกิจกรรม')}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}

                  {row.actionType === 'edit_delete' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="clear-btn" 
                        style={{ padding: '6px 8px', minWidth: 'auto', color: 'var(--color-primary)', borderColor: '#cbd5e1' }}
                        onClick={() => alert('แก้ไขกิจกรรม')}
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="clear-btn" 
                        style={{ padding: '6px 8px', minWidth: 'auto', color: 'var(--color-danger)', borderColor: '#fca5a5' }}
                        onClick={() => alert('ลบกิจกรรม')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-medium)' }}>
          Showing 2 of {isActivityAdded ? '5 Historical Log' : '5 Historical Log'}
        </span>
        <div className="pagination-buttons">
          <button className="page-btn" disabled>Previous</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">Next</button>
        </div>
      </div>

      {/* Legend of colors */}
      <div className="timeline-legend" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
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

      {/* คำแนะนำการใช้งาน */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid var(--color-info)', borderRadius: '8px', padding: '16px', marginTop: '24px', textAlign: 'left' }}>
        <h5 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>ℹ️</span>
          <span>คำแนะนำการใช้งาน</span>
        </h5>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-medium)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>กิจกรรมแทรกจะถูกแสดงในไทม์ไลน์รวมกับรอบติดตามปกติ</li>
          <li>ระบบจะส่งแจ้งเตือนตามวันที่และเวลาที่ตั้งไว้</li>
          <li>ผู้ป่วยและเจ้าหน้าที่จะได้รับการแจ้งเตือนตามสิทธิ์ที่ตั้งค่า</li>
        </ul>
      </div>
    </div>
  );
}
