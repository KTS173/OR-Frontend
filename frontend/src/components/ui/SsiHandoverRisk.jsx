import { selectedSsiRiskFactors } from '../../utils/ssiSurveillanceRisk.js'

export default function SsiHandoverRisk({ factors, details = false }) {
  if (factors == null) return <span className="text-xs text-slate-400">ยังไม่ระบุ</span>
  const selected = selectedSsiRiskFactors(factors)
  const high = selected.length > 0
  const label = high ? 'เสี่ยงสูง — ต้องเฝ้าระวังเป็นพิเศษ' : 'เคสปกติ'
  return <div title={!details && high ? selected.map(item=>item.label).join(' • ') : undefined} className={details ? `rounded-lg border p-3 ${high ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}` : ''}>
    {details && <p className="mb-2 text-xs text-slate-500">ปัจจัยความเสี่ยง SSI</p>}
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${high ? 'text-red-700' : 'text-green-700'}`}><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${high ? 'bg-red-500' : 'bg-green-500'}`}/>{label}</span>
    {details && high && <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-800">{selected.map(item => <li key={item.id}>{item.label}</li>)}</ul>}
  </div>
}
