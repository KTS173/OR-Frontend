import { AlignJustify, AlignLeft, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Bolt, BookOpen, Calendar, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, CloudUpload, Code2, Download, Edit2, Eye, FileImage, FileText, Info, LayoutGrid, Link as LinkIcon, Megaphone, MoreVertical, Plus, Redo2, RefreshCw, Search, Sparkles, Table2, Trash2, Undo2, User, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isCreating = ['create', 'edit'].includes(searchParams.get('mode'))
  const openCreate = () => setSearchParams({ mode: 'create' })
  const closeCreate = () => setSearchParams({})
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [editingDocId, setEditingDocId] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Document List Filters State
  const [dateRange, setDateRange] = useState('12 พ.ค. 2569 - 18 พ.ค. 2569')
  const [category, setCategory] = useState('ทั้งหมด')
  const [importanceFilter, setImportanceFilter] = useState('ทั้งหมด')
  const [deptFilter, setDeptFilter] = useState('ทั้งหมด')
  const [readStatus, setReadStatus] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')

  // New Document Form State
  const [contentType, setContentType] = useState('news') // 'news', 'announcement', 'document'
  const [docTitle, setDocTitle] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [contentDetail, setContentDetail] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [importance, setImportance] = useState('must-read') // 'normal', 'must-read', 'urgent'
  const [targetGroup, setTargetGroup] = useState('all') // 'all', 'or', 'opd', 'ipd', 'doctor'
  const [publishDate, setPublishDate] = useState('15 มิ.ย. 2569')
  const [refLink, setRefLink] = useState('https://intranet.bangkokhospital.com/or/infection-control/post-op')
  
  // Publisher department info
  const [pubDept1, setPubDept1] = useState('เจ้าหน้าที่ OPD')
  const [pubDept2, setPubDept2] = useState('OPD ทั่วไป')
  const [pubPerson, setPubPerson] = useState('น.ส มัลลิกา ศุภอรุณกุล')

  // Document Table List State
  const [docsList, setDocsList] = useState([
    { id: 1, date: '15 มิ.ย. 2569 10:15', title: 'ประกาศแนวทางการป้องกันการติดเชื้อหลังผ่าตัดฉบับอัปเดต', isNew: true, type: 'ประกาศทั่วไป', owner: 'คณะกรรมการ', importance: 'ต้องอ่าน', target: 'ทุกหน่วยงาน', color: 'orange' },
    { id: 2, date: '15 มิ.ย. 2569 10:15', title: 'คู่มือการบันทึกติดตามผู้ป่วยเวอร์ชันใหม่', isNew: true, type: 'คู่มือ', owner: 'ฝ่ายเทคโนโลยีสารสนเทศ', importance: 'ปกติ', target: 'ทุกหน่วยงาน', color: 'green' },
    { id: 3, date: '15 มิ.ย. 2569 10:15', title: 'แบบฟอร์มส่งต่อผู้ป่วยระหว่างแผนก', isNew: false, type: 'ประกาศทั่วไป', owner: 'คณะกรรมการ', importance: 'ปกติ', target: 'ทุกหน่วยงาน', color: 'green' },
    { id: 4, date: '15 มิ.ย. 2569 10:15', title: 'นโยบายการจัดเก็บเอกสารผู้ป่วย', isNew: false, type: 'ประกาศทั่วไป', owner: 'เจ้าหน้าที่ OR', importance: 'ปกติ', target: 'ทุกหน่วยงาน', color: 'green' },
    { id: 5, date: '15 มิ.ย. 2569 10:15', title: 'ข่าวสารระบบนัดหมายใหม่', isNew: false, type: 'ข่าวสาร', owner: 'เทคโนโลยีสารสนเทศ', importance: 'ปกติ', target: 'ทุกหน่วยงาน', color: 'green' },
    { id: 6, date: '15 มิ.ย. 2569 10:15', title: 'ประกาศปิดปรับปรุงระบบวันที่ 15 มิ.ย. 2569', isNew: false, type: 'ประกาศทั่วไป', owner: 'เทคโนโลยีสารสนเทศ', importance: 'ด่วน', target: 'ทุกหน่วยงาน', color: 'red' },
    { id: 7, date: '15 มิ.ย. 2569 10:15', title: 'ข่าวสารใหม่ รูปแบบการผ่าตัดใหม่', isNew: false, type: 'ข่าวสาร', owner: 'เจ้าหน้าที่ OR', importance: 'ปกติ', target: 'ทุกหน่วยงาน', color: 'green' }
  ])

  // Mock Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'แนวทางการป้องกันการติดเชื้อหลังผ่าตัด_v2.pdf', type: 'PDF', owner: '(ชื่อ-นามสกุลเจ้าหน้าที่)', dept: 'OPD -ศัลยกรรม', date: '15ม.ย.2569 10:30', size: '245KB' },
    { id: 2, name: 'Checklist_Post-op_Infection.pdf', type: 'PDF', owner: '(ชื่อ-นามสกุลเจ้าหน้าที่)', dept: 'OPD -ศัลยกรรม', date: '15ม.ย.2569 10:30', size: '245KB' }
  ])

  const handleDeleteFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleNextStep = () => {
    if (wizardStep < 3) {
      setWizardStep(prev => prev + 1)
    } else {
      // Form Submit
      const savedDoc = {
        id: editingDocId ?? Date.now(),
        date: '15 มิ.ย. 2569 10:20',
        title: docTitle || 'เอกสารใหม่ที่เพิ่มเข้ามา',
        isNew: true,
        type: contentType === 'news' ? 'ข่าวสาร' : contentType === 'announcement' ? 'ประกาศทั่วไป' : 'คู่มือ',
        owner: pubPerson || 'System Admin',
        importance: importance === 'normal' ? 'ปกติ' : importance === 'must-read' ? 'ต้องอ่าน' : 'ด่วน',
        target: targetGroup === 'all' ? 'ทุกหน่วยงาน' : targetGroup.toUpperCase(),
        color: importance === 'normal' ? 'green' : importance === 'must-read' ? 'orange' : 'red'
      }
      setDocsList((current) => editingDocId === null
        ? [savedDoc, ...current]
        : current.map((item) => item.id === editingDocId ? { ...item, ...savedDoc, isNew: false } : item))
      setSelectedDocId(savedDoc.id)
      setEditingDocId(null)
      setSearchParams({ mode: 'detail' })
      setWizardStep(1)
    }
  }

  const handleEditDocument = (doc) => {
    setEditingDocId(doc.id)
    setSelectedDocId(null)
    setDocTitle(doc.title)
    setContentType(doc.type === 'ประกาศทั่วไป' ? 'announcement' : doc.type === 'คู่มือ' ? 'document' : 'news')
    setImportance(doc.importance === 'ปกติ' ? 'normal' : doc.importance === 'ด่วน' ? 'urgent' : 'must-read')
    setTargetGroup(doc.target === 'ทุกหน่วยงาน' ? 'all' : doc.target.toLowerCase())
    setWizardStep(1)
    setSearchParams({ mode: 'edit' })
  }

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(refLink)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      setCopiedLink(false)
    }
  }

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1)
    } else {
      closeCreate()
    }
  }

  const renderContentDetail = (text) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      // Check if line is a header (starts with number like "1. ", "2. ", "3. ", "3.1 ")
      const isHeader = /^\d+(\.\d+)?\s+/.test(trimmed);
      
      // Check if bullet point
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
      
      if (isHeader) {
        return (
          <h4 key={idx} className="font-bold text-[13px] text-slate-800 mt-4 mb-2">
            {trimmed}
          </h4>
        );
      }
      
      if (isBullet) {
        const content = trimmed.substring(1).trim();
        return (
          <div key={idx} className="flex gap-2 pl-4 py-0.5 text-xs text-slate-600 font-semibold">
            <span className="text-slate-400">•</span>
            <span>{content}</span>
          </div>
        );
      }
      
      return (
        <p key={idx} className="text-xs text-slate-600 font-semibold leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    });
  };

  // Filter logic
  const filteredDocs = docsList.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.owner.toLowerCase().includes(searchQuery.toLowerCase())
    if (category !== 'ทั้งหมด' && doc.type !== category) return false
    if (importanceFilter !== 'ทั้งหมด' && doc.importance !== importanceFilter) return false
    return matchesSearch
  })

  // ── DETAIL VIEW ──
  if (selectedDocId !== null) {
    const doc = docsList.find(d => d.id === selectedDocId) || docsList[0]
    return (
      <div className="space-y-5 font-sans">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
          {/* Left panel details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-left">
            
            {/* Header info */}
            <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-500 border border-orange-100">
                <BookOpen size={24} />
              </span>
              <div className="space-y-1.5">
                <h1 className="text-lg font-bold text-slate-800 leading-snug">{doc.title}</h1>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[#fffbeb] border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    <BookOpen size={10} />
                    ต้องอ่าน
                  </span>
                  <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    ทุกหน่วยงาน
                  </span>
                </div>
              </div>
            </div>

            {/* description block */}
            <div className="text-xs text-slate-500 leading-relaxed font-semibold bg-[#f8fafc] p-4 rounded-xl">
              {shortDesc || 'เป็นแนวทางการปฏิบัติสำหรับบุคลากรในการป้องกันการติดเชื้อหลังผ่าตัด'}
            </div>

            {/* details markdown preview */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <p className="text-[13px] font-semibold text-[#002d73]">รายละเอียดเนื้อหา <span className="text-red-500 font-bold">*</span></p>
              <div className="space-y-2">
                {renderContentDetail(reviewContent || contentDetail)}
              </div>
            </div>

            {/* Attached documents list */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[13px] text-[#002d73]">เอกสารแนบ (2 ไฟล์)</h4>
              <div className="grid gap-3">
                {[
                  { name: 'Discharge Summary.pdf', size: '245 KB', date: '15 มิ.ย. 2569 10:10' },
                  { name: 'Discharge Summary.pdf', size: '245 KB', date: '15 มิ.ย. 2569 10:10' }
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-500">
                        <FileText size={20} />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-blue-600 hover:underline cursor-pointer">{file.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{file.date} &nbsp;•&nbsp; {file.size}</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* References links */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[13px] text-[#002d73]">ลิงก์อ้างอิงเพิ่มเติม</h4>
              <div className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-xs font-semibold">
                <a
                  href={refLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {refLink}
                </a>
              </div>
            </div>

          </div>

          {/* Right sidebar panel metadata */}
          <aside className="space-y-7 bg-white px-6 py-5">
            
            {/* Top edit/copy buttons row */}
            <div className="flex gap-3">
              <button
                onClick={() => handleEditDocument(doc)}
                className="inline-flex h-[46px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <Edit2 size={13} />
                แก้ไข
              </button>
              <button
                onClick={handleCopyReference}
                className="inline-flex h-[46px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <LinkIcon size={13} />
                {copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
              </button>
            </div>

            {/* Doc Info Card */}
            <div className="space-y-5 text-left">
              <h3 className="text-[15px] font-semibold text-slate-800">ข้อมูลเอกสาร</h3>
              <div className="space-y-5 text-[13px] font-normal text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">ประเภทเอกสาร</span>
                  <span className="text-slate-800">ข่าวสารทั่วไป</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ระดับความสำคัญ</span>
                  <span className="inline-block rounded bg-[#fffbeb] border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    ต้องอ่าน
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เวอร์ชัน</span>
                  <span className="text-slate-800 font-bold">1.0 (ล่าสุด)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ผู้เผยแพร่</span>
                  <span className="text-slate-800">คณะกรรมการ ICN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">วันที่อัปเดตล่าสุด</span>
                  <span className="text-slate-800">15 มิ.ย. 2569 10:30</span>
                </div>
              </div>
            </div>

            {/* Updates History Card */}
            <div className="space-y-4 text-left">
              <h3 className="text-[15px] font-semibold text-slate-800">ประวัติการอัปเดต</h3>
              <div className="relative border-l border-slate-100 pl-4 py-1 space-y-4">
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#175beb]">1.0</span>
                    <span className="text-[10px] text-slate-400 font-semibold">10 มิ.ย. 2569 15:05</span>
                  </div>
                  <p className="text-slate-500 font-semibold leading-relaxed">เผยแพร่เอกสารครั้งแรก</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">โดย น.ส มัลลิกา ศุภอรุณกุล (OPD)</p>
                </div>
              </div>
            </div>

            {/* Readers Card */}
            <div className="space-y-4 text-left">
              <h3 className="text-[15px] font-semibold text-slate-800">จำนวนผู้อ่าน</h3>
              <div className="flex h-[48px] items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 text-[14px] font-normal text-slate-700">
                <span>อ่านแล้ว</span>
                <span className="font-bold text-slate-800"><span className="text-[#002d73] text-sm font-bold">248</span> คน</span>
              </div>
            </div>

          </aside>
        </div>

      </div>
    )
  }

  // ── WIZARD VIEW ──
  if (isCreating) {
    return (
      <div className="space-y-6 font-sans">
        {/* Wizard Steps Header */}
        <div className="relative flex min-h-[78px] items-center rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="mr-[150px] grid w-full grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-xs font-semibold">
            {/* Step 1 */}
            <div className="flex min-w-0 items-center gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-medium ${
                wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{wizardStep > 1 ? '✓' : '1'}</span>
              <div>
                <p className="text-[14px] font-medium text-[#175beb]">กรอกข้อมูลพื้นฐาน</p>
                <p className="text-[11px] font-normal text-slate-700">Step 1 / 3</p>
              </div>
            </div>

            <div className="mx-5 h-px min-w-12 bg-slate-200" />

            {/* Step 2 */}
            <div className="flex min-w-0 items-center gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-full border-2 text-[14px] font-medium ${
                wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{wizardStep > 2 ? '✓' : '2'}</span>
              <div>
                <p className={`text-[14px] font-medium ${wizardStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>แนบไฟล์และกำหนดสิทธิ์</p>
                <p className="text-[11px] font-normal text-slate-400">Step 2 / 3</p>
              </div>
            </div>

            <div className="mx-5 h-px min-w-12 bg-slate-200" />

            {/* Step 3 */}
            <div className="flex min-w-0 items-center gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-full border-2 text-[14px] font-medium ${
                wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>3</span>
              <div>
                <p className={`text-[14px] font-medium ${wizardStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>ตรวจสอบและเผยแพร่</p>
                <p className="text-[11px] font-normal text-slate-400">Step 3 / 3</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { closeCreate(); setWizardStep(1); }}
            className="absolute right-5 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X size={15} />
            ยกเลิก
          </button>
        </div>

        {/* Wizard Form Content Card */}
        <section className="space-y-6 rounded-xl border border-black/10 bg-white p-9 shadow-sm">
          
          {wizardStep === 1 && (
            <div className="space-y-6">
              {/* Content Type Choice Cards */}
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#002d73]">ประเภทเนื้อหา <span className="text-red-500 font-bold">*</span></p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* megaphone news option */}
                  <button
                    onClick={() => setContentType('news')}
                    className={`flex h-[140px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                      contentType === 'news'
                        ? 'border-blue-600 bg-blue-50/20 text-[#175beb]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Megaphone size={24} />
                    <span className="font-bold text-[14px]">ข่าวสาร</span>
                    <span className="text-[11px] text-slate-400">แจ้งข่าว ประชาสัมพันธ์</span>
                  </button>

                  {/* declaration option */}
                  <button
                    onClick={() => setContentType('announcement')}
                    className={`flex h-[140px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                      contentType === 'announcement'
                        ? 'border-blue-600 bg-blue-50/20 text-[#175beb]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <FileText size={24} />
                    <span className="font-bold text-[14px]">ประกาศ</span>
                    <span className="text-[11px] text-slate-400">ประกาศทั่วไป</span>
                  </button>

                  {/* document book option */}
                  <button
                    onClick={() => setContentType('document')}
                    className={`flex h-[140px] flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
                      contentType === 'document'
                        ? 'border-blue-600 bg-blue-50/20 text-[#175beb]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen size={24} />
                    <span className="font-bold text-[14px]">เอกสาร</span>
                    <span className="text-[11px] text-slate-400">คู่มือ เอกสารอ้างอิง</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <label className="block text-[15px] font-medium text-slate-800">
                หัวข้อ <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="ระบุหัวข้อเอกสาร / ข่าวสาร"
                  className="field mt-3 h-[54px] text-[15px] font-normal placeholder:text-slate-500"
                />
              </label>

              {/* Description Input */}
              <label className="block text-[15px] font-medium text-slate-800">
                คำอธิบายสั้น <span className="text-red-500 font-bold">*</span>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="สรุปเนื้อหาโดยย่อ เพื่อแสดงในรายการ"
                  className="field mt-3 h-[54px] text-[15px] font-normal text-slate-600 placeholder:text-slate-500"
                />
              </label>

              {/* Textarea details content */}
              <div className="space-y-2">
                <p className="text-[15px] font-medium text-slate-800">รายละเอียดเนื้อหา <span className="text-red-500">*</span></p>
                {/* Richtext Editor toolbar mock */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <div className="flex h-[56px] select-none flex-wrap items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-5 text-slate-950">
                    <button type="button" className="inline-flex items-center gap-3 text-[14px] font-medium">Paragraph <ChevronDown size={15} /></button>
                    <span className="h-7 w-px bg-slate-300" />
                    <button type="button"><Bolt size={19} /></button>
                    <button type="button" className="text-[16px] font-bold">B</button>
                    <button type="button" className="text-[16px] italic">I</button>
                    <button type="button" className="text-[16px] underline">U</button>
                    <span className="h-7 w-px bg-slate-300" />
                    <button type="button"><AlignLeft size={19} /></button>
                    <button type="button"><AlignJustify size={19} /></button>
                    <span className="h-7 w-px bg-slate-300" />
                    <button type="button"><LinkIcon size={19} /></button>
                    <button type="button"><FileImage size={19} /></button>
                    <button type="button"><Table2 size={19} /></button>
                    <button type="button"><Code2 size={19} /></button>
                    <span className="h-7 w-px bg-slate-300" />
                    <button type="button"><Undo2 size={19} /></button>
                    <button type="button"><Redo2 size={19} /></button>
                  </div>
                  <textarea
                    rows={7}
                    value={contentDetail}
                    onChange={(e) => setContentDetail(e.target.value)}
                    placeholder="พิมพ์รายละเอียดเนื้อหาที่ต้องการเผยแพร่..."
                    className="h-[260px] w-full resize-none border-none p-5 text-[15px] leading-6 text-slate-600 outline-none placeholder:text-slate-500"
                  />
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-right text-[11px] font-normal text-slate-400">
                    อักขระ: {contentDetail.length}
                  </div>
                </div>
              </div>

              {/* Importance Row selection */}
              <div className="space-y-2 text-left">
                <p className="text-[13px] font-semibold text-[#002d73]">ระดับความสำคัญ <span className="text-red-500 font-bold">*</span></p>
                <div className="grid grid-cols-3 gap-4 w-full">
                  {/* normal option */}
                  <button
                    onClick={() => setImportance('normal')}
                    className={`inline-flex h-[60px] items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition ${
                      importance === 'normal'
                        ? 'bg-[#ecfdf5] border-2 border-[#10b981] text-[#10b981]'
                        : 'bg-[#ecfdf5]/40 border border-[#10b981]/25 text-[#10b981]/80 hover:bg-[#ecfdf5]/60'
                    }`}
                  >
                    <CheckCircle2 size={15} className="text-[#10b981] shrink-0" />
                    ปกติ
                  </button>

                  {/* warning option */}
                  <button
                    onClick={() => setImportance('must-read')}
                    className={`inline-flex h-[60px] items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition ${
                      importance === 'must-read'
                        ? 'bg-[#fffbeb] border-2 border-amber-500 text-amber-600'
                        : 'bg-[#fffbeb]/40 border border-amber-200 text-amber-600/80 hover:bg-[#fffbeb]/60'
                    }`}
                  >
                    <BookOpen size={15} className="text-amber-500 shrink-0" />
                    ต้องอ่าน
                  </button>

                  {/* urgent option */}
                  <button
                    onClick={() => setImportance('urgent')}
                    className={`inline-flex h-[60px] items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition ${
                      importance === 'urgent'
                        ? 'bg-[#fef2f2] border-2 border-red-500 text-red-600'
                        : 'bg-[#fef2f2]/40 border border-red-200 text-red-600/80 hover:bg-[#fef2f2]/60'
                    }`}
                  >
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    ด่วน
                  </button>
                </div>
              </div>

              {/* Target Targets targets */}
              <div className="space-y-2 text-left">
                <p className="text-[13px] font-semibold text-[#002d73]">กลุ่มเป้าหมาย <span className="text-red-500 font-bold">*</span></p>
                <div className="grid grid-cols-5 gap-3 w-full">
                  {[
                    { id: 'all', label: 'ทุกหน่วยงาน', icon: LayoutGrid },
                    { id: 'or', label: 'OR', icon: User },
                    { id: 'opd', label: 'OPD', icon: User },
                    { id: 'ipd', label: 'IPD', icon: User },
                    { id: 'doctor', label: 'แพทย์', icon: User }
                  ].map((item) => {
                    const TargetIcon = item.icon;
                    const isSelected = targetGroup === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTargetGroup(item.id)}
                        className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-[#175beb]'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <TargetIcon size={14} className={isSelected ? 'text-[#175beb]' : 'text-slate-400'} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Publish date */}
              <div className="space-y-2 text-left">
                <p className="text-[13px] font-semibold text-[#002d73]">วันที่เผยแพร่ <span className="text-red-500 font-bold">*</span></p>
                <div className="relative mt-2 w-full">
                  <input
                    type="text"
                    value={publishDate}
                    onChange={e => setPublishDate(e.target.value)}
                    className="h-[54px] w-full rounded-lg border border-slate-200 pl-4 pr-10 text-[13px] font-normal text-slate-600 outline-none"
                  />
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-7">
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-[15px] font-semibold text-[#002d73]">เอกสาร/ไฟล์แนบ (ถ้ามี)</h3>
                <p className="mt-1 text-[11px] font-normal text-slate-400">รองรับไฟล์ .jpg .jpeg .png ขนาดไม่เกิน 5 MB</p>

                <button type="button" className="mt-3 flex h-[136px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-center transition hover:bg-slate-50">
                  <CloudUpload size={25} className="mb-2 text-slate-900" />
                  <span className="text-[13px] font-medium text-slate-700">คลิกหรือลากไฟล์มาวางที่นี่</span>
                  <span className="mt-1 text-[11px] font-normal text-slate-400">รองรับไฟล์ pdf, doc, docx, jpg, png ขนาดไม่เกิน 5 MB</span>
                </button>
              </div>

              {/* Uploaded files section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px] font-medium">
                  <span className="text-slate-800">ไฟล์ที่อัปโหลด ({uploadedFiles.length} ไฟล์)</span>
                  <span className="text-[11px] font-normal text-slate-400">อัปโหลดล่าสุด 15 มิ.ย. 2569, 10:20 น.</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex h-[58px] items-center border-b border-slate-200 px-6 text-[15px] font-semibold text-[#002d73]">เอกสารแนบ</div>
                  <table className="w-full border-collapse text-left text-[13px] font-normal">
                    <thead>
                      <tr className="h-11 border-b border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-700">
                        <th className="px-6">ชื่อเอกสาร</th><th className="px-4">ประเภทไฟล์</th><th className="px-4">อัปโหลดโดย</th>
                        <th className="px-4">แผนก</th><th className="px-4">วันที่อัปโหลด</th><th className="px-4">ขนาด</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {uploadedFiles.map((file) => (
                        <tr key={file.id} className="h-[74px]">
                          <td className="px-6"><div className="flex items-center gap-3 font-medium text-blue-600"><FileText size={20} className="shrink-0 text-red-500" /><span className="max-w-[230px] leading-5">{file.name}</span></div>
                          </td>
                          <td className="px-4">{file.type}</td><td className="px-4">{file.owner}</td><td className="px-4">{file.dept}</td>
                          <td className="px-4 text-[12px]"><span className="block">15 มิ.ย.2569</span><span className="block">10:30</span></td>
                          <td className="px-4 text-slate-600">{file.size}</td>
                          <td className="px-4">
                            <button onClick={() => handleDeleteFile(file.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex min-h-[52px] items-center justify-between border-t border-slate-200 px-6 text-[12px] text-slate-500">
                    <span>Showing 10 of 10 Historical Log</span>
                    <div className="flex items-center gap-2">
                      <button type="button" className="h-8 rounded-md border border-slate-200 px-4">Previous</button>
                      <button type="button" className="h-8 min-w-8 rounded-md bg-blue-600 text-white">1</button>
                      <button type="button" className="h-8 min-w-8 rounded-md border border-slate-200">2</button>
                      <button type="button" className="h-8 min-w-8 rounded-md border border-slate-200">3</button>
                      <button type="button" className="h-8 rounded-md border border-slate-200 px-4">Next</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra input section */}
              <div className="space-y-4 pt-4">
                <p className="text-[15px] font-semibold text-slate-800">เอกสารประกอบเพิ่มเติม <span className="font-normal text-slate-400">(ไม่บังคับ)</span></p>
                <label className="block text-[13px] font-medium text-slate-700">
                  ลิงก์อ้างอิงเพิ่มเติม
                  <input
                    type="text"
                    value={refLink}
                    onChange={e => setRefLink(e.target.value)}
                    placeholder="ใส่ลิงก์ข้อมูลเพิ่มเติม..."
                    className="field mt-2 h-[52px] text-[13px] font-normal"
                  />
                </label>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  สามารถใส่หลายลิงก์ โดยคั่นด้วยเครื่องหมายจุลภาค (,)
                </p>
              </div>

              {/* Publishing department section */}
              <div className="space-y-4 border-t border-slate-100 pt-7">
                <p className="text-[15px] font-semibold text-slate-800">หน่วยงานที่เผยแพร่</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-[12px] font-medium text-slate-700">
                    แผนกผู้ดูแลติดตามคนไข้ <span className="text-red-500">*</span>
                    <input
                      type="text"
                      value={pubDept1}
                      onChange={e => setPubDept1(e.target.value)}
                      className="field mt-1.5 h-[48px] text-[13px] font-normal"
                    />
                  </label>
                  <label className="block text-[12px] font-medium text-slate-700">
                    แผนกผู้ดูแลติดตามคนไข้ <span className="text-red-500">*</span>
                    <input
                      type="text"
                      value={pubDept2}
                      onChange={e => setPubDept2(e.target.value)}
                      className="field mt-1.5 h-[48px] text-[13px] font-normal"
                    />
                  </label>
                  <label className="block text-[12px] font-medium text-slate-700">
                    ชื่อ-นามสกุลผู้รับผิดชอบ <span className="text-red-500">*</span>
                    <input
                      type="text"
                      value={pubPerson}
                      onChange={e => setPubPerson(e.target.value)}
                      className="field mt-1.5 h-[48px] text-[13px] font-normal"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-7 text-left">
              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start gap-5">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-orange-200 bg-orange-50 text-orange-500"><BookOpen size={23} /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[20px] font-semibold leading-7 text-slate-800">{docTitle || 'แนวทางการป้องกันการติดเชื้อหลังผ่าตัดฉบับอัปเดต'}</h3>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-600"><BookOpen size={11} />ต้องอ่าน</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-normal text-slate-500">ทุกหน่วยงาน</span>
                    </div>
                    <p className="mt-5 text-[13px] font-normal leading-6 text-slate-600">{shortDesc || 'เป็นแนวทางการปฏิบัติสำหรับบุคลากรในการป้องกันการติดเชื้อหลังผ่าตัด ครอบคลุมตั้งแต่การประเมินความเสี่ยง การเตรียมผู้ป่วย การดูแลแผลผ่าตัด ไปจนถึงการติดตามภาวะแทรกซ้อน'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[14px] font-medium text-slate-800">รายละเอียดเนื้อหา <span className="text-red-500">*</span></p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex h-[48px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 text-slate-950">
                    <button type="button" className="inline-flex items-center gap-2 text-[12px]">Paragraph <ChevronDown size={13} /></button><span className="h-6 w-px bg-slate-300" />
                    <Bolt size={16} /><b>B</b><i>I</i><u>U</u><span className="h-6 w-px bg-slate-300" /><AlignLeft size={16} /><AlignJustify size={16} /><LinkIcon size={16} /><FileImage size={16} /><Table2 size={16} /><Code2 size={16} /><span className="h-6 w-px bg-slate-300" /><Undo2 size={16} /><Redo2 size={16} />
                  </div>
                  <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="" className="h-[350px] w-full resize-none p-5 text-[14px] font-normal leading-6 text-slate-700 outline-none" />
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-right text-[10px] text-slate-400">อักขระ: {reviewContent.length}</div>
                </div>
              </div>

              {/* Uploaded files section */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between text-[13px] font-medium">
                  <span className="text-slate-800">ไฟล์ที่อัปโหลด ({uploadedFiles.length} ไฟล์)</span>
                  <span className="text-slate-400 font-medium">อัปโหลดล่าสุด 15 มิ.ย. 2569, 10:20 น.</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex h-[54px] items-center border-b border-slate-200 px-6 text-[15px] font-semibold text-[#002d73]">เอกสารแนบ</div>
                  <table className="w-full text-left border-collapse text-[13px] font-sans font-semibold">
                    <thead>
                      <tr className="bg-[#f8fafc] text-slate-500 font-bold border-b border-slate-200 text-xs">
                        <th className="px-6 py-3">ชื่อเอกสาร</th>
                        <th className="px-4 py-3">ประเภทไฟล์</th>
                        <th className="px-4 py-3">อัปโหลดโดย</th>
                        <th className="px-4 py-3">แผนก</th>
                        <th className="px-4 py-3">วันที่อัปโหลด</th>
                        <th className="px-6 py-3">ขนาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {uploadedFiles.map((file) => (
                        <tr key={file.id} className="h-16 hover:bg-slate-50/50 transition">
                          <td className="px-6 font-bold text-blue-600 h-16">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-red-500 shrink-0" />
                              <span className="hover:underline cursor-pointer leading-tight">
                                {file.name.includes('_v2') ? (
                                  <>
                                    แนวทางการป้องกันการ<br />ติดเชื้อหลังผ่าตัด_v2.pdf
                                  </>
                                ) : (
                                  file.name
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 text-slate-400 font-medium">{file.type}</td>
                          <td className="px-4 text-slate-400 font-medium">{file.owner}</td>
                          <td className="px-4 text-slate-400 font-medium">{file.dept}</td>
                          <td className="px-4 text-slate-400 text-xs font-medium">
                            <div>15 มิ.ย. 2569</div>
                            <div className="mt-0.5 text-[10px]">10:30</div>
                          </td>
                          <td className="px-6 text-slate-600 font-bold">{file.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination inside Uploaded Files card */}
                  <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans bg-white select-none">
                    <span>Showing 10 of 10 Historical Log</span>
                    <div className="flex gap-2">
                      <button className="page-button w-auto px-3">Previous</button>
                      <button className="page-button bg-[#175beb] text-white">1</button>
                      <button className="page-button">2</button>
                      <button className="page-button">3</button>
                      <button className="page-button w-auto px-3">Next</button>
                    </div>
                  </footer>
                </div>
              </div>

              {/* Extra reference links section */}
              <div className="space-y-3 pt-5 text-left">
                <p className="text-[15px] font-semibold text-slate-800">เอกสารประกอบเพิ่มเติม <span className="font-normal text-slate-400">(ไม่บังคับ)</span></p>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">ลิงก์อ้างอิงเพิ่มเติม</p>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-normal text-slate-700">
                    {refLink}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    สามารถใส่หลายลิงก์ โดยคั่นด้วยเครื่องหมายจุลภาค (,)
                  </p>
                </div>
              </div>

              {/* Publisher info */}
              <div className="space-y-4 border-t border-slate-100 pt-7 text-left">
                <p className="text-[15px] font-semibold text-slate-800">หน่วยงานที่เผยแพร่</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[12px] font-semibold text-slate-600">
                    แผนกผู้เผยแพร่ *
                    <input
                      type="text"
                      readOnly
                      value={pubDept2}
                      className="field mt-1.5 bg-[#f8fafc] border-slate-200 text-slate-700 cursor-not-allowed font-semibold"
                    />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-600">
                    ชื่อ-นามสกุลผู้รับผิดชอบ *
                    <input
                      type="text"
                      readOnly
                      value={pubPerson}
                      className="field mt-1.5 bg-[#f8fafc] border-slate-200 text-slate-700 cursor-not-allowed font-semibold"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

        </section>

          {/* Bottom Actions Row */}
          <div className="flex min-h-[72px] items-center justify-end gap-3 rounded-xl border border-black/10 bg-white px-6 py-4 shadow-sm">
            <button
              onClick={handlePrevStep}
              className="inline-flex h-[46px] min-w-[142px] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              ย้อนกลับ
            </button>
            {wizardStep === 2 && (
              <button
                type="button"
                onClick={() => { alert('บันทึกแบบร่างสำเร็จ!'); closeCreate(); }}
                className="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                บันทึกแบบร่าง
              </button>
            )}
            {wizardStep === 3 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-6 text-[14px] font-medium text-white transition hover:bg-blue-700"
              >
                บันทึก/เผยแพร่ข่าวสาร
              </button>
            )}
            {wizardStep !== 3 && (
              <button
                onClick={handleNextStep}
                className="inline-flex h-[46px] min-w-[118px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-6 text-[14px] font-medium text-white transition hover:bg-blue-700"
              >
                ถัดไป
                <ArrowRight size={14} />
              </button>
            )}
          </div>

      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="เอกสารข่าวสารกลาง"
        description="ประกาศ เอกสาร และข่าวสารที่เจ้าหน้าที่ทุกหน่วยงานสามารถเปิดดูร่วมกันได้"
      />

      {/* Top metrics sum row */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {[
          { label: 'ประกาศทั้งหมด', count: 128, color: 'text-blue-600', bg: 'bg-blue-50', icon: Megaphone },
          { label: 'เอกสารใหม่', count: 1248, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Sparkles },
          { label: 'ด่วน', count: 1248, color: 'text-red-500', bg: 'bg-emerald-50', icon: AlertCircle },
          { label: 'ต้องอ่าน', count: 1248, color: 'text-orange-500', bg: 'bg-emerald-50', icon: BookOpen },
          { label: 'อัปเดตสัปดาห์นี้', count: 36, color: 'text-purple-500', bg: 'bg-blue-50', icon: RefreshCw }
        ].map((item, idx) => (
          <div key={idx} className="relative flex h-[140px] flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
            <span className={`absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl ${item.bg} ${item.color}`}>
              <item.icon size={21} strokeWidth={2.2} />
            </span>
            <div className="flex h-full flex-col">
              <p className={`pr-12 text-[15px] font-medium ${item.color}`}>{item.label}</p>
              <p className={`mt-auto text-[30px] font-medium leading-none ${item.color}`}>{item.count.toLocaleString()}</p>
              <p className="mt-2 text-[13px] font-normal text-slate-500">รายการ</p>
            </div>
          </div>
        ))}
      </section>

      {/* Two Pinned cards banners side-by-side */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Urgent Banner */}
        <div className="rounded-xl border border-red-200 bg-red-50/10 p-5 shadow-sm relative flex flex-col justify-between">
          <span className="absolute top-4 right-4 text-red-500 bg-red-50 h-7 w-7 rounded-full grid place-items-center">
            📌
          </span>
          <div>
            <span className="inline-block rounded bg-red-50 py-0.5 text-[12px] font-normal text-red-500 uppercase tracking-wider mb-2">
              ด่วน
            </span>
            <h3 className="text-[16px] font-semibold text-slate-800 leading-6">แจ้งปิดปรับปรุงระบบชั่วคราว วันที่ 15 มิ.ย. 2569</h3>
            <p className="mt-1 text-slate-500 text-[12px] leading-relaxed font-normal">
              ระบบ OR Surveillance จะปิดให้บริการเพื่อปรับปรุงระบบตั้งเเต่เวลา 22:00 - 02:00 น.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 font-normal">
            <span>ฝ่ายเทคโนโลยีสารสนเทศ 14 มิ.ย. 2569 16:30</span>
            <span className="text-slate-600">ทุกหน่วยงาน</span>
          </div>
        </div>

        {/* Must-read Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/10 p-5 shadow-sm relative flex flex-col justify-between">
          <span className="absolute top-4 right-4 text-amber-500 bg-amber-50 h-7 w-7 rounded-full grid place-items-center">
            📌
          </span>
          <div>
            <span className="inline-block rounded bg-amber-50 py-0.5 text-[12px] font-normal text-amber-600 uppercase tracking-wider mb-2">
              ต้องอ่าน
            </span>
            <h3 className="text-[16px] font-semibold text-slate-800 leading-6">แนวทางการป้องกันการติดเชื้อหลังผ่าตัด ฉบับอัปเดต</h3>
            <p className="mt-1 text-slate-500 text-[12px] leading-relaxed font-normal">
              แนวทางการเฝ้าระวังเเละป้องกันภาวะแผลติดเชื้อหลังผ่าตัด โดยความร่วมมือระหว่างทีมแพทย์เเละ IC Nurse
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 font-normal">
            <span>ฝ่ายเทคโนโลยีสารสนเทศ 14 มิ.ย. 2569 16:30</span>
            <span className="text-slate-600">ทุกหน่วยงาน</span>
          </div>
        </div>
      </div>

      {/* Database Search Filter panel */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[#002d73] mb-4 border-b border-slate-50 pb-2">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูลข่าวสาร
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-[14px] font-medium text-slate-600">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="h-[39px] w-full rounded-lg border border-slate-200 pl-10 pr-4 text-[14px] font-normal text-slate-600"
              />
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[14px] font-medium text-slate-600">หมวดหมู่</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 h-[39px] w-full rounded-lg border border-slate-200 px-3 text-[14px] text-slate-600 font-normal"
            >
              <option>ทั้งหมด</option>
              <option>ประกาศทั่วไป</option>
              <option>คู่มือ</option>
              <option>ข่าวสาร</option>
            </select>
          </div>

          <div>
            <label className="text-[14px] font-medium text-slate-600">ระดับความสำคัญ</label>
            <select
              value={importanceFilter}
              onChange={e => setImportanceFilter(e.target.value)}
              className="mt-1 h-[39px] w-full rounded-lg border border-slate-200 px-3 text-[14px] text-slate-600 font-normal"
            >
              <option>ทั้งหมด</option>
              <option>ปกติ</option>
              <option>ต้องอ่าน</option>
              <option>ด่วน</option>
            </select>
          </div>

          <div>
            <label className="text-[14px] font-medium text-slate-600">หน่วยงาน</label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="mt-1 h-[39px] w-full rounded-lg border border-slate-200 px-3 text-[14px] text-slate-600 font-normal"
            >
              <option>ทั้งหมด</option>
              <option>เทคโนโลยีสารสนเทศ</option>
              <option>คณะกรรมการ</option>
            </select>
          </div>

          <div>
            <label className="text-[14px] font-medium text-slate-600">สถานะการอ่าน</label>
            <select
              value={readStatus}
              onChange={e => setReadStatus(e.target.value)}
              className="mt-1 h-[39px] w-full rounded-lg border border-slate-200 px-3 text-[14px] text-slate-600 font-normal"
            >
              <option>ทั้งหมด</option>
              <option>อ่านแล้ว</option>
              <option>ยังไม่ได้อ่าน</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1 text-[14px] font-medium text-slate-600">
            คำค้นหา
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหา หัวข้อ, เนื้อหา, หน่วยงาน..."
              className="mt-1 h-[39px] w-full rounded-lg border border-slate-200 px-3 text-[14px] outline-none focus:border-[#175beb]"
            />
          </label>
          <button className="inline-flex h-[39px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-[14px] font-medium text-white hover:bg-blue-700 transition">
            ค้นหา
          </button>
          <button
            onClick={() => { setSearchQuery(''); setCategory('ทั้งหมด'); setImportanceFilter('ทั้งหมด'); }}
            className="inline-flex h-[39px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-[14px] font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      {/* Section Title */}
      <h2 className="text-[17px] font-medium text-[#002d73] mt-4">รายการข่าวสารและเอกสาร</h2>

      {/* Documents table list card */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[16px] font-medium text-[#002d73]">ผลการค้นหา ({filteredDocs.length} รายการ)</h2>
          <button
            onClick={openCreate}
            className="btn-primary h-[39px] text-[14px] font-medium"
          >
            <Plus size={14} /> เพิ่มข่าวสาร
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse font-sans text-[15px] text-[#434651]">
            <thead className="h-[52px] bg-[#f8fafc] text-[14px] font-normal text-slate-500 [&_th]:font-normal">
              <tr className="border-b border-slate-100">
                <th className="w-[155px] px-5 py-3 text-left">วันที่อัปเดตล่าสุด</th>
                <th className="w-[330px] px-4 py-3 text-left">หัวข้อ</th>
                <th className="w-[180px] px-4 py-3 text-left">ประเภท</th>
                <th className="w-[180px] whitespace-nowrap px-4 py-3 text-left">หน่วยงานเจ้าของเอกสาร</th>
                <th className="w-[150px] px-4 py-3 text-center">ความสำคัญ</th>
                <th className="w-[150px] px-4 py-3 text-left">ผู้ชม</th>
                <th className="w-[110px] whitespace-nowrap px-5 py-3 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((row) => (
                <tr key={row.id} className="h-[82px] transition hover:bg-slate-50/60">
                  <td className="px-5 leading-5">
                    <span className="block font-normal text-slate-800">{row.date.split(' ').slice(0, -1).join(' ')}</span>
                    <span className="block text-[13px] font-normal text-slate-500">{row.date.split(' ').at(-1)}</span>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        onClick={() => setSelectedDocId(row.id)}
                        className="cursor-pointer font-medium leading-5 text-[#175beb] hover:underline"
                      >
                        {row.title}
                      </span>
                      {row.isNew && (
                        <span className="inline-flex shrink-0 rounded-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          ใหม่
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4">
                    <span className="inline-flex items-center gap-2 font-normal text-slate-500">
                      {row.type === 'ข่าวสาร' ? <Megaphone size={20} /> : <FileText size={20} />}
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 font-normal text-slate-500">{row.owner}</td>
                  <td className="px-4 text-center">
                    {row.importance === 'ด่วน' && <span className="font-medium text-red-500">{row.importance}</span>}
                    {row.importance === 'ต้องอ่าน' && <span className="font-medium text-orange-500">{row.importance}</span>}
                    {row.importance === 'ปกติ' && <span className="font-medium text-emerald-500">{row.importance}</span>}
                  </td>
                  <td className="px-4 font-normal text-slate-500">{row.target}</td>
                  <td className="px-5 text-center">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center justify-between border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>Showing 10 of 10 Historical Log</span>
          <div className="flex gap-2">
            <button className="page-button w-auto px-3">Previous</button>
            <button className="page-button bg-[#175beb] text-white">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
            <button className="page-button w-auto px-3">Next</button>
          </div>
        </footer>
      </section>

    </div>
  )
}
