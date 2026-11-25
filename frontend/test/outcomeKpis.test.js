import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOutcomeKpis } from '../src/utils/outcomeKpis.js'
const now = new Date('2026-11-18T08:00:00Z')
const base = {operationNo:'A',workflowStatus:'FOLLOW_UP_ACTIVE',procedure:'Appendectomy'}
const round = (date, completedAt) => ({date,...(completedAt?{completedAt,status:'COMPLETED'}:{status:'PENDING'})})
test('eight targets and no denominator remain unavailable',()=>{
 const rows=buildOutcomeKpis([],now)
 assert.deepEqual(rows.map(r=>r.target),['100%','100%','≤ 5%','Benchmark ตาม Procedure','100%','≥ 95%','100%','≥ 95%'])
 assert.ok(rows.every(r=>r.value===null))
})
test('count due rounds without discharge or waiting for the final 90-day round',()=>{
 const rows=buildOutcomeKpis([{...base,followUpSchedule:[round('2026-11-16','2026-11-16T09:00:00+07:00'),round('2026-11-17'),round('2027-02-01')]}],now)
 assert.equal(rows[0].value,50);assert.equal(rows[2].value,50);assert.equal(rows[5].value,100)
})
test('future rounds do not count; late completed rounds are not on-time or missed',()=>{
 const rows=buildOutcomeKpis([{...base,followUpSchedule:[round('2026-11-16','2026-11-17T09:00:00+07:00'),round('2026-11-30')]}],now)
 assert.equal(rows[0].value,0);assert.equal(rows[2].value,0);assert.equal(rows[5].value,0)
})
test('IC confirms 3 of 5 suspected out of 100 procedure cases: 3%, not 5%',()=>{
 const cases=Array.from({length:100},(_,i)=>({...base,operationNo:String(i),evaluations:i<5?[{result:'suspect_ssi',evaluated_at:'2026-11-10T09:00:00+07:00',data:{assessmentKind:'SCHEDULED',followUpMethod:'โทรศัพท์'}}]:[],ssiReview:i<3?{confirmed_at:'2026-11-12T09:00:00+07:00',concluded_at:'2026-11-12T09:00:00+07:00',data:{decision:'CONFIRMED_SSI',issues:'Cause',reviewer:'IC'}}:null,activities:[{activity_at:'2026-11-11T09:00:00+07:00',created_at:'2026-11-10T10:00:00+07:00',purpose:'นัดตรวจ SSI'}]}))
 // Appointment alone is insufficient without scheduled phone surveillance evidence.
 const result=buildOutcomeKpis(cases,now)
 assert.equal(result[3].value,3)
 assert.equal(result[3].denominator,100)
 assert.equal(result[4].value,60)
})
test('review within seven days starts at suspicion; drafts do not count',()=>{
 const suspected={result:'suspect_ssi',evaluated_at:'2026-11-01T00:00:00Z'}
 const reviewed={concluded_at:'2026-11-08T00:00:00Z',data:{decision:'NOT_SSI',issues:'No infection',reviewer:'IC'}}
 const rows=buildOutcomeKpis([{...base,evaluations:[suspected],ssiReview:reviewed},{...base,evaluations:[suspected],ssiReview:{data:{issues:'Draft'}}}],now)
 assert.equal(rows[4].value,50)
})
test('handover edits and notification coverage use evidence, not required extension fields',()=>{
 const rows=buildOutcomeKpis([{...base,sourceSystem:'RIS_EXTENSION',queuedAt:'2026-11-01',handoverDataEdited:false,notificationExpected:5,notificationGenerated:4},{...base,queuedAt:'2026-11-01',handoverDataEdited:true},{...base,queuedAt:'2026-11-01',handoverDataEdited:null}],now)
 assert.equal(rows[1].numerator,1);assert.equal(rows[6].value,50);assert.equal(rows[6].denominator,2);assert.equal(rows[7].value,80)
})

test('hospital presentation, failed phone contact and unconfirmed suspicion do not count as proactive SSI',()=>{
 const confirmed={data:{decision:'CONFIRMED_SSI'},confirmed_at:'2026-11-12'}
 const evaluation={result:'suspect_ssi',evaluated_at:'2026-11-10T09:00:00+07:00',data:{assessmentKind:'SCHEDULED',followUpMethod:'โรงพยาบาล'}}
 const appointment={activity_type:'นัดหมาย',created_at:'2026-11-10T10:00:00+07:00',activity_at:'2026-11-11T09:00:00+07:00',purpose:'ตรวจ SSI'}
 const rows=buildOutcomeKpis([{...base,ssiReview:confirmed,evaluations:[evaluation],activities:[appointment]},{...base,ssiReview:confirmed,evaluations:[{...evaluation,data:{assessmentKind:'SCHEDULED',followUpMethod:'โทรศัพท์',contactStatus:'failed'}}],activities:[appointment]}],now)
 assert.equal(rows[3].value,0)
})
