import { ssiSuspicionCriteria, meetsSsiSuspicionCriteria } from './ssiSuspicionCriteria.js'
import { ssiSurveillanceRiskFactors, requiresSsiSurveillance } from './ssiSurveillanceRisk.js'
const yes = value => value === true || ['yes','has','true','มี'].includes(String(value).toLowerCase())
export function summarizeSsiAssessment(symptoms = {}, risks = {}) {
  const answers = [...ssiSuspicionCriteria.map(item => symptoms[item.id]), ...ssiSurveillanceRiskFactors.map(item => risks[item.id])]
  const answered = answers.filter(value => value !== undefined && value !== null && value !== '').length
  const positive = answers.filter(yes).length
  return { total: answers.length, answered, positive, score: requiresSsiSurveillance(risks) ? 100 : answered ? Number((positive / answers.length * 100).toFixed(2)) : null, suspected: meetsSsiSuspicionCriteria(symptoms), surveillance: requiresSsiSurveillance(risks) }
}
