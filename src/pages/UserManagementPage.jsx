import { CalendarDays, Edit2, LogIn, Search, UserCheck, UserMinus, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState('ทั้งหมด')
  const [deptFilter, setDeptFilter] = useState('ทั้งหมด')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRoleTab, setActiveRoleTab] = useState('ทั้งหมด')

  // User table rows
  const [usersList, setUsersList] = useState([
    { id: 1, order: 1, name: 'เจ้าหน้าที่ A นามสกุล', email: 'Admin@bh.com', role: 'Admin', dept: 'เทคโนโลยีสารสนเทศ', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 2, order: 2, name: 'เจ้าหน้าที่ B นามสกุล', email: 'NURSE@bh.com', role: 'OPD NURSE', dept: 'ผู้ป่วยนอก', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 3, order: 3, name: 'เจ้าหน้าที่ C นามสกุล', email: 'N@bh.com', role: 'IPD NURSE', dept: 'ผู้ป่วยใน', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 4, order: 4, name: 'เจ้าหน้าที่ D นามสกุล', email: 'N@bh.com', role: 'PHYSICIAN', dept: 'ศัลยกรรม', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 5, order: 5, name: 'เจ้าหน้าที่ F นามสกุล', email: 'N@bh.com', role: 'OR STAFF', dept: 'เทคโนโลยีสารสนเทศ', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 6, order: 6, name: 'เจ้าหน้าที่ G นามสกุล', email: 'CEO@bh.com', role: 'VIEWER', dept: 'เจ้าหน้าที่ระดับสูง', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 7, order: 7, name: 'เจ้าหน้าที่ H นามสกุล', email: 'N@bh.com', role: 'OPD NURSE', dept: 'ผู้ป่วยนอก', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' },
    { id: 8, order: 8, name: 'เจ้าหน้าที่ I นามสกุล', email: 'N@bh.com', role: 'IPD NURSE', dept: 'ผู้ป่วยใน', status: 'ใช้งานอยู่', lastLogin: '15/06/2569 09:15' }
  ])

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (roleFilter !== 'ทั้งหมด' && user.role !== roleFilter) return false
    if (deptFilter !== 'ทั้งหมด' && user.dept !== deptFilter) return false
    if (statusFilter !== 'ทั้งหมด' && user.status !== statusFilter) return false
    if (activeRoleTab !== 'ทั้งหมด' && user.role.toUpperCase() !== activeRoleTab.toUpperCase()) return false
    return matchesSearch
  })

  const rolePills = [
    { label: 'Admin', count: 8, color: 'bg-blue-50 text-blue-700' },
    { label: 'OR STAFF', count: 24, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'OPD NURSE', count: 38, color: 'bg-rose-50 text-rose-700' },
    { label: 'IPD NURSE', count: 32, color: 'bg-sky-50 text-sky-700' },
    { label: 'PHYSICIAN', count: 18, color: 'bg-amber-50 text-amber-700' },
    { label: 'VIEWER', count: 2, color: 'bg-slate-100 text-slate-700' }
  ]

  const getRoleStyle = (role) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'text-blue-700 font-bold'
      case 'OPD NURSE': return 'text-rose-500 font-bold'
      case 'IPD NURSE': return 'text-sky-600 font-bold'
      case 'PHYSICIAN': return 'text-amber-500 font-bold'
      case 'OR STAFF': return 'text-emerald-600 font-bold'
      default: return 'text-slate-600 font-bold'
    }
  }

  const handleAddUser = () => {
    const name = prompt('กรอกชื่อผู้ใช้งาน:')
    if (!name) return
    const email = prompt('กรอกอีเมล:')
    if (!email) return
    const role = prompt('กรอกบทบาท (เช่น Admin, OPD NURSE, IPD NURSE, PHYSICIAN, OR STAFF, VIEWER):', 'OPD NURSE')
    if (!role) return
    const dept = prompt('กรอกแผนก:', 'ผู้ป่วยนอก')
    if (!dept) return

    const newUser = {
      id: Date.now(),
      order: usersList.length + 1,
      name,
      email,
      role,
      dept,
      status: 'ใช้งานอยู่',
      lastLogin: '15/06/2569 09:30'
    }
    setUsersList([...usersList, newUser])
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="จัดการผู้ใช้งาน"
        description="กำหนดบัญชี บทบาท และสิทธิ์ตามโครงสร้างองค์กร"
      />

      {/* Top 4 summaries cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ผู้ใช้งานทั้งหมด</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">156 <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-slate-400 text-xs font-bold">ทั้งหมดในระบบ</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={20} />
          </span>
        </div>

        {/* Active Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ใช้งานอยู่</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">142 <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-emerald-500 text-xs font-bold">คิดเป็น 91.0%</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck size={20} />
          </span>
        </div>

        {/* Inactive Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ถูกปิดใช้งาน</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">14 <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-orange-500 text-xs font-bold">คิดเป็น 9.0%</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
            <UserMinus size={20} />
          </span>
        </div>

        {/* Logged in today */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">เข้าใช้งานวันนี้</p>
            <p className="mt-2 text-2xl font-bold text-[#175beb]">87 <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-slate-400 text-xs font-bold">อัปเดต ณ 09:30 น.</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <LogIn size={20} />
          </span>
        </div>
      </section>

      {/* Search panel */}
      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#002d73] mb-4">
          <Search size={19} className="text-[#175beb]" />
          ค้นหาข้อมูล
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] font-semibold text-slate-600">บทบาท</label>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>Admin</option>
              <option>OPD NURSE</option>
              <option>IPD NURSE</option>
              <option>PHYSICIAN</option>
              <option>OR STAFF</option>
              <option>VIEWER</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">แผนก</label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>เทคโนโลยีสารสนเทศ</option>
              <option>ผู้ป่วยนอก</option>
              <option>ผู้ป่วยใน</option>
              <option>ศัลยกรรม</option>
              <option>เจ้าหน้าที่ระดับสูง</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">สถานะ</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600 font-semibold"
            >
              <option>ทั้งหมด</option>
              <option>ใช้งานอยู่</option>
              <option>ปิดใช้งาน</option>
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
              placeholder="ค้นหาชื่อผู้ใช้งาน, อีเมล..."
              className="mt-1 h-[38px] w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#175beb]"
            />
          </label>
          <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 transition">
            ค้นหา
          </button>
          <button
            onClick={() => { setSearchQuery(''); setRoleFilter('ทั้งหมด'); setDeptFilter('ทั้งหมด'); setStatusFilter('ทั้งหมด'); setActiveRoleTab('ทั้งหมด'); }}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      {/* Role Tabs buttons row */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveRoleTab('ทั้งหมด')}
          className={`inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
            activeRoleTab === 'ทั้งหมด' ? 'bg-[#002d73] text-white border-[#002d73]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
            activeRoleTab === 'ทั้งหมด' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}>156</span>
        </button>

        {rolePills.map(pill => (
          <button
            key={pill.label}
            onClick={() => setActiveRoleTab(pill.label)}
            className={`inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
              activeRoleTab === pill.label ? 'bg-[#002d73] text-white border-[#002d73]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{pill.label}</span>
            <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              activeRoleTab === pill.label ? 'bg-white/20 text-white' : pill.color
            }`}>{pill.count}</span>
          </button>
        ))}
      </div>

      {/* Table Card Results */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <header className="flex h-[72px] items-center justify-between px-6 border-b border-slate-100">
          <h2 className="text-[16px] font-bold text-[#002d73]">เจ้าหน้าที่ในระบบ</h2>
          <button
            onClick={handleAddUser}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 text-xs font-bold hover:bg-blue-700 transition"
          >
            <UserPlus size={14} /> เพิ่มผู้ใช้งาน
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-[13px] text-[#434651] font-sans border-collapse">
            <thead className="h-[46px] bg-[#f8fafc] font-bold text-[#1e293b]">
              <tr className="border-b border-slate-100">
                <th className="px-4 text-left w-12"><input type="checkbox" /></th>
                <th className="px-4 text-left">ลำดับ</th>
                <th className="px-4 text-left">USERNAME / ชื่อผู้ใช้งาน</th>
                <th className="px-4 text-left">EMAIL / อีเมล</th>
                <th className="px-4 text-left">ROLE / บทบาท</th>
                <th className="px-4 text-left">DEPARTMENT/ แผนก</th>
                <th className="px-4 text-left">STATUS/ สถานะ</th>
                <th className="px-4 text-left">LAST LOGIN</th>
                <th className="px-6 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((row) => (
                <tr key={row.id} className="h-[64px] hover:bg-slate-50/60 transition">
                  <td className="px-4"><input type="checkbox" /></td>
                  <td className="px-4 font-bold text-slate-400">{row.order}</td>
                  <td className="px-4 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 text-slate-500 font-semibold">{row.email}</td>
                  <td className="px-4">
                    <span className={getRoleStyle(row.role)}>{row.role}</span>
                  </td>
                  <td className="px-4 font-bold text-slate-600">{row.dept}</td>
                  <td className="px-4">
                    <span className="inline-flex rounded bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600 font-bold border border-emerald-100">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 text-slate-400 text-xs font-semibold">{row.lastLogin}</td>
                  <td className="px-6 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-[#175beb] hover:bg-slate-50 transition">
                      <Edit2 size={13} />
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
