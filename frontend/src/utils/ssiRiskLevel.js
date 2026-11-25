import { requiresSsiSurveillance } from './ssiSurveillanceRisk.js'
export const defaultSsiRiskLevels = [
 { id:'low',name:'ต่ำ',min:0,max:24,color:'#10b981' },
 { id:'moderate',name:'กลาง',min:25,max:50,color:'#f59e0b' },
 { id:'high',name:'สูง',min:51,max:100,color:'#ef4444' },
]
export function normalizeSsiRiskLevels(levels = []) {
 return defaultSsiRiskLevels.map(base => {
  const stored=levels.find(item=>item.id===base.id)
  const critical=levels.find(item=>item.id==='critical')
  return {...base,...stored,name:base.name,...(base.id==='high'&&critical?{max:100}:{}),...(base.id==='moderate'&&stored?.max===49?{max:50}:{}),...(base.id==='high'&&stored?.min===50?{min:51}:{})}
 })
}
export function classifySsiRisk(score, levels = defaultSsiRiskLevels) {
 if(score == null || !Number.isFinite(Number(score))) return null
 const numeric=Number(score)
 return normalizeSsiRiskLevels(levels).find(level=>numeric>=Number(level.min)&&numeric<=Number(level.max)) || null
}
export function savedSsiRisk(evaluation = {}) {
 const data=evaluation.evaluation_data || evaluation.data || {}
 if(data.assessmentModel === 'ssi-checklist-v1') return null
 if(requiresSsiSurveillance(data.ssiRiskFactors)) return {...defaultSsiRiskLevels[2],score:100,label:'สูง 100%'}
 const saved=data.riskAssessment
 const score=evaluation.evaluation_score ?? evaluation.score ?? saved?.score
 if(score == null) return null
 const level=saved?.level ? {id:saved.level,name:saved.name,color:saved.color} : classifySsiRisk(score)
 return level ? {...level,score:Number(score),label:`${level.name} ${Number(score)}%`} : null
}
