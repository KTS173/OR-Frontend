const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const currentUserId = () => {
  try { return JSON.parse(sessionStorage.getItem('or-smart-user') || 'null')?.id || null } catch { return null }
}

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message ?? `API request failed (${response.status})`)
  }

  return result?.data ?? result
}

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(new Date(value))
  : '-'

const withAssessmentScore = (payload) => {
  if (payload.score != null) return payload
  const answers = Object.values(payload.data?.symptoms || {}).filter(Boolean)
  if (!answers.length) return payload
  const points = answers.reduce((sum, value) => {
    if (/^(has|yes|true|มี)$/i.test(String(value))) return sum + 1
    if (/^(unknown|unsure|ไม่ทราบ)$/i.test(String(value))) return sum + 0.5
    return sum
  }, 0)
  return { ...payload, score: Number(((points / answers.length) * 100).toFixed(2)) }
}

const operationToPatient = (operation) => ({
  id: operation.hn,
  operationNo: operation.operation_no,
  name: [operation.first_name, operation.last_name].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ',
  firstName: operation.first_name,
  lastName: operation.last_name,
  dateOfBirth: operation.date_of_birth,
  age: operation.age,
  sex: operation.sex,
  heightCm: operation.height_cm,
  weightKg: operation.weight_kg,
  bmi: operation.bmi,
  phonePrimary: operation.phone_primary,
  phoneSecondary: operation.phone_secondary,
  lineId: operation.line_id,
  email: operation.email,
  ethnicity: operation.ethnicity,
  nationality: operation.nationality,
  insurance: operation.insurance,
  address: operation.address,
  episodeNo: operation.episode_no,
  episodeDate: operation.episode_date,
  wardName: operation.ward_name,
  bedNo: operation.bed_no,
  patientType: operation.patient_type?.toLowerCase() || '',
  abbrev: operation.procedure_name,
  procedure: operation.procedure_name,
  procedureFreeText: operation.procedure_free_text,
  secondaryOperation: operation.secondary_operation,
  diagnosis: operation.preoperative_diagnosis,
  surgeon: operation.surgeon,
  secondSurgeon: operation.second_surgeon,
  department: operation.operation_department,
  receivingDepartment: operation.receiving_department,
  location: operation.operation_location,
  operatingRoom: operation.operating_room,
  urgency: operation.urgency,
  operationType: operation.operation_type,
  bodySite: operation.primary_body_site,
  laterality: operation.laterality,
  surgeryDate: formatDate(operation.start_at ?? operation.episode_date),
  startAt: operation.start_at,
  endAt: operation.end_at,
  durationMinutes: operation.duration_minutes,
  dischargeDate: operation.discharge_date,
  woundClass: operation.wound_class,
  asaClass: operation.asa_class,
  implant: operation.implant,
  outcome: operation.outcome,
  reportTemplate: operation.report_template,
  status: operation.status || 'รอตรวจสอบ',
  workflowStatus: operation.workflow_status || 'OR_PENDING',
  ssiStatus: operation.ssi_status || 'UNASSESSED',
  risk: 'ยังไม่ประเมิน',
  createdAt: operation.created_at,
  followUpId: operation.follow_up_id,
  followUpNo: operation.follow_up_no,
  followUpTemplateDays: operation.template_days,
  followUpStatus: operation.follow_up_status,
  followUpSchedule: operation.follow_up_schedule ?? [],
  followUpSelectedProcedures: operation.follow_up_selected_procedures ?? [],
  followUpCreatedAt: operation.follow_up_created_at,
  assignedTo: operation.follow_up_assigned_to ?? operation.assigned_to,
  assignedUserId: operation.assigned_user_id,
  currentRoundIndex: operation.current_round_index ?? 0,
  followUpCompletedAt: operation.completed_at,
  followUpViewedAt: operation.follow_up_viewed_at,
  evaluationId: operation.evaluation_id,
  evaluationRound: operation.evaluation_round,
  evaluationResult: operation.evaluation_result,
  evaluationScore: operation.evaluation_score,
  evaluatedBy: operation.evaluated_by,
  evaluatedAt: operation.evaluated_at,
  evaluationData: operation.evaluation_data,
})

export const api = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }),
  getPatients: async () => (await request('/api/operations')).map(operationToPatient),
  getFollowUpPatients: async (assignedUserId = currentUserId()) => (await request(`/api/follow-ups${assignedUserId ? `?assignedUserId=${encodeURIComponent(assignedUserId)}` : ''}`)).map(operationToPatient),
  getPatient: async (id) => {
    const operations = await request('/api/operations')
    const operation = operations.find((item) => item.hn === id || item.operation_no === id)
    if (!operation) throw new Error('ไม่พบข้อมูลผู้ป่วย')
    return operationToPatient(operation)
  },
  getOperations: () => request('/api/operations'),
  updateOperation: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateOperation: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  assignPatientType: async (operationNo, patientType, department) => request(`/api/operations/${encodeURIComponent(operationNo)}/patient-type`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientType, department }),
  }),
  acceptOperation: (operationNo, userId) => request(`/api/operations/${encodeURIComponent(operationNo)}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }),
  getUsers: () => request('/api/users'),
  createUser: (data) => request('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  getDocuments: () => request('/api/documents'),
  createDocument: (data) => request('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getSettings: () => request('/api/settings'),
  saveSettings: (data) => request('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getFollowUps: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/follow-ups`),
  createFollowUp: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/follow-ups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateFollowUp: (id, data) => request(`/api/follow-ups/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getTransfers: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/transfers`),
  createTransfer: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/transfers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getCaseDocuments: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/documents`),
  createCaseDocument: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getCaseDocument: (id) => request(`/api/case-documents/${encodeURIComponent(id)}/download`),
  markFollowUpViewed: (id, userId = currentUserId()) => request(`/api/follow-ups/${encodeURIComponent(id)}/viewed`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }),
  getEvaluationHistory: async (assignedUserId = currentUserId()) => (await request(`/api/evaluations${assignedUserId ? `?assignedUserId=${encodeURIComponent(assignedUserId)}` : ''}`)).map(operationToPatient),
  getActivities: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/activities`),
  createActivity: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getEvaluations: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/evaluations`),
  createEvaluation: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/evaluations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(withAssessmentScore(data)) }),
  updateEvaluation: (id, data) => request(`/api/evaluations/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  reviewEvaluation: (id, data) => request(`/api/evaluations/${encodeURIComponent(id)}/doctor-decision`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  reviewOperation: (operationNo, data) => request(`/api/operations/${encodeURIComponent(operationNo)}/doctor-decision`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  markRecovered: (operationNo) => request(`/api/operations/${encodeURIComponent(operationNo)}/recovery`, { method: 'PATCH' }),
  getNotifications: (userId = currentUserId()) => userId ? request(`/api/notifications?userId=${encodeURIComponent(userId)}`) : Promise.resolve([]),
  markNotificationRead: (notificationKey, userId = currentUserId()) => request('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationKey, userId }) }),
  getSearchRecords: () => request('/api/search-records'),
}
