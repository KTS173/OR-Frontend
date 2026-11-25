const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('new case notifications include the saved priority and Thai label for every level', async () => {
  const routes = {};
  const app = new Proxy({}, { get: (_, verb) => verb === 'get' ? (url, handler) => { routes[url] = handler; } : () => {} });
  const express = () => app;
  express.json = () => () => {};
  const query = async sql => {
    if (sql.startsWith('SELECT id,role,department FROM app_users')) return { rows: [{ id: 1, role: 'ADMIN' }] };
    if (sql.includes('FROM ris_operations o')) return { rows: ['HIGH', 'MEDIUM', 'LOW'].map((priority, i) => ({ operation_no: `TEST-${i}`, workflow_status: 'QUEUED', case_priority: priority, patient_type: i === 1 ? 'IPD' : 'OPD', receiving_department: 'Test department', queued_at: '2026-11-03T00:00:00Z' })) };
    return { rows: [] };
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8'), {
    module: { exports: {} }, console, process,
    require(name) {
      if (name === 'express') return express;
      if (name === 'cors') return () => () => {};
      if (name === './db') return { query, pool: {} };
      return require(name.startsWith('./') ? path.join(__dirname, '../src', name) : name);
    },
  });
  let result;
  await routes['/api/notifications']({ query: { userId: '1' } }, { json(body) { result = body; } }, error => { throw error; });
  assert.equal(result.data.length, 3);
  for (const [priority, label] of [['HIGH', 'สูง'], ['MEDIUM', 'กลาง'], ['LOW', 'ต่ำ']]) {
    const notification = result.data.find(item => item.priority === priority);
    assert.equal(notification.notification_type, 'NEW_QUEUE');
    assert.ok(notification.detail.includes(`ระดับความสำคัญ: ${label}`));
    assert.ok(notification.detail.includes('Test department'));
    assert.equal(notification.is_read, false);
  }
});

test('extension imports generate stable notifications before OR sends the case onward', async () => {
  const routes = {};
  const app = new Proxy({}, { get: (_, verb) => verb === 'get' ? (url, handler) => { routes[url] = handler; } : () => {} });
  const express = () => app;
  express.json = () => () => {};
  const query = async sql => {
    if (sql.startsWith('SELECT id,role,department FROM app_users')) return { rows: [{ id: 1, role: 'ADMIN' }] };
    if (sql.includes('FROM ris_operations o')) return { rows: [{ operation_no: 'EXT-1', source_system: 'RIS_EXTENSION', workflow_status: 'OR_PENDING', created_at: '2026-11-25T00:00:00Z' }, { operation_no: 'MANUAL', source_system: 'MANUAL', created_at: '2026-11-25T00:00:00Z' }] };
    return { rows: [] };
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8'), {
    module: { exports: {} }, console, process,
    require(name) {
      if (name === 'express') return express;
      if (name === 'cors') return () => () => {};
      if (name === './db') return { query, pool: {} };
      return require(name.startsWith('./') ? path.join(__dirname, '../src', name) : name);
    },
  });
  let result;
  await routes['/api/notifications']({ query: { userId: '1' } }, { json(body) { result = body; } }, error => { throw error; });
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].notification_key, 'EXTENSION:EXT-1');
  assert.equal(result.data[0].notification_type, 'NEW_OR_CASE');
  assert.equal(result.data[0].event_at, '2026-11-25T00:00:00Z');
  assert.equal(result.data[0].is_read, false);
});
