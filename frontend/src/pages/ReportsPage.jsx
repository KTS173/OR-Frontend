import { exportReportWorkbook } from '../utils/exportReportWorkbook.js'
import { printReport } from '../utils/printReport.js'
import { hasConfirmedSsiHistory, getSsiReportCategory } from '../utils/ssiAnalytics.js'
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Download, FileText, Printer, Search, Send, Stethoscope, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useApiQuery } from '../hooks/useApiQuery.js'
import { api } from '../services/api.js'
import { AnalyticsChartPair, AnalyticsDonutPair } from '../components/AnalyticsOverview.jsx'

const tones=[['#1e3a8a','#eff6ff'],['#4338ca','#eef2ff'],['#ea580c','#fff7ed'],['#2563eb','#eff6ff'],['#10b981','#ecfdf5'],['#ef4444','#fef2f2'],['#6d28d9','#f5f3ff'],['#1e3a8a','#eff6ff'],['#ea580c','#fff7ed'],['#dc2626','#fef2f2']]
export default function ReportsPage(){
  const reportRef=useRef(null)
  const [printing,setPrinting]=useState(false)
  const [exporting,setExporting]=useState(false)
  const [printError,setPrintError]=useState('')
  const exportPdf=async()=>{
    if(printing)return
    setPrinting(true);setPrintError('')
    try { await printReport(reportRef.current) }
    catch { setPrintError('เตรียมรายงานไม่สำเร็จ กรุณาลองอีกครั้ง') }
    finally { setPrinting(false) }
  }

  const {data:patients}=useApiQuery(api.getPatients),[dateFrom,setDateFrom]=useState(''),[dateTo,setDateTo]=useState(''),[department,setDepartment]=useState('all'),[procedure,setProcedure]=useState('all'),[ssi,setSsi]=useState('all'),[patientType,setPatientType]=useState('all')
  const departments=[...new Set(patients.map(p=>p.department).filter(Boolean))],procedures=[...new Set(patients.map(p=>p.procedure).filter(Boolean))]
  const data=useMemo(()=>patients.filter(p=>{const date=String(p.startAt||p.createdAt||'').slice(0,10);return(!dateFrom||date>=dateFrom)&&(!dateTo||date<=dateTo)&&(department==='all'||p.department===department)&&(procedure==='all'||p.procedure===procedure)&&(ssi==='all'||getSsiReportCategory(p)===ssi)&&(patientType==='all'||p.patientType===patientType)}),[patients,dateFrom,dateTo,department,procedure,ssi,patientType])
  const suspected=data.filter(p=>getSsiReportCategory(p)==='SUSPECTED_SSI').length,confirmed=data.filter(p=>hasConfirmedSsiHistory(p)).length,overdue=data.filter(p=>(p.followUpSchedule||[]).some(r=>r.status!=='COMPLETED'&&r.date<new Date().toISOString().slice(0,10))).length
  const metrics=[['เคสผ่าตัดทั้งหมด',data.length,'คน',Users],['เคสผ่าตัดวันนี้',data.filter(p=>p.startAt?.slice(0,10)===new Date().toISOString().slice(0,10)).length,'คน',CalendarDays],['รอตรวจสอบจาก OR',data.filter(p=>p.workflowStatus==='OR_PENDING').length,'คน',ClipboardList],['ส่งเข้า OPD/IPD แล้ว',data.filter(p=>p.patientType).length,'คน',Send],['ครบกำหนดติดตามวันนี้',data.filter(p=>(p.followUpSchedule||[]).some(r=>r.date===new Date().toISOString().slice(0,10))).length,'คน',CheckCircle2],['ติดตามเกินกำหนด',overdue,'คน',AlertTriangle],['รอแพทย์ประเมิน',suspected,'คน',Stethoscope],['ความพึงพอใจผู้ป่วย','-','คะแนน',Users],['สงสัย SSI',suspected,'',AlertTriangle],['ยืนยัน SSI',confirmed,'',CheckCircle2]]
  const procedureData=useMemo(()=>{const map=new Map();data.forEach(p=>{const key=p.procedure||'ไม่ระบุ';const v=map.get(key)||{name:key,total:0,confirmed:0};v.total++;if(hasConfirmedSsiHistory(p))v.confirmed++;map.set(key,v)});return[...map.values()].map(x=>({...x,rate:x.total?Number((x.confirmed/x.total*100).toFixed(2)):0})).sort((a,b)=>b.rate-a.rate)},[data])
  const deptData=useMemo(()=>{const map=new Map();data.forEach(p=>{const key=p.department||'ไม่ระบุ';const v=map.get(key)||{name:key,total:0,confirmed:0};v.total++;if(hasConfirmedSsiHistory(p))v.confirmed++;map.set(key,v)});return[...map.values()].map(x=>({...x,rate:x.total?Number((x.confirmed/x.total*100).toFixed(2)):0}))},[data])
  const heatMonths=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return{year:d.getFullYear(),index:d.getMonth(),label:d.toLocaleDateString('th-TH',{month:'short',year:'2-digit'})}})
  const exportExcel=async()=>{
    if(exporting)return
    setExporting(true);setPrintError('')
    try {
      const charts=JSON.parse(reportRef.current.querySelector('[data-export-charts]').dataset.exportCharts)
      const donuts=JSON.parse(reportRef.current.querySelector('[data-export-donuts]').dataset.exportDonuts)
      const percent=(count,total)=>total?Number((count/total*100).toFixed(2)):0
      const sheets=[
        {name:'ตัวกรองรายงาน',headers:['รายการ','ค่าที่เลือก'],rows:[['วันที่เริ่มต้น',dateFrom||'ทั้งหมด'],['วันที่สิ้นสุด',dateTo||'ทั้งหมด'],['แผนก',department==='all'?'ทั้งหมด':department],['หัตถการ',procedure==='all'?'ทั้งหมด':procedure],['ประเภท SSI',ssi],['ประเภทผู้ป่วย',patientType],['ช่วงกราฟ',charts.period],['ปีกราฟ',charts.year],['เกณฑ์ SSI','รวมเคสที่เคยยืนยันติดเชื้อ แม้ปัจจุบันหายแล้ว']]},
        {name:'ยอดสรุป',headers:['รายการ','จำนวน','หน่วย'],rows:metrics.map(([label,value,unit])=>[label,value,unit])},
        {name:'เคสทั้งหมดและ SSI',headers:['ช่วงเวลา','เคสทั้งหมด','เคสติดเชื้อ SSI'],rows:charts.caseTrend.map(r=>[r.label,r.total,r.infected])},
        {name:'เคสแยกการผ่าตัด',headers:['หัตถการ','จำนวนเคส','ยืนยัน SSI','สัดส่วนเคสทั้งหมด (%)'],rows:charts.procedures.map(r=>[r.name,r.total,r.confirmed,r.rate])},
        {name:'SSI แผนกรายเดือน',headers:['แผนก',...heatMonths.map(m=>`${m.label} (%)`)],rows:deptData.map(row=>[row.name,...heatMonths.map(m=>{const cases=data.filter(p=>{const d=new Date(p.startAt||p.createdAt);return(p.department||'ไม่ระบุ')===row.name&&d.getFullYear()===m.year&&d.getMonth()===m.index});return percent(cases.filter(hasConfirmedSsiHistory).length,cases.length)})])},
        {name:'5 หัตถการ SSI สูงสุด',headers:['อันดับ','หัตถการ','จำนวนเคส','ยืนยัน SSI','อัตรายืนยัน SSI (%)'],rows:procedureData.slice(0,5).map((r,i)=>[i+1,r.name,r.total,r.confirmed,r.rate])},
        {name:'สรุปการติดตามประจำวัน',headers:['สถานะ','จำนวนเคส','สัดส่วน (%)'],rows:donuts.followRows.map(r=>[r.name,r.value,percent(r.value,donuts.total)])},
        {name:'อัตราเคสแต่ละประเภท',headers:['ประเภท','จำนวนเคส','สัดส่วน (%)'],rows:donuts.typeRows.map(r=>[r.name,r.value,percent(r.value,donuts.total)])},
        {name:'รายการเคส',headers:['Operation Number','HN','ชื่อผู้ป่วย','หัตถการ','แผนก','ประเภทผู้ป่วย','วันที่ผ่าตัด','วันที่จำหน่าย','สถานะ SSI ปัจจุบัน','เคยยืนยัน SSI'],rows:data.map(p=>[p.operationNo,p.id,p.name,p.procedure,p.department,p.patientType,p.startAt,p.dischargeDate,p.ssiStatus,hasConfirmedSsiHistory(p)?'ใช่':'ไม่ใช่'])},
      ]
      await exportReportWorkbook({sheets})
    } catch {setPrintError('ส่งออก Excel ไม่สำเร็จ กรุณาลองอีกครั้ง')}
    finally {setExporting(false)}
  }

  return <div ref={reportRef} className="space-y-5 bg-slate-50/60 pb-8">{printError && <p role="alert" data-report-controls className="text-red-600">{printError}</p>}<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="flex items-center gap-2 text-[18px] font-semibold"><Search size={22} className="text-[#002d73]"/>ค้นหาข้อมูล</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><label className="text-[12px] sm:col-span-2 xl:col-span-1">เลือกช่วงวันที่<div className="mt-1 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2"><input type="date" className="form-input min-w-0" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/><input type="date" className="form-input min-w-0" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></div></label><label className="text-[12px]">แผนก<select className="form-select mt-1" value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">แผนกทั้งหมด</option>{departments.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-[12px]">หัตถการ<select className="form-select mt-1" value={procedure} onChange={e=>setProcedure(e.target.value)}><option value="all">หัตถการทั้งหมด</option>{procedures.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-[12px]">ประเภท SSI<select className="form-select mt-1" value={ssi} onChange={e=>setSsi(e.target.value)}><option value="all">SSI ทั้งหมด</option><option value="UNASSESSED">ยังไม่ประเมิน</option><option value="NOT_SSI">ไม่ติดเชื้อ</option><option value="SUSPECTED_SSI">สงสัย SSI</option><option value="CONFIRMED_SSI">ยืนยัน SSI</option></select></label><label className="text-[12px]">ประเภทผู้ป่วย<select className="form-select mt-1" value={patientType} onChange={e=>setPatientType(e.target.value)}><option value="all">คนไข้ทั้งหมด</option><option value="opd">OPD</option><option value="ipd">IPD</option></select></label></div><div data-report-controls className="mt-5 flex flex-wrap justify-end gap-3"><button onClick={exportExcel} disabled={exporting} className="inline-flex items-center gap-2 rounded bg-emerald-600 px-5 py-2.5 text-[13px] text-white"><Download size={15}/>{exporting?'กำลังสร้าง Excel...':'ส่งออก Excel'}</button><button onClick={exportPdf} disabled={printing} className="inline-flex items-center gap-2 rounded border border-red-200 bg-red-50 px-5 py-2.5 text-[13px] text-red-600"><FileText size={15}/>{printing ? 'กำลังเตรียมรายงาน...' : 'ส่งออก PDF'}</button><button onClick={exportPdf} disabled={printing} className="inline-flex items-center gap-2 rounded border border-slate-200 px-5 py-2.5 text-[13px]"><Printer size={15}/>พิมพ์รายงาน</button></div></section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{metrics.map(([label,value,unit,Icon],i)=>{const[color,bg]=tones[i];return<article key={label} className="min-h-[112px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="text-[15px] font-semibold leading-5" style={{color}}>{label}</p><span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{color,background:bg}}><Icon size={20}/></span></div><p className="mt-3 text-[32px] font-semibold leading-9" style={{color}}>{value} <small className="text-[14px] font-semibold">{unit}</small></p></article>})}</section>
    <p className="text-[12px] text-slate-500">สถิติยืนยัน SSI รวมเคสที่เคยยืนยันติดเชื้อ แม้ปัจจุบันหายแล้ว โดยนับแต่ละ Operation Number หนึ่งครั้ง</p>
    <AnalyticsChartPair patients={data}/>
    <section className="grid items-stretch gap-4 xl:grid-cols-2">
      <article className="flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5 text-[15px] font-semibold text-[#002d73]">อัตรายืนยัน SSI แยกตามแผนกและรายเดือน (%)</h2>
        <div className="flex-1 overflow-x-auto"><table className="w-full min-w-[620px] text-[11px]"><thead className="h-[52px] border-b border-slate-200 bg-slate-50"><tr><th className="px-3 text-left">แผนก</th>{heatMonths.map(m=><th key={m.label}>{m.label}</th>)}</tr></thead><tbody>{deptData.map(row=><tr key={row.name} className="h-[72px] border-b border-slate-200 last:border-b-0"><td className="px-3">{row.name}</td>{heatMonths.map(m=>{const list=data.filter(p=>(p.department||'ไม่ระบุ')===row.name&&(p.startAt||p.createdAt)&&new Date(p.startAt||p.createdAt).getMonth()===m.index&&new Date(p.startAt||p.createdAt).getFullYear()===m.year),rate=list.length?Number((list.filter(p=>hasConfirmedSsiHistory(p)).length/list.length*100).toFixed(2)):0;return<td key={m.label} className="p-1"><span className="block p-3 text-center" style={{background:`rgba(239,68,68,${Math.min(.85,rate/8+.06)})`}}>{rate.toFixed(2)}</span></td>})}</tr>)}</tbody></table></div>
        <div className="mx-5 mb-5 mt-auto h-2 rounded-full bg-gradient-to-r from-red-50 to-red-500"/>
      </article>
      <article className="flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5 text-[15px] font-semibold text-[#002d73]">5 หัตถการที่มีอัตรายืนยัน SSI สูงสุด</h2>
        <table className="w-full text-[12px]"><thead className="h-[52px] border-b border-slate-200 bg-slate-50"><tr><th>อันดับ</th><th className="text-left">หัตถการ (Procedure)</th><th>จำนวนเคส</th><th>อัตรายืนยัน SSI %</th></tr></thead><tbody>{procedureData.slice(0,5).map((row,i)=><tr key={row.name} className="h-[72px] border-b border-slate-200 last:border-b-0"><td className="text-center">{i+1}</td><td>{row.name}</td><td className="text-center">{row.total}</td><td className="text-center">{row.rate}%</td></tr>)}</tbody></table>
      </article>
    </section>
    <AnalyticsDonutPair patients={data}/>
    <section data-report-controls className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-[14px] font-semibold text-[#002d73]">✉️ ไปยังเมล</h2><div className="mt-4 grid gap-3"><label className="text-[11px]">ผู้รับ<input className="form-input mt-1" placeholder="ระบุอีเมลผู้รับ"/></label><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="min-w-0 flex-1 text-[11px]">หัวข้อ<input className="form-input mt-1" defaultValue="รายงานสรุประบบคิวโรงพยาบาล"/></label><button className="btn-filled-primary inline-flex items-center gap-2" disabled title="ยังไม่ได้เชื่อมระบบอีเมล"><Send size={15}/>ส่ง</button></div></div></section></div>
}
