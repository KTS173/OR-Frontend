import { useMemo, useState } from 'react'
import { 
  Calendar, 
  Phone, 
  PhoneOff, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  UserCheck, 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  User,
  Plus
} from 'lucide-react'
import MetricCard from '../components/ui/MetricCard.jsx'
import { useApiQuery } from '../hooks/useApiQuery.js'
import { api } from '../services/api.js'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const { data: patients } = useApiQuery(api.getPatients)
  const [activeViewMode, setActiveViewMode] = useState('month'); // 'week' | 'month'

  const statCards = [
    { label: 'เคสทั้งหมด', value: String(patients.length), unit: 'คน', tone: 'green', subtext: 'ข้อมูลจากฐานข้อมูล' },
    { label: 'เคส OPD', value: String(patients.filter((item) => item.patientType === 'opd').length), unit: 'คน', tone: 'blue', subtext: 'ข้อมูลจากฐานข้อมูล' },
    { label: 'เคส IPD', value: String(patients.filter((item) => item.patientType === 'ipd').length), unit: 'คน', tone: 'orange', subtext: 'ข้อมูลจากฐานข้อมูล' },
    { label: 'ดำเนินการเสร็จ', value: String(patients.filter((item) => item.status === 'COMPLETED').length), unit: 'คน', tone: 'green', subtext: 'ข้อมูลจากฐานข้อมูล' },
    { label: 'เคสฉุกเฉิน', value: String(patients.filter((item) => item.urgency === 'EMERGENCY').length), unit: 'คน', tone: 'red', subtext: 'ข้อมูลจากฐานข้อมูล' },
  ];

  const calendarDays = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const counts = new Map()
    patients.forEach((item) => {
      const value = item.startAt || item.episodeDate
      if (!value) return
      const date = new Date(value)
      if (date.getFullYear() === year && date.getMonth() === month) counts.set(date.getDate(), (counts.get(date.getDate()) || 0) + 1)
    })
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1
      return { day: day > 0 && day <= daysInMonth ? day : '', count: counts.get(day) || null, isCurrentMonth: day > 0 && day <= daysInMonth, isSelected: day === selectedDate }
    })
  }, [patients, selectedDate]);

  const dotColors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
  };

  const patientsList = patients.filter((item) => {
    const value = item.startAt || item.episodeDate
    return value && new Date(value).getDate() === selectedDate
  }).map((item) => ({
    name: item.name,
    hn: item.id,
    date: item.startAt || item.episodeDate || '-',
    phone: '-',
    staff: item.surgeon || '-',
    round: item.status || '-',
    day: item.patientType?.toUpperCase() || '-'
  }));

  return (
    <div className="flex flex-col gap-6 text-left pb-10">

      {/* Top Stat Cards Section */}
      <div className="grid grid-cols-5 gap-4">
        {statCards.map((m, idx) => (
          <MetricCard key={idx} {...m} dashboard />
        ))}
      </div>

      {/* Search Filters Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#002d73] border-b border-slate-100 pb-3">
          <Search size={16} />
          ค้นหาข้อมูล
        </h3>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">เลือกช่วงวันที่</label>
            <div className="relative mt-1">
              <input 
                type="text" 
                className="form-input text-[13px] h-9 py-1 pr-9" 
                defaultValue="12 พ.ค. 2567 - 18 พ.ค. 2567" 
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">แผนก</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">หัตถการ</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">รอบการติดตาม</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">ระดับความเสี่ยง</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>

          <div className="form-group text-left">
            <label className="text-[12px] font-medium text-slate-500">สถานะ</label>
            <select className="form-select mt-1 text-[13px] h-9 py-1">
              <option>ทั้งหมด</option>
            </select>
          </div>

          <div className="form-group text-left md:col-span-2">
            <label className="text-[12px] font-medium text-slate-500">คำค้นหา</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                className="form-input text-[13px] h-9 py-1 flex-1" 
                placeholder="ค้นหา HN, ชื่อผู้ป่วย, หัตถการ..." 
              />
              <button className="rounded-lg bg-[#175beb] px-5 text-[13px] font-medium text-white shadow-sm hover:bg-blue-700 flex items-center gap-1.5 shrink-0">
                <Search size={14} />
                ค้นหา
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shrink-0">
                <RotateCcw size={14} />
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Patient Task List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Calendar (7 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-[17px] font-semibold text-slate-800">มิถุนายน 2569</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveViewMode('week')}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${activeViewMode === 'week' ? 'bg-[#175beb] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                สัปดาห์
              </button>
              <button 
                onClick={() => setActiveViewMode('month')}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${activeViewMode === 'month' ? 'bg-[#175beb] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                เดือน
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l border-t border-slate-200/60 rounded-lg overflow-hidden">
            {/* Days of week header */}
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/80 border-r border-b border-slate-200/60 py-2.5 text-center text-[13.5px] font-medium text-slate-500"
              >
                {day}
              </div>
            ))}

            {/* Calendar Cells */}
            {calendarDays.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => item.isCurrentMonth && setSelectedDate(item.day)}
                className={`min-h-[75px] p-2 border-r border-b border-slate-200/60 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50/50 ${
                  !item.isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'bg-white'
                } ${item.isSelected ? 'ring-2 ring-[#175beb] ring-inset relative z-10' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[12.5px] font-medium ${
                    item.isSelected ? 'text-[#175beb] font-semibold' : 'text-slate-600'
                  }`}>
                    {item.day}
                  </span>
                  
                  {/* Highlight dots if any */}
                  {item.dots && (
                    <div className="flex gap-0.5 mt-0.5">
                      {item.dots.map((dot, dIdx) => (
                        <span key={dIdx} className={`w-1.5 h-1.5 rounded-full ${dotColors[dot] || 'bg-slate-400'}`}></span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day Count Badge */}
                {item.count !== null && (
                  <div className="mt-1">
                    <span className={`inline-block w-full text-center py-1 px-1.5 rounded text-[11px] font-medium ${
                      item.isSelected 
                        ? 'bg-[#175beb] text-white' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {item.count} ราย
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calendar Dots Legend */}
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[12px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Day 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Day 7</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Day 14</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Day 21</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>Day 28</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>Day 30</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Day 60</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Day 90</span>
            </div>
          </div>
        </div>

        {/* Right Side: Daily Tasks (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
                รายการงานวันนี้
                <span className="text-[12px] text-slate-400">({selectedDate} มิ.ย. 2569)</span>
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#175beb]">
                28 เคส
              </span>
            </div>

            {/* Patients list */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {patientsList.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-left text-[12.5px] transition-all hover:border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-[14px] text-slate-800">{p.name}</strong>
                      <span className="text-[11px] text-slate-400 ml-2 font-medium">{p.hn}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-blue-600 font-semibold block">{p.round}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{p.day}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">เวลานัดหมาย</span>
                      <strong className="font-medium text-slate-700">{p.date}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">เบอร์โทรศัพท์</span>
                      <strong className="font-medium text-slate-700">{p.phone}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">ผู้รับผิดชอบ</span>
                      <strong className="font-medium text-slate-700">{p.staff}</strong>
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button className="rounded-lg bg-[#175beb] px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                      เริ่มติดตาม
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View all link */}
          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-end">
            <a href="#" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#175beb] hover:underline">
              ดูงานทั้งหมด
              <ArrowRight size={14} />
            </a>
          </div>

        </div>

      </div>

      {/* Notice Banner */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3.5 text-left text-[12.5px] text-blue-700 flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <span>15 มิ.ย. 2569: ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.</span>
      </div>
    </div>
  );
}
