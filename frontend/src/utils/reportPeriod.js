export const reportPeriodLabels = { day: 'รายวัน', month: 'รายเดือน', year: 'รายปี' }
export function bangkokDate(value = new Date()) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
export function filterReportPeriod(patients, period, date) {
  const length = { day: 10, month: 7, year: 4 }[period]
  if (!length || !date) return []
  return patients.filter(patient => {
    const raw = patient.startAt || patient.createdAt
    return raw && bangkokDate(raw).slice(0, length) === date.slice(0, length)
  })
}
