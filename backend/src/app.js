const express = require('express');
const cors = require('cors');
const { query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const columns = [
  'request_id', 'event_type', 'source_system', 'hn', 'first_name', 'last_name',
  'date_of_birth', 'age', 'sex', 'height_cm', 'weight_kg', 'bmi', 'episode_no',
  'episode_date', 'ward_name', 'bed_no', 'operation_no', 'surgeon', 'second_surgeon',
  'operation_department', 'operation_location', 'operating_room', 'urgency',
  'operation_type', 'preoperative_diagnosis', 'procedure_name', 'procedure_free_text',
  'primary_body_site', 'laterality', 'secondary_operation', 'start_at', 'end_at',
  'duration_minutes', 'outcome', 'report_template', 'status', 'patient_type'
];

const emptyToNull = (value) => value === '' || value === undefined ? null : value;

const valuesFrom = (body) => {
  const patient = body.patient || {};
  const visit = body.visit || {};
  const operation = body.operation || {};
  return [
    body.requestId,
    body.eventType || 'OPERATION_CREATED',
    body.sourceSystem || 'MOCK_RIS_EXTENSION',
    patient.hn,
    patient.firstName,
    patient.lastName,
    patient.dateOfBirth,
    patient.age,
    patient.sex,
    patient.heightCm,
    patient.weightKg,
    patient.bmi,
    visit.episodeNo,
    visit.episodeDate,
    visit.wardName,
    visit.bedNo,
    operation.operationNo,
    operation.surgeon,
    operation.secondSurgeon,
    operation.department,
    operation.location,
    operation.operatingRoom,
    operation.urgency,
    operation.operationType,
    operation.preoperativeDiagnosis,
    operation.procedureName,
    operation.procedureFreeText,
    operation.primaryBodySite,
    operation.laterality,
    operation.secondaryOperation,
    operation.startAt,
    operation.endAt,
    operation.durationMinutes,
    operation.outcome,
    operation.reportTemplate,
    operation.status,
    visit.patientType
  ].map((value, index) => {
    const textColumns = new Set([3, 12, 16, 25]);
    return textColumns.has(index) && (value === '' || value === undefined) ? '' : emptyToNull(value);
  });
};

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'UP' });
});

app.post('/api/operations', async (req, res, next) => {
  if (!req.body?.requestId) {
    return res.status(400).json({ success: false, message: 'Missing requestId' });
  }

  const requiredFields = [
    ['patient.hn', req.body.patient?.hn],
    ['visit.episodeNo', req.body.visit?.episodeNo],
    ['operation.operationNo', req.body.operation?.operationNo],
    ['operation.procedureName', req.body.operation?.procedureName]
  ];
  const missingFields = requiredFields
    .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
    .map(([field]) => field);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      fields: missingFields
    });
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const updates = columns
    .filter((column) => column !== 'operation_no')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');
  const sql = `
    INSERT INTO ris_operations (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (operation_no) DO UPDATE SET ${updates}, updated_at = NOW()
    RETURNING id, operation_no, (xmax = 0) AS inserted
  `;

  try {
    const result = await query(sql, valuesFrom(req.body));
    const saved = result.rows[0];
    res.status(saved.inserted ? 201 : 200).json({
      success: true,
      message: 'Operation data saved successfully',
      data: { id: saved.id, operationNo: saved.operation_no }
    });
  } catch (error) {
    if (error.code === '22P02' || error.code === '22007' || error.code === '22008' || error.code === '22003') {
      return res.status(400).json({ success: false, message: 'Invalid field format' });
    }
    next(error);
  }
});

app.get('/api/operations', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM ris_operations ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/operations/:operationNo', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM ris_operations WHERE operation_no = $1', [req.params.operationNo]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Operation not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/operations/:operationNo/patient-type', async (req, res, next) => {
  const patientType = String(req.body?.patientType || '').trim().toUpperCase();
  if (!['OPD', 'IPD'].includes(patientType)) {
    return res.status(400).json({ success: false, message: 'patientType must be OPD or IPD' });
  }

  try {
    const result = await query(
      'UPDATE ris_operations SET patient_type = $1, updated_at = NOW() WHERE operation_no = $2 RETURNING operation_no, patient_type',
      [patientType, req.params.operationNo]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Operation not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Server or database error' });
});

module.exports = app;
