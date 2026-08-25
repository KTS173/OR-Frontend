require('dotenv').config();
const app = require('./app');
const { pool, ensureSchema } = require('./db');

const port = Number(process.env.PORT || 4000);
let server;
ensureSchema()
  .then(() => { server = app.listen(port, () => console.log(`Mock RIS backend listening on port ${port}`)); })
  .catch((error) => { console.error('Database initialization failed', error); process.exit(1); });

const shutdown = async () => {
  if (!server) return pool.end().then(() => process.exit(0));
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
