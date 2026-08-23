import { CalendarDays, Download, Mail, Printer, Search, Send, X } from 'lucide-react'
import { useState } from 'react'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import MetricCard from '../components/ui/MetricCard.jsx'
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
    if (val >= 4.0) return 'bg-red-500 text-slate-800'
    if (val >= 2.0) return 'bg-red-300 text-slate-800'
    if (val >= 1.0) return 'bg-red-200 text-slate-800'
    return 'bg-red-50 text-slate-700'
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
    { name: 'สงสัย SSI', value: 126, color: '#3b82f6' },
    { name: 'ยืนยัน SSI', value: 62, color: '#22c55e' },
    { name: 'เกินกำหนด', value: 9, color: '#ef4444' },
    { name: 'รอการตอบกลับ', value: 9, color: '#f59e0b' },
    { name: 'ยกเลิกเคส', value: 8, color: '#9ca3af' }
  ]

  // 6. Patient Case Type Ratio Donut Chart Data
  const patientCaseRatioData = [
    { name: 'เคสปกติ', value: 1250, color: '#3b82f6' },
    { name: 'สงสัย SSI', value: 126, color: '#22c55e' },
    { name: 'ยืนยัน SSI', value: 62, color: '#ef4444' }
  ]

  const handleSendEmail = (e) => {
    e.preventDefault()
    alert(`ส่งรายงานไปที่เมล ${emailTo} เรียบร้อยแล้ว!`)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[#191c1e]"><Search size={17} className="text-[#175beb]" />ค้นหาข้อมูล</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <label className="text-[12px] text-slate-600">เลือกช่วงวันที่<div className="relative mt-1"><CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={dateRange} onChange={e => setDateRange(e.target.value)} className="h-[42px] w-full rounded-lg border border-slate-200 pl-9 pr-3 text-[13px]" /></div></label>
          <label className="text-[12px] text-slate-600">แผนก<select value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-[13px]"><option>แผนกทั้งหมด</option><option>ศัลยกรรมกระดูก</option><option>ศัลยกรรมทั่วไป</option></select></label>
          <label className="text-[12px] text-slate-600">หัตถการ<select value={procedure} onChange={e => setProcedure(e.target.value)} className="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-[13px]"><option>หัตถการทั้งหมด</option><option>Colectomy</option><option>Gastrectomy</option></select></label>
          <label className="text-[12px] text-slate-600">ประเภท SSI<select value={ssiType} onChange={e => setSsiType(e.target.value)} className="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-[13px]"><option>SSI ทั้งหมด</option><option>สงสัย SSI</option><option>ยืนยัน SSI</option></select></label>
          <label className="text-[12px] text-slate-600">ประเภท ผู้คนไข้<select value={patientType} onChange={e => setPatientType(e.target.value)} className="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-[13px]"><option>คนไข้ทั้งหมด</option><option>ผู้ป่วยนอก (OPD)</option><option>ผู้ป่วยใน (IPD)</option></select></label>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="inline-flex h-[38px] items-center gap-2 rounded bg-emerald-600 px-4 text-[13px] text-white"><Download size={14} />ส่งออกExcel</button>
          <button className="inline-flex h-[38px] items-center gap-2 rounded border border-red-200 bg-red-50 px-4 text-[13px] text-red-600"><Download size={14} />ส่งออกPDF</button>
          <button className="inline-flex h-[38px] items-center gap-2 rounded border border-slate-200 px-4 text-[13px] text-slate-600"><Printer size={14} />พิมพ์รายงาน</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {dashboardMetrics.slice(0, 10).map(item => <MetricCard key={item.label} {...item} dashboard />)}
      </section>

      {/* Charts Section */}
      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        {/* Left: SSI Infection Trend LineChart */}
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[#002d73]">แนวโน้มอัตราการติดเชื้อแผลผ่าตัด (SSI)</h2>
            </div>
            <select className="h-[35px] w-[105px] rounded-lg border border-slate-300 px-5 text-[14px] font-normal text-slate-600 outline-none focus:border-slate-300 focus:outline-none focus:ring-0">
              <option>2569</option>
              <option>2568</option>
            </select>
          </div>

          <div className="h-[230px] w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ssiTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#434651', fontWeight: 500 }} />
                <YAxis unit="%" domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} tick={{ fontSize: 13, fill: '#434651', fontWeight: 500 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="linear" dataKey="suspected" name="สงสัย SSI" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="linear" dataKey="confirmed" name="ยืนยัน SSI" stroke="#ef4444" strokeWidth={2.5} />
                <Line type="linear" dataKey="standard" name="เกณฑ์มาตรฐาน THIP SSI Standard < 1%" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />สงสัย SSI</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444]" />ยืนยัน SSI</span>
            <span className="flex items-center gap-1.5"><span className="border-t-2 border-dashed border-[#94a3b8] w-4 h-0.5" />เกณฑ์มาตรฐาน THIP SSI Standard &lt; 1% (ดี)</span>
          </div>
        </article>

        {/* Right: Surgical Department BarChart */}
        <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
            <div>
              <h2 className="text-[18px] font-semibold text-[#002d73]">เคสแยกการผ่าตัด</h2>
            </div>
            <select className="h-[35px] w-[105px] rounded-lg border border-slate-300 px-5 text-[14px] font-normal text-slate-600 outline-none focus:border-slate-300 focus:outline-none focus:ring-0">
              <option>2569</option>
              <option>2568</option>
            </select>
          </div>

          <div className="space-y-3 px-5 py-4">
            {deptChartData.slice(0, 5).map((item) => <div key={item.name}><div className="mb-1 flex justify-between text-[13px] font-medium text-slate-600"><span>{item.name}</span><span>{item.rate.toFixed(2)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${item.rate / 2 * 100}%`, backgroundColor: item.fill }} /></div></div>)}
          </div>
          <div className="grid h-[46px] grid-cols-5 items-center border-t border-slate-200 px-5 text-center text-[12px] font-medium text-slate-500">
            {['0%', '0.5%', '1%', '1.5%', '2%'].map(item => <span key={item}>{item}</span>)}
          </div>
        </article>
      </div>

      {/* Middle Grid: Detailed Rate Tables */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Left: Monthly Table by Department */}
        <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm flex flex-col">
          <h2 className="px-7 py-6 text-[18px] font-semibold text-[#002d73] border-b border-slate-100">
            อัตรายืนยัน SSI แยกตามแผนกและรายเดือน (%)
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-[14px] font-sans">
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
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.jan)}`}>{row.jan}</td>
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.feb)}`}>{row.feb}</td>
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.mar)}`}>{row.mar}</td>
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.apr)}`}>{row.apr}</td>
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.may)}`}>{row.may}</td>
                    <td className={`px-3 py-5 text-center font-medium ${getCellBg(row.jun)}`}>{row.jun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mx-10 my-5">
            <div className="h-3 rounded-full bg-gradient-to-r from-red-50 via-red-200 to-red-500" />
            <div className="mt-2 flex justify-between text-[12px] text-slate-500">{['0%', '1%', '2%', '3%', '4%', '5%'].map(x => <span key={x}>{x}</span>)}</div>
          </div>
        </article>

        {/* Right: Top 5 Procedures Table */}
        <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="px-7 py-6 text-[18px] font-semibold text-[#002d73] border-b border-slate-100">
              5 หัตถการที่มีอัตรายืนยันSSI สูงสุด
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px] font-sans">
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
                      <td className="px-4 py-5 text-center font-medium text-slate-700">{row.rank}</td>
                      <td className="px-4 py-5 font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-500">{row.cases}</td>
                      <td className="px-4 py-5 text-right font-medium text-slate-700">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 px-7 py-5 text-right">
            <button className="text-[#175beb] hover:underline text-[14px] font-medium">
              ดูรายละเอียดทั้งหมด ❯
            </button>
          </div>
        </article>
      </div>

      {/* Donut Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Donut 1: Daily Follow-up Summary */}
        <article className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[#002d73]">
            สรุปการติดตามประจำวัน
          </h2>
          <div className="mt-3 flex items-center gap-8"><div className="h-52 w-52 shrink-0 relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dailyFollowUpData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={84}
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
              <span className="text-[14px] text-slate-400 font-medium">ทั้งหมด</span>
              <span className="text-[24px] font-semibold text-slate-900">214</span>
              <span className="text-[13px] text-slate-400 font-medium">เคส</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 text-[14px] font-medium">
            {dailyFollowUpData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-slate-600">{item.name}</span>
                <span className="text-slate-600">{item.value} ({['58.9%', '29.0%', '4.2%', '4.7%', '3.7%'][index]})</span>
              </div>
            ))}
          </div></div>
        </article>

        {/* Donut 2: Patient Case Type Ratio */}
        <article className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[#002d73]">
            อัตราเคสแต่ละประเภท
          </h2>
          <div className="mt-3 flex items-center gap-8"><div className="h-52 w-52 shrink-0 relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientCaseRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={84}
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
              <span className="text-[14px] text-slate-400 font-medium">ทั้งหมด</span>
              <span className="text-[24px] font-semibold text-slate-900">214</span>
              <span className="text-[13px] text-slate-400 font-medium">เคส</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 text-[14px] font-medium">
            {patientCaseRatioData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 truncate flex-1">{item.name}</span>
                <span className="text-slate-600">{item.value === 1250 ? '1,250' : item.value} ({['90.9%', '1.02%', '0.6%'][index]})</span>
              </div>
            ))}
          </div></div>
        </article>

        {/* Email Report Send Panel */}
        <article className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm md:col-span-2">
          <div>
            <h2 className="mb-5 flex items-center gap-2 text-[18px] font-semibold text-[#191c1e]">
              <Mail size={18} className="text-[#175beb]" />
              ไปยังเมล
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4 font-sans">
              <div>
                <label className="block text-[14px] font-medium text-slate-700">ผู้รับ</label>
                <div className="mt-1 flex h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4">
                  <span className="inline-flex items-center gap-3 rounded-md bg-blue-100 px-3 py-1.5 text-[14px] text-slate-800">
                    {emailTo}<X size={15} className="text-slate-500" />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-slate-700">หัวข้อ</label>
                <div className="mt-1 flex gap-4"><input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="h-[42px] flex-1 rounded-lg border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-[#175beb]"
                />
              <button
                type="submit"
                className="inline-flex h-[42px] w-[100px] items-center justify-center gap-2 rounded-lg bg-blue-600 text-[15px] font-medium text-white transition hover:bg-blue-700"
              >
                <Send size={14} />
                ส่ง
              </button>
              </div></div>
            </form>
          </div>
        </article>
      </div>

      {/* maintenance Banner */}
    </div>
  )
}
