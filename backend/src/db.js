const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
  port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT || 5432),
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'ris',
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER || 'postgres',
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD || 'postgres123'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
