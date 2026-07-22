import { Download, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import Filters from '../components/ui/Filters.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import PatientTable from '../components/ui/PatientTable.jsx'
import { patients as fallbackPatients } from '../data/mockData.js'
import { useMockQuery } from '../hooks/useMockQuery.js'
import { api } from '../services/api.js'

const configs = {
  validation: { title: 'OR Validation List', description: 'รายการเคสที่ต้องตรวจสอบก่อนส่งเข้า Surveillance', metrics: [['รอตรวจสอบทั้งหมด', '58'], ['เข้าเกณฑ์ (Eligible)', '24'], ['ข้อมูลไม่ครบถ้วน', '18'], ['ส่งเข้า OPD/IPD แล้ว', '24']] },
  opd: { title: 'คิว OPD', description: 'รายการผู้ป่วยนอกที่อยู่ในแผนติดตาม', metrics: [['คิวทั้งหมด', '18'], ['ติดตามวันนี้', '42'], ['เกินกำหนด', '11'], ['สงสัย SSI', '2']] },
  ipd: { title: 'คิว IPD', description: 'รายการผู้ป่วยในที่ต้องเฝ้าระวัง', metrics: [['คิวทั้งหมด', '15'], ['กำลังรักษา', '28'], ['รอจำหน่าย', '6'], ['ความเสี่ยงสูง', '3']] },
  followUp: { title: 'งานติดตามของฉัน', description: 'งานเฝ้าระวังและติดตามที่ได้รับมอบหมาย', metrics: [['งานทั้งหมด', '118'], ['กำลังติดตาม', '42'], ['เสร็จแล้ว', '62'], ['เกินกำหนด', '9']] },
  history: { title: 'ประวัติการติดตาม', description: 'ค้นหาและตรวจสอบประวัติการเฝ้าระวังย้อนหลัง', metrics: [['ประวัติทั้งหมด', '1,186'], ['เดือนนี้', '142'], ['ติดตามสำเร็จ', '1,108'], ['ยกเลิก', '36']] },
  suspected: { title: 'เคสสงสัยติดเชื้อ (Suspected SSI Cases)', description: 'เคสที่รอแพทย์ประเมินอาการ', metrics: [['รอประเมิน', '18'], ['ประเมินแล้ว', '48'], ['ความเสี่ยงสูง', '11'], ['เกิน SLA', '2']] },
  confirmed: { title: 'เคสยืนยันติดเชื้อ (Confirmed SSI Cases)', description: 'ทะเบียนผู้ป่วยที่ได้รับการยืนยัน SSI', metrics: [['ยืนยันเดือนนี้', '11'], ['กำลังรักษา', '8'], ['หายแล้ว', '36'], ['ส่ง THIP', '9']] },
  doctor: { title: 'แพทย์ตรวจสอบ SSI', description: 'รายการเคสที่ส่งให้แพทย์วินิจฉัยและรับรอง', metrics: [['รอตรวจสอบ', '14'], ['ตรวจวันนี้', '6'], ['ขอข้อมูลเพิ่ม', '3'], ['ยืนยันแล้ว', '11']] },
  notifications: { title: 'ศูนย์แจ้งเตือน', description: 'ติดตามเหตุการณ์สำคัญและงานที่ต้องดำเนินการ', metrics: [['แจ้งเตือนใหม่', '12'], ['สำคัญ', '4'], ['อ่านแล้ว', '142'], ['เก็บถาวร', '87']] },
  search: { title: 'ค้นหาข้อมูลกลาง', description: 'ค้นหาข้อมูลผู้ป่วยและประวัติข้ามหน่วยงาน', metrics: [['ผู้ป่วยทั้งหมด', '1,286'], ['ติดตามทั้งหมด', '8,642'], ['SSI ปีนี้', '36'], ['แผนก', '14']] },
  sync: { title: 'ข้อมูลที่เชื่อมต่อจาก HIS / TrackCare', description: 'ตรวจสอบสถานะและความสมบูรณ์ของข้อมูลต้นทาง', metrics: [['ซิงค์ล่าสุด', '14:05'], ['รายการวันนี้', '1,248'], ['สำเร็จ', '1,212'], ['ผิดพลาด', '36']] },
}

export default function RegistryPage({ type }) {
  const [search, setSearch] = useState('')
  const { data, loading } = useMockQuery(api.getPatients, fallbackPatients)
  const config = configs[type] ?? configs.validation
  const filtered = useMemo(() => data.filter((item) => [item.id, item.name, item.procedure, item.department].some((value) => value.toLowerCase().includes(search.toLowerCase()))), [data, search])
  return (
    <>
      <PageHeader title={config.title} description={config.description} actions={<><button className="btn-secondary"><Download size={14} />ส่งออก</button><button className="btn-primary">{type === 'sync' ? <RefreshCw size={14} /> : <Plus size={14} />}{type === 'sync' ? 'ซิงค์ข้อมูล' : 'เพิ่มรายการ'}</button></>} />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{config.metrics.map(([label, value], index) => <MetricCard key={label} label={label} value={value} unit={index === 0 ? 'รายการ' : ''} trend={index % 2 ? '+8%' : '+12%'} tone={['blue', 'green', 'amber', 'violet'][index]} />)}</section>
      <Filters search={search} onSearch={setSearch} />
      <PatientTable patients={filtered} loading={loading} />
    </>
  )
}
