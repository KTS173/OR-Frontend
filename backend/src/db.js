const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
  port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT || 5432),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'ris',
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER || 'postgres',
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD || 'postgres123'
});

const ensureSchema = async () => {
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS or_ssi_risk_factors JSONB");
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS case_priority VARCHAR(10) NOT NULL DEFAULT 'LOW' CHECK (case_priority IN ('HIGH', 'MEDIUM', 'LOW'))");
  await pool.query(`CREATE TABLE IF NOT EXISTS ssi_case_reviews (
    operation_no VARCHAR(100) PRIMARY KEY REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL DEFAULT 'password', role VARCHAR(50) NOT NULL,
      department VARCHAR(255), status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY, content_type VARCHAR(30) NOT NULL, title TEXT NOT NULL,
      short_description TEXT, content_detail TEXT, importance VARCHAR(30) NOT NULL DEFAULT 'normal',
      target_group VARCHAR(50) NOT NULL DEFAULT 'all', publish_date DATE, reference_link TEXT,
      publisher_department VARCHAR(255), publisher_subdepartment VARCHAR(255), publisher_name VARCHAR(255),
      status VARCHAR(30) NOT NULL DEFAULT 'published', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS system_settings (
      key VARCHAR(100) PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS follow_ups (
      id SERIAL PRIMARY KEY, follow_up_no VARCHAR(50) UNIQUE NOT NULL, operation_no VARCHAR(100) NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      template_days INTEGER NOT NULL, auto_calculate BOOLEAN NOT NULL DEFAULT TRUE, schedule JSONB NOT NULL DEFAULT '[]',
      selected_procedures JSONB NOT NULL DEFAULT '[]',
      status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', assigned_to VARCHAR(255), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS case_activities (
      id SERIAL PRIMARY KEY, operation_no VARCHAR(100) NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      activity_type VARCHAR(100) NOT NULL, activity_at TIMESTAMPTZ, purpose TEXT, location TEXT, staff VARCHAR(255),
      contact_primary VARCHAR(100), contact_secondary VARCHAR(100), detail TEXT, notify_period VARCHAR(100), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evaluations (
      id SERIAL PRIMARY KEY, operation_no VARCHAR(100) NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      evaluation_type VARCHAR(50) NOT NULL DEFAULT 'SSI', result VARCHAR(50), score NUMERIC(8,2), data JSONB NOT NULL DEFAULT '{}',
      evaluated_by VARCHAR(255), evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      follow_up_id INTEGER REFERENCES follow_ups(id) ON DELETE SET NULL, round_key VARCHAR(100),
      doctor_decision VARCHAR(50), doctor_note TEXT, doctor_reviewed_by VARCHAR(255), doctor_reviewed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS case_transfers (
      id SERIAL PRIMARY KEY, operation_no VARCHAR(100) NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      from_type VARCHAR(10) NOT NULL, to_type VARCHAR(10) NOT NULL, target_department VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL, start_date DATE NOT NULL, notes TEXT, transferred_by VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS case_documents (
      id SERIAL PRIMARY KEY, operation_no VARCHAR(100) NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      file_name TEXT NOT NULL, mime_type VARCHAR(150) NOT NULL, file_size INTEGER NOT NULL,
      file_data TEXT NOT NULL, document_type VARCHAR(100), follow_up_round VARCHAR(100),
      uploaded_by VARCHAR(255), department VARCHAR(255), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notification_reads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      notification_key TEXT NOT NULL,
      read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, notification_key)
    );
  `);
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS receiving_department VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS or_handover_note TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS third_surgeon VARCHAR(255)');
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(40) NOT NULL DEFAULT 'OR_PENDING'");
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS ssi_status VARCHAR(40) NOT NULL DEFAULT 'UNASSESSED'");
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ');
  await pool.query(`ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS handover_data_edited BOOLEAN;
    ALTER TABLE ssi_case_reviews ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
    ALTER TABLE ssi_case_reviews ADD COLUMN IF NOT EXISTS concluded_at TIMESTAMPTZ;
    CREATE TABLE IF NOT EXISTS case_data_edits (
      id BIGSERIAL PRIMARY KEY, operation_no TEXT NOT NULL REFERENCES ris_operations(operation_no) ON DELETE CASCADE,
      edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), changed_fields JSONB NOT NULL
    );
    CREATE OR REPLACE FUNCTION track_handover_data_edit() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE changes JSONB;
    BEGIN
      IF OLD.queued_at IS NOT NULL AND NEW.queued_at IS NOT DISTINCT FROM OLD.queued_at THEN
        SELECT jsonb_object_agg(k, jsonb_build_object('before',to_jsonb(OLD)->k,'after',to_jsonb(NEW)->k)) INTO changes
        FROM jsonb_object_keys(to_jsonb(NEW)) k
        WHERE k = ANY(ARRAY['hn','first_name','last_name','date_of_birth','age','sex','height_cm','weight_kg','bmi',
          'episode_no','episode_date','ward_name','bed_no','surgeon','second_surgeon','third_surgeon','operation_department',
          'operation_location','operating_room','urgency','operation_type','preoperative_diagnosis','procedure_name',
          'procedure_free_text','primary_body_site','laterality','secondary_operation','start_at','end_at','duration_minutes',
          'anesthesiologist','anesthesia_type','scrub_nurse','circulating_nurse','anesthesia_nurse','special_equipment',
          'phone_primary','phone_secondary','line_id','email','ethnicity','nationality','insurance','address',
          'implant_present','implant','comorbidities','smoking_status','wound_class','asa_class'])
          AND (to_jsonb(NEW)->k) IS DISTINCT FROM (to_jsonb(OLD)->k);
        IF changes IS NOT NULL THEN
          NEW.handover_data_edited = TRUE;
          INSERT INTO case_data_edits(operation_no,changed_fields) VALUES(OLD.operation_no,changes);
        END IF;
      END IF;
      RETURN NEW;
    END $$;
    DROP TRIGGER IF EXISTS track_handover_data_edit ON ris_operations;
    CREATE TRIGGER track_handover_data_edit BEFORE UPDATE ON ris_operations FOR EACH ROW EXECUTE FUNCTION track_handover_data_edit();`);

  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS phone_primary VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS line_id VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS insurance VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS address TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS discharge_date DATE');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS wound_class VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS asa_class VARCHAR(50)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS implant VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS implant_present BOOLEAN');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS anesthesiologist VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS anesthesia_type VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS special_equipment TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS scrub_nurse VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS circulating_nurse VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS anesthesia_nurse VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS comorbidities TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(30)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS wound_at_discharge VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS wound_discharge_notes TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS patient_photo TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS phone_primary VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS line_id VARCHAR(150)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS insurance VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS address TEXT');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS discharge_date DATE');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS wound_class VARCHAR(100)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS asa_class VARCHAR(50)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS implant VARCHAR(255)');
  await pool.query("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS selected_procedures JSONB NOT NULL DEFAULT '[]'");
  await pool.query('ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL');
  await pool.query('ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS current_round_index INTEGER NOT NULL DEFAULT 0');
  await pool.query('ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS follow_up_id INTEGER REFERENCES follow_ups(id) ON DELETE SET NULL');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS round_key VARCHAR(100)');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS doctor_decision VARCHAR(50)');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS doctor_note TEXT');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS doctor_reviewed_by VARCHAR(255)');
  await pool.query('ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS doctor_reviewed_at TIMESTAMPTZ');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS evaluations_follow_up_round_unique ON evaluations(follow_up_id, round_key) WHERE follow_up_id IS NOT NULL AND round_key IS NOT NULL');
  await pool.query(`INSERT INTO app_users (name, email, password, role, department)
    VALUES ('System Admin', 'admin@example.com', 'admin123', 'ADMIN', 'เทคโนโลยีสารสนเทศ')
    ON CONFLICT (email) DO NOTHING`);
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  ensureSchema
};
