import { CalendarDays, Download, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import MetricCard from '../components/ui/MetricCard.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { dashboardMetrics } from '../data/mockData.js'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('01/05/2569 - 01/06/2569')
  const [department, setDepartment] = useState('แผนกทั้งหมด')
  const [procedure, setProcedure] = useState('หัตถการทั้งหมด')
  const [ssiType, setSsiType] = useState('SSI ทั้งหมด')
  const [patientType, setPatientType] = useState('คนไข้ทั้งหมด')
  const [emailTo, setEmailTo] = useState('admin@HospitalgeneralBK.com')
  const [emailSubject, setEmailSubject] = useState('รายงานสรุประบบคิวในโรงพยาบาล')

  // 1. SSI Trend Line Chart Data
  const ssiTrendData = [
    { month: 'ม.ค.', suspected: 0.4, confirmed: 0.2, standard: 1.0 },
    { month: 'ก.พ.', suspected: 0.6, confirmed: 0.3, standard: 1.0 },
    { month: 'มี.ค.', suspected: 1.3, confirmed: 0.6, standard: 1.0 },
    { month: 'เม.ย.', suspected: 1.7, confirmed: 1.1, standard: 1.0 },
    { month: 'พ.ค.', suspected: 1.3, confirmed: 0.8, standard: 1.0 },
    { month: 'มิ.ย.', suspected: 1.4, confirmed: 0.9, standard: 1.0 },
    { month: 'ก.ค.', suspected: 1.5, confirmed: 1.2, standard: 1.0 },
  ]

  // 2. Department Horizontal Bar Chart Data
  const deptChartData = [
    { name: 'ศัลยกรรมกระดูก', rate: 1.48, fill: '#002d73' },
    { name: 'ศัลยกรรมกระดูกสันหลัง', rate: 1.20, fill: '#175beb' },
    { name: 'ศัลยกรรมทั่วไป', rate: 0.82, fill: '#f59e0b' },
    { name: 'ศัลยกรรมหัวใจ', rate: 0.65, fill: '#f97316' },
    { name: 'ศัลยกรรมตกแต่ง', rate: 0.65, fill: '#f97316' },
    { name: 'หู คอ จมูก', rate: 0.28, fill: '#facc15' },
  ]

  // 3. Monthly Infection rates table
  const monthlyInfectionRates = [
    { dept: 'ศัลยกรรมทั่วไป', jan: 1.32, feb: 1.28, mar: 1.61, apr: 1.61, may: 1.61, jun: 1.61 },
    { dept: 'ศัลยกรรมกระดูก', jan: 1.05, feb: 1.28, mar: 1.61, apr: 1.61, may: 1.61, jun: 1.61 },
    { dept: 'ศัลยกรรมกระดูกสันหลัง', jan: 1.32, feb: 1.28, mar: 1.61, apr: 1.61, may: 1.61, jun: 1.61 },
    { dept: 'ศัลยกรรมหัวใจ', jan: 1.32, feb: 1.28, mar: 1.61, apr: 1.61, may: 1.61, jun: 2.61 },
    { dept: 'ศัลยกรรมตกแต่ง', jan: 0.45, feb: 0.52, mar: 1.61, apr: 1.61, may: 1.61, jun: 4.61 }
  ]

  // Helper for conditional cell background coloring
  const getCellBg = (val) => {
    if (val >= 4.0) return 'bg-red-200 text-red-800'
    if (val >= 2.0) return 'bg-red-100 text-red-700'
    if (val >= 1.0) return 'bg-red-50 text-red-600'
    return 'bg-slate-50 text-slate-700'
  }

  // 4. Top 5 Surgical Procedures Table Data
  const topProcedures = [
    { rank: 1, name: 'Colectomy', cases: 86, rate: '5.81%' },
    { rank: 2, name: 'Gastrectomy', cases: 86, rate: '4.44%' },
    { rank: 3, name: 'Rectal Surgery', cases: 86, rate: '3.57%' },
    { rank: 4, name: 'Hernia Repair (Mesh)', cases: 86, rate: '3.57%' },
    { rank: 5, name: 'Cholecystectomy (Lap)', cases: 86, rate: '2.08%' }
  ]

  // 5. Daily Follow-up Summary Donut Chart Data
  const dailyFollowUpData = [
    { name: 'สงสัย SSI', value: 126, color: '#175beb' },
    { name: 'ยืนยัน SSI', value: 62, color: '#facc15' },
    { name: 'เกินกำหนด', value: 9, color: '#f97316' },
    { name: 'รอการตอบกลับ', value: 9, color: '#0d9488' },
    { name: 'ยกเลิกเคส', value: 8, color: '#ef4444' }
  ]

  // 6. Patient Case Type Ratio Donut Chart Data
  const patientCaseRatioData = [
    { name: 'เคสปกติ', value: 1250, color: '#175beb' },
    { name: 'สงสัย SSI', value: 126, color: '#10b981' },
    { name: 'ยืนยัน SSI', value: 62, color: '#ef4444' }
  ]

  const handleSendEmail = (e) => {
    e.preventDefault()
    alert(`ส่งรายงานไปที่เมล ${emailTo} เรียบร้อยแล้ว!`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="รายงานและวิเคราะห์ (Reports & Analytics)"
        description="รายงานและวิเคราะห์"
      />

      {/* Filter and Export Row */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-[16px] font-semibold text-[#002d73] mb-4">ค้นหาข้อมูล</h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-[13px] font-medium text-slate-600">เลือกช่วงวันที่</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="h-[38px] w-full rounded-lg border border-slate-200 pl-10 pr-4 text-xs font-semibold text-slate-600"
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-600">แผนก</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
              >
                <option>แผนกทั้งหมด</option>
                <option>ศัลยกรรมกระดูก</option>
                <option>ศัลยกรรมกระดูกสันหลัง</option>
                <option>ศัลยกรรมทั่วไป</option>
                <option>ศัลยกรรมหัวใจ</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-600">หัตถการ</label>
              <select
                value={procedure}
                onChange={e => setProcedure(e.target.value)}
                className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
              >
                <option>หัตถการทั้งหมด</option>
                <option>Colectomy</option>
                <option>Gastrectomy</option>
                <option>Rectal Surgery</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-600">ประเภท SSI</label>
              <select
                value={ssiType}
                onChange={e => setSsiType(e.target.value)}
                className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
              >
                <option>SSI ทั้งหมด</option>
                <option>สงสัย SSI</option>
                <option>ยืนยัน SSI</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-600">ประเภท ผู้คนไข้</label>
              <select
                value={patientType}
                onChange={e => setPatientType(e.target.value)}
                className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
              >
                <option>คนไข้ทั้งหมด</option>
                <option>ผู้ป่วยนอก (OPD)</option>
                <option>ผู้ป่วยใน (IPD)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 mt-2 border-t border-slate-100 pt-4">
            <button className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-[#10b981] px-5 text-xs font-semibold text-white hover:bg-emerald-600 transition shadow-sm">
              <Download size={14} />
              ส่งออกExcel
            </button>
            <button className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-[#ef4444] px-5 text-xs font-semibold text-white hover:bg-red-600 transition shadow-sm">
              <Download size={14} />
              ส่งออกPDF
            </button>
            <button className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
              พิมพ์รายงาน
            </button>
          </div>
        </div>
      </section>

      {/* 10 Metrics Cards Responsive Grid */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {dashboardMetrics.slice(0, 10).map((item) => (
          <MetricCard key={item.label} {...item} dashboard={true} />
        ))}
      </section>

      {/* Charts Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left: SSI Infection Trend LineChart */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-[#002d73]">แนวโน้มอัตราการติดเชื้อแผลผ่าตัด (SSI)</h2>
            </div>
            <select className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">
              <option>2569</option>
              <option>2568</option>
            </select>
          </div>

          <div className="h-72 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ssiTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis unit="%" domain={[0, 2.5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="suspected" name="สงสัย SSI" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="confirmed" name="ยืนยัน SSI" stroke="#ef4444" strokeWidth={2.5} />
                <Line type="monotone" dataKey="standard" name="เกณฑ์มาตรฐาน THIP SSI Standard < 1%" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] font-semibold">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />สงสัย SSI</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444]" />ยืนยัน SSI</span>
            <span className="flex items-center gap-1.5"><span className="border-t-2 border-dashed border-[#94a3b8] w-4 h-0.5" />เกณฑ์มาตรฐาน THIP SSI Standard &lt; 1% (ดี)</span>
          </div>
        </article>

        {/* Right: Surgical Department BarChart */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-[#002d73]">เคสแยกการผ่าตัด</h2>
            </div>
            <select className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">
              <option>2569</option>
              <option>2568</option>
            </select>
          </div>

          <div className="h-72 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" unit="%" domain={[0, 2]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={130} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" radius={[0, 5, 5, 0]}>
                  {deptChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#002d73]" />สูงมาก (1.4+%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#175beb]" />สูง (1.0 - 1.3%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />ปานกลาง (0.5 - 0.9%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#facc15]" />ต่ำ (&lt; 0.5%)</span>
          </div>
        </article>
      </div>

      {/* Middle Grid: Detailed Rate Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left: Monthly Table by Department */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-[16px] font-semibold text-[#002d73] border-b border-slate-100 pb-4 mb-4">
            อัตรายืนยัน SSI แยกตามแผนกและรายเดือน (%)
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="px-4 py-3">แผนก</th>
                  <th className="px-3 py-3 text-center">ม.ค.69</th>
                  <th className="px-3 py-3 text-center">ก.พ.69</th>
                  <th className="px-3 py-3 text-center">มี.ค.69</th>
                  <th className="px-3 py-3 text-center">เม.ย.69</th>
                  <th className="px-3 py-3 text-center">พ.ค.69</th>
                  <th className="px-3 py-3 text-center">มิ.ย.69</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {monthlyInfectionRates.map((row) => (
                  <tr key={row.dept} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.dept}</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.jan)}`}>{row.jan}%</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.feb)}`}>{row.feb}%</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.mar)}`}>{row.mar}%</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.apr)}`}>{row.apr}%</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.may)}`}>{row.may}%</td>
                    <td className={`px-3 py-3 text-center font-bold rounded ${getCellBg(row.jun)}`}>{row.jun}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-4 text-[11px] font-semibold text-slate-500 justify-end">
            <span className="flex items-center gap-1"><span className="h-3 w-5 rounded bg-red-200" /> &gt; 4.0%</span>
            <span className="flex items-center gap-1"><span className="h-3 w-5 rounded bg-red-100" /> &gt; 2.0%</span>
            <span className="flex items-center gap-1"><span className="h-3 w-5 rounded bg-red-50" /> &gt; 1.0%</span>
            <span className="flex items-center gap-1"><span className="h-3 w-5 rounded bg-slate-50 border border-slate-100" /> ปกติ</span>
          </div>
        </article>

        {/* Right: Top 5 Procedures Table */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#002d73] border-b border-slate-100 pb-4 mb-4">
              5 หัตถการที่มีอัตรายืนยันSSI สูงสุด
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="px-4 py-3 text-center w-16">อันดับ</th>
                    <th className="px-4 py-3">หัตถการ (Procedure)</th>
                    <th className="px-4 py-3 text-center">จำนวนเคส</th>
                    <th className="px-4 py-3 text-right">อัตรายืนยัน SSI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {topProcedures.map((row) => (
                    <tr key={row.rank} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-400">{row.rank}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{row.name}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-500">{row.cases}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-red-500">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-right">
            <button className="text-[#175beb] hover:underline text-xs font-semibold">
              ดูรายละเอียดทั้งหมด &gt;
            </button>
          </div>
        </article>
      </div>

      {/* Donut Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Donut 1: Daily Follow-up Summary */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3 mb-4 w-full text-center">
            สรุปการติดตามประจำวัน
          </h2>
          <div className="h-48 w-48 relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dailyFollowUpData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dailyFollowUpData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">214</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">เคสทั้งหมด</span>
            </div>
          </div>
          <div className="mt-4 w-full grid grid-cols-2 gap-2 text-[11px] font-semibold">
            {dailyFollowUpData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </article>

        {/* Donut 2: Patient Case Type Ratio */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3 mb-4 w-full text-center">
            อัตราเคสแต่ละประเภท
          </h2>
          <div className="h-48 w-48 relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientCaseRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {patientCaseRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">214</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">เคสทั้งหมด</span>
            </div>
          </div>
          <div className="mt-4 w-full flex flex-col gap-2 text-[11px] font-semibold justify-center items-center">
            {patientCaseRatioData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 w-full max-w-[150px]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 truncate flex-1">{item.name}</span>
                <span className="text-slate-800">{item.value === 1250 ? '1,250' : item.value}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Email Report Send Panel */}
        <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-[#175beb]" />
              ไปยังเมล
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ผู้รับ</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                    {emailTo}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">หัวข้อ</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#175beb]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-md shadow-blue-600/10"
              >
                <Send size={14} />
                ส่ง
              </button>
            </form>
          </div>
        </article>
      </div>

      {/* maintenance Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <span>📅 15 มิ.ย. 2569:</span>
        <div className="flex-1 font-medium">
          ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.
        </div>
      </div>
    </div>
  )
}
