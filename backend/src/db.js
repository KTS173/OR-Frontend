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
      evaluated_by VARCHAR(255), evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`INSERT INTO app_users (name, email, password, role, department)
    VALUES ('System Admin', 'admin@example.com', 'admin123', 'ADMIN', 'เทคโนโลยีสารสนเทศ')
    ON CONFLICT (email) DO NOTHING`);
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  ensureSchema
};
