const { createHash } = require('node:crypto');

// Stable internal key: the visible slot (1–3) belongs to one HN/EN pair.
const normalizeOperationIdentity = (body) => {
  if (!body || typeof body !== 'object') return {};
  const hn = typeof body.patient?.hn === 'string' ? body.patient.hn.trim() : '';
  const en = typeof body.visit?.episodeNo === 'string' ? body.visit.episodeNo.trim() : '';
  const slot = String(body.operation?.operationNo ?? '1').trim();
  const operationNo = /^[123]$/.test(slot) && hn && en
    ? `RIS-${createHash('sha256').update(JSON.stringify([hn, en])).digest('hex')}-${slot}`
    : body.operation?.operationNo;
  return { ...body, patient: { ...body.patient, hn }, visit: { ...body.visit, episodeNo: en }, operation: { ...body.operation, operationNo } };
};

module.exports = { normalizeOperationIdentity };
