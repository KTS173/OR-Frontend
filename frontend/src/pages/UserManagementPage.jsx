import { Edit2, LogIn, Save, Search, Trash2, UserCheck, UserMinus, UserPlus, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

const roleLabels = {
  ADMIN: 'Admin', OR: 'OR STAFF', OPD: 'OPD NURSE', IPD: 'IPD NURSE',
  DOCTOR: 'PHYSICIAN', PHYSICIAN: 'PHYSICIAN', VIEWER: 'VIEWER'
}

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState('ทั้งหมด')
  const [deptFilter, setDeptFilter] = useState('ทั้งหมด')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRoleTab, setActiveRoleTab] = useState('ทั้งหมด')
  const [editor, setEditor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notice, setNotice] = useState('')

  // User table rows
  const [usersList, setUsersList] = useState([])

  const loadUsers = () => api.getUsers().then((rows) => setUsersList(rows.map((user, index) => ({
      ...user, roleRaw: user.role, role: roleLabels[String(user.role || '').toUpperCase()] || user.role,
      order: index + 1, dept: user.department || '-',
      status: user.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ปิดใช้งาน',
      lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleString('th-TH') : '-'
    })))).catch((error) => setNotice(error.message))
  useEffect(() => { loadUsers() }, [])

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (roleFilter !== 'ทั้งหมด' && user.role !== roleFilter) return false
    if (deptFilter !== 'ทั้งหมด' && user.dept !== deptFilter) return false
    if (statusFilter !== 'ทั้งหมด' && user.status !== statusFilter) return false
    if (activeRoleTab !== 'ทั้งหมด' && user.role.toUpperCase() !== activeRoleTab.toUpperCase()) return false
    return matchesSearch
  })

  const rolePills = [
    { 
      label: 'Admin', 
      count: 0,
      inactiveClass: 'bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-50',
      activeClass: 'bg-blue-600 text-white border-blue-600'
    },
    { 
      label: 'OR STAFF', 
      count: 0, 
      inactiveClass: 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50',
      activeClass: 'bg-emerald-600 text-white border-emerald-600'
    },
    { 
      label: 'OPD NURSE', 
      count: 0, 
      inactiveClass: 'bg-rose-50/50 border-rose-200 text-rose-700 hover:bg-[#fff1f2]',
      activeClass: 'bg-rose-600 text-white border-rose-600'
    },
    { 
      label: 'IPD NURSE', 
      count: 0, 
      inactiveClass: 'bg-indigo-50/50 border-indigo-200 text-indigo-700 hover:bg-indigo-50',
      activeClass: 'bg-indigo-600 text-white border-indigo-600'
    },
    { 
      label: 'PHYSICIAN', 
      count: 0, 
      inactiveClass: 'bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-50',
      activeClass: 'bg-amber-600 text-white border-amber-600'
    },
    { 
      label: 'VIEWER', 
      count: 0, 
      inactiveClass: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/50',
      activeClass: 'bg-slate-600 text-white border-slate-600'
    }
  ]
  const visibleRolePills = rolePills.filter(pill => usersList.some(user => user.role.toUpperCase() === pill.label.toUpperCase()))
  const loggedInToday = usersList.filter(user => {
    if (!user.last_login_at) return false
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
    const loginDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(user.last_login_at))
    return loginDate === today
  }).length

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

  const handleAddUser = async () => {
    setEditor({ title: 'เพิ่มผู้ใช้งาน', values: { name: '', email: '', role: 'OPD', department: '', status: 'ACTIVE', password: '' } })
  }

  const handleEditUser = user => setEditor({ id: user.id, title: 'แก้ไขผู้ใช้งาน', values: { name: user.name, email: user.email, role: user.roleRaw, department: user.dept === '-' ? '' : user.dept, status: user.status === 'ใช้งานอยู่' ? 'ACTIVE' : 'INACTIVE' } })
  const updateEditor = (key, value) => setEditor(current => ({ ...current, values: { ...current.values, [key]: value } }))
  const saveUser = async () => {
    if (!editor.values.name.trim() || !editor.values.email.trim() || !editor.values.role) return
    try {
      if (editor.id) await api.updateUser(editor.id, editor.values)
      else await api.createUser(editor.values)
      setEditor(null); await loadUsers(); setNotice('บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว')
    } catch (error) { setNotice(error.message) }
  }
  const deleteUser = async () => {
    try { await api.deleteUser(deleteTarget.id); setDeleteTarget(null); await loadUsers(); setNotice('ลบผู้ใช้งานเรียบร้อยแล้ว') }
    catch (error) { setDeleteTarget(null); setNotice(error.message) }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top 4 summaries cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#175beb] uppercase">ผู้ใช้งานทั้งหมด</p>
            <p className="mt-2 text-2xl font-bold text-[#175beb]">{usersList.length} <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-slate-400 text-xs font-bold">ทั้งหมดในระบบ</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#175beb]">
            <Users size={20} />
          </span>
        </div>

        {/* Active Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#10b981] uppercase">ใช้งานอยู่</p>
            <p className="mt-2 text-2xl font-bold text-[#10b981]">{usersList.filter(user => user.status === 'ใช้งานอยู่').length} <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-emerald-500 text-xs font-bold">คิดเป็น {usersList.length ? ((usersList.filter(user => user.status === 'ใช้งานอยู่').length / usersList.length) * 100).toFixed(1) : '0.0'}%</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-[#10b981]">
            <UserCheck size={20} />
          </span>
        </div>

        {/* Inactive Users */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#f59e0b] uppercase">ถูกปิดใช้งาน</p>
            <p className="mt-2 text-2xl font-bold text-[#f59e0b]">{usersList.filter(user => user.status !== 'ใช้งานอยู่').length} <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-orange-500 text-xs font-bold">คิดเป็น {usersList.length ? ((usersList.filter(user => user.status !== 'ใช้งานอยู่').length / usersList.length) * 100).toFixed(1) : '0.0'}%</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[#f59e0b]">
            <UserMinus size={20} />
          </span>
        </div>

        {/* Logged in today */}
        <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase">เข้าใช้งานวันนี้</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">{loggedInToday} <span className="text-xs font-medium text-slate-400">คน</span></p>
            <p className="mt-1 text-slate-400 text-xs font-bold">อ้างอิงจากประวัติเข้าสู่ระบบจริง</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
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
              {[...new Set(usersList.map(user => user.role))].map(role => <option key={role}>{role}</option>)}
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
              {[...new Set(usersList.map(user => user.dept).filter(dept => dept && dept !== '-'))].map(dept => <option key={dept}>{dept}</option>)}
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
          }`}>{usersList.length}</span>
        </button>

        {visibleRolePills.map(pill => {
          const isSelected = activeRoleTab === pill.label;
          return (
            <button
              key={pill.label}
              onClick={() => setActiveRoleTab(pill.label)}
              className={`inline-flex items-center justify-between gap-3 px-4 py-2 rounded-xl border text-xs font-bold transition ${
                isSelected 
                  ? pill.activeClass 
                  : pill.inactiveClass
              }`}
            >
              <span>{pill.label}</span>
              <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-white/60 text-current'
              }`}>{usersList.filter(user => user.role.toUpperCase() === pill.label.toUpperCase()).length}</span>
            </button>
          );
        })}
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
                  <td className="px-4 font-bold text-slate-400">{row.order}</td>
                  <td className="px-4 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 text-slate-500 font-semibold">{row.email}</td>
                  <td className="px-4">
                    <span className={getRoleStyle(row.role)}>{row.role}</span>
                  </td>
                  <td className="px-4 font-bold text-slate-600">{row.dept}</td>
                  <td className="px-4">
                    <span className={`inline-flex rounded px-2.5 py-0.5 text-xs font-bold border ${row.status === 'ใช้งานอยู่' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 text-slate-400 text-xs font-semibold">{row.lastLogin}</td>
                  <td className="px-6 text-right"><div className="flex justify-end gap-1">
                    <button onClick={() => handleEditUser(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition" aria-label={`แก้ไข ${row.name}`}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition" aria-label={`ลบ ${row.name}`}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex h-[46px] items-center border-t border-slate-200 px-6 text-[13px] text-slate-500 font-sans">
          <span>แสดง {filteredUsers.length} รายการ</span>
        </footer>
      </section>

      {editor && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setEditor(null)}><div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}><div className="flex items-center justify-between border-b px-6 py-5"><h3 className="text-lg font-semibold">{editor.title}</h3><button onClick={() => setEditor(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={20} /></button></div><div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">ชื่อผู้ใช้งาน <span className="text-red-500">*</span><input autoFocus className="field mt-2" value={editor.values.name} onChange={event => updateEditor('name', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">อีเมล <span className="text-red-500">*</span><input type="email" className="field mt-2" value={editor.values.email} disabled={Boolean(editor.id)} onChange={event => updateEditor('email', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">บทบาท <span className="text-red-500">*</span><select className="field mt-2" value={editor.values.role} onChange={event => updateEditor('role', event.target.value)}>{Object.entries({ ADMIN: 'Admin', OR: 'OR STAFF', OPD: 'OPD NURSE', IPD: 'IPD NURSE', DOCTOR: 'PHYSICIAN', VIEWER: 'VIEWER' }).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">แผนก<input className="field mt-2" value={editor.values.department} onChange={event => updateEditor('department', event.target.value)} /></label>
        {!editor.id && <label className="text-sm font-medium text-slate-700">รหัสผ่าน<input type="password" className="field mt-2" value={editor.values.password} onChange={event => updateEditor('password', event.target.value)} placeholder="หากไม่ระบุ ระบบจะใช้ค่าเริ่มต้น" /></label>}
        <label className="text-sm font-medium text-slate-700">สถานะ<select className="field mt-2" value={editor.values.status} onChange={event => updateEditor('status', event.target.value)}><option value="ACTIVE">ใช้งานอยู่</option><option value="INACTIVE">ปิดใช้งาน</option></select></label>
      </div><div className="flex justify-end gap-3 border-t px-6 py-4"><button className="btn-secondary" onClick={() => setEditor(null)}>ยกเลิก</button><button className="btn-primary" onClick={saveUser}><Save size={15} />บันทึก</button></div></div></div>}

      {deleteTarget && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setDeleteTarget(null)}><div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onMouseDown={event => event.stopPropagation()}><span className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-500"><Trash2 size={25} /></span><h3 className="mt-4 text-lg font-semibold">ยืนยันการลบผู้ใช้งาน</h3><p className="mt-2 text-sm text-slate-500">ต้องการลบ “{deleteTarget.name}” ออกจากระบบหรือไม่</p><div className="mt-6 flex gap-3"><button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>ยกเลิก</button><button className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={deleteUser}>ลบข้อมูล</button></div></div></div>}

      {notice && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={() => setNotice('')}><div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onMouseDown={event => event.stopPropagation()}><UserCheck className="mx-auto text-emerald-500" size={44} /><p className="mt-4 text-sm text-slate-700">{notice}</p><button className="btn-primary mt-5 w-full" onClick={() => setNotice('')}>ตกลง</button></div></div>}
    </div>
  )
}
