import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarCheck, CalendarDays, CalendarPlus, ClipboardList, Send, ShieldAlert, Smile, Stethoscope, Users } from 'lucide-react'

const tones = {
  blue: 'bg-blue-50   text-blue-600',
  cyan: 'bg-cyan-50   text-cyan-600',
  amber: 'bg-amber-50  text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50    text-red-500',
  purple: 'bg-purple-50 text-purple-600',
  teal: 'bg-teal-50   text-teal-600',
  orange: 'bg-orange-50 text-orange-500',
  rose: 'bg-rose-50   text-rose-600',
}

const icons = {
  blue: Users,
  cyan: CalendarPlus,
  amber: ClipboardList,
  violet: Send,
  green: CalendarCheck,
  red: AlertTriangle,
  purple: Stethoscope,
  teal: Smile,
  orange: AlertTriangle,
  rose: ShieldAlert,
}

export default function MetricCard({ label, value, unit, trend, tone = 'blue', dashboard = false, topRow = false }) {
  const positive = trend?.startsWith('+')
  const Icon = icons[tone] ?? Users

  if (!dashboard) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-slate-500">{label}</p>
          <span className={`rounded-lg p-1.5 ${tones[tone]}`}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
        <p className={`mt-2 text-[16px] ${positive ? 'text-emerald-600' : 'text-slate-400'}`}>{trend} <span className="text-slate-400">จากเมื่อวาน</span></p>
      </article>
    )
  }

  const colorClass = tones[tone].split(' ').at(-1)

  return (
    <article className={`flex min-h-[124px] flex-col items-start gap-1 overflow-hidden rounded-xl border border-black/10 bg-white p-[17px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${topRow ? 'sm:min-h-[138px]' : ''} ${tone === 'orange' ? 'bg-orange-50/50' : tone === 'rose' ? 'bg-red-50/60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[14px] leading-5 font-medium ${tone === 'blue' ? 'text-[#1823ed]' : colorClass}`}>{label}</p>
        <span className={`grid place-items-center rounded-lg ${topRow ? 'h-10 w-10' : 'h-6 w-6'}`}><Icon size={24} className={tone === 'blue' ? 'text-[#1823ed]' : colorClass} strokeWidth={2.2} /></span>
      </div>
      <p className={`w-full pt-1 text-[32px] leading-9 font-semibold ${tone === 'blue' ? 'text-[#1823ed]' : colorClass}`}>
        {value} <span className="text-[14px] font-semibold">{unit}</span>
      </p>
      <p className={`flex items-center gap-0.5 text-[12px] leading-4 font-medium ${positive ? 'text-[#10b981]' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend?.replace('+', '')}
        <span className="ml-1 text-[#6b7280]">จากเมื่อวาน</span>
      </p>
    </article>
  )
}
