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

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const login = String(req.body?.username || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const result = await query(`UPDATE app_users SET last_login_at = NOW() WHERE LOWER(email) = $1 AND password = $2 AND status = 'ACTIVE'
      RETURNING id, name, email, role, department, status, last_login_at`, [login, password]);
    if (!result.rows[0]) return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
});

app.get('/api/users', async (_req, res, next) => {
  try { const result = await query('SELECT id, name, email, role, department, status, last_login_at, created_at FROM app_users ORDER BY id'); res.json({ success: true, data: result.rows }); }
  catch (error) { next(error); }
});
app.post('/api/users', async (req, res, next) => {
  try {
    const { name, email, role, department, password = 'password' } = req.body || {};
    if (![name, email, role].every((v) => String(v || '').trim())) return res.status(400).json({ success: false, message: 'name, email และ role จำเป็นต้องระบุ' });
    const result = await query(`INSERT INTO app_users (name,email,password,role,department) VALUES ($1,$2,$3,$4,$5)
      RETURNING id,name,email,role,department,status,last_login_at,created_at`, [name, String(email).toLowerCase(), password, role, department || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { if (error.code === '23505') return res.status(409).json({ success: false, message: 'อีเมลนี้มีในระบบแล้ว' }); next(error); }
});
app.patch('/api/users/:id', async (req, res, next) => {
  try { const result = await query(`UPDATE app_users SET name=COALESCE($1,name), role=COALESCE($2,role), department=COALESCE($3,department), status=COALESCE($4,status), updated_at=NOW() WHERE id=$5 RETURNING id,name,email,role,department,status,last_login_at,created_at`, [req.body.name, req.body.role, req.body.department, req.body.status, req.params.id]); if (!result.rows[0]) return res.status(404).json({success:false,message:'User not found'}); res.json({success:true,data:result.rows[0]}); }
  catch(error){ next(error); }
});

app.get('/api/documents', async (_req,res,next)=>{ try{const r=await query('SELECT * FROM documents ORDER BY created_at DESC');res.json({success:true,data:r.rows});}catch(e){next(e);} });
app.post('/api/documents', async (req,res,next)=>{ try{const b=req.body||{};if(!String(b.title||'').trim())return res.status(400).json({success:false,message:'กรุณาระบุชื่อเอกสาร'});const r=await query(`INSERT INTO documents(content_type,title,short_description,content_detail,importance,target_group,publish_date,reference_link,publisher_department,publisher_subdepartment,publisher_name,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[b.contentType||'news',b.title,b.shortDescription||null,b.contentDetail||null,b.importance||'normal',b.targetGroup||'all',b.publishDate||null,b.referenceLink||null,b.publisherDepartment||null,b.publisherSubdepartment||null,b.publisherName||null,b.status||'published']);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);} });

app.get('/api/settings', async (_req,res,next)=>{try{const r=await query('SELECT key,value FROM system_settings');res.json({success:true,data:Object.fromEntries(r.rows.map(x=>[x.key,x.value]))});}catch(e){next(e);}});
app.put('/api/settings', async(req,res,next)=>{try{const entries=Object.entries(req.body||{});await Promise.all(entries.map(([k,v])=>query(`INSERT INTO system_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,[k,v])));res.json({success:true,data:req.body});}catch(e){next(e);}});

app.get('/api/operations/:operationNo/follow-ups', async(req,res,next)=>{try{const r=await query('SELECT * FROM follow_ups WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/follow-ups', async(req,res,next)=>{try{const no=`SUR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;const r=await query(`INSERT INTO follow_ups(follow_up_no,operation_no,template_days,auto_calculate,schedule,assigned_to) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[no,req.params.operationNo,Number(req.body.templateDays)||30,req.body.autoCalculate!==false,req.body.schedule||[],req.body.assignedTo||null]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/activities', async(req,res,next)=>{try{const r=await query('SELECT * FROM case_activities WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/activities', async(req,res,next)=>{try{const b=req.body||{};const r=await query(`INSERT INTO case_activities(operation_no,activity_type,activity_at,purpose,location,staff,contact_primary,contact_secondary,detail,notify_period) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[req.params.operationNo,b.activityType||'FOLLOW_UP',b.activityAt||null,b.purpose||null,b.location||null,b.staff||null,b.contactPrimary||null,b.contactSecondary||null,b.detail||null,b.notifyPeriod||null]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/evaluations', async(req,res,next)=>{try{const r=await query('SELECT * FROM evaluations WHERE operation_no=$1 ORDER BY evaluated_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/evaluations', async(req,res,next)=>{try{const b=req.body||{};const r=await query(`INSERT INTO evaluations(operation_no,evaluation_type,result,score,data,evaluated_by,evaluated_at) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7,NOW())) RETURNING *`,[req.params.operationNo,b.evaluationType||'SSI',b.result||null,b.score||null,b.data||{},b.evaluatedBy||null,b.evaluatedAt||null]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Server or database error' });
});

module.exports = app;
