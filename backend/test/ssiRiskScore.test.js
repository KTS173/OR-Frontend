const test=require('node:test');const assert=require('node:assert/strict');const {calculateSsiRisk}=require('../src/ssiRiskScore');
test('server computes equal ten-item score and ignores client score and extra symptoms',()=>{
 const data={score:99,symptoms:{pus:'yes',fever:'yes',pain:'unknown'},ssiRiskFactors:{cancer:'yes'}};
 const risk=calculateSsiRisk(data);assert.equal(risk.score,100);assert.equal(risk.level,'high');assert.equal(risk.total,10);
 assert.equal(calculateSsiRisk({symptoms:{pus:'no'}}).score,0);assert.equal(calculateSsiRisk({}),null);
});
test('surveillance overrides to 100%, three suspicion-only positives produce middle 30%',()=>{
 const data={symptoms:{pus:'yes',gap:'yes',pain:'yes',woundInflammation:'yes',physicianSsiDiagnosis:'yes'},ssiRiskFactors:{cancer:true}};
 assert.equal(calculateSsiRisk(data).score,100);assert.equal(calculateSsiRisk(data).level,'high');
 assert.equal(calculateSsiRisk({symptoms:{pus:'yes',gap:'yes',pain:'yes'}}).level,'moderate');
});

test('all five surveillance factors alone force high 100%',()=>{
 for(const id of ['glucoseAbove200','hematocritBelow20','cancer','otherSiteInfection','asaClass3OrHigher']){
  const result=calculateSsiRisk({ssiRiskFactors:{[id]:'yes'}});
  assert.equal(result.score,100);assert.equal(result.level,'high');
 }
});
