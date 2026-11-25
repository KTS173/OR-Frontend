const symptomIds=['pus','gap','pain','woundInflammation','physicianSsiDiagnosis'];
const riskIds=['glucoseAbove200','hematocritBelow20','cancer','otherSiteInfection','asaClass3OrHigher'];
const defaults=[{id:'low',name:'ต่ำ',min:0,max:24,color:'#10b981'},{id:'moderate',name:'กลาง',min:25,max:50,color:'#f59e0b'},{id:'high',name:'สูง',min:51,max:100,color:'#ef4444'}];
function calculateSsiRisk(data={},levels=[]){
 const answers=[...symptomIds.map(id=>data.symptoms?.[id]),...riskIds.map(id=>data.ssiRiskFactors?.[id])];
 const answered=answers.filter(value=>value!=null&&value!=='').length;
 const positive=answers.filter(value=>value===true||['yes','has','true','มี'].includes(String(value).toLowerCase())).length;
 if(!answered)return null;
 const surveillance=riskIds.some(id=>data.ssiRiskFactors?.[id]===true||['yes','has','true','มี'].includes(String(data.ssiRiskFactors?.[id]).toLowerCase()));
 const score=surveillance?100:positive*10;
 const ranges=defaults.map(base=>{const stored=levels.find(l=>l.id===base.id);return {...base,...stored,name:base.name,...(base.id==='high'&&levels.some(l=>l.id==='critical')?{max:100}:{}),...(base.id==='moderate'&&stored?.max===49?{max:50}:{}),...(base.id==='high'&&stored?.min===50?{min:51}:{})};});
 const level=surveillance?defaults.find(l=>l.id==='high'):ranges.find(l=>score>=Number(l.min)&&score<=Number(l.max));
 return {score,level:level?.id||null,name:level?.name||'ไม่ระบุระดับ',color:level?.color||'#64748b',positive,total:10,answered,surveillance,model:'ssi-surveillance-override-v2'};
}
module.exports={calculateSsiRisk};
