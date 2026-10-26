const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup() {
  const routes = {}, saved = new Map();
  const app = new Proxy({}, { get: (_, verb) => ['get', 'put'].includes(verb) ? (url, fn) => { routes[`${verb}:${url}`] = fn; } : () => {} });
  const express = () => app; express.json = () => () => {};
  const query = async (sql, args) => {
    if (sql.startsWith('SELECT operation_no FROM ris_operations')) return { rows: args[0] === 'missing' ? [] : [{ operation_no: args[0] }] };
    if (sql.startsWith('INSERT INTO ssi_case_reviews')) { const row = { operation_no: args[0], data: JSON.parse(args[1]), updated_at: new Date().toISOString() }; saved.set(args[0], row); return { rows: [row] }; }
    if (sql.startsWith('SELECT * FROM ssi_case_reviews')) return { rows: saved.has(args[0]) ? [saved.get(args[0])] : [] };
    throw new Error(`Unexpected query ${sql}`);
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8'), { module: { exports: {} }, console, process, require(name) { if (name === 'express') return express; if (name === 'cors') return () => () => {}; if (name === './db') return { query, pool: {} }; return require(name.startsWith('./') ? path.join(__dirname, '../src', name) : name); } });
  return async (method, operationNo, data) => {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await routes[`${method}:/api/operations/:operationNo/ssi-review`]({ params: { operationNo }, body: { data } }, res, error => { throw error; });
    return res;
  };
}
const form = () => ({ classification: 'DEEP', header: { hn: 'HN1' }, risks: { 0: { answer: 'YES', detail: 'Age 65' } }, bundle: { 1: { answer: 'COMPLY' } }, findings: ['พบ Risk factor'], issues: 'Review', correctiveAction: 'Plan', reviewer: 'Nurse' });
test('save, reload and update a review without mixing operations', async () => {
  const call = setup();
  assert.equal((await call('get', 'A')).body.data, null);
  assert.equal((await call('put', 'A', form())).code, 200);
  assert.equal((await call('get', 'A')).body.data.data.classification, 'DEEP');
  assert.equal((await call('get', 'B')).body.data, null);
  await call('put', 'A', { ...form(), classification: 'ORGAN_SPACE', issues: 'Updated' });
  const data = (await call('get', 'A')).body.data.data;
  assert.equal(data.classification, 'ORGAN_SPACE'); assert.equal(data.issues, 'Updated');
  assert.equal(data.bundle[1].answer, 'COMPLY');
});
test('reject invalid classification / malformed data and unknown cases', async () => {
  const call = setup();
  assert.equal((await call('put', 'A', { ...form(), classification: 'INVALID' })).code, 400);
  assert.equal((await call('put', 'A', {})).code, 400);
  assert.equal((await call('put', 'missing', form())).code, 404);
  assert.equal((await call('get', 'missing')).code, 404);
});
