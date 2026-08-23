export const dashboardMetrics = [
  { label: 'เคสผ่าตัดทั้งหมด',             value: '1,250', unit: 'คน',        trend: '+15%', tone: 'blue'   },
  { label: 'เคสผ่าตัดวันนี้',         value: '32',    unit: 'คน',        trend: '+15%', tone: 'cyan'   },
  { label: 'รอตรวจสอบจาก OR',        value: '18',    unit: 'คน',        trend: '+5%',  tone: 'amber'  },
  { label: 'ส่งเข้า OPD/IPD แล้ว',   value: '24',    unit: 'คน',        trend: '+8%',  tone: 'violet' },
  { label: 'ครบกำหนดติดตามวันนี้',    value: '24',    unit: 'คน',        trend: '+12%', tone: 'green'  },
  { label: 'ติดตามเกินกำหนด',         value: '9',     unit: 'คน',        trend: '+28%', tone: 'red'    },
  { label: 'รอแพทย์ประเมิน',          value: '1',     unit: 'เคส',       trend: '-3',   tone: 'purple', featured: true },
  { label: 'ความพึงพอใจผู้ป่วย',      value: '4.5',   unit: '/ 5 คะแนน', trend: '-15%', tone: 'teal'   },
  { label: 'สงสัย SSI',              value: '2',     unit: 'ราย',       trend: '+2',   tone: 'orange' },
  { label: 'ยืนยัน SSI',             value: '1',     unit: 'ราย',       trend: '+1',   tone: 'rose'   },
]

export const ssiTrend = [
  { month: 'ม.ค.',  suspected: 0.4,  confirmed: 0.2 },
  { month: 'ก.พ.',  suspected: 0.6,  confirmed: 0.3 },
  { month: 'มี.ค.', suspected: 1.3,  confirmed: 0.6 },
  { month: 'เม.ย.', suspected: 1.7,  confirmed: 1.1 },
  { month: 'พ.ค.',  suspected: 1.3,  confirmed: 0.8 },
  { month: 'มิ.ย.', suspected: 1.4,  confirmed: 0.9 },
  { month: 'ก.ค.',  suspected: 1.5,  confirmed: 1.2 },
]

export const surgeryRates = [
  { name: 'ศัลยกรรมกระดูก',          rate: 1.48 },
  { name: 'ศัลยกรรมกระดูกสันหลัง',   rate: 1.20 },
  { name: 'ศัลยกรรมทั่วไป',          rate: 0.83 },
  { name: 'ศัลยกรรมหัวใจ',           rate: 0.65 },
  { name: 'ศัลยกรรมหัวใจและทรวงอก', rate: 0.65 },
]

export const patients = [
  { id: '0123456', name: 'นายสมชาย ใจดี', age: 68, sex: 'ชาย', patientType: 'opd', abbrev: 'TKA', procedure: 'Total Knee Arthroplasty (R)', surgeon: 'นพ. อธิวัฒน์ ศรีกมล', department: 'ศัลยกรรมกระดูก', surgeryDate: '10 มิ.ย. 2569', followUp: '15 มิ.ย. 2569', status: 'รอตรวจสอบ', risk: 'ปานกลาง' },
  { id: '0123457', name: 'นายภาคิน พิทักษ์อนันต์', age: 42, sex: 'ชาย', patientType: 'ipd', abbrev: 'TKA', procedure: 'Total Knee Arthroplasty (L)', surgeon: 'นพ. อธิวัฒน์ ศรีกมล', department: 'ศัลยกรรมกระดูก', surgeryDate: '10 มิ.ย. 2569', followUp: '15 มิ.ย. 2569', status: 'กำลังติดตาม', risk: 'ต่ำ' },
  { id: '0123458', name: 'นางสาววิภาพร คำดี', age: 63, sex: 'หญิง', patientType: 'ipd', abbrev: 'THA', procedure: 'Total Hip Arthroplasty', surgeon: 'นพ. อธิวัฒน์ ศรีกมล', department: 'ศัลยกรรมกระดูก', surgeryDate: '10 มิ.ย. 2569', followUp: 'วันนี้', status: 'ครบกำหนดวันนี้', risk: 'สูง' },
  { id: '0123459', name: 'นายกรกนก พิพัฒน์เมธา', age: 43, sex: 'ชาย', patientType: 'opd', abbrev: 'TKA', procedure: 'Total Knee Arthroplasty (R)', surgeon: 'นพ. กมลชนก อัศวรุ่งโรจน์', department: 'ศัลยกรรมกระดูก', surgeryDate: '10 มิ.ย. 2569', followUp: '14 มิ.ย. 2569', status: 'ติดตามเสร็จแล้ว', risk: 'ต่ำ' },
  { id: '0456789', name: 'นายอนันต์ รัตนกุล', age: 70, sex: 'ชาย', patientType: 'ipd', abbrev: 'Spine Fixation', procedure: 'Posterior Lumbar Spine Fixation', surgeon: 'นพ. กมลชนก อัศวรุ่งโรจน์', department: 'ศัลยกรรมกระดูกสันหลัง', surgeryDate: '10 มิ.ย. 2569', followUp: '13 มิ.ย. 2569', status: 'เกินกำหนด', risk: 'สูง' },
  { id: '0456790', name: 'นางฉัตรดาว เพชรดี', age: 48, sex: 'หญิง', patientType: 'opd', abbrev: 'Appendectomy', procedure: 'Laparoscopic Appendectomy', surgeon: 'พญ. สุภาวดี จันทร์แก้ว', department: 'ศัลยกรรมทั่วไป', surgeryDate: '9 มิ.ย. 2569', followUp: '16 มิ.ย. 2569', status: 'สงสัย SSI', risk: 'สูง' },
  { id: '0456791', name: 'นางนิตยา เจริญสุข', age: 55, sex: 'หญิง', patientType: 'ipd', abbrev: 'THA', procedure: 'Total Hip Arthroplasty', surgeon: 'นพ. อธิวัฒน์ ศรีกมล', department: 'ศัลยกรรมกระดูก', surgeryDate: '7 มิ.ย. 2569', followUp: '16 มิ.ย. 2569', status: 'ยืนยัน SSI', risk: 'สูง' },
]

export const followUpTasks = [
  { label: 'โทรติดตามผู้ป่วย',        count: 12, meta: 'เกินกำหนด 3',     tone: 'blue',   metaTone: 'red'   },
  { label: 'ประเมินอาการผู้ป่วย',     count: 8,  meta: 'ครบกำหนดวันนี้ 5', tone: 'green',  metaTone: 'green' },
  { label: 'ตรวจสอบรูปแผลใหม่',      count: 5,  meta: 'ใหม่ 4',          tone: 'orange', metaTone: 'blue'  },
  { label: 'ส่งเคสให้แพทย์ประเมิน',  count: 3,  meta: 'รอดำเนินการ',     tone: 'purple', metaTone: 'gray'  },
]

export const documents = [
  { id: 1, title: 'แนวทางการเฝ้าระวังการติดเชื้อแผลผ่าตัด ปี 2569', category: 'แนวทางปฏิบัติ', owner: 'หน่วยควบคุมการติดเชื้อ',   date: '12 มิ.ย. 2569', status: 'เผยแพร่' },
  { id: 2, title: 'ประกาศปิดปรับปรุงระบบชั่วคราว',                   category: 'ประกาศ',        owner: 'ฝ่ายเทคโนโลยีสารสนเทศ',     date: '10 มิ.ย. 2569', status: 'เผยแพร่' },
  { id: 3, title: 'แบบประเมินแผลหลังผ่าตัดฉบับปรับปรุง',              category: 'แบบฟอร์ม',     owner: 'ฝ่ายการพยาบาล',             date: '8 มิ.ย. 2569',  status: 'ฉบับร่าง' },
]

export const users = [
  { id: 1, name: 'AdminHospitalBK',    role: 'System Admin', department: 'เทคโนโลยีสารสนเทศ', email: 'admin@bangkokhospital.com',    status: 'ใช้งาน' },
  { id: 2, name: 'ณัฐกานต์ วัฒนสุข',  role: 'IC Nurse',     department: 'ควบคุมการติดเชื้อ',  email: 'nattakan@bangkokhospital.com', status: 'ใช้งาน' },
  { id: 3, name: 'นพ. อธิวัฒน์ ศรีกมล', role: 'Doctor',     department: 'ศัลยกรรมกระดูก',    email: 'athiwat@bangkokhospital.com',  status: 'ใช้งาน' },
  { id: 4, name: 'วราภรณ์ ธนกุล',      role: 'OR Nurse',    department: 'ห้องผ่าตัด',         email: 'waraporn@bangkokhospital.com', status: 'ระงับ'  },
]
