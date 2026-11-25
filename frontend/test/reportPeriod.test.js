import test from 'node:test'
import assert from 'node:assert/strict'
import { filterReportPeriod } from '../src/utils/reportPeriod.js'
const rows = [{id:1,startAt:'2026-10-31T18:00:00Z'}, {id:2,startAt:'2026-11-25'}, {id:3,createdAt:'2026-01-01'}, {id:4,startAt:'2025-11-01'}, {id:5}]
test('day, month and year select actual cases using Bangkok time and creation fallback',()=>{
 assert.deepEqual(filterReportPeriod(rows,'day','2026-11-01').map(r=>r.id),[1])
 assert.deepEqual(filterReportPeriod(rows,'month','2026-11').map(r=>r.id),[1,2])
 assert.deepEqual(filterReportPeriod(rows,'year','2026').map(r=>r.id),[1,2,3])
 assert.deepEqual(filterReportPeriod(rows,'month','2024-11'),[])
})
