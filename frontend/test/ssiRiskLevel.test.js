import test from 'node:test'
import assert from 'node:assert/strict'
import {classifySsiRisk,normalizeSsiRiskLevels,savedSsiRisk} from '../src/utils/ssiRiskLevel.js'
test('three risk bands match agreed boundaries and distinguish 0 from unassessed',()=>{
 for(const [score,level] of [[0,'low'],[24,'low'],[25,'moderate'],[50,'moderate'],[51,'high'],[100,'high']]) assert.equal(classifySsiRisk(score).id,level)
 assert.equal(classifySsiRisk(null),null)
 assert.equal(savedSsiRisk({evaluation_score:'0'}).label,'ต่ำ 0%')
 assert.equal(savedSsiRisk({evaluation_score:null}),null)
})
test('old critical tier merges into high and stored snapshot stays stable across other views',()=>{
 const ranges=normalizeSsiRiskLevels([{id:'high',min:51,max:74},{id:'critical',min:75,max:100}])
 assert.equal(ranges.length,3);assert.equal(classifySsiRisk(90,ranges).name,'สูง')
 assert.equal(savedSsiRisk({score:'60',data:{riskAssessment:{level:'high',name:'สูง',color:'#ef4444',score:60}}}).label,'สูง 60%')
})

test('patient views apply the surveillance override to previously saved factor answers',()=>{
 const result=savedSsiRisk({score:'10',data:{ssiRiskFactors:{cancer:'yes'}}})
 assert.equal(result.score,100);assert.equal(result.id,'high')
})

test('new SSI checklist never displays a numeric risk even if old score data is supplied',()=>{
 assert.equal(savedSsiRisk({score:100,data:{assessmentModel:'ssi-checklist-v1',ssiRiskFactors:{cancer:'yes'}}}),null)
})
