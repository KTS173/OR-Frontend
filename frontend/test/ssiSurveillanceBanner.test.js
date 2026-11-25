import test from 'node:test'
import assert from 'node:assert/strict'
import { showSsiSurveillanceBanner } from '../src/utils/ssiSurveillanceBanner.js'
test('use OR risk before the first scheduled assessment',()=>{
 assert.equal(showSsiSurveillanceBanner({orSsiRiskFactors:{asaClass3OrHigher:true}}),true)
 assert.equal(showSsiSurveillanceBanner({orSsiRiskFactors:{}}),false)
})
test('OR risk factors remain visible after a negative scheduled assessment',()=>{
 const operation={orSsiRiskFactors:{cancer:true}}
 assert.equal(showSsiSurveillanceBanner({...operation,latestScheduledEvaluation:{result:'not_infected'}}),true)
 assert.equal(showSsiSurveillanceBanner({...operation,latestScheduledEvaluation:{result:'suspect_ssi'}}),true)
 assert.equal(operation.orSsiRiskFactors.cancer,true)
 assert.equal(showSsiSurveillanceBanner({orSsiRiskFactors:{},latestScheduledEvaluation:{result:'suspect_ssi'}}),true)
})

test('follow-up table still uses the current assessment independently of historical OR factors',async()=>{
 const {currentSsiSurveillanceLevel}=await import('../src/utils/ssiSurveillanceBanner.js')
 const handedOver={orSsiRiskFactors:{cancer:true}}
 assert.equal(currentSsiSurveillanceLevel(handedOver),'HIGH')
 assert.equal(currentSsiSurveillanceLevel({...handedOver,latestScheduledEvaluation:{result:'not_infected'}}),'NORMAL')
 assert.equal(currentSsiSurveillanceLevel({latestScheduledEvaluation:{result:'suspect_ssi'}}),'HIGH')
 assert.equal(currentSsiSurveillanceLevel({}),'UNKNOWN')
})
