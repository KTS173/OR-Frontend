import { Download } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo } from 'react'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useApiQuery } from '../hooks/useApiQuery.js'
import { api } from '../services/api.js'

export default function ReportsPage() {
  const { data: patients } = useApiQuery(api.getPatients)
  const dashboardMetrics = useMemo(() => [
    { label: 'เคสทั้งหมด', value: String(patients.length), unit: 'คน', tone: 'blue' },
    { label: 'เคส OPD', value: String(patients.filter((item) => item.patientType === 'opd').length), unit: 'คน', tone: 'cyan' },
    { label: 'เคส IPD', value: String(patients.filter((item) => item.patientType === 'ipd').length), unit: 'คน', tone: 'amber' },
    { label: 'ผ่าตัดเสร็จแล้ว', value: String(patients.filter((item) => item.status === 'COMPLETED').length), unit: 'คน', tone: 'green' },
    { label: 'เคสฉุกเฉิน', value: String(patients.filter((item) => item.urgency === 'EMERGENCY').length), unit: 'คน', tone: 'red' },
  ], [patients])
  const surgeryRates = useMemo(() => {
    const counts = new Map()
    patients.forEach((item) => { const name = item.department || 'ไม่ระบุแผนก'; counts.set(name, (counts.get(name) || 0) + 1) })
    return [...counts.entries()].map(([name, rate]) => ({ name, rate }))
  }, [patients])
  const ssiTrend = []
  const completeRecords = patients.filter((item) => item.id && item.operationNo && item.episodeNo && item.procedure).length
  const completeness = patients.length ? `${(completeRecords / patients.length * 100).toFixed(1)}%` : '0.0%'
  const qualityRows = [
    ['อัตราการติดเชื้อ SSI', '-', '-', 'ไม่มีข้อมูล', '-'],
    ['ติดตามครบตามกำหนด', '-', '-', 'ไม่มีข้อมูล', '-'],
    ['ข้อมูลครบถ้วน', '-', completeness, patients.length ? 'ข้อมูลจริง' : 'ไม่มีข้อมูล', '-'],
    ['ระยะเวลาตอบสนอง', '-', '-', 'ไม่มีข้อมูล', '-'],
  ]
  return <><PageHeader title="รายงานและวิเคราะห์" description="Reports & Analytics สำหรับติดตามคุณภาพและตัวชี้วัดองค์กร" actions={<><select className="field w-36"><option>ปี 2569</option></select><button className="btn-primary"><Download size={14} />ดาวน์โหลดรายงาน</button></>} /><section className="grid grid-cols-2 gap-3 lg:grid-cols-5">{dashboardMetrics.slice(0, 5).map((item) => <MetricCard key={item.label} {...item} />)}</section><section className="mt-4 grid gap-4 xl:grid-cols-2"><article className="card"><div className="card-title"><div><h2>แนวโน้ม SSI รายเดือน</h2><p>เปรียบเทียบเคสสงสัยและเคสยืนยัน</p></div></div><div className="h-72 pt-5"><ResponsiveContainer width="100%" height="100%"><LineChart data={ssiTrend}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="month" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Line dataKey="suspected" stroke="#f59e0b" strokeWidth={2} /><Line dataKey="confirmed" stroke="#ef4444" strokeWidth={2} /></LineChart></ResponsiveContainer></div></article><article className="card"><div className="card-title"><div><h2>อัตรา SSI แยกตามแผนก</h2><p>ใช้สำหรับ Quality Review และ THIP</p></div></div><div className="h-72 pt-5"><ResponsiveContainer width="100%" height="100%"><BarChart data={surgeryRates}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tick={{fontSize:9}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Bar dataKey="rate" fill="#2563eb" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div></article></section><section className="card mt-4"><div className="card-title"><div><h2>สรุปตัวชี้วัดคุณภาพ</h2><p>เปรียบเทียบผลจริงกับเป้าหมายองค์กร</p></div></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-xs"><thead className="bg-slate-50 text-left text-[10px] text-slate-500"><tr><th className="table-cell">ตัวชี้วัด</th><th className="table-cell">เป้าหมาย</th><th className="table-cell">ผลจริง</th><th className="table-cell">สถานะ</th><th className="table-cell">แนวโน้ม</th></tr></thead><tbody>{qualityRows.map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((cell, i) => <td key={cell} className={`table-cell ${i === 3 ? 'font-semibold text-emerald-600' : ''}`}>{cell}</td>)}</tr>)}</tbody></table></div></section></>
}
