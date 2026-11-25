export const ssiSurveillanceRiskFactors = [
  { id: 'glucoseAbove200', label: 'ระดับน้ำตาลสูงกว่า 200 มิลลิกรัม/เดซิลิตร' },
  { id: 'hematocritBelow20', label: 'ฮีมาโตคริตต่ำกว่า 20 เปอร์เซ็นต์' },
  { id: 'cancer', label: 'โรคมะเร็ง' },
  { id: 'otherSiteInfection', label: 'มีการติดเชื้อที่ตำแหน่งอื่นของร่างกาย' },
  { id: 'asaClass3OrHigher', label: 'ASA score class 3 ขึ้นไป' },
]
export const selectedSsiRiskFactors = (answers = {}) => ssiSurveillanceRiskFactors.filter(item => (answers[item.id] === true || answers[item.id] === 'yes'))
export const requiresSsiSurveillance = answers => selectedSsiRiskFactors(answers).length > 0
