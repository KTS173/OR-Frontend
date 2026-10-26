const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeOperationIdentity: normalize } = require('../src/operationIdentity');
const payload = (hn = 'HN1', en = 'EN1', slot = '1') => ({ patient: { hn }, visit: { episodeNo: en }, operation: { operationNo: slot, procedureName: 'Procedure' } });
test('same HN/EN and slot updates the same identity, independently of request ID', () => {
  const first = normalize(payload());
  assert.equal(first.operation.operationNo, normalize({ ...payload(), requestId: 'retry' }).operation.operationNo);
  assert.equal(first.operation.procedureName, 'Procedure');
  assert.ok(first.operation.operationNo.length <= 100);
});
test('different patients, encounters and slots cannot share an identity', () => {
  const records = [payload(), payload('HN2'), payload('HN1', 'EN2'), payload('HN1', 'EN1', '2'), payload('HN1', 'EN1', '3')];
  assert.equal(new Set(records.map(body => normalize(body).operation.operationNo)).size, records.length);
});
test('missing operation number defaults to slot 1, whitespace is normalized and legacy keys remain valid', () => {
  assert.equal(normalize(payload(' HN1 ', ' EN1 ', undefined)).operation.operationNo, normalize(payload()).operation.operationNo);
  const body = payload();
  delete body.operation.operationNo;
  assert.equal(normalize(body).operation.operationNo, normalize(payload()).operation.operationNo);
  assert.equal(normalize(payload('HN1', 'EN1', 'OLD-OP')).operation.operationNo, 'OLD-OP');
  assert.deepEqual(normalize(null), {});
});
