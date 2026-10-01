import { hasConfirmedSsiHistory, getSsiReportCategory } from '../utils/ssiAnalytics.js'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const colors = ['#0b3d83', '#264cc7', '#f97316', '#fbbf24', '#94a3b8']

const percent = (value, total) => total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%'

export function AnalyticsChartPair({ patients, hideProcedure = false }) {
  const now = new Date()
  const year = now.getFullYear()
  const [period, setPeriod] = useState('month')
  const datedPatients = useMemo(() => patients.map((patient) => {
    const raw = patient.startAt || patient.createdAt
    const date = raw ? new Date(raw) : null
    return { patient, date: date && !Number.isNaN(date.getTime()) ? date : null }
  }).filter((row) => row.date), [patients])
  const caseTrend = useMemo(() => {
    let buckets
    if (period === 'year') {
      buckets = Array.from({ length: 5 }, (_, index) => {
        const bucketYear = year - 4 + index
        return { label: String(bucketYear + 543), match: (date) => date.getFullYear() === bucketYear }
      })
    } else if (period === 'day') {
      const days = new Date(year, now.getMonth() + 1, 0).getDate()
      buckets = Array.from({ length: days }, (_, index) => ({
        label: String(index + 1),
        match: (date) => date.getFullYear() === year && date.getMonth() === now.getMonth() && date.getDate() === index + 1,
      }))
    } else {
      buckets = thaiMonths.map((label, index) => ({
        label,
        match: (date) => date.getFullYear() === year && date.getMonth() === index,
      }))
    }
    return buckets.map((bucket) => {
      const rows = datedPatients.filter((row) => bucket.match(row.date))
      return {
        label: bucket.label,
        total: rows.length,
        infected: rows.filter(({ patient }) => hasConfirmedSsiHistory(patient)).length,
      }
    })
  }, [datedPatients, period, year, now])
  const procedures = useMemo(() => {
    const map = new Map()
    patients.forEach((patient) => {
      const name = patient.procedure || patient.department || 'ไม่ระบุหัตถการ'
      const row = map.get(name) || { name, total: 0, confirmed: 0 }
      row.total += 1
      if (hasConfirmedSsiHistory(patient)) row.confirmed += 1
      map.set(name, row)
    })
    return [...map.values()].map((row) => ({ ...row, rate: patients.length ? Number((row.total / patients.length * 100).toFixed(2)) : 0 })).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [patients])
  const maxRate = Math.max(2, ...procedures.map((row) => row.rate))
  return <section data-export-charts={JSON.stringify({caseTrend,procedures,period,year})} className={`grid gap-4 ${hideProcedure ? 'grid-cols-1' : 'xl:grid-cols-[3fr_2fr]'}`}>
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[18px] font-semibold text-[#073b7a]">เคสทั้งหมดและเคสติดเชื้อ SSI</h2><p className="mt-1 text-[12px] text-slate-500">เปรียบเทียบจำนวนเคสตามช่วงเวลา</p></div><div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">{[['year', 'รายปี'], ['month', 'รายเดือน'], ['day', 'รายวัน']].map(([value, label]) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`h-8 rounded-md px-4 text-[13px] font-medium transition ${period === value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>)}</div></div>
      <div className="mt-5 h-[300px]"><ResponsiveContainer><BarChart data={caseTrend} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barGap={3}><CartesianGrid vertical={false} stroke="#e9edf3"/><XAxis dataKey="label" interval={period === 'day' ? 2 : 0} tick={{ fontSize: 11, fill: '#475467' }}/><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475467' }}/><Tooltip formatter={(value, name) => [`${value} เคส`, name]}/><Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 16 }}/><Bar name="เคสทั้งหมด" dataKey="total" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={28}/><Bar name="เคสติดเชื้อ SSI" dataKey="infected" fill="#ef4444" radius={[5, 5, 0, 0]} maxBarSize={28}/></BarChart></ResponsiveContainer></div>
    </article>
    {!hideProcedure && <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-[70px] items-center justify-between border-b border-slate-100 px-6"><div><h2 className="text-[18px] font-semibold text-[#073b7a]">เคสแยกการผ่าตัด</h2><p className="mt-0.5 text-[11px] text-slate-400">สัดส่วนจากเคสทั้งหมด</p></div><span className="rounded-lg border border-slate-200 px-5 py-2 text-[13px] text-slate-600">{year + 543}</span></div>
      <div className="h-[300px] px-4 py-4"><ResponsiveContainer><BarChart data={procedures} layout="vertical" margin={{ left: 5, right: 55 }}><CartesianGrid horizontal={false} stroke="#eef2f7"/><XAxis type="number" domain={[0, maxRate]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }}/><YAxis type="category" dataKey="name" width={125} tick={{ fontSize: 11, fill: '#475467' }}/><Tooltip formatter={(v) => `${v}%`}/><Bar dataKey="rate" barSize={14} radius={[0, 7, 7, 0]}>{procedures.map((row, index) => <Cell key={row.name} fill={colors[index]}/>) }<LabelList dataKey="rate" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 10, fill: '#475467', fontWeight: 600 }}/></Bar></BarChart></ResponsiveContainer></div>
    </article>}
  </section>
}

function DonutCard({ title, rows, total }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="text-[16px] font-semibold text-[#073b7a] sm:text-[18px]">{title}</h2><div className="mt-3 flex min-h-[210px] flex-col items-center gap-4 sm:flex-row sm:gap-6"><div className="relative h-[170px] w-full max-w-[230px] shrink-0 sm:h-[180px]"><ResponsiveContainer><PieChart><Pie data={rows} dataKey="value" innerRadius={56} outerRadius={82}>{rows.map((row) => <Cell key={row.name} fill={row.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-content-center text-center text-[12px] text-slate-500">ทั้งหมด<strong className="text-[22px] text-slate-900">{total}</strong>เคส</div></div><div className="w-full min-w-0 flex-1 space-y-3">{rows.map((row) => <div key={row.name} className="flex items-center gap-2 text-[13px] sm:gap-3 sm:text-[14px]"><span className="size-3 shrink-0 rounded-full" style={{ background: row.color }}/><span className="min-w-0 flex-1 text-slate-700">{row.name}</span><span className="shrink-0 text-slate-500">{row.value} ({percent(row.value, total)})</span></div>)}</div></div></article>
}

export function AnalyticsDonutPair({ patients }) {
  const total = patients.length
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const followSummary = patients.reduce((counts, row) => {
    const workflow = String(row.workflowStatus || '').toUpperCase()
    const cancelled = ['CANCELLED', 'EXCLUDED', 'REJECTED'].includes(workflow)
    const overdue = (row.followUpSchedule || []).some((round) => !round.completedAt && round.status !== 'COMPLETED' && round.date && round.date < today)
    if (cancelled) counts.cancelled += 1
    else if (overdue) counts.overdue += 1
    else counts.onSchedule += 1
    return counts
  }, { onSchedule: 0, overdue: 0, cancelled: 0 })
  const followRows = [
    { name: 'ตามกำหนด', value: followSummary.onSchedule, color: '#22c55e' },
    { name: 'เกินกำหนด', value: followSummary.overdue, color: '#ef4444' },
    { name: 'ยกเลิกเคส', value: followSummary.cancelled, color: '#94a3b8' },
  ]
  const suspected = patients.filter((row) => getSsiReportCategory(row) === 'SUSPECTED_SSI').length
  const confirmed = patients.filter((row) => hasConfirmedSsiHistory(row)).length
  const typeRows = [{ name: 'เคสปกติ', value: Math.max(0, total - suspected - confirmed), color: '#3b82f6' }, { name: 'สงสัย SSI', value: suspected, color: '#22c55e' }, { name: 'ยืนยัน SSI', value: confirmed, color: '#ef4444' }]
  return <section data-export-donuts={JSON.stringify({followRows,typeRows,total})} className="grid gap-4 xl:grid-cols-2"><DonutCard title="สรุปการติดตามประจำวัน" rows={followRows} total={followRows.reduce((sum, row) => sum + row.value, 0)}/><DonutCard title="อัตราเคสแต่ละประเภท" rows={typeRows} total={total}/></section>
}
