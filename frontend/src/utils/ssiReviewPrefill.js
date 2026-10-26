const answer = value => {
  if (value === true || /^(yes|has|true|มี)$/i.test(String(value))) return 'YES'
  if (value === false || /^(no|false|ไม่มี)$/i.test(String(value))) return 'NO'
  return null
}
const classification = value => ({ SUPERFICIAL: 'SUPERFICIAL', DEEP: 'DEEP', ORGAN_SPACE: 'ORGAN_SPACE', 'Superficial Incisional SSI': 'SUPERFICIAL', 'Deep Incisional SSI': 'DEEP', 'Organ/Space SSI': 'ORGAN_SPACE' })[value]

export function prefillSsiReview(patient, evaluations, criteria = []) {
  const risks = {}, bundle = {}, findings = [], evidence = []
  const put = (index, value, detail, source) => { if (value) risks[index] = { answer: value, detail, source } }
  const numeric = value => value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null
  const age = numeric(patient.age)
  const height = numeric(patient.heightCm), weight = numeric(patient.weightKg)
  const bmi = numeric(patient.bmi) ?? (height > 0 && weight > 0 ? Number((weight / (height / 100) ** 2).toFixed(2)) : null)
  if (age != null) put(0, age > 60 ? 'YES' : 'NO', `อายุ ${age} ปี`, 'ข้อมูลผู้ป่วย')
  if (bmi != null) put(1, bmi > 28 ? 'YES' : 'NO', `BW ${weight ?? '-'} kg / HT ${height ?? '-'} cm / BMI ${bmi}`, 'ข้อมูลผู้ป่วย')
  if (['YES', 'NO', 'FORMER'].includes(patient.smokingStatus)) put(4, patient.smokingStatus === 'YES' ? 'YES' : 'NO', patient.smokingStatus === 'FORMER' ? 'เคยสูบ' : patient.smokingStatus === 'YES' ? 'สูบ' : 'ไม่สูบ', 'ข้อมูลผู้ป่วย')
  const comorbidities = String(patient.comorbidities || '').trim()
  if (/^(ไม่มี|ไม่มีโรคประจำตัว|none|no|no comorbidities)$/i.test(comorbidities)) put(6, 'NO', comorbidities, 'ข้อมูลโรคร่วม/ปัจจัยเสี่ยง')
  else if (comorbidities && !/^(ไม่ระบุ|unknown|n\/a|-)$/i.test(comorbidities)) put(6, 'YES', comorbidities, 'ข้อมูลโรคร่วม/ปัจจัยเสี่ยง')
  if (/\bDM\b|diabetes|เบาหวาน/i.test(comorbidities) && !/(ไม่มี|ไม่เป็น|ปฏิเสธ|no|without)\s*(โรค)?\s*(เบาหวาน|DM|diabetes)/i.test(comorbidities)) put(2, 'YES', comorbidities, 'ข้อมูลโรคประจำตัว')
  for (const [field, index] of [['diabetes',2], ['nearbyInfection',3], ['alcohol',5]]) if (answer(patient[field])) put(index, answer(patient[field]), '', 'ข้อมูลผู้ป่วย')
  const albumin = numeric(patient.albumin), bilirubin = numeric(patient.bilirubin)
  if (albumin != null) put(7, albumin < 3.5 ? 'YES' : 'NO', `Albumin ${albumin} g/dL`, 'ข้อมูลผู้ป่วย')
  if (bilirubin != null) put(8, bilirubin > 1 ? 'YES' : 'NO', `Bilirubin ${bilirubin} mg/dL`, 'ข้อมูลผู้ป่วย')
  const dateOnly = value => { if (!value) return NaN; const date = new Date(value); if (!Number.isFinite(date.getTime())) return NaN; return Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)) }
  const admitted = dateOnly(patient.episodeDate), operated = dateOnly(patient.startAt)
  const days = (operated - admitted) / 86400000
  if (Number.isFinite(days) && days >= 0) put(9, days > 2 ? 'YES' : 'NO', `${days} วันก่อนผ่าตัด`, 'วันที่ Admit และวันผ่าตัด')
  const history = [...evaluations].filter(row => row.evaluation_type !== 'SSI_ACTIVITY' && !String(row.round_key || '').startsWith('ACTIVITY:') && !String(row.round_key || '').startsWith('CONTACT:') && row.result !== 'contact_failed').sort((a,b) => new Date(b.evaluated_at) - new Date(a.evaluated_at))
  let selectedClass = '', issues = ''
  const labels = new Map(criteria.map(item => [String(item.id), item.name]))
  for (const row of history) {
    const data = row.data || {}
    const source = `ประเมินตามรอบ ${row.round_key || ''}`.trim()
    // Only identical, explicit risk data are reused. Postoperative symptoms do not imply preoperative risks or bundle compliance.
    for (const [field, index] of [['diabetes',2],['nearbyInfection',3],['alcohol',5]]) {
      if (!risks[index] && answer(data[field])) put(index, answer(data[field]), '', source)
    }
    if (!selectedClass) selectedClass = classification(data.ssiClassification || data.classification) || ''
    if (!issues && data.evalRemarks?.trim()) issues = `${source}: ${data.evalRemarks.trim()}`
    if (evidence.length < 3) {
      const symptoms = Object.entries(data.symptoms || {}).filter(([,value]) => answer(value) === 'YES').map(([key]) => labels.get(key) || ({ fever:'ไข้',pain:'ปวด',swell:'บวม',red:'แดง',pus:'หนอง',smell:'กลิ่นผิดปกติ',gap:'แผลแยก' })[key] || key)
      evidence.push({ round: row.round_key || '-', date: row.evaluated_at, result: row.doctor_decision || row.result, symptoms, advice: data.evalRemarks || '' })
    }
  }
  if (Object.values(risks).some(item => item.answer === 'YES')) findings.push('พบ Risk factor')
  return { risks, bundle, findings, classification: selectedClass, issues, evidence }
}

export function mergeSsiReviewPrefill(defaults, saved = {}) {
  return { ...defaults, ...saved, classification: saved.classification || defaults.classification, risks: { ...defaults.risks, ...saved.risks }, bundle: { ...defaults.bundle, ...saved.bundle }, findings: Array.isArray(saved.findings) ? saved.findings : (defaults.findings || []), issues: saved.issues ?? defaults.issues }
}
