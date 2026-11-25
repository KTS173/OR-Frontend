const test=require('node:test');const assert=require('node:assert/strict');const {normalizeHandoverRisk,handoverRiskLevel}=require('../src/ssiHandoverRisk');
test('one of any five factors is high; no factors is normal; historical missing data is unknown',()=>{
 for(const id of ['glucoseAbove200','hematocritBelow20','cancer','otherSiteInfection','asaClass3OrHigher']){
  const factors=normalizeHandoverRisk({[id]:true});assert.equal(handoverRiskLevel(factors),'HIGH');assert.equal(Object.keys(factors).length,5);
 }
 assert.equal(handoverRiskLevel(normalizeHandoverRisk({})),'NORMAL');assert.equal(handoverRiskLevel(normalizeHandoverRisk(undefined)),'UNKNOWN');
});
test('reject unsupported factors and nonboolean values',()=>{
 for(const input of [null,[],{cancer:'yes'},{unknown:true}])assert.throws(()=>normalizeHandoverRisk(input));
});
