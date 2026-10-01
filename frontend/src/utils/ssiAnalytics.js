export const hasConfirmedSsiHistory = (patient) => Boolean(
  patient.everConfirmedSsi || ['CONFIRMED_SSI', 'RECOVERED'].includes(patient.ssiStatus)
)

export const getSsiReportCategory = (patient) => hasConfirmedSsiHistory(patient)
  ? 'CONFIRMED_SSI'
  : patient.ssiStatus
