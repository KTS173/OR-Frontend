import { ArrowRight } from 'lucide-react'
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import MetricCard from '../components/ui/MetricCard.jsx'
import PatientTable from '../components/ui/PatientTable.jsx'
import { dashboardMetrics, followUpTasks, patients, ssiTrend, surgeryRates } from '../data/mockData.js'

const followUpSummary = [
  { name: 'กำลังติดตาม',    value: 126, color: '#3b82f6' },
  { name: 'ติดตามเสร็จแล้ว', value: 62,  color: '#22c55e' },
  { name: 'เกินกำหนด',      value: 9,   color: '#ef4444' },
  { name: 'รอการตอบกลับ',   value: 9,   color: '#f59e0b' },
  { name: 'ยกเลิกเคส',      value: 8,   color: '#9ca3af' },
]

const taskIcons = ['phone.png', 'icon3.png', 'image.png', '2.png']

const metaBadge = {
  red:   'bg-red-50   text-red-600',
  green: 'bg-green-50 text-green-700',
  blue:  'bg-blue-50  text-blue-600',
  gray:  'bg-slate-100 text-slate-500',
}

const barColors = ['#0b3d83', '#264cc7', '#f97316', '#fbbf24', '#94a3b8']

export default function DashboardPage() {
  return (
    <div className="space-y-4">

      {/* ── Row 1 + 2 Metric Cards ── */}
      <section className="dashboard-grid">
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} dashboard topRow={index < 5} />
        ))}
      </section>

      {/* ── Charts Row ── */}
      <section className="dashboard-charts">

        {/* SSI Trend Line Chart */}
        <article className="or-card flex h-[330px] flex-col gap-2 rounded-2xl p-[18px]">
          <CardHeading title="แนวโน้มอัตราการติดเชื้อแผลผ่าตัด (SSI)" />
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ssiTrend} margin={{ top: 12, right: 24, left: 0, bottom: 2 }}>
                <CartesianGrid stroke="#e9edf3" />
                <XAxis dataKey="month" tick={{ fontSize: 14, fill: '#667085' }} />
                <YAxis domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 14, fill: '#667085' }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 14, paddingTop: 14 }}
                  payload={[
                    { value: 'สงสัย SSI',   type: 'line', color: '#f97316' },
                    { value: 'ยืนยัน SSI',  type: 'line', color: '#ef4444' },
                    { value: 'เกณฑ์มาตรฐาน THIP SSI Standard < 1% (ดี)', type: 'plainline', color: '#ef4444' },
                  ]}
                />
                {/* Standard reference line at 1% */}
                <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 4" strokeWidth={1.5} />
                <Line name="สงสัย SSI"  dataKey="suspected" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316'  }} activeDot={{ r: 5 }} />
                <Line name="ยืนยัน SSI" dataKey="confirmed"  stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Surgery Rates Horizontal Bar Chart */}
        <article className="or-card h-[330px] overflow-hidden rounded-xl">
          <CardHeading title="เคสแยกการผ่าตัด" side />
          <div className="flex h-[273px] flex-col px-6 pb-3 pt-4">
            <div className="flex min-h-0 flex-1 flex-col justify-between">
              {surgeryRates.map((item, i) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[13px] leading-4 font-basexdg text-[#475467]">
                    <span>{item.name}</span>
                    <span className="shrink-0 font-semibold">{item.rate.toFixed(2)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(item.rate / 2 * 100, 100)}%`, backgroundColor: barColors[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-5 border-t border-slate-200 pt-2 text-[12px] font-medium text-slate-500">
              {['0%', '0.5%', '1%', '1.5%', '2%'].map((tick, i) => (
                <span key={tick} className={i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}>{tick}</span>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* ── Bottom Row ── */}
      <section className="dashboard-lower">
        <div className="grid gap-4">

          {/* Follow-up Summary Donut */}
          <article className="or-card flex min-h-[200px] flex-col overflow-hidden">
            <div className="border-b border-slate-100 px-8 py-5 text-[16px] leading-6 font-medium text-[#002d73]">สรุปการติดตามประจำวัน</div>
            <div className="flex min-h-[200px] flex-1 flex-col items-center gap-3 px-7 py-0 sm:flex-row sm:justify-between">
              <div className="relative h-[190px] w-[190px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={followUpSummary} dataKey="value" innerRadius={53} outerRadius={92} paddingAngle={0} stroke="none">
                      {followUpSummary.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-content-center text-center text-[15px] font-medium leading-6 text-slate-500">
                  ทั้งหมด<strong className="block text-[28px] leading-9 font-medium text-slate-900">214</strong>เคส
                </div>
              </div>
              <div className="w-full min-w-0 space-y-3 sm:max-w-[310px] sm:flex-1">
                {followUpSummary.map((item) => (
                  <div key={item.name} className="grid grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-3 text-[14px] leading-5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: item.color }} />
                    <span className="min-w-0 text-slate-700 text-[16px]">{item.name}</span>
                    <span className="whitespace-nowrap text-[16px] text-slate-700">{item.value} ({(item.value / 214 * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* My Tasks */}
          <article className="or-card flex min-h-[300px] flex-col overflow-hidden">
            <div className="border-b border-slate-100 px-8 py-5 text-[16px] leading-6 font-medium text-[#002d73]">งานของฉันวันนี้</div>
            <div className="divide-y divide-slate-100 px-8">
              {followUpTasks.map((task, i) => {
                const iconUrl = `/assets/icon/dashboard/${taskIcons[i]}`
                return (
                  <div key={task.label} className="flex items-center gap-3 py-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50">
                      <span
                        className="dashboard-task-icon"
                        aria-hidden="true"
                        style={{
                          WebkitMaskImage: `url("${iconUrl}")`,
                          maskImage: `url("${iconUrl}")`,
                        }}
                      />
                    </span>
                    <p className="min-w-0 flex-1 text-[15px] font-medium text-slate-700">{task.label}</p>
                    <span className="text-[15px] text-slate-500">{task.count} รายการ</span>
                    <span className={`rounded-full px-3 py-1 text-[15px] font-medium ${metaBadge[task.metaTone] ?? metaBadge.gray}`}>
                      {task.meta}
                    </span>
                  </div>
                )
              })}
            </div>
            <Link to="/my-follow-ups" className="mt-auto flex items-center justify-end gap-1 border-t border-slate-100 px-5 py-4 text-[15px] font-medium text-blue-600">
              ดูงานทั้งหมด <ArrowRight size={14} />
            </Link>
          </article>
        </div>

        {/* Patient Table */}
        <PatientTable patients={patients} dashboard />
      </section>

    </div>
  )
}

function CardHeading({ title, side = false }) {
  return (
    <div className={`flex shrink-0 items-center justify-between ${side ? 'h-[57px] border-b border-slate-50 px-6' : 'h-[31px]'}`}>
      <h2 className="text-[16px] leading-6 font-medium text-[#002d73]">{title}</h2>
      <select className="h-[31px] w-[104px] rounded-lg border border-[#d1d5db] bg-white px-[17px] text-[14px] font-normal text-[#4b5563]">
        <option>2569</option>
      </select>
    </div>
  )
}
