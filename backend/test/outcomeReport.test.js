const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOutcomeMetadata } = require('../src/outcomeReport');
test('notification coverage compares independent activity keys, not reads or raw notification totals',()=>{
 const input={operations:[{operation_no:'A'}],followUps:[],evaluations:[{id:1,operation_no:'A',doctor_decision:'NOT_SSI'}],activities:[{id:4,operation_no:'A'}],reviews:[],transfers:[],documents:[],edits:[],notifications:[{operation_no:'A',notification_key:'EVALUATION:1'},{operation_no:'A',notification_key:'ACTIVITY:4'},{operation_no:'B',notification_key:'DOCTOR_DECISION:1:NOT_SSI'}]};
 const result=buildOutcomeMetadata(input)[0];
 assert.equal(result.notificationExpected,3);
 // Keys also belong to the operation, so another case cannot satisfy coverage.
 assert.equal(result.notificationGenerated,2);
});
test('untracked historical handover remains unknown rather than assumed complete',()=>{
 const row=buildOutcomeMetadata({operations:[{operation_no:'A',queued_at:'2026-11-01',handover_data_edited:null}],followUps:[],evaluations:[],activities:[],reviews:[],transfers:[],documents:[],edits:[],notifications:[]})[0];
 assert.equal(row.handoverDataEdited,null);assert.equal(row.notificationExpected,1);assert.equal(row.notificationGenerated,0);
});
