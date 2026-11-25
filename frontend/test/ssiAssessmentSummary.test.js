import test from 'node:test'
import assert from 'node:assert/strict'
import {summarizeSsiAssessment} from '../src/utils/ssiAssessmentSummary.js'
test('percent uses the ten explicit criteria and flags override percentage bands',()=>{
 const result=summarizeSsiAssessment({pus:'yes',fever:'yes'},{cancer:'yes'})
 assert.equal(result.score,100);assert.equal(result.positive,2);assert.equal(result.suspected,true);assert.equal(result.surveillance,true)
 assert.equal(summarizeSsiAssessment({pus:'yes'}).score,10)
})
test('unknown does not add risk points and unanswered remains distinct from zero',()=>{
 assert.equal(summarizeSsiAssessment().score,null)
 assert.equal(summarizeSsiAssessment({pus:'unknown'}).score,0)
 assert.equal(summarizeSsiAssessment({pus:'unknown'}).suspected,false)
})

test('each surveillance factor independently forces 100%, clearing it restores symptom score',()=>{
 for(const id of ['glucoseAbove200','hematocritBelow20','cancer','otherSiteInfection','asaClass3OrHigher']){
  assert.equal(summarizeSsiAssessment({}, {[id]:'yes'}).score,100)
  assert.equal(summarizeSsiAssessment({pus:'yes'}, {[id]:'no'}).score,10)
  assert.equal(summarizeSsiAssessment({}, {[id]:'unknown'}).surveillance,false)
 }
})
