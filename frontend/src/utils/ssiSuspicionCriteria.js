export const ssiSuspicionCriteria = [
  { id: 'pus', name: 'มีหนองออกจากแผลผ่าตัด', enabled: true },
  { id: 'gap', name: 'บาดแผลชั้นลึกแยก (spontaneous dehisces)', enabled: true },
  { id: 'pain', name: 'ปวดหรือกดเจ็บ', enabled: true },
  { id: 'woundInflammation', name: 'บาดแผลบวมแดง หรือร้อน', enabled: true },
  { id: 'physicianSsiDiagnosis', name: 'ศัลยแพทย์ หรือแพทย์ผู้ดูแลวินิจฉัย SSI', enabled: true },
]
export function normalizeSsiCriteria() {
  return ssiSuspicionCriteria.map(item => ({...item}))
}
export const meetsSsiSuspicionCriteria = (answers = {}) => ssiSuspicionCriteria.some(item => ['yes','has','true','มี'].includes(String(answers[item.id]).toLowerCase()))
