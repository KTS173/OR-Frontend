const factorIds=['glucoseAbove200','hematocritBelow20','cancer','otherSiteInfection','asaClass3OrHigher'];
function normalizeHandoverRisk(input){
 if(input===undefined)return null;
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!factorIds.includes(key)))throw Error('Invalid SSI handover factors');
 if(Object.values(input).some(value=>typeof value!=='boolean'))throw Error('SSI handover factors must be boolean');
 return Object.fromEntries(factorIds.map(id=>[id,input[id]===true]));
}
const handoverRiskLevel = factors => factors==null?'UNKNOWN':factorIds.some(id=>factors[id]===true)?'HIGH':'NORMAL';
module.exports={normalizeHandoverRisk,handoverRiskLevel};
