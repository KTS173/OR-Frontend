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
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(40) NOT NULL DEFAULT 'OR_PENDING'");
  await pool.query("ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS ssi_status VARCHAR(40) NOT NULL DEFAULT 'UNASSESSED'");
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE ris_operations ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ');
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
