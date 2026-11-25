const test=require('node:test');const assert=require('node:assert/strict');const {prepareSsiChecklist}=require('../src/ssiChecklist');
test('any one of the five criteria produces suspected SSI for IC without scores',()=>{
 for(const id of ['pus','gap','pain','woundInflammation','physicianSsiDiagnosis']){
  const output=prepareSsiChecklist({result:'not_infected',score:100,data:{assessmentModel:'ssi-checklist-v1',symptoms:{[id]:'yes',fever:'yes'},ssiRiskFactors:{cancer:'yes'},riskAssessment:{score:100},assessmentSummary:{score:100}}});
  assert.equal(output.result,'suspect_ssi');assert.equal(output.score,null);assert.equal(output.data.requiresIcReview,true);
  assert.equal(Object.keys(output.data.symptoms).length,5);assert.ok(!('riskAssessment' in output.data));assert.ok(!('ssiRiskFactors' in output.data));
 }
});
test('no selected criterion produces not_infected; failed contact cannot be classified',()=>{
 assert.equal(prepareSsiChecklist({data:{symptoms:{fever:'yes'}}}).result,'not_infected');
 const failed=prepareSsiChecklist({data:{contactStatus:'failed',symptoms:{pus:'yes'}}});
 assert.equal(failed.result,'contact_failed');assert.equal(failed.data.requiresIcReview,false);assert.equal(failed.score,null);
});

test('table preserves unknown answers and other symptoms without adding scores or triggering suspicion',()=>{
 const output=prepareSsiChecklist({data:{symptoms:{pus:'unknown',gap:'no'},otherSymptom:'Other observation'}});
 assert.equal(output.data.symptoms.pus,'unknown');assert.equal(output.data.otherSymptom,'Other observation');assert.equal(output.result,'not_infected');assert.equal(output.score,null);
})
