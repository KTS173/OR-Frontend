import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeSsiCriteria,ssiSuspicionCriteria,meetsSsiSuspicionCriteria} from '../src/utils/ssiSuspicionCriteria.js'
test('any one of the five explicit criteria triggers suspicion, irrespective of percentage score',()=>{
 for(const item of ssiSuspicionCriteria) assert.equal(meetsSsiSuspicionCriteria({[item.id]:'yes'}),true)
 assert.equal(meetsSsiSuspicionCriteria({pus:'unknown',pain:'no'}),false)
 assert.equal(meetsSsiSuspicionCriteria({fever:'yes',smell:'yes'}),false)
})
test('use exactly five canonical criteria and remove extra configured observations',()=>{
 const rows=normalizeSsiCriteria([{id:'swell',name:'แผลบวม'},{id:'red',name:'แผลแดง'},{id:'pus',name:'น้ำเหลือง/หนอง'},{id:'fever',name:'ไข้'}])
 assert.equal(rows.length,5);assert.equal(rows.filter(r=>r.id==='pus').length,1)
 assert.ok(!rows.some(r=>r.id==='fever'))
 assert.deepEqual(normalizeSsiCriteria(rows),rows)
})
