const stamp = value => value?.toISOString ? value.toISOString() : value;

function buildOutcomeMetadata({ operations, followUps, evaluations, activities, reviews, transfers, documents, edits, notifications }) {
  const keys = new Set(notifications.map(n => `${n.operation_no}:${n.notification_key}`));
  return operations.map(op => {
    const byCase = rows => rows.filter(row => row.operation_no === op.operation_no);
    const expected = [];
    const expect = key => expected.push(key);
    if (op.queued_at) expect(`QUEUE:${op.operation_no}:${op.queued_at}`);
    if (op.accepted_at) expect(`ACCEPT:${op.operation_no}:${stamp(op.accepted_at)}`);
    if (op.ssi_status === 'RECOVERED') expect(`SSI:${op.operation_no}:RECOVERED`);
    byCase(followUps).forEach(f => expect(`FOLLOWUP:${f.id}`));
    byCase(evaluations).forEach(e => {
      expect(`EVALUATION:${e.id}`);
      if (e.doctor_decision) expect(`DOCTOR_DECISION:${e.id}:${e.doctor_decision}`);
    });
    byCase(activities).forEach(a => expect(`ACTIVITY:${a.id}`));
    byCase(transfers).forEach(t => expect(`TRANSFER:${t.id}`));
    byCase(documents).forEach(d => expect(`DOCUMENT:${d.id}`));
    byCase(edits).forEach(e => expect(`DATA_EDIT:${e.id}`));
    const review = byCase(reviews)[0];
    if (review) expect(`REVIEW:${op.operation_no}:${stamp(review.updated_at)}`);
    // Include active automatic reminder events emitted by the same notification engine.
    notifications.filter(n => n.operation_no === op.operation_no && /^(RULE|ACTIVITY_REMINDER):/.test(n.notification_key)).forEach(n => expect(n.notification_key));
    return {
      operationNo: op.operation_no, evaluations: byCase(evaluations), activities: byCase(activities),
      ssiReview: review || null, handoverDataEdited: op.handover_data_edited, queuedAt: op.queued_at,
      notificationExpected: expected.length, notificationGenerated: expected.filter(key => keys.has(`${op.operation_no}:${key}`)).length,
    };
  });
}
module.exports = { buildOutcomeMetadata };
