import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import PatientTable from '../components/ui/PatientTable.jsx'
import { dashboardMetrics, followUpTasks, patients, ssiTrend, surgeryRates } from '../data/mockData.js'

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="แดชบอร์ด" description="ภาพรวมการเฝ้าระวังแผลติดเชื้อหลังผ่าตัด" actions={<button className="btn-secondary">ส่งออกรายงาน</button>} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">{dashboardMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="card"><div className="card-title"><div><h2>แนวโน้มอัตราการติดเชื้อแผลผ่าตัด (SSI)</h2><p>เกณฑ์มาตรฐาน THIP SSI Standard &lt; 1%</p></div><select className="field w-28"><option>2569</option></select></div><div className="h-64 pt-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={ssiTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} unit="%" /><Tooltip /><Legend wrapperStyle={{ fontSize: 10 }} /><Line name="สงสัย SSI" dataKey="suspected" type="monotone" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} /><Line name="ยืนยัน SSI" dataKey="confirmed" type="monotone" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></article>
        <article className="card"><div className="card-title"><div><h2>เคสแยกตามการผ่าตัด</h2><p>อัตราการติดเชื้อแยกตามแผนก</p></div><select className="field w-28"><option>2569</option></select></div><div className="h-64 pt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={surgeryRates} layout="vertical" margin={{ left: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8edf4" /><XAxis type="number" tick={{ fontSize: 10 }} unit="%" /><YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={105} /><Tooltip /><Bar dataKey="rate" fill="#2474e5" radius={[0, 4, 4, 0]} barSize={13} /></BarChart></ResponsiveContainer></div></article>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.7fr]">
        <article className="card"><div className="card-title"><div><h2>งานของฉันวันนี้</h2><p>รายการที่ต้องดำเนินการ</p></div><Link to="/my-follow-ups" className="text-xs font-medium text-blue-600">ดูทั้งหมด</Link></div><div className="mt-2 divide-y divide-slate-100">{followUpTasks.map((task) => <div key={task.label} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><ClipboardCheck size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-700">{task.label}</p><p className="text-[10px] text-slate-400">{task.meta}</p></div><strong className="text-sm text-slate-800">{task.count}</strong><ArrowRight size={14} className="text-slate-300" /></div>)}</div></article>
        <PatientTable patients={patients.slice(0, 5)} />
      </section>
      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-700"><strong>ประกาศ:</strong> ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</div>
    </>
  )
}
