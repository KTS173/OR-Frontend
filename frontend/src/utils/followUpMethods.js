const legacyMethodNames = {
  'โทรศัพท์ + Patient Portal': 'โทรติดตามผู้ป่วย',
  'ประเมินอาการและรูปแผล': 'ประเมินจากรูปแผล',
  'แพทย์เรียกพบเข้าตรวจ': 'แพทย์นัดตรวจ',
}

export const normalizeFollowUpMethod = (method) => ({
  ...method,
  name: legacyMethodNames[method.name] || method.name,
  enabled: method.enabled !== false,
})
