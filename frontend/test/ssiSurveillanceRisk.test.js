import test from 'node:test'
import assert from 'node:assert/strict'
import { ssiSurveillanceRiskFactors, requiresSsiSurveillance, selectedSsiRiskFactors } from '../src/utils/ssiSurveillanceRisk.js'
test('each of the five factors alone requires SSI surveillance', () => {
 assert.equal(ssiSurveillanceRiskFactors.length,5)
 for(const factor of ssiSurveillanceRiskFactors) assert.equal(requiresSsiSurveillance({[factor.id]:true}),true)
})
test('clearing factors removes the flag; legacy and unrelated answers do not trigger it',()=>{
 assert.equal(requiresSsiSurveillance(),false)
 assert.equal(requiresSsiSurveillance({cancer:false,other:true}),false)
 assert.equal(selectedSsiRiskFactors({cancer:true,glucoseAbove200:true}).length,2)
})

test('table yes/no/unknown answers retain the one-factor surveillance rule and support saved checkbox answers',()=>{
 for(const factor of ssiSurveillanceRiskFactors){
  assert.equal(requiresSsiSurveillance({[factor.id]:'yes'}),true)
  assert.equal(requiresSsiSurveillance({[factor.id]:'no'}),false)
  assert.equal(requiresSsiSurveillance({[factor.id]:'unknown'}),false)
  assert.equal(requiresSsiSurveillance({[factor.id]:true}),true)
 }
})
