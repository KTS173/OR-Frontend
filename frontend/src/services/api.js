const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
  episodeNo: operation.episode_no,
  episodeDate: operation.episode_date,
  wardName: operation.ward_name,
  bedNo: operation.bed_no,
  patientType: operation.patient_type?.toLowerCase() || '',
  abbrev: operation.procedure_name,
  procedure: operation.procedure_name,
  procedureFreeText: operation.procedure_free_text,
  diagnosis: operation.preoperative_diagnosis,
  surgeon: operation.surgeon,
  secondSurgeon: operation.second_surgeon,
  department: operation.operation_department,
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
  outcome: operation.outcome,
  reportTemplate: operation.report_template,
  status: operation.status || 'รอตรวจสอบ',
  risk: 'ยังไม่ประเมิน',
  createdAt: operation.created_at,
})

export const api = {
  getPatients: async () => (await request('/api/operations')).map(operationToPatient),
  getPatient: async (id) => {
    const operations = await request('/api/operations')
    const operation = operations.find((item) => item.hn === id || item.operation_no === id)
    if (!operation) throw new Error('ไม่พบข้อมูลผู้ป่วย')
    return operationToPatient(operation)
  },
  getOperations: () => request('/api/operations'),
  assignPatientType: async (operationNo, patientType) => request(`/api/operations/${encodeURIComponent(operationNo)}/patient-type`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientType }),
  }),
}
