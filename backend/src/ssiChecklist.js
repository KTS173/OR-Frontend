const criteria=['pus','gap','pain','woundInflammation','physicianSsiDiagnosis'];
const yes=value=>value===true||['yes','has','true','มี'].includes(String(value).toLowerCase());
function prepareSsiChecklist(body){
 const source=body.data||{};
 const {ssiRiskFactors,riskAssessment,assessmentSummary,calculatedRisk,requiresSsiSurveillance,...data}=source;
 const contactFailed=body.result==='contact_failed'||data.contactStatus==='failed';
 const symptoms=contactFailed?{}:Object.fromEntries(criteria.map(id=>[id,yes(source.symptoms?.[id])?'yes':source.symptoms?.[id]==='unknown'?'unknown':'no']));
 const requiresIcReview=!contactFailed&&Object.values(symptoms).includes('yes');
 const result=contactFailed?'contact_failed':requiresIcReview?'suspect_ssi':'not_infected';
 return {...body,result,score:null,data:{...data,otherSymptom:contactFailed?'':String(data.otherSymptom||''),symptoms,requiresIcReview,suggestedResult:contactFailed?'':result,assessmentModel:'ssi-checklist-v1'}};
}
module.exports={prepareSsiChecklist};
