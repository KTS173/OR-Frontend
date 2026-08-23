import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

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

const dashboardVisuals = {
  blue:   { icon: 'Group.png', arrow: 'upgreen.png', label: '#1823ed', value: '#1823ed', iconColor: '#1823ed', trend: '#10b981' },
  cyan:   { icon: 'Symbol.png', arrow: 'upgreen.png', label: '#1e3a8a', value: '#1e3a8a', iconColor: '#3b82f6', trend: '#10b981' },
  amber:  { icon: 'icon3.png', arrow: 'up orange.png', label: '#7c2d12', value: '#f97316', iconColor: '#f97316', trend: '#f97316' },
  violet: { icon: 'letter.png', arrow: 'upgreen.png', label: '#0561d9', value: '#3b82f6', iconColor: '#3b82f6', trend: '#10b981' },
  green:  { icon: 'calendar-check.png', arrow: 'upgreen.png', label: '#047857', value: '#10b981', iconColor: '#10b981', trend: '#10b981' },
  red:    { icon: 'time-alert_svgrepo.com.png', arrow: 'up-red-margin.png', label: '#ef2b2b', value: '#ef4444', iconColor: '#ef4444', trend: '#ef4444' },
  purple: { icon: '2.png', arrow: 'down green.png', label: '#4c1dca', value: '#4c1dca', iconColor: '#4c1dca', trend: '#ef4444' },
  teal:   { icon: 'image.png', arrow: 'down green.png', label: '#1e3a8a', value: '#1e3a8a', iconColor: '#1e3a8a', trend: '#ef4444' },
  orange: { icon: 'warning.png', arrow: 'up-red-margin.png', label: '#e96500', value: '#e96500', iconColor: '#f97316', trend: '#ef4444', trendUnit: 'ราย', trendSuffix: '#ef4444', background: '#fffaf5', border: 'border-amber-200' },
  rose:   { icon: 'ice.png', arrow: 'up-red-margin.png', label: '#e9272f', value: '#ef3741', iconColor: '#e9272f', trend: '#ef3741', trendUnit: 'ราย', trendSuffix: '#ef3741', background: '#fff4f4' },
}

export default function MetricCard({ label, value, unit, trend, tone = 'blue', dashboard = false, topRow = false, subtext }) {
  const positive = trend?.startsWith('+')
  if (!dashboard) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-slate-500">{label}</p>
          <span className={`rounded-lg p-1.5 ${tones[tone]}`}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
        <p className={`mt-2 text-[10px] ${positive ? 'text-emerald-600' : 'text-slate-400'}`}>{trend} <span className="text-slate-400">จากเมื่อวาน</span></p>
      </article>
    )
  }

  const visual = dashboardVisuals[tone] ?? dashboardVisuals.blue
  const iconUrl = `/assets/icon/dashboard/${visual.icon}`
  const arrowUrl = `/assets/icon/dashboard/${visual.arrow}`
  const borderClass = visual.border ?? 'border-black/10'

  return (
    <article
      className={`flex min-h-[124px] flex-col items-start gap-1 overflow-hidden rounded-xl border p-[17px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md ${borderClass} ${topRow ? 'sm:min-h-[138px]' : ''}`}
      style={{ backgroundColor: visual.background ?? '#ffffff' }}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <p className="text-[14px] leading-5 font-medium" style={{ color: visual.label }}>{label}</p>
        <span
          className="metric-card-icon"
          aria-hidden="true"
          style={{
            backgroundColor: visual.iconColor,
            WebkitMaskImage: `url("${iconUrl}")`,
            maskImage: `url("${iconUrl}")`,
          }}
        />
      </div>
      <p className="flex w-full items-baseline gap-2 pt-1 text-[32px] leading-9 font-semibold" style={{ color: visual.value }}>
        <span>{value}</span>
        {unit && <span className="whitespace-nowrap text-[14px] font-semibold">{unit}</span>}
      </p>
      {subtext ? (
        <p className="mt-auto text-[12px] font-medium" style={{ color: tone === 'red' ? '#ef4444' : '#6b7280' }}>
          {subtext}
        </p>
      ) : (
        <p className="flex items-center gap-0.5 text-[14px] leading-4 font-medium" style={{ color: visual.trend }}>
          <span
            className="h-[9px] w-3 shrink-0 bg-contain bg-center bg-no-repeat"
            aria-hidden="true"
            style={{
              backgroundColor: visual.trend,
              WebkitMaskImage: `url("${arrowUrl}")`,
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              maskImage: `url("${arrowUrl}")`,
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
            }}
          />
          {trend?.replace('+', '')}{visual.trendUnit ? ` ${visual.trendUnit}` : ''}
          <span className="ml-1" style={{ color: visual.trendSuffix ?? '#6b7280' }}>จากเมื่อวาน</span>
        </p>
      )}
    </article>
  )
}
