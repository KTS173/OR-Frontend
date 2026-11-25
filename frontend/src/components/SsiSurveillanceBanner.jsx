import SsiHandoverRisk from './ui/SsiHandoverRisk.jsx'
import { requiresSsiSurveillance } from '../utils/ssiSurveillanceRisk.js'
import { showSsiSurveillanceBanner } from '../utils/ssiSurveillanceBanner.js'

export default function SsiSurveillanceBanner({ operation }) {
  if (!showSsiSurveillanceBanner(operation)) return null
  return <div className="mx-5 mb-4">{requiresSsiSurveillance(operation.orSsiRiskFactors) ? <SsiHandoverRisk factors={operation.orSsiRiskFactors} details/> : <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">สงสัย SSI — ให้ IC ตรวจสอบเพื่อยืนยัน</div>}</div>
}
