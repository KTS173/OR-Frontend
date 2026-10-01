export function getFollowUpStatus(patient, today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())) {
  if (['CANCELLED', 'EXCLUDED', 'REJECTED'].includes(patient.workflowStatus) || patient.followUpStatus === 'CANCELLED') return 'ยกเลิกเคส'
  if (patient.followUpStatus === 'COMPLETED' || patient.workflowStatus === 'FOLLOW_UP_COMPLETED' || patient.followUpCompletedAt) return 'ประเมินแล้ว'
  const rounds = patient.followUpSchedule || []
  const completed = (round) => round.status === 'COMPLETED' || Boolean(round.completedAt)
  const pending = rounds.filter(round => !completed(round) && round.status !== 'CANCELLED')
  if (pending.some(round => round.date && round.date.slice(0, 10) < today)) return 'เกินกำหนดการประเมิน'
  if (pending.some(round => round.date && round.date.slice(0, 10) === today)) return 'ถึงรอบการประเมิน'
  if (rounds.some(completed)) return 'ประเมินแล้ว'
  if (pending.length) return 'รอรอบการประเมิน'
  return 'ยังไม่กำหนดรอบประเมิน'
}
