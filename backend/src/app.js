const express = require('express');
const cors = require('cors');
const { query, pool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '7mb' }));

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
const alertOffsetMs = (value) => {
  const text = String(value || '').trim();
  const amount = Number(text.match(/[\d.]+/)?.[0]);
  if (!Number.isFinite(amount)) return null;
  if (/ชั่วโมง|hour/i.test(text)) return amount * 60 * 60 * 1000;
  if (/นาที|minute/i.test(text)) return amount * 60 * 1000;
  if (/วัน|day/i.test(text)) return amount * 24 * 60 * 60 * 1000;
  return null;
};
const notificationRuleKey = (row) => {
  const text = `${row?.id || ''} ${row?.type || ''}`.toLowerCase();
  if (/overdue|เกินกำหนด/.test(text)) return 'overdue';
  if (/no-assessment|ยังไม่ตอบ/.test(text)) return 'noAssessmentResponse';
  if (/appointment|นัดหมาย/.test(text)) return 'appointmentReminder';
  if (/follow-up-due|follow-up due|ติดตามผู้ป่วย/.test(text)) return 'followUpDue';
  return 'others';
};
const assessmentScore = (data = {}) => {
  const answers = Object.values(data.symptoms || {}).filter(Boolean);
  if (!answers.length) return null;
  const points = answers.reduce((sum, value) => {
    if (/^(has|yes|true|มี)$/i.test(String(value))) return sum + 1;
    if (/^(unknown|unsure|ไม่ทราบ)$/i.test(String(value))) return sum + 0.5;
    return sum;
  }, 0);
  return Number(((points / answers.length) * 100).toFixed(2));
};

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

  const operationNo = req.body.operation.operationNo.trim();
  const hn = req.body.patient.hn.trim();
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const updates = columns
    // Routing/ownership is managed by OR Smart. A repeated event from the
    // extension must never move an accepted case back out of its queue.
    .filter((column) => !['operation_no', 'patient_type'].includes(column))
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');
  const sql = `
    INSERT INTO ris_operations (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (operation_no) DO UPDATE SET ${updates}, updated_at = NOW()
    RETURNING id, operation_no, (xmax = 0) AS inserted
  `;

  try {
    const existing = await query('SELECT hn FROM ris_operations WHERE operation_no = $1', [operationNo]);
    if (existing.rows[0] && existing.rows[0].hn !== hn) {
      return res.status(409).json({
        success: false,
        message: `Operation Number ${operationNo} ถูกใช้กับ HN ${existing.rows[0].hn} แล้ว กรุณาระบุ Operation Number ใหม่สำหรับคนไข้รายนี้`
      });
    }
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
    const result = await query(`SELECT o.*,f.id AS follow_up_id,f.follow_up_no,f.template_days,f.auto_calculate,
      f.schedule AS follow_up_schedule,f.selected_procedures AS follow_up_selected_procedures,
      f.status AS follow_up_status,f.assigned_to AS follow_up_assigned_to,f.current_round_index,
      f.completed_at,f.viewed_at AS follow_up_viewed_at,f.created_at AS follow_up_created_at,
      e.id AS evaluation_id,e.result AS evaluation_result,e.score AS evaluation_score,
      e.data AS evaluation_data,e.evaluated_at
      FROM ris_operations o LEFT JOIN LATERAL (
        SELECT * FROM follow_ups x WHERE x.operation_no=o.operation_no ORDER BY x.created_at DESC LIMIT 1
      ) f ON TRUE LEFT JOIN LATERAL (
        SELECT * FROM evaluations x WHERE x.operation_no=o.operation_no ORDER BY x.evaluated_at DESC LIMIT 1
      ) e ON TRUE ORDER BY o.created_at DESC`);
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

app.patch('/api/operations/:operationNo', async (req, res, next) => {
  const fieldMap = {
    hn: 'hn', firstName: 'first_name', lastName: 'last_name', dateOfBirth: 'date_of_birth', age: 'age', sex: 'sex',
    heightCm: 'height_cm', weightKg: 'weight_kg', bmi: 'bmi', phonePrimary: 'phone_primary', phoneSecondary: 'phone_secondary',
    lineId: 'line_id', email: 'email', ethnicity: 'ethnicity', nationality: 'nationality', insurance: 'insurance', address: 'address',
    episodeNo: 'episode_no', episodeDate: 'episode_date', wardName: 'ward_name', bedNo: 'bed_no', patientType: 'patient_type',
    surgeon: 'surgeon', secondSurgeon: 'second_surgeon', operationDepartment: 'operation_department', operationLocation: 'operation_location',
    operatingRoom: 'operating_room', urgency: 'urgency', operationType: 'operation_type', preoperativeDiagnosis: 'preoperative_diagnosis',
    procedureName: 'procedure_name', procedureFreeText: 'procedure_free_text', primaryBodySite: 'primary_body_site', laterality: 'laterality',
    secondaryOperation: 'secondary_operation', startAt: 'start_at', endAt: 'end_at', durationMinutes: 'duration_minutes', outcome: 'outcome',
    reportTemplate: 'report_template', status: 'status', dischargeDate: 'discharge_date', woundClass: 'wound_class', asaClass: 'asa_class', implant: 'implant'
  };
  const entries = Object.entries(req.body || {}).filter(([key]) => fieldMap[key]);
  if (!entries.length) return res.status(400).json({ success: false, message: 'ไม่มีข้อมูลสำหรับแก้ไข' });
  if ('hn' in (req.body || {}) && !String(req.body.hn || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุ HN' });
  if ('episodeNo' in (req.body || {}) && !String(req.body.episodeNo || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุ Episode No.' });
  if ('procedureName' in (req.body || {}) && !String(req.body.procedureName || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุหัตถการ' });
  try {
    const values = entries.map(([, value]) => value === '' ? null : value);
    const setters = entries.map(([key], index) => `${fieldMap[key]}=$${index + 1}`);
    values.push(req.params.operationNo);
    const result = await query(`UPDATE ris_operations SET ${setters.join(',')},updated_at=NOW() WHERE operation_no=$${values.length} RETURNING *`, values);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'ไม่พบเคสที่ต้องการแก้ไข' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'HN นี้ซ้ำกับข้อมูลที่มีอยู่' });
    if (['22P02', '22007', '22008', '22003'].includes(error.code)) return res.status(400).json({ success: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' });
    next(error);
  }
});

app.patch('/api/operations/:operationNo', async (req, res, next) => {
  const editable = {
    hn: 'hn', firstName: 'first_name', lastName: 'last_name', dateOfBirth: 'date_of_birth', age: 'age', sex: 'sex',
    heightCm: 'height_cm', weightKg: 'weight_kg', bmi: 'bmi', episodeNo: 'episode_no', episodeDate: 'episode_date',
    wardName: 'ward_name', bedNo: 'bed_no', patientType: 'patient_type', surgeon: 'surgeon', secondSurgeon: 'second_surgeon',
    department: 'operation_department', location: 'operation_location', operatingRoom: 'operating_room', urgency: 'urgency',
    operationType: 'operation_type', diagnosis: 'preoperative_diagnosis', procedureName: 'procedure_name',
    procedureFreeText: 'procedure_free_text', bodySite: 'primary_body_site', laterality: 'laterality',
    secondaryOperation: 'secondary_operation', startAt: 'start_at', endAt: 'end_at', durationMinutes: 'duration_minutes',
    outcome: 'outcome', reportTemplate: 'report_template', status: 'status', phonePrimary: 'phone_primary',
    phoneSecondary: 'phone_secondary', lineId: 'line_id', email: 'email', ethnicity: 'ethnicity', nationality: 'nationality',
    insurance: 'insurance', address: 'address', dischargeDate: 'discharge_date', woundClass: 'wound_class',
    asaClass: 'asa_class', implant: 'implant'
  };
  const entries = Object.entries(req.body || {}).filter(([key]) => editable[key]);
  if (!entries.length) return res.status(400).json({ success: false, message: 'ไม่มีข้อมูลที่แก้ไข' });
  if ('hn' in (req.body || {}) && !String(req.body.hn || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุ HN' });
  if ('episodeNo' in (req.body || {}) && !String(req.body.episodeNo || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุ Episode No.' });
  if ('procedureName' in (req.body || {}) && !String(req.body.procedureName || '').trim()) return res.status(400).json({ success: false, message: 'กรุณาระบุหัตถการ' });
  const values = entries.map(([, value]) => value === '' ? null : value);
  const setters = entries.map(([key], index) => `${editable[key]}=$${index + 1}`);
  try {
    const result = await query(`UPDATE ris_operations SET ${setters.join(',')},updated_at=NOW() WHERE operation_no=$${values.length + 1} RETURNING *`, [...values, req.params.operationNo]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการผ่าตัด' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'HN หรือข้อมูลอ้างอิงซ้ำกับข้อมูลในระบบ' });
    if (['22P02', '22007', '22008', '22003'].includes(error.code)) return res.status(400).json({ success: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' });
    next(error);
  }
});

app.patch('/api/operations/:operationNo/patient-type', async (req, res, next) => {
  const patientType = String(req.body?.patientType || '').trim().toUpperCase();
  const department = String(req.body?.department || '').trim();
  if (!['OPD', 'IPD'].includes(patientType)) {
    return res.status(400).json({ success: false, message: 'patientType must be OPD or IPD' });
  }

  try {
    const result = await query(
      `UPDATE ris_operations SET patient_type = $1, receiving_department = $2, workflow_status = 'QUEUED',
       assigned_user_id = NULL, assigned_to = NULL, queued_at = NOW(), accepted_at = NULL, updated_at = NOW()
       WHERE operation_no = $3 RETURNING operation_no, patient_type, receiving_department, workflow_status`,
      [patientType, department || null, req.params.operationNo]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Operation not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post('/api/operations/:operationNo/accept', async (req, res, next) => {
  const userId = Number(req.body?.userId);
  if (!Number.isInteger(userId)) return res.status(400).json({ success: false, message: 'กรุณาระบุผู้รับผิดชอบเคส' });
  try {
    const userResult = await query(`SELECT id,name,role,department FROM app_users WHERE id=$1 AND status='ACTIVE'`, [userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
    const result = await query(`UPDATE ris_operations SET assigned_user_id=$1, assigned_to=$2,
      workflow_status=CASE WHEN EXISTS(SELECT 1 FROM follow_ups f WHERE f.operation_no=ris_operations.operation_no AND f.status='ACTIVE') THEN 'FOLLOW_UP_ACTIVE' ELSE 'ASSIGNED' END,
      accepted_at=NOW(), updated_at=NOW()
      WHERE operation_no=$3 AND workflow_status='QUEUED' AND ($4='ADMIN' OR patient_type=$4)
      RETURNING *`, [user.id, user.name, req.params.operationNo, String(user.role).toUpperCase()]);
    if (!result.rows[0]) return res.status(409).json({ success: false, message: 'เคสนี้ถูกรับไปแล้ว หรือไม่ตรงกับคิว OPD/IPD ของผู้ใช้งาน' });
    await query(`UPDATE follow_ups SET assigned_user_id=$1,assigned_to=$2,viewed_at=NULL,updated_at=NOW() WHERE operation_no=$3 AND status='ACTIVE'`,[user.id,user.name,req.params.operationNo]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
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
    const { name, email, role, department, password = 'password', status = 'ACTIVE' } = req.body || {};
    if (![name, email, role].every((v) => String(v || '').trim())) return res.status(400).json({ success: false, message: 'name, email และ role จำเป็นต้องระบุ' });
    const result = await query(`INSERT INTO app_users (name,email,password,role,department,status) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id,name,email,role,department,status,last_login_at,created_at`, [name, String(email).toLowerCase(), password || 'password', role, department || null, status]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { if (error.code === '23505') return res.status(409).json({ success: false, message: 'อีเมลนี้มีในระบบแล้ว' }); next(error); }
});
app.patch('/api/users/:id', async (req, res, next) => {
  try { const result = await query(`UPDATE app_users SET name=COALESCE($1,name), role=COALESCE($2,role), department=COALESCE($3,department), status=COALESCE($4,status), updated_at=NOW() WHERE id=$5 RETURNING id,name,email,role,department,status,last_login_at,created_at`, [req.body.name, req.body.role, req.body.department, req.body.status, req.params.id]); if (!result.rows[0]) return res.status(404).json({success:false,message:'User not found'}); res.json({success:true,data:result.rows[0]}); }
  catch(error){ next(error); }
});
app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM app_users WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
});

app.get('/api/documents', async (_req,res,next)=>{ try{const r=await query('SELECT * FROM documents ORDER BY created_at DESC');res.json({success:true,data:r.rows});}catch(e){next(e);} });
app.post('/api/documents', async (req,res,next)=>{ try{const b=req.body||{};if(!String(b.title||'').trim())return res.status(400).json({success:false,message:'กรุณาระบุชื่อเอกสาร'});const r=await query(`INSERT INTO documents(content_type,title,short_description,content_detail,importance,target_group,publish_date,reference_link,publisher_department,publisher_subdepartment,publisher_name,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[b.contentType||'news',b.title,b.shortDescription||null,b.contentDetail||null,b.importance||'normal',b.targetGroup||'all',b.publishDate||null,b.referenceLink||null,b.publisherDepartment||null,b.publisherSubdepartment||null,b.publisherName||null,b.status||'published']);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);} });

app.get('/api/settings', async (_req,res,next)=>{try{const r=await query('SELECT key,value FROM system_settings');res.json({success:true,data:Object.fromEntries(r.rows.map(x=>[x.key,x.value]))});}catch(e){next(e);}});
app.put('/api/settings', async(req,res,next)=>{
  const client=await pool.connect();
  try{
    const entries=Object.entries(req.body||{});
    await client.query('BEGIN');
    for(const [key,value] of entries){
      await client.query(
        `INSERT INTO system_settings(key,value) VALUES($1,$2::jsonb)
         ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,
        [key,JSON.stringify(value)]
      );
    }
    await client.query('COMMIT');
    res.json({success:true,data:req.body});
  }catch(e){
    await client.query('ROLLBACK');
    next(e);
  }finally{
    client.release();
  }
});

app.get('/api/operations/:operationNo/follow-ups', async(req,res,next)=>{try{const r=await query('SELECT * FROM follow_ups WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.get('/api/follow-ups', async(req,res,next)=>{try{const assignedUserId=Number(req.query.assignedUserId)||null;const params=[];let where=`o.workflow_status IN ('ASSIGNED','FOLLOW_UP_ACTIVE','SUSPECTED_SSI','CONFIRMED_SSI','RECOVERED','FOLLOW_UP_COMPLETED')`;if(assignedUserId){params.push(assignedUserId);where+=` AND o.assigned_user_id=$${params.length}`;}const r=await query(`SELECT o.*, f.id AS follow_up_id, f.follow_up_no, f.template_days, f.auto_calculate, f.schedule AS follow_up_schedule, f.selected_procedures AS follow_up_selected_procedures, f.status AS follow_up_status, f.assigned_to AS follow_up_assigned_to, f.current_round_index, f.completed_at, f.viewed_at AS follow_up_viewed_at, f.created_at AS follow_up_created_at, f.updated_at AS follow_up_updated_at FROM ris_operations o LEFT JOIN LATERAL (SELECT * FROM follow_ups x WHERE x.operation_no=o.operation_no ORDER BY x.created_at DESC LIMIT 1) f ON TRUE WHERE ${where} ORDER BY COALESCE(f.created_at,o.accepted_at) DESC`,params);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.patch('/api/follow-ups/:id/viewed', async(req,res,next)=>{try{const userId=Number(req.body?.userId);const r=await query(`UPDATE follow_ups SET viewed_at=NOW(),updated_at=NOW() WHERE id=$1 AND ($2::int IS NULL OR assigned_user_id=$2) RETURNING id,viewed_at`,[req.params.id,userId||null]);if(!r.rows[0])return res.status(404).json({success:false,message:'ไม่พบงานติดตามของผู้ใช้งาน'});res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/follow-ups', async(req,res,next)=>{try{const existing=await query(`SELECT id FROM follow_ups WHERE operation_no=$1 AND status='ACTIVE'`,[req.params.operationNo]);if(existing.rows[0])return res.status(409).json({success:false,message:'เคสนี้มี Follow-up ที่กำลังดำเนินการอยู่แล้ว'});const no=`SUR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;const schedule=Array.isArray(req.body.schedule)?req.body.schedule:[];const selectedProcedures=Array.isArray(req.body.selectedProcedures)?req.body.selectedProcedures:[];const owner=await query('SELECT assigned_user_id,assigned_to FROM ris_operations WHERE operation_no=$1',[req.params.operationNo]);const r=await query(`INSERT INTO follow_ups(follow_up_no,operation_no,template_days,auto_calculate,schedule,selected_procedures,assigned_to,assigned_user_id) VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8) RETURNING *`,[no,req.params.operationNo,Number(req.body.templateDays)||30,req.body.autoCalculate!==false,JSON.stringify(schedule),JSON.stringify(selectedProcedures),owner.rows[0]?.assigned_to||req.body.assignedTo||null,owner.rows[0]?.assigned_user_id||null]);await query(`UPDATE ris_operations SET workflow_status='FOLLOW_UP_ACTIVE',updated_at=NOW() WHERE operation_no=$1`,[req.params.operationNo]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.patch('/api/follow-ups/:id', async(req,res,next)=>{try{const schedule=Array.isArray(req.body.schedule)?req.body.schedule:null;if(!schedule?.length)return res.status(400).json({success:false,message:'ต้องมีรอบติดตามอย่างน้อย 1 รอบ'});if(schedule.some(x=>!x.day||!x.date||!x.time||!x.method))return res.status(400).json({success:false,message:'กรุณากรอกข้อมูลรอบติดตามที่จำเป็นให้ครบ'});const r=await query(`UPDATE follow_ups SET template_days=$1,auto_calculate=$2,schedule=$3::jsonb,updated_at=NOW() WHERE id=$4 RETURNING *`,[Number(req.body.templateDays)||30,req.body.autoCalculate!==false,JSON.stringify(schedule),req.params.id]);if(!r.rows[0])return res.status(404).json({success:false,message:'ไม่พบ Follow-up'});res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/transfers', async(req,res,next)=>{try{const r=await query('SELECT * FROM case_transfers WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/transfers', async(req,res,next)=>{try{const b=req.body||{};const toType=String(b.toType||'').toUpperCase();if(!['OPD','IPD'].includes(toType)||!b.targetDepartment||!b.reason||!b.startDate)return res.status(400).json({success:false,message:'กรุณากรอกข้อมูลย้ายเคสที่จำเป็นให้ครบ'});const op=(await query('SELECT patient_type FROM ris_operations WHERE operation_no=$1',[req.params.operationNo])).rows[0];if(!op)return res.status(404).json({success:false,message:'ไม่พบเคส'});const fromType=String(op.patient_type||'').toUpperCase();if(fromType===toType)return res.status(409).json({success:false,message:'ปลายทางต้องเป็นคนละประเภทกับแผนกปัจจุบัน'});const r=await query(`INSERT INTO case_transfers(operation_no,from_type,to_type,target_department,reason,start_date,notes,transferred_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[req.params.operationNo,fromType,toType,b.targetDepartment,b.reason,b.startDate,b.notes||null,b.transferredBy||null]);await query(`UPDATE ris_operations SET patient_type=$1,receiving_department=$2,workflow_status='QUEUED',assigned_user_id=NULL,assigned_to=NULL,queued_at=NOW(),accepted_at=NULL,updated_at=NOW() WHERE operation_no=$3`,[toType,b.targetDepartment,req.params.operationNo]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/documents', async(req,res,next)=>{try{const r=await query('SELECT id,operation_no,file_name,mime_type,file_size,document_type,follow_up_round,uploaded_by,department,created_at FROM case_documents WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/documents', async(req,res,next)=>{try{const b=req.body||{};if(!b.fileName||!b.mimeType||!b.fileData||!Number(b.fileSize))return res.status(400).json({success:false,message:'กรุณาเลือกไฟล์เอกสาร'});if(Number(b.fileSize)>5*1024*1024)return res.status(413).json({success:false,message:'ไฟล์ต้องมีขนาดไม่เกิน 5 MB'});const r=await query(`INSERT INTO case_documents(operation_no,file_name,mime_type,file_size,file_data,document_type,follow_up_round,uploaded_by,department) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,operation_no,file_name,mime_type,file_size,document_type,follow_up_round,uploaded_by,department,created_at`,[req.params.operationNo,b.fileName,b.mimeType,b.fileSize,b.fileData,b.documentType||null,b.followUpRound||null,b.uploadedBy||null,b.department||null]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/case-documents/:id/download', async(req,res,next)=>{try{const r=await query('SELECT file_name,mime_type,file_data FROM case_documents WHERE id=$1',[req.params.id]);if(!r.rows[0])return res.status(404).json({success:false,message:'ไม่พบเอกสาร'});res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/activities', async(req,res,next)=>{try{const r=await query('SELECT * FROM case_activities WHERE operation_no=$1 ORDER BY created_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/activities', async(req,res,next)=>{try{const b=req.body||{};if(!b.activityType||!b.activityAt||!b.purpose||!b.staff||!b.contactPrimary||!b.detail)return res.status(400).json({success:false,message:'กรุณากรอกข้อมูลกิจกรรมที่จำเป็นให้ครบ'});const r=await query(`INSERT INTO case_activities(operation_no,activity_type,activity_at,purpose,location,staff,contact_primary,contact_secondary,detail,notify_period) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[req.params.operationNo,b.activityType,b.activityAt,b.purpose,b.location||null,b.staff,b.contactPrimary,b.contactSecondary||null,b.detail,b.notifyPeriod||null]);res.status(201).json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/operations/:operationNo/evaluations', async(req,res,next)=>{try{const r=await query('SELECT * FROM evaluations WHERE operation_no=$1 ORDER BY evaluated_at DESC',[req.params.operationNo]);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.patch('/api/evaluations/:id', async(req,res,next)=>{try{const b=req.body||{};if(!b.result)return res.status(400).json({success:false,message:'กรุณาระบุผลการประเมิน'});const r=await query(`UPDATE evaluations SET result=$1,data=$2::jsonb,evaluated_by=COALESCE($3,evaluated_by),evaluated_at=NOW() WHERE id=$4 RETURNING *`,[b.result,JSON.stringify(b.data||{}),b.evaluatedBy||null,req.params.id]);if(!r.rows[0])return res.status(404).json({success:false,message:'ไม่พบผลการประเมิน'});await query(`UPDATE follow_ups SET schedule=(SELECT jsonb_agg(CASE WHEN COALESCE(x->>'id',x->>'day')=$1 THEN x||jsonb_build_object('result',$2,'completedAt',NOW()) ELSE x END ORDER BY ord) FROM follow_ups f2,jsonb_array_elements(f2.schedule) WITH ORDINALITY a(x,ord) WHERE f2.id=follow_ups.id),updated_at=NOW() WHERE id=$3`,[r.rows[0].round_key,b.result,r.rows[0].follow_up_id]);const ssi=/suspect/i.test(b.result)?'SUSPECTED_SSI':/confirmed|positive/i.test(b.result)?'CONFIRMED_SSI':'NOT_SSI';const workflow=ssi==='SUSPECTED_SSI'?'SUSPECTED_SSI':ssi==='CONFIRMED_SSI'?'CONFIRMED_SSI':'FOLLOW_UP_ACTIVE';await query('UPDATE ris_operations SET ssi_status=$1,workflow_status=$2,updated_at=NOW() WHERE operation_no=$3',[ssi,workflow,r.rows[0].operation_no]);res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});
app.get('/api/evaluations', async(req,res,next)=>{try{const userId=Number(req.query.assignedUserId)||null;const params=[];let where='TRUE';if(userId){params.push(userId);where=`o.assigned_user_id=$1`;}const r=await query(`SELECT o.*,e.id AS evaluation_id,e.round_key AS evaluation_round,e.result AS evaluation_result,e.evaluated_by,e.evaluated_at,e.data AS evaluation_data FROM evaluations e JOIN ris_operations o ON o.operation_no=e.operation_no WHERE ${where} ORDER BY e.evaluated_at DESC`,params);res.json({success:true,data:r.rows});}catch(e){next(e);}});
app.post('/api/operations/:operationNo/evaluations', async(req,res,next)=>{try{const b=req.body||{};if(!b.result)return res.status(400).json({success:false,message:'กรุณาระบุผลการประเมิน'});const followUp=await query(`SELECT * FROM follow_ups WHERE operation_no=$1 AND status='ACTIVE' ORDER BY created_at DESC LIMIT 1`,[req.params.operationNo]);const active=followUp.rows[0];if(!active)return res.status(409).json({success:false,message:'ยังไม่มี Follow-up ที่กำลังดำเนินการ'});const schedule=Array.isArray(active.schedule)?active.schedule:[];const roundIndex=Number.isInteger(Number(b.roundIndex))?Number(b.roundIndex):active.current_round_index;if(roundIndex!==active.current_round_index)return res.status(409).json({success:false,message:'รอบนี้ถูกประเมินแล้ว กรุณาประเมินรอบปัจจุบัน'});const round=schedule[roundIndex];if(!round)return res.status(409).json({success:false,message:'ไม่พบรอบติดตามที่ต้องประเมิน'});const roundKey=round.id||round.day||String(roundIndex);const duplicate=await query('SELECT id FROM evaluations WHERE follow_up_id=$1 AND round_key=$2',[active.id,roundKey]);if(duplicate.rows[0])return res.status(409).json({success:false,message:'รอบนี้มีผลประเมินแล้ว ไม่สามารถประเมินซ้ำได้'});const todayBangkok=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const scheduledDate=String(round.date||round.scheduledAt||'').slice(0,10);if(roundIndex>0&&scheduledDate&&todayBangkok<scheduledDate)return res.status(409).json({success:false,message:`ยังไม่ถึงวันประเมิน ${round.day||`รอบที่ ${roundIndex+1}`} (กำหนด ${scheduledDate})`});const r=await query(`INSERT INTO evaluations(operation_no,evaluation_type,result,score,data,evaluated_by,evaluated_at,follow_up_id,round_key) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7,NOW()),$8,$9) RETURNING *`,[req.params.operationNo,b.evaluationType||'SSI',b.result,b.score||null,b.data||{},b.evaluatedBy||null,b.evaluatedAt||null,active.id,roundKey]);schedule[roundIndex]={...round,status:'COMPLETED',completedAt:new Date().toISOString(),evaluationId:r.rows[0].id,result:b.result};const nextIndex=roundIndex+1;const finished=nextIndex>=schedule.length;await query(`UPDATE follow_ups SET schedule=$1::jsonb,current_round_index=$2,status=$3,completed_at=$4,updated_at=NOW() WHERE id=$5`,[JSON.stringify(schedule),nextIndex,finished?'COMPLETED':'ACTIVE',finished?new Date():null,active.id]);const ssiStatus=/confirmed|positive/i.test(b.result)?'CONFIRMED_SSI':/suspect/i.test(b.result)?'SUSPECTED_SSI':'NOT_SSI';const workflow=/confirmed|positive/i.test(b.result)?'CONFIRMED_SSI':/suspect/i.test(b.result)?'SUSPECTED_SSI':finished?'FOLLOW_UP_COMPLETED':'FOLLOW_UP_ACTIVE';await query(`UPDATE ris_operations SET ssi_status=$1,workflow_status=$2,updated_at=NOW() WHERE operation_no=$3`,[ssiStatus,workflow,req.params.operationNo]);res.status(201).json({success:true,data:{evaluation:r.rows[0],nextRound:schedule[nextIndex]||null,followUpCompleted:finished}});}catch(e){if(e.code==='23505')return res.status(409).json({success:false,message:'รอบนี้มีผลประเมินแล้ว ไม่สามารถประเมินซ้ำได้'});next(e);}});

app.patch('/api/evaluations/:id/doctor-decision', async(req,res,next)=>{try{const decision=String(req.body?.decision||'').toUpperCase();if(!['NOT_SSI','CONFIRMED_SSI'].includes(decision))return res.status(400).json({success:false,message:'decision ต้องเป็น NOT_SSI หรือ CONFIRMED_SSI'});const r=await query(`UPDATE evaluations SET doctor_decision=$1,doctor_note=$2,doctor_reviewed_by=$3,doctor_reviewed_at=NOW() WHERE id=$4 RETURNING *`,[decision,req.body.note||null,req.body.reviewedBy||null,req.params.id]);if(!r.rows[0])return res.status(404).json({success:false,message:'ไม่พบผลประเมิน'});await query(`UPDATE ris_operations SET ssi_status=$1,workflow_status=$2,updated_at=NOW() WHERE operation_no=$3`,[decision,decision==='CONFIRMED_SSI'?'CONFIRMED_SSI':'FOLLOW_UP_ACTIVE',r.rows[0].operation_no]);res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});

app.patch('/api/operations/:operationNo/doctor-decision', async(req,res,next)=>{try{const decision=String(req.body?.decision||'').toUpperCase();if(!['NOT_SSI','CONFIRMED_SSI'].includes(decision))return res.status(400).json({success:false,message:'ผลวินิจฉัยไม่ถูกต้อง'});const evaluation=await query(`UPDATE evaluations SET doctor_decision=$1,doctor_note=$2,doctor_reviewed_by=$3,doctor_reviewed_at=NOW() WHERE id=(SELECT id FROM evaluations WHERE operation_no=$4 AND result ILIKE '%suspect%' ORDER BY evaluated_at DESC LIMIT 1) RETURNING *`,[decision,req.body.note||null,req.body.reviewedBy||null,req.params.operationNo]);if(!evaluation.rows[0])return res.status(409).json({success:false,message:'ไม่พบผลประเมินสงสัย SSI ของเคสนี้'});const operation=await query(`UPDATE ris_operations SET ssi_status=$1,workflow_status=$2,updated_at=NOW() WHERE operation_no=$3 RETURNING *`,[decision,decision==='CONFIRMED_SSI'?'CONFIRMED_SSI':'FOLLOW_UP_ACTIVE',req.params.operationNo]);res.json({success:true,data:operation.rows[0]});}catch(e){next(e);}});

app.patch('/api/operations/:operationNo/recovery', async(req,res,next)=>{try{const r=await query(`UPDATE ris_operations SET ssi_status='RECOVERED',workflow_status='RECOVERED',updated_at=NOW() WHERE operation_no=$1 AND ssi_status='CONFIRMED_SSI' RETURNING *`,[req.params.operationNo]);if(!r.rows[0])return res.status(409).json({success:false,message:'เคสนี้ยังไม่ได้รับการยืนยัน SSI'});res.json({success:true,data:r.rows[0]});}catch(e){next(e);}});

app.get('/api/notifications', async(req,res,next)=>{try{
  const userId=Number(req.query.userId)||null;
  const user=userId?(await query('SELECT id,role,department FROM app_users WHERE id=$1',[userId])).rows[0]:null;
  if(!user)return res.json({success:true,data:[]});
  const settingsRows=(await query(`SELECT key,value FROM system_settings WHERE key IN ('notificationPreferencesConfigured','alertTypes','intervals','staffRoles','staffChannels','staffRecipientEnabled')`)).rows;
  const notificationSettings=Object.fromEntries(settingsRows.map(row=>[row.key,row.value]));
  const alertTypes=notificationSettings.alertTypes||{};
  const roleSettingKey={ADMIN:'admin',OR:'orStaff','OR STAFF':'orStaff',OPD:'opdNurse','OPD NURSE':'opdNurse',IPD:'ipdNurse','IPD NURSE':'ipdNurse',DOCTOR:'physician',PHYSICIAN:'physician'}[String(user.role||'').toUpperCase()];
  const webAlertsEnabled=notificationSettings.notificationPreferencesConfigured===true&&notificationSettings.staffRecipientEnabled===true&&notificationSettings.staffChannels?.dashboard===true&&Boolean(roleSettingKey&&notificationSettings.staffRoles?.[roleSettingKey]);
  const intervalRules=(Array.isArray(notificationSettings.intervals)?notificationSettings.intervals:[]).filter(row=>row?.enabled===true);
  const operations=(await query(`SELECT o.operation_no,o.hn,o.first_name,o.last_name,o.workflow_status,o.ssi_status,
      o.receiving_department,o.patient_type,o.queued_at,o.accepted_at,o.updated_at,
      f.id AS follow_up_id,f.schedule,f.current_round_index,f.status AS follow_up_status,
      e.data AS latest_evaluation_data
    FROM ris_operations o
    LEFT JOIN LATERAL (SELECT * FROM follow_ups x WHERE x.operation_no=o.operation_no ORDER BY x.created_at DESC LIMIT 1) f ON TRUE
    LEFT JOIN LATERAL (SELECT data FROM evaluations x WHERE x.operation_no=o.operation_no ORDER BY x.evaluated_at DESC LIMIT 1) e ON TRUE
    ORDER BY COALESCE(o.updated_at,o.queued_at) DESC`)).rows;
  const notifications=[];
  const now=new Date();
  for(const op of operations){
    if(op.workflow_status==='QUEUED') notifications.push({...op,notification_key:`QUEUE:${op.operation_no}:${op.queued_at||op.updated_at}`,notification_type:'NEW_QUEUE',detail:`มีเคสใหม่จากห้องผ่าตัดส่งเข้า ${op.patient_type||''} ${op.receiving_department||''}`.trim(),priority:'NORMAL',event_at:op.queued_at||op.updated_at,due_date:null});
    const schedule=Array.isArray(op.schedule)?op.schedule:[];
    schedule.forEach((round,index)=>{
      if(!round?.date||index!==Number(op.current_round_index||0))return;
      const completed=Boolean(round.completedAt||round.completed_at||round.result);
      if(completed)return;
      const roundName=round.day||`รอบที่ ${index+1}`;
      const roundTime=String(round.time||'09:00').slice(0,5);
      const dueAt=new Date(`${round.date}T${roundTime}:00+07:00`);
      intervalRules.forEach(rule=>{
        const ruleKey=notificationRuleKey(rule);
        if(alertTypes[ruleKey]===false)return;
        const values=['val1','val2','val3','val4'].map(key=>rule[key]).filter(Boolean);
        values.forEach(value=>{
          const offset=alertOffsetMs(value);if(offset==null)return;
          const afterDue=ruleKey==='overdue'||ruleKey==='noAssessmentResponse';
          const triggerAt=new Date(dueAt.getTime()+(afterDue?offset:-offset));
          const expiresAt=afterDue?new Date(triggerAt.getTime()+24*60*60*1000):dueAt;
          if(now<triggerAt||now>expiresAt)return;
          const notificationType=ruleKey==='overdue'?'FOLLOW_UP_OVERDUE':ruleKey==='appointmentReminder'?'APPOINTMENT_REMINDER':ruleKey==='noAssessmentResponse'?'NO_ASSESSMENT_RESPONSE':'FOLLOW_UP_ADVANCE';
          const detail=ruleKey==='overdue'?`เลยกำหนดประเมินอาการ ${roundName} ${value}`:`${rule.desc||'แจ้งเตือนก่อนถึงกำหนด'} ${roundName} (${value})`;
          notifications.push({...op,notification_key:`RULE:${rule.id||ruleKey}:${op.follow_up_id}:${round.id||round.day||index}:${value}`,notification_type:notificationType,detail,priority:ruleKey==='overdue'?'HIGH':'NORMAL',event_at:triggerAt.toISOString(),due_date:round.date,round_name:roundName});
        });
      });
    });
    if(op.ssi_status==='RECOVERED') notifications.push({...op,notification_key:`SSI:${op.operation_no}:RECOVERED`,notification_type:'SSI_RECOVERED',detail:'เจ้าหน้าที่บันทึกว่าเคสนี้หายจากการติดเชื้อ SSI แล้ว',priority:'NORMAL',event_at:op.updated_at,due_date:null});
  }
  const operationMap=new Map(operations.map(op=>[op.operation_no,op]));
  const operationNos=[...operationMap.keys()];
  if(operationNos.length){
    const activities=(await query(`SELECT * FROM case_activities WHERE operation_no=ANY($1::text[])
      AND activity_at::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 1 ORDER BY activity_at`,[operationNos])).rows;
    activities.forEach(activity=>{const op=operationMap.get(activity.operation_no);if(!op)return;notifications.push({...op,notification_key:`ACTIVITY:${activity.id}`,notification_type:'ADDITIONAL_ACTIVITY',detail:`มีกิจกรรมเพิ่มเติม: ${activity.detail||activity.purpose||activity.activity_type}`,priority:'NORMAL',event_at:activity.activity_at,due_date:String(activity.activity_at||'').slice(0,10)});});
    const evaluations=(await query(`SELECT id,operation_no,result,round_key,data,evaluated_at,doctor_decision,doctor_note,doctor_reviewed_at FROM evaluations WHERE operation_no=ANY($1::text[]) ORDER BY evaluated_at DESC`,[operationNos])).rows;
    evaluations.forEach(evaluation=>{
      const op=operationMap.get(evaluation.operation_no);if(!op)return;
      const result=String(evaluation.result||'').toUpperCase();
      const round=evaluation.round_key||'รอบที่ประเมิน';
      let notificationType='FOLLOW_UP_RECORDED';
      let detail=`เจ้าหน้าที่บันทึกผลการติดตาม ${round} เรียบร้อยแล้ว`;
      let priority='NORMAL';
      if(result.includes('CONFIRMED')){
        notificationType='SSI_CONFIRMED';detail=`ผลการประเมิน ${round} ระบุว่าเข้าข่ายการติดเชื้อ SSI`;priority='HIGH';
      }else if(result.includes('SUSPECT')){
        priority='HIGH';
        if(evaluation.data?.submittedToDoctor===true){notificationType='SSI_SENT_TO_DOCTOR';detail=`เจ้าหน้าที่ส่งผลประเมิน ${round} ที่พบความเสี่ยง SSI ให้แพทย์ตรวจสอบแล้ว`;}
        else{notificationType='SSI_RISK_FOUND';detail=`ผลการประเมิน ${round} พบความเสี่ยง SSI และรอเจ้าหน้าที่ดำเนินการ`;}
      }else if(result){detail=`เจ้าหน้าที่บันทึกผลการติดตาม ${round} เรียบร้อยแล้ว โดยผลประเมินไม่เข้าข่าย SSI`;}
      notifications.push({...op,notification_key:`EVALUATION:${evaluation.id}`,notification_type:notificationType,detail,priority,event_at:evaluation.evaluated_at,due_date:null});
      if(evaluation.doctor_decision){
        const confirmed=evaluation.doctor_decision==='CONFIRMED_SSI';
        notifications.push({...op,notification_key:`DOCTOR_DECISION:${evaluation.id}:${evaluation.doctor_decision}`,notification_type:confirmed?'SSI_CONFIRMED':'SSI_NOT_CONFIRMED',detail:confirmed?`เจ้าหน้าที่บันทึกผลตามคำวินิจฉัยของแพทย์ว่าเคส ${round} ยืนยันการติดเชื้อ SSI`:`เจ้าหน้าที่บันทึกผลตามคำวินิจฉัยของแพทย์ว่าเคส ${round} ไม่พบการติดเชื้อ SSI${evaluation.doctor_note?`: ${evaluation.doctor_note}`:''}`,priority:confirmed?'HIGH':'NORMAL',event_at:evaluation.doctor_reviewed_at||evaluation.evaluated_at,due_date:null});
      }
    });
    const transfers=(await query(`SELECT id,operation_no,from_type,to_type,target_department,created_at FROM case_transfers WHERE operation_no=ANY($1::text[]) ORDER BY created_at DESC`,[operationNos])).rows;
    transfers.forEach(transfer=>{const op=operationMap.get(transfer.operation_no);if(!op)return;notifications.push({...op,notification_key:`TRANSFER:${transfer.id}`,notification_type:'CASE_TRANSFERRED',detail:`ย้ายเคสจาก ${transfer.from_type||'-'} ไป ${transfer.to_type||'-'} ${transfer.target_department||''}`.trim(),priority:'NORMAL',event_at:transfer.created_at,due_date:null});});
    const documents=(await query(`SELECT id,operation_no,file_name,created_at FROM case_documents WHERE operation_no=ANY($1::text[]) ORDER BY created_at DESC`,[operationNos])).rows;
    documents.forEach(document=>{const op=operationMap.get(document.operation_no);if(!op)return;notifications.push({...op,notification_key:`DOCUMENT:${document.id}`,notification_type:'DOCUMENT_UPLOADED',detail:`อัปโหลดเอกสาร: ${document.file_name}`,priority:'NORMAL',event_at:document.created_at,due_date:null});});
  }
  const reads=(await query('SELECT notification_key,read_at FROM notification_reads WHERE user_id=$1',[user.id])).rows;
  const readMap=new Map(reads.map(row=>[row.notification_key,row.read_at]));
  notifications.forEach(item=>{item.read_at=readMap.get(item.notification_key)||null;item.is_read=Boolean(item.read_at)});
  notifications.sort((a,b)=>new Date(b.event_at||0)-new Date(a.event_at||0));
  res.json({success:true,data:notifications});
}catch(e){next(e);}});

app.post('/api/notifications/read', async(req,res,next)=>{try{
  const userId=Number(req.body?.userId)||null;
  const notificationKey=String(req.body?.notificationKey||'').trim();
  if(!userId||!notificationKey)return res.status(400).json({success:false,message:'ข้อมูลการแจ้งเตือนไม่ครบ'});
  const r=await query(`INSERT INTO notification_reads(user_id,notification_key) VALUES($1,$2)
    ON CONFLICT(user_id,notification_key) DO UPDATE SET read_at=NOW() RETURNING notification_key,read_at`,[userId,notificationKey]);
  res.json({success:true,data:r.rows[0]});
}catch(e){next(e);}});

app.get('/api/search-records', async(_req,res,next)=>{try{
  const [operations,followUps,documents,transfers,evaluations]=await Promise.all([
    query('SELECT * FROM ris_operations ORDER BY updated_at DESC'),
    query('SELECT * FROM follow_ups ORDER BY updated_at DESC'),
    query('SELECT * FROM case_documents ORDER BY created_at DESC'),
    query('SELECT * FROM case_transfers ORDER BY created_at DESC'),
    query('SELECT * FROM evaluations ORDER BY evaluated_at DESC')
  ]);
  const opMap=new Map(operations.rows.map(op=>[op.operation_no,op]));
  const base=(op)=>({operation_no:op?.operation_no||null,hn:op?.hn||null,patient_name:[op?.first_name,op?.last_name].filter(Boolean).join(' ')||'-',patient_type:op?.patient_type||null,department:op?.receiving_department||op?.operation_department||null});
  const records=[];
  operations.rows.forEach(op=>{
    records.push({...base(op),id:`PATIENT:${op.operation_no}`,type:'ผู้ป่วย',title:'ข้อมูลผู้ป่วย',detail:`${op.sex||'-'} อายุ ${op.age??'-'} ปี`,status:op.workflow_status,updated_at:op.updated_at});
    if(op.procedure_name||op.procedure_free_text)records.push({...base(op),id:`PROCEDURE:${op.operation_no}`,type:'หัตถการ',title:op.procedure_name||op.procedure_free_text,detail:op.preoperative_diagnosis||'รายละเอียดหัตถการ',status:op.ssi_status,updated_at:op.updated_at});
    if(op.surgeon)records.push({...base(op),id:`DOCTOR:${op.operation_no}`,type:'แพทย์',title:op.surgeon,detail:'ศัลยแพทย์ผู้ทำหัตถการ',status:'PHYSICIAN',updated_at:op.updated_at});
    if(op.receiving_department||op.operation_department)records.push({...base(op),id:`DEPARTMENT:${op.operation_no}`,type:'แผนก',title:op.receiving_department||op.operation_department,detail:op.patient_type||'แผนกที่ดูแล',status:op.workflow_status,updated_at:op.updated_at});
  });
  followUps.rows.forEach(row=>{const op=opMap.get(row.operation_no);records.push({...base(op),id:`FOLLOWUP:${row.id}`,type:'การติดตาม',title:row.follow_up_no,detail:`รอบปัจจุบัน ${(row.current_round_index||0)+1}/${Array.isArray(row.schedule)?row.schedule.length:0}`,status:row.status,updated_at:row.updated_at});});
  documents.rows.forEach(row=>{const op=opMap.get(row.operation_no);records.push({...base(op),id:`DOCUMENT:${row.id}`,type:'เอกสาร',title:row.file_name,detail:row.document_type||row.mime_type,status:'เอกสารล่าสุด',updated_at:row.created_at});});
  transfers.rows.forEach(row=>{const op=opMap.get(row.operation_no);records.push({...base(op),id:`TRANSFER:${row.id}`,type:'การส่งต่อ',title:`ส่งต่อ ${row.from_type} → ${row.to_type}`,detail:`${row.target_department}: ${row.reason}`,status:'สำเร็จ',updated_at:row.created_at});});
  evaluations.rows.forEach(row=>{const op=opMap.get(row.operation_no);records.push({...base(op),id:`SSI:${row.id}`,type:'SSI',title:`ผลประเมิน ${row.round_key||''}`.trim(),detail:row.result||'ยังไม่ระบุผล',status:row.result||'รอประเมิน',updated_at:row.evaluated_at});});
  records.sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0));
  res.json({success:true,data:records});
}catch(e){next(e);}});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Server or database error' });
});

module.exports = app;
