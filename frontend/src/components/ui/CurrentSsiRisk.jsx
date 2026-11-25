import { currentSsiSurveillanceLevel } from '../../utils/ssiSurveillanceBanner.js'
import SsiHandoverRisk from './SsiHandoverRisk.jsx'

export default function CurrentSsiRisk({ patient }) {
  if (!patient.latestScheduledEvaluation) return <SsiHandoverRisk factors={patient.orSsiRiskFactors}/>
  const level = currentSsiSurveillanceLevel(patient)
  if (level === 'UNKNOWN') return <span className="text-xs text-slate-400">ยังไม่ระบุ</span>
  const high = level === 'HIGH'
  return <span title="อิงผลประเมินตามรอบล่าสุด" className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold ${high ? 'text-red-700' : 'text-green-700'}`}><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${high ? 'bg-red-500' : 'bg-green-500'}`}/>{high ? 'เสี่ยงสูง — ต้องเฝ้าระวังเป็นพิเศษ' : 'ไม่เข้าข่าย SSI'}</span>
}
