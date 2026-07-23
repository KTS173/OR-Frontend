import { ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
        <article className="or-card flex h-[326px] flex-col gap-3 rounded-2xl p-[21px]">
          <CardHeading title="แนวโน้มอัตราการติดเชื้อแผลผ่าตัด (SSI)" />
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ssiTrend} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#e9edf3" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#667085' }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11, paddingTop: 14 }}
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
        <article className="or-card h-[326px] overflow-hidden rounded-xl">
          <CardHeading title="เคสแยกการผ่าตัด" side />
          <div className="h-[268px] px-3 pb-2 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surgeryRates} layout="vertical" margin={{ left: 8, right: 52, top: 4 }}>
                <CartesianGrid horizontal={false} stroke="#e9edf3" />
                <XAxis type="number" domain={[0, 2]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#475467' }} width={130} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={13}>
                  {surgeryRates.map((item, i) => <Cell key={item.name} fill={barColors[i]} />)}
                  <LabelList dataKey="rate" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: '#475467', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* ── Bottom Row ── */}
      <section className="dashboard-lower">
        <div className="grid gap-4">

          {/* Follow-up Summary Donut */}
          <article className="or-card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 text-base font-bold text-[#10386f]">สรุปการติดตามประจำวัน</div>
            <div className="flex min-h-[205px] flex-col items-stretch gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <div className="relative h-36 min-w-36 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={followUpSummary} dataKey="value" innerRadius={42} outerRadius={65} paddingAngle={0}>
                      {followUpSummary.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-content-center text-center text-xs text-slate-500">
                  ทั้งหมด<strong className="block text-xl text-slate-800">214</strong>เคส
                </div>
              </div>
              <div className="min-w-0 space-y-2.5 sm:min-w-[210px]">
                {followUpSummary.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                    <span className="flex-1 text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-700">{item.value} ({(item.value / 214 * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* My Tasks */}
          <article className="or-card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 text-base font-bold text-[#10386f]">งานของฉันวันนี้</div>
            <div className="divide-y divide-slate-100 px-5">
              {followUpTasks.map((task, i) => {
                const iconUrl = `/assets/icon/dashboard/${taskIcons[i]}`
                return (
                  <div key={task.label} className="flex items-center gap-3 py-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50">
                      <span
                        className="dashboard-task-icon"
                        aria-hidden="true"
                        style={{
                          WebkitMaskImage: `url("${iconUrl}")`,
                          maskImage: `url("${iconUrl}")`,
                        }}
                      />
                    </span>
                    <p className="min-w-0 flex-1 text-xs font-semibold text-slate-700">{task.label}</p>
                    <span className="text-[11px] text-slate-500">{task.count} รายการ</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${metaBadge[task.metaTone] ?? metaBadge.gray}`}>
                      {task.meta}
                    </span>
                  </div>
                )
              })}
            </div>
            <Link to="/my-follow-ups" className="flex items-center justify-end gap-1 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-blue-600">
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
