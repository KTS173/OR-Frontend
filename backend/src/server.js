require('dotenv').config();
const app = require('./app');
const { pool } = require('./db');

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => console.log(`Mock RIS backend listening on port ${port}`));

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
