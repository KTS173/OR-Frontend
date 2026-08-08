import { Database, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))
}

export default function RisOperationsPage() {
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadOperations = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOperations(await api.getOperations())
    } catch (reason) {
      setError(reason.message || 'ไม่สามารถโหลดข้อมูลจาก backend ได้')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.getOperations()
      .then((data) => active && setOperations(data))
      .catch((reason) => active && setError(reason.message || 'ไม่สามารถโหลดข้อมูลจาก backend ได้'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return operations
    return operations.filter((item) => [
      item.hn, item.first_name, item.last_name, item.operation_no,
      item.procedure_name, item.surgeon, item.operation_department,
    ].some((value) => String(value ?? '').toLowerCase().includes(keyword)))
  }, [operations, search])

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#002d73]"><Database size={24} />ข้อมูลการผ่าตัดจาก RIS</h1>
          <p className="mt-1 text-sm text-slate-500">ข้อมูลที่ extension ส่งเข้า PostgreSQL ผ่าน backend</p>
        </div>
        <button onClick={loadOperations} disabled={loading} className="btn-secondary h-10 px-4 disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm" placeholder="ค้นหา HN, ชื่อผู้ป่วย, เลขที่ผ่าตัด, หัตถการ หรือแพทย์" />
        </label>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">เชื่อมต่อ backend ไม่สำเร็จ: {error} — ตรวจสอบว่า OR-Test backend ทำงานที่ port 4000</div>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600"><tr>{['Operation No.', 'HN', 'ชื่อผู้ป่วย', 'หัตถการ', 'แผนก', 'ศัลยแพทย์', 'ห้องผ่าตัด', 'สถานะ', 'เวลารับข้อมูล'].map((title) => <th key={title} className="px-4 py-3">{title}</th>)}</tr></thead>
            <tbody>
              {loading && <tr><td colSpan="9" className="px-4 py-12 text-center text-slate-500">กำลังโหลดข้อมูลจาก backend...</td></tr>}
              {!loading && !filtered.length && <tr><td colSpan="9" className="px-4 py-12 text-center text-slate-500">ยังไม่มีข้อมูลการผ่าตัด</td></tr>}
              {!loading && filtered.map((item) => (
                <tr key={item.id ?? item.operation_no} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-4 font-semibold text-blue-600">{item.operation_no || '-'}</td>
                  <td className="px-4 py-4">{item.hn || '-'}</td>
                  <td className="px-4 py-4 font-medium">{[item.first_name, item.last_name].filter(Boolean).join(' ') || '-'}</td>
                  <td className="max-w-[240px] px-4 py-4">{item.procedure_name || '-'}</td>
                  <td className="px-4 py-4">{item.operation_department || '-'}</td>
                  <td className="px-4 py-4">{item.surgeon || '-'}</td>
                  <td className="px-4 py-4">{item.operating_room || '-'}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{item.status || 'ไม่ระบุ'}</span></td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{formatDateTime(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">แสดง {filtered.length} จาก {operations.length} รายการ</footer>
      </section>
    </div>
  )
}
