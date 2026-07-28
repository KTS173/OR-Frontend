import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Calendar, CalendarDays, ChevronRight, Download, Edit2, Eye, FileText, Info, Link as LinkIcon, Megaphone, MoreVertical, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function DocumentsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedDocId, setSelectedDocId] = useState(null)

  // Document List Filters State
  const [dateRange, setDateRange] = useState('12 พ.ค. 2569 - 18 พ.ค. 2569')
  const [category, setCategory] = useState('ทั้งหมด')
  const [importanceFilter, setImportanceFilter] = useState('ทั้งหมด')
  const [deptFilter, setDeptFilter] = useState('ทั้งหมด')
  const [readStatus, setReadStatus] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')

  // New Document Form State
  const [contentType, setContentType] = useState('news') // 'news', 'announcement', 'document'
  const [docTitle, setDocTitle] = useState('แนวทางการป้องกันการติดเชื้อหลังผ่าตัดฉบับอัปเดต')
  const [shortDesc, setShortDesc] = useState('เป็นแนวทางการปฏิบัติสำหรับบุคลากรในการป้องกันการติดเชื้อหลังผ่าตัดครอบคลุมตั้งแต่การประเมินความเสี่ยง การเตรียมผู้ป่วย การดูแลแผลผ่าตัด ไปจนถึงการติดตามภาวะแทรกซ้อน เพื่อให้เกิดความปลอดภัยและลดอัตราการติดเชื้อในผู้ป่วยผ่าตัด')
  const [contentDetail, setContentDetail] = useState(`1. วัตถุประสงค์
เพื่อกำหนดแนวทางในการปฏิบัติเพื่อป้องกันการติดเชื้อหลังผ่าตัด ลดอัตราการติดเชื้อแผลผ่าตัด (Surgical Site Infection, SSI) และเพิ่มความปลอดภัยให้แก่ผู้ป่วย

2. ขอบเขต
แนวทางนี้ครอบคลุมผู้ป่วยที่เข้ารับการผ่าตัดทุกประเภทในโรงพยาบาล ทั้งแบบผู้ป่วยในและผู้ป่วยนอก รวมถึงบุคลากรที่เกี่ยวข้องในขั้นตอนของการดูแล

3. แนวทางการปฏิบัติ
3.1 ก่อนการผ่าตัด
• ประเมินความเสี่ยงของผู้ป่วย (เช่น โรคร่วม ภาวะโภชนาการ ภาวะน้ำหนักเกิน)
• อาบน้ำ/ทำความสะอาดร่างกายด้วย Chlorhexidine ตามแนวทาง
• ให้ยาปฏิชีวนะป้องกันก่อนผ่าตัด 30-60 นาที ตามข้อบ่งชี้
• เตรียมเครื่องมือและอุปกรณ์ให้สะอาด ปลอดเชื้อ และตรวจสอบการทำงาน`)
  const [importance, setImportance] = useState('must-read') // 'normal', 'must-read', 'urgent'
  const [targetGroup, setTargetGroup] = useState('all') // 'all', 'or', 'opd', 'ipd', 'doctor'
  const [publishDate, setPublishDate] = useState('15 มิ.ย. 2569')
  const [refLink, setRefLink] = useState('https://intranet.bangkokhospital.com/or/infection-control/post-op')
  
  // Publisher department info
  const [pubDept1, setPubDept1] = useState('เจ้าหน้าที่ OPD')
  const [pubDept2, setPubDept2] = useState('OPD ทั่วไป')
  const [pubPerson, setPubPerson] = useState('น.ส มลลิกา ศุภอรุณกุล')

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
      const newDoc = {
        id: Date.now(),
        date: '15 มิ.ย. 2569 10:20',
        title: docTitle || 'เอกสารใหม่ที่เพิ่มเข้ามา',
        isNew: true,
        type: contentType === 'news' ? 'ข่าวสาร' : contentType === 'announcement' ? 'ประกาศทั่วไป' : 'คู่มือ',
        owner: pubPerson || 'System Admin',
        importance: importance === 'normal' ? 'ปกติ' : importance === 'must-read' ? 'ต้องอ่าน' : 'ด่วน',
        target: targetGroup === 'all' ? 'ทุกหน่วยงาน' : targetGroup.toUpperCase(),
        color: importance === 'normal' ? 'green' : importance === 'must-read' ? 'orange' : 'red'
      }
      setDocsList([newDoc, ...docsList])
      alert('บันทึกและเผยแพร่เอกสารข่าวสารเรียบร้อยแล้ว!')
      setIsCreating(false)
      setWizardStep(1)
    }
  }

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1)
    } else {
      setIsCreating(false)
    }
  }

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
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            onClick={() => setSelectedDocId(null)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={15} />
            ย้อนกลับ
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => alert('เปิดระบบแก้ไขเอกสารข่าวสาร')}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <Edit2 size={13} />
              แก้ไข
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!'); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <LinkIcon size={13} />
              คัดลอกลิงก์
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
          {/* Left panel details */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <BookOpen size={24} />
              </span>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-slate-800 leading-snug">
                  แนวทางการป้องกันการติดเชื้อหลังผ่าตัดฉบับอัปเดต
                </h1>
                <div className="flex gap-2">
                  <span className="inline-block rounded bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
                    ต้องอ่าน
                  </span>
                  <span className="inline-block rounded bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                    ทุกหน่วยงาน
                  </span>
                </div>
              </div>
            </div>

            {/* description block */}
            <div className="text-[13px] text-slate-600 leading-relaxed font-semibold bg-slate-50/50 rounded-xl p-4">
              เป็นแนวทางการปฏิบัติสำหรับบุคลากรในการป้องกันการติดเชื้อหลังผ่าตัดครอบคลุมตั้งแต่การประเมินความเสี่ยง การเตรียมผู้ป่วย การดูแลแผลผ่าตัด ไปจนถึงการติดตามภาวะแทรกซ้อน เพื่อให้เกิดความปลอดภัยและลดอัตราการติดเชื้อในผู้ป่วยผ่าตัด
            </div>

            {/* details markdown mockup */}
            <div className="space-y-4 text-[13px] text-slate-700">
              <h3 className="font-bold text-slate-800 border-b pb-2">รายละเอียดเนื้อหา *</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">1. วัตถุประสงค์</p>
                  <p className="pl-4 font-semibold text-slate-500 leading-relaxed">
                    เพื่อกำหนดแนวทางในการปฏิบัติเพื่อป้องกันการติดเชื้อหลังผ่าตัด ลดอัตราการติดเชื้อแผลผ่าตัด (Surgical Site Infection, SSI) และเพิ่มความปลอดภัยให้แก่ผู้ป่วย
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800">2. ขอบเขต</p>
                  <p className="pl-4 font-semibold text-slate-500 leading-relaxed">
                    แนวทางนี้ครอบคลุมผู้ป่วยที่เข้ารับการผ่าตัดทุกประเภทในโรงพยาบาล ทั้งแบบผู้ป่วยในและผู้ป่วยนอก รวมถึงบุคลากรที่เกี่ยวข้องในขั้นตอนของการดูแล
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-800">3. แนวทางการปฏิบัติ</p>
                  <div className="pl-4 space-y-2">
                    <p className="font-bold text-slate-800 text-xs">3.1 ก่อนการผ่าตัด</p>
                    <ul className="pl-4 space-y-1.5 font-semibold text-slate-500 list-disc">
                      <li>ประเมินความเสี่ยงของผู้ป่วย (เช่น โรคร่วม ภาวะโภชนาการ ภาวะน้ำหนักเกิน)</li>
                      <li>อาบน้ำ/ทำความสะอาดร่างกายด้วย Chlorhexidine ตามแนวทาง</li>
                      <li>ให้ยาปฏิชีวนะป้องกันก่อนผ่าตัด 30-60 นาที ตามข้อบ่งชี้</li>
                      <li>เตรียมเครื่องมือและอุปกรณ์ให้สะอาด ปลอดเชื้อ และตรวจสอบการทำงาน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Attached documents list */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[14px] text-slate-800">เอกสารแนบ (2 ไฟล์)</h4>
              
              <div className="grid gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-500">
                        <FileText size={20} />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Discharge Summary.pdf</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">15 มิ.ย. 2569 10:10 • 245 KB</p>
                      </div>
                    </div>
                    <button className="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* References links */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-[14px] text-slate-800">ลิงก์อ้างอิงเพิ่มเติม</h4>
              <a
                href={refLink}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-blue-600 font-bold hover:underline break-all"
              >
                {refLink}
              </a>
            </div>

          </div>

          {/* Right sidebar panel metadata */}
          <div className="space-y-4">
            
            {/* Doc Info Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">ข้อมูลเอกสาร</h3>
              <div className="space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">ประเภทเอกสาร</span>
                  <span className="text-slate-800">ข่าวสารทั่วไป</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ระดับความสำคัญ</span>
                  <span className="inline-block rounded bg-orange-50 border border-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
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
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">ประวัติการอัปเดต</h3>
              <div className="relative border-l border-slate-100 pl-4 py-1 space-y-4">
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#175beb]">1.0</span>
                    <span className="text-[10px] text-slate-400 font-semibold">10 มิ.ย. 2569 15:05</span>
                  </div>
                  <p className="text-slate-500 font-semibold leading-relaxed">เผยแพร่เอกสารครั้งแรก</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">โดย น.ส มลลิกา ศุภอรุณกุล (OPD)</p>
                </div>
              </div>
            </div>

            {/* Readers Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">จำนวนผู้อ่าน</span>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">อ่านแล้ว </span>
                <span className="text-sm font-extrabold text-slate-800">248 คน</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
        </div>
      </div>
    )
  }

  // ── WIZARD VIEW ──
  if (isCreating) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">เพิ่มเอกสาร / ข่าวสาร</h1>
          </div>
          <button
            onClick={() => { setIsCreating(false); setWizardStep(1); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <X size={15} />
            ยกเลิก
          </button>
        </div>

        {/* Wizard Steps Header */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center max-w-[800px] mx-auto text-xs font-semibold">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>1</span>
              <div>
                <p className="font-bold text-slate-800">กรอกข้อมูลพื้นฐาน</p>
                <p className="text-[10px] text-slate-400 font-medium">Step 1 / 3</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 flex-1 mx-4" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>2</span>
              <div>
                <p className={`font-bold ${wizardStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>แนบไฟล์และกำหนดสิทธิ์</p>
                <p className="text-[10px] text-slate-400 font-medium">Step 2 / 3</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 flex-1 mx-4" />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>3</span>
              <div>
                <p className={`font-bold ${wizardStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>ตรวจสอบและเผยแพร่</p>
                <p className="text-[10px] text-slate-400 font-medium">Step 3 / 3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Form Content Card */}
        <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
          
          {wizardStep === 1 && (
            <div className="space-y-6">
              {/* Content Type Choice Cards */}
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#002d73]">ประเภทเนื้อหา *</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* megaphone news option */}
                  <button
                    onClick={() => setContentType('news')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
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
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
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
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
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
              <label className="block text-[13px] font-semibold text-[#002d73]">
                หัวข้อ *
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="ระบุหัวข้อเอกสาร / ข่าวสาร"
                  className="field mt-2 font-semibold"
                />
              </label>

              {/* Description Input */}
              <label className="block text-[13px] font-semibold text-[#002d73]">
                คำอธิบายสั้น *
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="สรุปเนื้อหาโดยย่อ เพื่อแสดงในรายการ"
                  className="field mt-2 font-semibold text-slate-600"
                />
              </label>

              {/* Textarea details content */}
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#002d73]">รายละเอียดเนื้อหา *</p>
                {/* Richtext Editor toolbar mock */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <div className="bg-slate-50/50 border-b border-slate-200 px-3 py-2 flex flex-wrap gap-3 text-slate-400 text-xs font-bold items-center select-none">
                    <span className="border-r pr-3 hover:text-slate-600 cursor-pointer">Paragraph</span>
                    <span className="hover:text-slate-600 cursor-pointer">B</span>
                    <span className="hover:text-slate-600 cursor-pointer italic">I</span>
                    <span className="hover:text-slate-600 cursor-pointer underline">U</span>
                    <span className="border-r pr-3" />
                    <span className="hover:text-slate-600 cursor-pointer">Align</span>
                    <span className="hover:text-slate-600 cursor-pointer">Link</span>
                    <span className="hover:text-slate-600 cursor-pointer">Image</span>
                    <span className="hover:text-slate-600 cursor-pointer">Video</span>
                    <span className="hover:text-slate-600 cursor-pointer">Code</span>
                  </div>
                  <textarea
                    rows={8}
                    value={contentDetail}
                    onChange={(e) => setContentDetail(e.target.value)}
                    placeholder="พิมพ์รายละเอียดเนื้อหาที่ต้องการเผยแพร่..."
                    className="w-full border-none p-4 text-[13px] text-slate-600 leading-6 outline-none resize-none"
                  />
                  <div className="bg-slate-50 border-t border-slate-100 px-4 py-1.5 text-right text-[10px] text-slate-400 font-bold">
                    อักขระ: {contentDetail.length}
                  </div>
                </div>
              </div>

              {/* Importance Row selection */}
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#002d73]">ระดับความสำคัญ *</p>
                <div className="flex gap-4">
                  {/* normal option */}
                  <button
                    onClick={() => setImportance('normal')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      importance === 'normal'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    ปกติ
                  </button>

                  {/* warning option */}
                  <button
                    onClick={() => setImportance('must-read')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      importance === 'must-read'
                        ? 'bg-[#fffbeb] border-amber-200 text-amber-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    ต้องอ่าน
                  </button>

                  {/* urgent option */}
                  <button
                    onClick={() => setImportance('urgent')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      importance === 'urgent'
                        ? 'bg-[#fef2f2] border-red-200 text-red-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    ด่วน
                  </button>
                </div>
              </div>

              {/* Target Targets targets */}
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#002d73]">กลุ่มเป้าหมาย *</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'all', label: 'ทุกหน่วยงาน' },
                    { id: 'or', label: 'OR' },
                    { id: 'opd', label: 'OPD' },
                    { id: 'ipd', label: 'IPD' },
                    { id: 'doctor', label: 'แพทย์' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTargetGroup(item.id)}
                      className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold border transition ${
                        targetGroup === item.id
                          ? 'bg-blue-50 border-blue-200 text-[#175beb]'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publish date */}
              <label className="block text-[13px] font-semibold text-[#002d73]">
                วันที่เผยแพร่ *
                <div className="relative mt-2 max-w-[320px]">
                  <input
                    type="text"
                    value={publishDate}
                    onChange={e => setPublishDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-xs font-semibold text-slate-600 outline-none"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </label>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-6">
              {/* File upload header */}
              <div>
                <h3 className="text-[15px] font-bold text-[#002d73]">เอกสาร/ไฟล์แนบ (ถ้ามี)</h3>
                <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ .jpg .jpeg .png ขนาดไม่เกิน 5 MB</p>
              </div>

              {/* Upload box */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#175beb] mb-3">
                  <FileText size={24} />
                </span>
                <p className="text-sm font-bold text-slate-800">คลิกหรือลากไฟล์มาวางที่นี่</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">รองรับไฟล์ pdf, doc, docx, jpg, png ขนาดไม่เกิน 5 MB</p>
              </div>

              {/* Uploaded files section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">ไฟล์ที่อัปโหลด ({uploadedFiles.length} ไฟล์)</span>
                  <span className="text-slate-400">อัปโหลดล่าสุด 15 ม.ย. 2569, 10:20 น.</span>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[13px] font-sans font-medium">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                        <th className="px-4 py-3">ชื่อเอกสาร</th>
                        <th className="px-4 py-3">ประเภทไฟล์</th>
                        <th className="px-4 py-3">อัปโหลดโดย</th>
                        <th className="px-4 py-3">แผนก</th>
                        <th className="px-4 py-3">วันที่อัปโหลด</th>
                        <th className="px-4 py-3">ขนาด</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {uploadedFiles.map((file) => (
                        <tr key={file.id} className="h-14">
                          <td className="px-4 font-bold text-blue-600 flex items-center gap-2 h-14">
                            <FileText size={16} className="text-red-500" />
                            {file.name}
                          </td>
                          <td className="px-4 text-slate-400">{file.type}</td>
                          <td className="px-4 font-semibold text-slate-800">{file.owner}</td>
                          <td className="px-4 font-semibold text-slate-600">{file.dept}</td>
                          <td className="px-4 text-slate-400 text-xs">{file.date}</td>
                          <td className="px-4 text-slate-600">{file.size}</td>
                          <td className="px-4">
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-500 hover:text-red-700 p-1 transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extra input section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-[13px] font-bold text-[#002d73]">เอกสารประกอบเพิ่มเติม (ไม่บังคับ)</p>
                <label className="block text-[12px] font-semibold text-slate-600">
                  ลิงก์อ้างอิงเพิ่มเติม
                  <input
                    type="text"
                    value={refLink}
                    onChange={e => setRefLink(e.target.value)}
                    placeholder="ใส่ลิงก์ข้อมูลเพิ่มเติม..."
                    className="field mt-1.5"
                  />
                </label>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  สามารถใส่หลายลิงก์ โดยคั่นด้วยเครื่องหมายจุลภาค (,)
                </p>
              </div>

              {/* Publishing department section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-[13px] font-bold text-[#002d73]">หน่วยงานที่เผยแพร่</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-[12px] font-semibold text-slate-600">
                    แผนกผู้ดูแลติดตามคนไข้ *
                    <input
                      type="text"
                      value={pubDept1}
                      onChange={e => setPubDept1(e.target.value)}
                      className="field mt-1.5"
                    />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-600">
                    แผนกผู้ดูแลติดตามคนไข้ *
                    <input
                      type="text"
                      value={pubDept2}
                      onChange={e => setPubDept2(e.target.value)}
                      className="field mt-1.5"
                    />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-600">
                    ชื่อ-นามสกุลผู้รับผิดชอบ *
                    <input
                      type="text"
                      value={pubPerson}
                      onChange={e => setPubPerson(e.target.value)}
                      className="field mt-1.5"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-6">
              {/* Document details preview */}
              <div className="rounded-xl border border-slate-100 p-5 space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <BookOpen size={20} />
                  </span>
                  <div>
                    <h3 className="text-md font-bold text-slate-800 leading-snug">
                      แนวทางการป้องกันการติดเชื้อหลังผ่าตัดฉบับอัปเดต
                    </h3>
                    <div className="flex gap-2 mt-1.5">
                      <span className="inline-block rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                        ต้องอ่าน
                      </span>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        ทุกหน่วยงาน
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed font-semibold bg-slate-50/50 p-4 rounded-xl">
                  {shortDesc}
                </div>

                {/* Details editor mock container view */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600">รายละเอียดเนื้อหา *</p>
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <div className="bg-slate-50/50 border-b border-slate-200 px-3 py-2 flex gap-3 text-slate-400 text-xs font-bold select-none">
                      <span>Paragraph</span>
                      <span>B</span>
                      <span>I</span>
                      <span>U</span>
                    </div>
                    <div className="p-4 text-xs font-semibold text-slate-600 whitespace-pre-line leading-6">
                      {contentDetail}
                    </div>
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-1 text-right text-[10px] text-slate-400 font-bold">
                      อักขระ: 0
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded files section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">ไฟล์ที่อัปโหลด ({uploadedFiles.length} ไฟล์)</span>
                  <span className="text-slate-400">อัปโหลดล่าสุด 15 ม.ย. 2569, 10:20 น.</span>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[13px] font-sans font-medium">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                        <th className="px-4 py-3">ชื่อเอกสาร</th>
                        <th className="px-4 py-3">ประเภทไฟล์</th>
                        <th className="px-4 py-3">อัปโหลดโดย</th>
                        <th className="px-4 py-3">แผนก</th>
                        <th className="px-4 py-3">วันที่อัปโหลด</th>
                        <th className="px-4 py-3">ขนาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {uploadedFiles.map((file) => (
                        <tr key={file.id} className="h-14">
                          <td className="px-4 font-bold text-blue-600 flex items-center gap-2 h-14">
                            <FileText size={16} className="text-red-500" />
                            {file.name}
                          </td>
                          <td className="px-4 text-slate-400">{file.type}</td>
                          <td className="px-4 font-semibold text-slate-800">{file.owner}</td>
                          <td className="px-4 font-semibold text-slate-600">{file.dept}</td>
                          <td className="px-4 text-slate-400 text-xs">{file.date}</td>
                          <td className="px-4 text-slate-600">{file.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Extra reference links section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-[13px] font-bold text-[#002d73]">เอกสารประกอบเพิ่มเติม (ไม่บังคับ)</p>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400">ลิงก์อ้างอิงเพิ่มเติม</p>
                  <div className="rounded-xl border border-slate-150 p-4 text-xs font-semibold text-blue-600 bg-slate-50/20 break-all">
                    {refLink}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    สามารถใส่หลายลิงก์ โดยคั่นด้วยเครื่องหมายจุลภาค (,)
                  </p>
                </div>
              </div>

              {/* Publisher info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-[13px] font-bold text-[#002d73]">หน่วยงานที่เผยแพร่</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[12px] font-semibold text-slate-600">
                    แผนกผู้เผยแพร่ *
                    <input
                      type="text"
                      readOnly
                      value={pubDept2}
                      className="field mt-1.5 bg-slate-50/50 cursor-not-allowed"
                    />
                  </label>
                  <label className="block text-[12px] font-semibold text-slate-600">
                    ชื่อ-นามสกุลผู้รับผิดชอบ *
                    <input
                      type="text"
                      readOnly
                      value={pubPerson}
                      className="field mt-1.5 bg-slate-50/50 cursor-not-allowed"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
            <button
              onClick={handlePrevStep}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} />
              ย้อนกลับ
            </button>
            <div className="flex gap-2">
              {wizardStep === 2 && (
                <button
                  type="button"
                  onClick={() => { alert('บันทึกแบบร่างสำเร็จ!'); setIsCreating(false); }}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  บันทึกแบบร่าง
                </button>
              )}
              {wizardStep === 3 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 text-xs font-bold text-white transition"
                >
                  บันทึก/เผยแพร่ข่าวสาร
                </button>
              )}
              {wizardStep !== 3 && (
                <button
                  onClick={handleNextStep}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  ถัดไป
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

        </section>
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
          { label: 'ประกาศทั้งหมด', count: 128, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'เอกสารใหม่', count: 1248, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'ด่วน', count: 1248, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'ต้องอ่าน', count: 1248, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'อัปเดตสัปดาห์นี้', count: 36, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">{item.label}</p>
              <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.count.toLocaleString()} <span className="text-xs font-medium text-slate-400">รายการ</span></p>
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
            <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">
              ด่วน
            </span>
            <h3 className="text-[15px] font-bold text-slate-800 leading-6">แจ้งปิดปรับปรุงระบบชั่วคราว วันที่ 15 มิ.ย. 2569</h3>
            <p className="mt-1 text-slate-500 text-xs leading-relaxed font-semibold">
              ระบบ OR Surveillance จะปิดให้บริการเพื่อปรับปรุงระบบตั้งเเต่เวลา 22:00 - 02:00 น.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
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
            <span className="inline-block rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">
              ต้องอ่าน
            </span>
            <h3 className="text-[15px] font-bold text-slate-800 leading-6">แนวทางการป้องกันการติดเชื้อหลังผ่าตัด ฉบับอัปเดต</h3>
            <p className="mt-1 text-slate-500 text-xs leading-relaxed font-semibold">
              แนวทางการเฝ้าระวังเเละป้องกันภาวะแผลติดเชื้อหลังผ่าตัด โดยความร่วมมือระหว่างทีมแพทย์เเละ IC Nurse
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>ฝ่ายเทคโนโลยีสารสนเทศ 14 มิ.ย. 2569 16:30</span>
            <span className="text-slate-600">ทุกหน่วยงาน</span>
          </div>
        </div>
      </div>

      {/* Database Search Filter panel */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73] mb-4 border-b border-slate-50 pb-2">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูลข่าวสาร
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-600">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="h-[38px] w-full rounded-lg border border-slate-200 pl-10 pr-4 text-xs font-semibold text-slate-600"
              />
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">หมวดหมู่</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>ประกาศทั่วไป</option>
              <option>คู่มือ</option>
              <option>ข่าวสาร</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">ระดับความสำคัญ</label>
            <select
              value={importanceFilter}
              onChange={e => setImportanceFilter(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>ปกติ</option>
              <option>ต้องอ่าน</option>
              <option>ด่วน</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">หน่วยงาน</label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>เทคโนโลยีสารสนเทศ</option>
              <option>คณะกรรมการ</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-600">สถานะการอ่าน</label>
            <select
              value={readStatus}
              onChange={e => setReadStatus(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>อ่านแล้ว</option>
              <option>ยังไม่ได้อ่าน</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1 text-[13px] font-semibold text-slate-600">
            คำค้นหา
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหา หัวข้อ, เนื้อหา, หน่วยงาน..."
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#175beb]"
            />
          </label>
          <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 transition">
            ค้นหา
          </button>
          <button
            onClick={() => { setSearchQuery(''); setCategory('ทั้งหมด'); setImportanceFilter('ทั้งหมด'); }}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      {/* Section Title */}
      <h2 className="text-[18px] font-bold text-[#002d73] mt-4">รายการข่าวสารและเอกสาร</h2>

      {/* Documents table list card */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-[#002d73]">ผลการค้นหา ({filteredDocs.length} รายการ)</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary h-9"
          >
            <Plus size={14} /> เพิ่มข่าวสาร
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans border-collapse">
            <thead className="h-[46px] bg-[#f8fafc] font-bold text-[#1e293b]">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left">วันที่อัปเดตล่าสุด</th>
                <th className="px-4 py-3 text-left">หัวข้อ</th>
                <th className="px-4 py-3 text-left">ประเภท</th>
                <th className="px-4 py-3 text-left">หน่วยงานเจ้าของเอกสาร</th>
                <th className="px-4 py-3 text-left">ความสำคัญ</th>
                <th className="px-4 py-3 text-left">ผู้ชม</th>
                <th className="px-6 py-3 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((row) => (
                <tr key={row.id} className="h-[64px] hover:bg-slate-50/60 transition">
                  <td className="px-6 text-slate-500 font-semibold text-xs">{row.date}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => setSelectedDocId(row.id)}
                        className="font-bold text-[#175beb] hover:underline cursor-pointer"
                      >
                        {row.title}
                      </span>
                      {row.isNew && (
                        <span className="inline-flex rounded bg-blue-100 text-[10px] font-bold px-1.5 py-0.5 text-blue-700 uppercase tracking-wide">
                          ใหม่
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 font-bold text-slate-800">{row.type}</td>
                  <td className="px-4 text-slate-600 font-bold">{row.owner}</td>
                  <td className="px-4">
                    {row.importance === 'ด่วน' && <span className="text-red-500 font-bold">{row.importance}</span>}
                    {row.importance === 'ต้องอ่าน' && <span className="text-amber-500 font-bold">{row.importance}</span>}
                    {row.importance === 'ปกติ' && <span className="text-emerald-600 font-bold">{row.importance}</span>}
                  </td>
                  <td className="px-4 text-slate-500 font-semibold text-xs">{row.target}</td>
                  <td className="px-6 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                      <MoreVertical size={16} />
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

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <CalendarDays size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  )
}
