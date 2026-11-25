import { requiresSsiSurveillance } from './ssiSurveillanceRisk.js'

export function currentSsiSurveillanceLevel(operation) {
  const latest = operation.latestScheduledEvaluation
  const result = String(latest?.result || '').toLowerCase()
  if (['not_infected', 'not_ssi', 'normal', 'negative', 'recovery_clear'].includes(result)) return 'NORMAL'
  if (/suspect|confirmed|positive/.test(result)) return 'HIGH'
  return operation.orSsiRiskFactors == null ? 'UNKNOWN' : requiresSsiSurveillance(operation.orSsiRiskFactors) ? 'HIGH' : 'NORMAL'
}

export function showSsiSurveillanceBanner(operation) {
  return requiresSsiSurveillance(operation.orSsiRiskFactors) || currentSsiSurveillanceLevel(operation) === 'HIGH'
}
