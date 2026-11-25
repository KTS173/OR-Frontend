const DAY = 86400000
const dateValue = value => { const ms = value ? new Date(value).getTime() : NaN; return Number.isFinite(ms) ? ms : null }
const day = value => dateValue(value) == null ? '' : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
const completedAt = round => round.completedAt || round.completed_at
const completed = round => Boolean(completedAt(round) || round.status === 'COMPLETED') && round.result !== 'contact_failed'
const rate = (n, d) => d ? n / d * 100 : null
const isSuspect = e => /suspect/i.test(e.result || '') && e.data?.contactStatus !== 'failed'

export function buildOutcomeKpis(patients, now = new Date()) {
  const today = day(now)
  const eligible = patients.filter(p => !['CANCELLED','EXCLUDED','REJECTED'].includes(p.workflowStatus))
  // Count each due round immediately; future rounds do not delay reporting.
  const rounds = eligible.flatMap(p => (p.followUpSchedule || []).filter(r => r.date && (r.date.slice(0,10) < today || completed(r))))
  const onTime = rounds.filter(r => completed(r) && day(completedAt(r)) && day(completedAt(r)) <= r.date.slice(0,10))
  const missed = rounds.filter(r => !completed(r))
  const extension = patients.filter(p => ['RIS_EXTENSION','MOCK_RIS_EXTENSION'].includes(String(p.sourceSystem || '').toUpperCase()))
  const confirmedByIc = p => p.ssiReview?.data?.decision === 'CONFIRMED_SSI' && Boolean(p.ssiReview.confirmed_at)
  const proactive = p => (p.evaluations || []).some(e => {
    const data=e.data || {}
    const scheduled=data.assessmentKind === 'SCHEDULED' || (e.follow_up_id && !/^(ACTIVITY|CONTACT):/.test(e.round_key || ''))
    if(!scheduled || !/suspect/i.test(e.result || '') || data.contactStatus === 'failed' || !/โทร|phone|telephone/i.test(data.followUpMethod || '')) return false
    const assessed=dateValue(e.evaluated_at)
    return assessed != null && (p.activities || []).some(a => /SSI/i.test(`${a.purpose || ''} ${a.detail || ''}`) && /นัด|ตรวจ|appointment|visit/i.test(`${a.activity_type || ''} ${a.purpose || ''}`) && dateValue(a.created_at) >= assessed && dateValue(a.activity_at) > assessed)
  })
  const detected = eligible.filter(p => confirmedByIc(p) && proactive(p))
  const suspicion = p => (p.evaluations || []).filter(isSuspect).sort((a,b) => dateValue(a.evaluated_at)-dateValue(b.evaluated_at))[0]
  const reviewCases = eligible.filter(p => suspicion(p))
  const reviewed = reviewCases.filter(p => {
    const review = p.ssiReview
    const start = dateValue(suspicion(p).evaluated_at)
    const end = dateValue(review?.concluded_at)
    return ['CONFIRMED_SSI','NOT_SSI'].includes(review?.data?.decision) && Boolean(review.data.issues?.trim()) && Boolean(review.data.reviewer?.trim()) && end != null && end >= start && end-start <= 7*DAY
  })
  const firstRounds = eligible.map(p => p.followUpSchedule?.[0]).filter(r => r?.date && (r.date.slice(0,10) < today || completed(r)))
  const firstOnTime = firstRounds.filter(r => { const at=dateValue(completedAt(r)), start=dateValue(`${r.date.slice(0,10)}T00:00:00+07:00`); return completed(r) && at != null && at >= start && at-start <= DAY })
  const handedOver = eligible.filter(p => p.queuedAt && typeof p.handoverDataEdited === 'boolean')
  const complete = handedOver.filter(p => !p.handoverDataEdited)
  const expected = patients.reduce((n,p) => n+(p.notificationExpected || 0),0)
  const generated = patients.reduce((n,p) => n+(p.notificationGenerated || 0),0)
  const row = (id,name,title,target,baseline,n,d,limit=100,lower=false) => {
    const value=rate(n,d)
    return {id,name,title,target,baseline,value,numerator:n,denominator:d,status:value==null?'ยังคำนวณไม่ได้':limit==null?'เทียบตามหัตถการ':(lower?value<=limit:value>=limit)?'ผ่านเป้าหมาย':'ไม่ผ่านเป้าหมาย'}
  }
  return [
    row(1,'Post-Discharge Follow-up Completion Rate','ติดตามครบตาม Timeline','100%','100%',onTime.length,rounds.length),
    row(2,'Data Integration & Smart Surveillance Rate','เข้าระบบอัตโนมัติ','100%','ไม่ได้กำหนด',extension.length,patients.length),
    row(3,'Missed Follow-up Rate','หลุดจากการติดตาม','≤ 5%','ไม่ได้กำหนด',missed.length,rounds.length,5,true),
    {...row(4,'SSI Detection Rate','ตรวจพบ SSI เชิงรุก','Benchmark ตาม Procedure','ไม่ได้กำหนด',detected.length,eligible.length,null),procedures:[...new Set(eligible.map(p=>p.procedure))].map(procedure=>({procedure,total:eligible.filter(p=>p.procedure===procedure).length,confirmed:detected.filter(p=>p.procedure===procedure).length}))},
    row(5,'SSI Case Review within 7 Days','ทบทวนเคสภายใน 7 วัน','100%','50%',reviewed.length,reviewCases.length),
    row(6,'Clinical Assessment within 24 Hrs Post-Discharge','ประเมินรอบแรกภายใน 24 ชม.','≥ 95%','ไม่ได้กำหนด',firstOnTime.length,firstRounds.length,95),
    row(7,'Surveillance Data Completeness Rate','ความสมบูรณ์ของข้อมูล','100%','ไม่ได้กำหนด',complete.length,handedOver.length),
    row(8,'Smart Alert Success Rate','ระบบแจ้งเตือนอัตโนมัติสำเร็จ','≥ 95%','ไม่ได้กำหนด',generated,expected,95),
  ]
}
