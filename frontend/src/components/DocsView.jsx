import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eye, FileImage, FileText, RefreshCw, Search, Upload, X } from 'lucide-react'
import { api } from '../services/api.js'

const toDataUrl=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)})
const fileType=doc=>doc.mime_type?.includes('pdf')?'PDF':doc.file_name?.split('.').pop()?.toUpperCase()||'FILE'
const referenceTypes = [
  ['INSTRUMENT_TRACKING', 'Instrument Tracking'],
  ['IMPLANT', 'Implant'],
  ['IMAGE', 'Image'],
]
const isImageDocument = doc => doc.mime_type?.startsWith('image/') || ['IMAGE', 'FOLLOW_UP_IMAGE'].includes(doc.document_type)
const categoryLabel = doc => ({
  INSTRUMENT_TRACKING: 'Instrument Tracking (จาก OR)',
  IMPLANT: 'Implant (จาก OR)',
  IMAGE: 'รูปภาพจาก OR',
  FOLLOW_UP_IMAGE: 'รูปภาพติดตามอาการ',
  FOLLOW_UP_DOCUMENT: 'เอกสารอื่นๆ',
  'เอกสารผู้ป่วย': 'เอกสารอื่นๆ',
})[doc.document_type] || doc.document_type || 'เอกสารอื่นๆ'
const uploadDateKey = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
const uploadDateLabel = value => new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
const groupByUploadDate = items => items.reduce((groups, item) => {
  const key = uploadDateKey(item.created_at)
  const group = groups.find(entry => entry.date === key)
  if (group) group.items.push(item)
  else groups.push({ date: key, items: [item] })
  return groups
}, [])

function GroupedFileTable({ title, items, total, imageTable, download, preview }) {
  const groups = groupByUploadDate(items)
  const columns = imageTable
    ? ['ชื่อรูปภาพ', 'หมวดหมู่', 'รอบติดตาม', 'อัปโหลดโดย', 'เวลา', 'ขนาด', '']
    : ['ชื่อไฟล์', 'หมวดหมู่', 'ประเภทไฟล์', 'รอบติดตาม', 'อัปโหลดโดย', 'แผนก', 'เวลา', 'ขนาด', '']
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-3">{imageTable ? <FileImage size={20} className="text-blue-600" /> : <FileText size={20} className="text-blue-600" />}<div><h4 className="text-[16px] font-semibold text-[#002d73]">{title}</h4><p className="mt-0.5 text-[12px] text-slate-500">{items.length} รายการ</p></div></div></header>
    <div className="overflow-x-auto"><table className={`w-full text-[13px] text-slate-700 ${imageTable ? 'min-w-[900px]' : 'min-w-[1100px]'}`}><thead className="h-11 bg-slate-50 font-semibold text-slate-700"><tr>{columns.map((heading, index) => <th key={`${heading}-${index}`} className="px-5 text-left">{heading}</th>)}</tr></thead><tbody>
      {!items.length && <tr><td colSpan={columns.length} className="h-24 text-center text-slate-400">ยังไม่มี{imageTable ? 'รูปภาพ' : 'เอกสาร'}ที่ตรงกับตัวกรอง</td></tr>}
      {groups.map(group => <Fragment key={group.date}><tr className="border-t border-slate-200 bg-blue-50/50"><td colSpan={columns.length} className="px-5 py-2.5 font-medium text-[#002d73]">วันที่แนบ {uploadDateLabel(group.date)} <span className="ml-2 font-normal text-slate-500">({group.items.length} รายการ)</span></td></tr>{group.items.map(doc => <tr key={doc.id} className="h-14 border-t border-slate-100"><td className="px-5"><button onClick={() => preview(doc)} className="inline-flex max-w-[280px] items-center gap-2 font-medium text-blue-600"><span className="truncate">{doc.file_name}</span></button></td><td className="px-5"><span className={`inline-flex rounded-md px-2 py-1 text-[12px] font-medium ${['INSTRUMENT_TRACKING', 'IMPLANT', 'IMAGE'].includes(doc.document_type) ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{categoryLabel(doc)}</span></td>{!imageTable && <td className="px-5">{fileType(doc)}</td>}<td className="px-5">{doc.follow_up_round || '-'}</td><td className="px-5">{doc.uploaded_by || '-'}</td>{!imageTable && <td className="px-5">{doc.department || '-'}</td>}<td className="px-5 whitespace-nowrap">{new Date(doc.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}</td><td className="px-5 whitespace-nowrap">{doc.file_size >= 1024 * 1024 ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : `${(doc.file_size / 1024).toFixed(0)} KB`}</td><td className="px-5"><div className="flex items-center gap-2"><button onClick={() => preview(doc)} className="text-slate-400 hover:text-blue-600" title="ดูไฟล์"><Eye size={17} /></button><button onClick={() => download(doc)} className="text-slate-400 hover:text-blue-600" title="ดาวน์โหลด"><Download size={17} /></button></div></td></tr>)}</Fragment>)}
    </tbody></table></div>
    <footer className="flex h-11 items-center border-t border-slate-200 px-5 text-[13px] text-slate-500">แสดง {items.length} จาก {total} รายการ</footer>
  </section>
}

function FilePreviewModal({ file, loading, onClose, onDownload }) {
  if (!file && !loading) return null
  const mimeType = file?.mime_type || ''
  const canPreview = mimeType.startsWith('image/') || mimeType === 'application/pdf'
  return <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3"><div className="min-w-0"><h3 className="truncate text-[16px] font-semibold text-[#002d73]">{file?.file_name || 'กำลังเปิดไฟล์...'}</h3><p className="mt-0.5 text-[12px] text-slate-500">{file ? categoryLabel(file) : 'กำลังโหลดข้อมูล'}</p></div><div className="flex shrink-0 items-center gap-2">{file && <button type="button" onClick={() => onDownload(file)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-500 px-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50"><Download size={15} />ดาวน์โหลด</button>}<button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="ปิด"><X size={19} /></button></div></header>
      <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-slate-100 p-4">{loading ? <p className="text-sm text-slate-500">กำลังโหลดไฟล์...</p> : canPreview && mimeType.startsWith('image/') ? <img src={file.file_data} alt={file.file_name} className="max-h-full max-w-full rounded-lg bg-white object-contain shadow-sm" /> : canPreview ? <iframe title={file.file_name} src={file.file_data} className="h-full w-full rounded-lg border-0 bg-white" /> : <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm"><FileText size={42} className="mx-auto text-slate-400" /><h4 className="mt-4 text-[16px] font-semibold text-slate-700">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้</h4><p className="mt-2 text-[13px] text-slate-500">สามารถกดดาวน์โหลดเพื่อเปิดด้วยโปรแกรมที่รองรับได้</p></div>}</div>
    </section>
  </div>
}

export default function DocsView({ selectedPatient, operations = [selectedPatient], referenceMode = false, viewMode = 'all' }) {
  const inputRef=useRef(null),user=(()=>{try{return JSON.parse(sessionStorage.getItem('or-smart-user')||'null')}catch{return null}})()
  const [docs,setDocs]=useState([]),[uploading,setUploading]=useState(false),[type,setType]=useState('all'),[uploadType,setUploadType]=useState('INSTRUMENT_TRACKING'),[round,setRound]=useState('all'),[query,setQuery]=useState(''),[operationNo,setOperationNo]=useState(selectedPatient.operationNo),[previewFile,setPreviewFile]=useState(null),[previewLoading,setPreviewLoading]=useState(false)
  const activePatient=operations.find(operation=>operation.operationNo===operationNo)||selectedPatient
  const load=useCallback(()=>api.getCaseDocuments(operationNo).then(setDocs).catch(e=>alert(e.message)),[operationNo])
  useEffect(()=>{load()},[load])
  useEffect(()=>{window.addEventListener('documents-updated',load);return()=>window.removeEventListener('documents-updated',load)},[load])
  useEffect(()=>{setType('all')},[viewMode])
  const rounds=useMemo(()=>[...new Set(docs.map(doc=>doc.follow_up_round).filter(Boolean))],[docs])
  const visible=useMemo(()=>docs.filter(doc=>{
    const image = isImageDocument(doc)
    const matchesView = referenceMode || viewMode === 'all' || (viewMode === 'images' ? image : !image)
    const matchesType = type === 'all' || (type === 'GENERAL' ? !image && !['INSTRUMENT_TRACKING', 'IMPLANT'].includes(doc.document_type) : doc.document_type === type)
    const searchableText = [doc.file_name, doc.uploaded_by, doc.department, doc.follow_up_round, activePatient.id, activePatient.episodeNo, activePatient.operationNo, activePatient.name, activePatient.procedure].filter(Boolean).join(' ').toLowerCase()
    return matchesView && matchesType && (round==='all'||doc.follow_up_round===round)&&(!query||searchableText.includes(query.trim().toLowerCase()))
  }),[docs,type,round,query,activePatient,referenceMode,viewMode])
  const documentRows=useMemo(()=>visible.filter(doc=>!isImageDocument(doc)),[visible])
  const imageRows=useMemo(()=>visible.filter(isImageDocument),[visible])
  const upload=async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;const isImage=file.type.startsWith('image/');if((referenceMode&&uploadType==='IMAGE'||!referenceMode&&viewMode==='images')&&!isImage)return alert('ส่วนรูปภาพรองรับเฉพาะไฟล์รูปภาพ');if(!referenceMode&&viewMode==='documents'&&isImage)return alert('กรุณาเพิ่มไฟล์รูปภาพในแท็บรูปภาพ');if(file.size>5*1024*1024)return alert('ไฟล์ต้องมีขนาดไม่เกิน 5 MB');setUploading(true);try{await api.createCaseDocument(operationNo,{fileName:file.name,mimeType:file.type||'application/octet-stream',fileSize:file.size,fileData:await toDataUrl(file),documentType:referenceMode?uploadType:isImage?'FOLLOW_UP_IMAGE':'FOLLOW_UP_DOCUMENT',uploadedBy:user?.name,department:user?.department});await load()}catch(e){alert(e.message)}finally{setUploading(false)}}
  const download=async doc=>{try{const data=await api.getCaseDocument(doc.id);const link=document.createElement('a');link.href=data.file_data;link.download=data.file_name;link.click()}catch(e){alert(e.message)}}
  const preview=async doc=>{setPreviewFile(null);setPreviewLoading(true);try{setPreviewFile(await api.getCaseDocument(doc.id))}catch(e){alert(e.message)}finally{setPreviewLoading(false)}}
  const controlClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50'
  const labelClass = 'mb-2 block text-[13px] font-medium text-slate-700'

  return <div className="mt-3 space-y-4 text-left text-[13px]">
    {!referenceMode && operations.length > 1 && <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <label className="block max-w-md"><span className={labelClass}>Operation Number</span><select className={controlClass} value={operationNo} onChange={event => setOperationNo(event.target.value)}>{operations.map(operation => <option key={operation.operationNo} value={operation.operationNo}>{operation.operationNo} - {operation.procedure || 'ไม่ระบุหัตถการ'}</option>)}</select></label>
    </section>}
    {referenceMode && <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid items-end gap-4 lg:grid-cols-[320px_1fr]">
        <label><span className={labelClass}>Operation Number</span><select className={controlClass} value={operationNo} onChange={event => setOperationNo(event.target.value)}>{operations.map(operation => <option key={operation.operationNo} value={operation.operationNo}>{operation.operationNo} - {operation.procedure || 'ไม่ระบุหัตถการ'}</option>)}</select></label>
        <div><p className={labelClass}>ประเภทข้อมูลที่จะเพิ่ม</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{referenceTypes.map(([value, label]) => <button key={value} type="button" onClick={() => setUploadType(value)} className={`h-10 rounded-lg border px-3 text-[13px] font-medium ${uploadType === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}</div></div>
      </div>
    </section>}

    {!referenceMode && viewMode === 'documents' && <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className={labelClass}>หมวดเอกสาร</p><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{[['all','เอกสารทั้งหมด'],['INSTRUMENT_TRACKING','Instrument Tracking'],['IMPLANT','Implant'],['GENERAL','เอกสารอื่นๆ']].map(([value,label])=><button key={value} type="button" onClick={()=>setType(value)} className={`h-10 rounded-lg border px-3 text-[13px] font-medium ${type===value?'border-blue-600 bg-blue-50 text-blue-700':'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}{['INSTRUMENT_TRACKING','IMPLANT'].includes(value)&&<span className="ml-1 text-[11px] font-normal text-teal-600">จาก OR</span>}</button>)}</div></section>}

    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="flex items-center gap-2 text-[16px] font-semibold text-[#002d73]"><Search size={18} />ค้นหาข้อมูล</h4>
      <div className={`mt-4 grid items-end gap-4 ${referenceMode ? 'lg:grid-cols-[320px_1fr_auto]' : viewMode === 'documents' ? 'lg:grid-cols-[260px_1fr_auto]' : 'lg:grid-cols-[260px_260px_1fr_auto]'}`}>
        {(referenceMode || viewMode !== 'documents') && <label><span className={labelClass}>ประเภท{viewMode === 'images' ? 'รูปภาพ' : 'เอกสาร'}</span><select className={controlClass} value={type} onChange={event => setType(event.target.value)}><option value="all">ทั้งหมด</option>{referenceMode ? referenceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>) : [['IMAGE','รูปภาพจาก OR'],['FOLLOW_UP_IMAGE','รูปภาพติดตามอาการ']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
        {!referenceMode && <label><span className={labelClass}>รอบติดตามเอกสาร</span><select className={controlClass} value={round} onChange={event => setRound(event.target.value)}><option value="all">ทั้งหมด</option>{rounds.map(value => <option key={value}>{value}</option>)}</select></label>}
        <label><span className={labelClass}>คำค้นหา</span><input className={controlClass} value={query} onChange={event => setQuery(event.target.value)} placeholder="ค้นหาชื่อไฟล์, HN, EN หรือ Operation Number..." /></label>
        <button onClick={() => { setType('all'); setRound('all'); setQuery('') }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-500 bg-white px-4 text-[13px] font-medium text-blue-600 hover:bg-blue-50"><RefreshCw size={15} />ล้างตัวกรอง</button>
      </div>
    </section>

    {referenceMode ? <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div><h4 className="text-[16px] font-semibold text-[#002d73]">เอกสารอ้างอิง</h4>{referenceMode && <p className="mt-1 text-[12px] text-slate-500">Operation Number: {operationNo} · {referenceTypes.find(([value]) => value === uploadType)?.[1]}</p>}</div>
        <input ref={inputRef} type="file" className="hidden" accept={referenceMode && uploadType === 'IMAGE' ? 'image/*' : '.pdf,.doc,.docx,.jpg,.jpeg,.png'} onChange={upload} />
        <button disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Upload size={15} />{uploading ? 'กำลังอัปโหลด...' : uploadType === 'IMAGE' ? 'เพิ่มรูปภาพ' : 'เพิ่มเอกสาร'}</button>
      </header>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-[13px] text-slate-700"><thead className="h-11 bg-slate-50 font-semibold text-slate-700"><tr>{['ชื่อไฟล์', 'หมวดหมู่', 'ประเภทไฟล์', 'อัปโหลดโดย', 'แผนก', 'วันที่อัปโหลด', 'ขนาด', ''].map((heading, index) => <th key={`${heading}-${index}`} className="px-5 text-left">{heading}</th>)}</tr></thead><tbody>{!visible.length && <tr><td colSpan="8" className="h-20 text-center text-slate-400">ยังไม่มีเอกสารที่ตรงกับตัวกรอง</td></tr>}{visible.map(doc => { const category = referenceTypes.find(([value]) => value === doc.document_type)?.[1] || doc.document_type || '-'; const Icon = doc.mime_type?.startsWith('image/') ? FileImage : FileText; return <tr key={doc.id} className="h-14 border-t border-slate-100"><td className="px-5"><button onClick={() => preview(doc)} className="inline-flex items-center gap-2 font-medium text-blue-600"><Icon size={18} className={doc.mime_type?.startsWith('image/') ? 'text-blue-500' : 'text-red-500'} />{doc.file_name}</button></td><td className="px-5">{category}</td><td className="px-5">{fileType(doc)}</td><td className="px-5">{doc.uploaded_by || '-'}</td><td className="px-5">{doc.department || '-'}</td><td className="px-5">{new Date(doc.created_at).toLocaleString('th-TH')}</td><td className="px-5">{doc.file_size >= 1024 * 1024 ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : `${(doc.file_size / 1024).toFixed(0)} KB`}</td><td className="px-5"><div className="flex items-center gap-2"><button onClick={() => preview(doc)} className="text-slate-400 hover:text-blue-600" title="ดูไฟล์"><Eye size={17} /></button><button onClick={() => download(doc)} className="text-slate-400 hover:text-blue-600" title="ดาวน์โหลด"><Download size={17} /></button></div></td></tr> })}</tbody></table></div>
      <footer className="flex h-12 items-center border-t border-slate-200 px-5 text-[13px] text-slate-500">แสดง {visible.length} จาก {docs.length} รายการ</footer>
    </section> : <>
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"><div><h4 className="text-[16px] font-semibold text-[#002d73]">{viewMode === 'images' ? 'เพิ่มรูปภาพในเคส' : 'เพิ่มเอกสารในเคส'}</h4><p className="mt-1 text-[12px] text-slate-500">{viewMode === 'images' ? 'รองรับ JPG, PNG และ WebP ขนาดไม่เกิน 5 MB' : 'รองรับ PDF, DOC และ DOCX ขนาดไม่เกิน 5 MB'}</p></div><input ref={inputRef} type="file" className="hidden" accept={viewMode === 'images' ? 'image/jpeg,image/png,image/webp' : '.pdf,.doc,.docx'} onChange={upload} /><button disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Upload size={15} />{uploading ? 'กำลังอัปโหลด...' : viewMode === 'images' ? 'เพิ่มรูปภาพ' : 'เพิ่มเอกสาร'}</button></section>
      {viewMode !== 'images' && <GroupedFileTable title="เอกสาร" items={documentRows} total={docs.filter(doc => !isImageDocument(doc)).length} download={download} preview={preview} />}
      {viewMode !== 'documents' && <GroupedFileTable title="รูปภาพ" items={imageRows} total={docs.filter(isImageDocument).length} imageTable download={download} preview={preview} />}
    </>}
    <FilePreviewModal file={previewFile} loading={previewLoading} onClose={() => { setPreviewFile(null); setPreviewLoading(false) }} onDownload={download} />
  </div>
}
