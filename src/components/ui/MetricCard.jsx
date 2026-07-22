import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

const tones = {
  blue: 'bg-blue-50 text-blue-600', cyan: 'bg-cyan-50 text-cyan-600', amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600', green: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600', teal: 'bg-teal-50 text-teal-600', orange: 'bg-orange-50 text-orange-600', rose: 'bg-rose-50 text-rose-600',
}

export default function MetricCard({ label, value, unit, trend, tone = 'blue' }) {
  const positive = trend?.startsWith('+')
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${tones[tone]}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
      <p className={`mt-2 text-[10px] ${positive ? 'text-emerald-600' : 'text-slate-400'}`}>{trend} <span className="text-slate-400">จากเมื่อวาน</span></p>
    </article>
  )
}
