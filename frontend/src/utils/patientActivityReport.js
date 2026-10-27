import { api } from '../services/api.js'
import { hasConfirmedSsiHistory } from './ssiAnalytics.js'

const bangkokDate = (value) => value ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)) : ''
const thaiDate = (value) => value ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '-'
const thaiDateTime = (value) => value ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '-'
const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000)

const ssiLabels = { UNASSESSED: 'ยังไม่ประเมิน', NOT_SSI: 'ไม่ติดเชื้อ', SUSPECTED_SSI: 'สงสัย SSI', CONFIRMED_SSI: 'ยืนยัน SSI', RECOVERED: 'หายจากการติดเชื้อ' }
const resultText = (value) => !value ? '-' : value === 'contact_failed' ? 'ติดต่อผู้ป่วยไม่สำเร็จ' : value === 'recovery_clear' ? 'ประเมินว่าหายจากการติดเชื้อ' : /suspect/i.test(value) ? 'สงสัย SSI' : /confirmed|positive/i.test(value) ? 'ยืนยัน SSI' : 'ไม่เข้าเกณฑ์ SSI'

export const ROUND_STATUS = { ON_TIME: 'ตรงตามกำหนด', LATE: 'ประเมินล่าช้า', OVERDUE: 'เกินกำหนด (ยังไม่ประเมิน)', DUE_TODAY: 'ครบกำหนดวันนี้', UPCOMING: 'รอถึงกำหนด', DONE: 'ประเมินแล้ว', CANCELLED: 'ยกเลิก' }
const statusFills = { [ROUND_STATUS.ON_TIME]: 'FFDCFCE7', [ROUND_STATUS.LATE]: 'FFFEF3C7', [ROUND_STATUS.OVERDUE]: 'FFFEE2E2', [ROUND_STATUS.DUE_TODAY]: 'FFDBEAFE' }

export function getRoundStatus(round, today, caseCancelled) {
  const scheduled = String(round.date || '').slice(0, 10)
  if (round.status === 'COMPLETED' || round.completedAt) {
    const done = bangkokDate(round.completedAt)
    if (!scheduled || !done) return { status: ROUND_STATUS.DONE, days: 0 }
    return done <= scheduled ? { status: ROUND_STATUS.ON_TIME, days: 0 } : { status: ROUND_STATUS.LATE, days: daysBetween(scheduled, done) }
  }
  if (caseCancelled || round.status === 'CANCELLED') return { status: ROUND_STATUS.CANCELLED, days: 0 }
  if (!scheduled || scheduled > today) return { status: ROUND_STATUS.UPCOMING, days: 0 }
  if (scheduled === today) return { status: ROUND_STATUS.DUE_TODAY, days: 0 }
  return { status: ROUND_STATUS.OVERDUE, days: daysBetween(scheduled, today) }
}

export async function loadCaseDetails(patients, onProgress) {
  const details = new Map()
  const queue = [...patients]
  let done = 0
  const worker = async () => {
    while (queue.length) {
      const patient = queue.shift()
      const [activities, evaluations, transfers] = await Promise.all([
        api.getActivities(patient.operationNo).catch(() => []),
        api.getEvaluations(patient.operationNo).catch(() => []),
        api.getTransfers(patient.operationNo).catch(() => []),
      ])
      details.set(patient.operationNo, { activities, evaluations, transfers })
      onProgress?.(++done, patients.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, patients.length) }, worker))
  return details
}

function caseEvents(patient, detail, today) {
  const events = []
  const add = (at, type, info, staff = '', result = '') => events.push({ at, type, info, staff, result })
  const cancelled = ['CANCELLED', 'EXCLUDED', 'REJECTED'].includes(patient.workflowStatus) || patient.followUpStatus === 'CANCELLED'
  if (patient.createdAt) add(patient.createdAt, 'รับข้อมูลเข้าระบบ', `จาก RIS / OR (${patient.operationNo})`)
  if (patient.startAt) add(patient.startAt, 'ผ่าตัด', [patient.procedure, patient.operatingRoom && `ห้อง ${patient.operatingRoom}`].filter(Boolean).join(' · '), [patient.surgeon, patient.secondSurgeon].filter(Boolean).join(', '))
  if (patient.dischargeDate) add(patient.dischargeDate, 'จำหน่ายผู้ป่วย', patient.woundAtDischarge ? `แผลขณะจำหน่าย: ${patient.woundAtDischarge}` : '')
  detail.transfers.forEach(t => add(t.created_at, 'ย้าย/ส่งต่อเคส', `${t.from_type || '-'} → ${t.to_type} ${t.target_department} · ${t.reason}${t.notes ? ` · ${t.notes}` : ''}`, t.transferred_by))
  if (patient.followUpCreatedAt) add(patient.followUpCreatedAt, 'สร้างแผนติดตาม', `${patient.followUpNo || ''} · ${patient.followUpSchedule.length} รอบ / ${patient.followUpTemplateDays || '-'} วัน`, patient.assignedTo)
  detail.activities.forEach(a => add(a.activity_at || a.created_at, `กิจกรรม: ${a.activity_type}`, [a.purpose, a.detail, a.location && `สถานที่: ${a.location}`].filter(Boolean).join(' · '), a.staff))
  detail.evaluations.forEach(e => {
    const key = String(e.round_key || '')
    const round = patient.followUpSchedule.find(r => String(r.id || r.day) === key)
    const type = e.result === 'contact_failed' ? 'ติดต่อผู้ป่วย' : key.startsWith('ACTIVITY:') ? 'ประเมินจากกิจกรรม' : `ประเมินรอบ ${round?.day || key || '-'}`
    const note = e.data?.note || e.data?.notes || e.data?.remark || ''
    add(e.evaluated_at, type, [e.score != null && `คะแนน ${e.score}`, note].filter(Boolean).join(' · '), e.evaluated_by, resultText(e.result))
    if (e.doctor_reviewed_at) add(e.doctor_reviewed_at, 'แพทย์วินิจฉัย', e.doctor_note || '', e.doctor_reviewed_by, ssiLabels[e.doctor_decision] || e.doctor_decision)
  })
  patient.followUpSchedule.forEach(round => {
    if (round.status === 'COMPLETED' || round.completedAt) return
    const { status, days } = getRoundStatus(round, today, cancelled)
    add(`${String(round.date).slice(0, 10)}T${round.time || '00:00'}:00+07:00`, `นัดติดตามรอบ ${round.day || '-'}`, `วิธีติดตาม: ${round.method || '-'}`, patient.assignedTo, days ? `${status} ${days} วัน` : status)
  })
  return events.filter(e => e.at && !Number.isNaN(new Date(e.at).getTime())).sort((a, b) => new Date(a.at) - new Date(b.at))
}

export function buildPatientSheets(patients, details, today = bangkokDate(new Date())) {
  const sorted = [...patients].sort((a, b) => new Date(a.startAt || a.createdAt) - new Date(b.startAt || b.createdAt))
  const summaryRows = [], roundRows = [], timelineRows = []
  const byHn = new Map()
  sorted.forEach(p => byHn.set(p.id, [...(byHn.get(p.id) || []), p]))

  sorted.forEach(p => {
    const detail = details.get(p.operationNo) || { activities: [], evaluations: [], transfers: [] }
    const cancelled = ['CANCELLED', 'EXCLUDED', 'REJECTED'].includes(p.workflowStatus) || p.followUpStatus === 'CANCELLED'
    const counts = Object.fromEntries(Object.values(ROUND_STATUS).map(s => [s, 0]))
    p.followUpSchedule.forEach((round, index) => {
      const { status, days } = getRoundStatus(round, today, cancelled)
      counts[status]++
      const evaluation = detail.evaluations.find(e => e.id === round.evaluationId || String(e.round_key) === String(round.id || round.day))
      roundRows.push({ values: [p.id, p.name, p.operationNo, p.procedure, index + 1, round.day || '-', thaiDate(round.date), round.time || '-', round.method || '-', thaiDateTime(round.completedAt), status, days || '', resultText(round.result || evaluation?.result), evaluation?.evaluated_by || '-'], fill: statusFills[status], fillColumn: 11 })
    })
    const contactFailed = detail.evaluations.filter(e => e.result === 'contact_failed').length
    summaryRows.push([p.id, p.name, p.age ?? '-', p.sex || '-', p.phonePrimary || '-', p.operationNo, p.procedure, p.department, p.patientType?.toUpperCase() || '-', thaiDateTime(p.startAt), thaiDate(p.dischargeDate), p.surgeon || '-', p.assignedTo || '-', p.followUpNo || '-', p.followUpSchedule.length, counts[ROUND_STATUS.ON_TIME] + counts[ROUND_STATUS.DONE], counts[ROUND_STATUS.LATE], counts[ROUND_STATUS.OVERDUE], counts[ROUND_STATUS.DUE_TODAY] + counts[ROUND_STATUS.UPCOMING], detail.activities.length, contactFailed, ssiLabels[p.ssiStatus] || p.ssiStatus, hasConfirmedSsiHistory(p) ? 'ใช่' : 'ไม่ใช่', counts[ROUND_STATUS.OVERDUE] ? 'มีรอบเกินกำหนด' : counts[ROUND_STATUS.LATE] ? 'มีรอบล่าช้า' : p.followUpSchedule.length ? 'ตรงตามกำหนด' : 'ยังไม่มีแผนติดตาม'])
  })

  byHn.forEach((cases, hn) => {
    const first = cases[0]
    timelineRows.push({ group: `HN ${hn} · ${first.name} · ${first.sex || '-'} · อายุ ${first.age ?? '-'} · โทร ${first.phonePrimary || '-'} · ${cases.length} การผ่าตัด` })
    cases.forEach(p => caseEvents(p, details.get(p.operationNo) || { activities: [], evaluations: [], transfers: [] }, today)
      .forEach(e => timelineRows.push([thaiDateTime(e.at), p.operationNo, p.procedure, e.type, e.info || '-', e.staff || '-', e.result || '-'])))
  })

  return [
    { name: 'ข้อมูลผู้ป่วยรายเคส', headers: ['HN', 'ชื่อผู้ป่วย', 'อายุ', 'เพศ', 'เบอร์โทร', 'Operation Number', 'หัตถการ', 'แผนก', 'ประเภทผู้ป่วย', 'วันที่ผ่าตัด', 'วันที่จำหน่าย', 'ศัลยแพทย์', 'ผู้รับผิดชอบติดตาม', 'เลขที่แผนติดตาม', 'จำนวนรอบทั้งหมด', 'ตรงตามกำหนด', 'ประเมินล่าช้า', 'เกินกำหนด (ยังไม่ประเมิน)', 'รอถึงกำหนด', 'จำนวนกิจกรรม', 'ติดต่อไม่สำเร็จ (ครั้ง)', 'สถานะ SSI ปัจจุบัน', 'เคยยืนยัน SSI', 'สรุปการติดตาม'], rows: summaryRows, widths: [12, 24, 8, 8, 14, 22, 28, 20, 12, 18, 14, 20, 20, 18, 12, 12, 12, 14, 12, 12, 12, 16, 12, 18] },
    { name: 'การติดตามรายรอบ', headers: ['HN', 'ชื่อผู้ป่วย', 'Operation Number', 'หัตถการ', 'ลำดับรอบ', 'รอบ', 'วันที่กำหนด', 'เวลา', 'วิธีติดตาม', 'วันที่ประเมินจริง', 'สถานะตามกำหนด', 'ล่าช้า/เกิน (วัน)', 'ผลประเมิน', 'ผู้ประเมิน'], rows: roundRows, widths: [12, 24, 22, 28, 10, 12, 14, 10, 20, 18, 22, 12, 22, 20] },
    { name: 'ไทม์ไลน์กิจกรรมรายผู้ป่วย', headers: ['วันที่/เวลา', 'Operation Number', 'หัตถการ', 'กิจกรรม', 'รายละเอียด', 'ผู้ดำเนินการ', 'ผล/สถานะ'], rows: timelineRows, widths: [18, 22, 26, 24, 50, 22, 26], autoFilter: false },
  ]
}
