import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import CaseDetailPage from './pages/CaseDetailPage.jsx'
import CreateFollowUpPage from './pages/CreateFollowUpPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistryPage from './pages/RegistryPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import UserManagementPage from './pages/UserManagementPage.jsx'
import RisEntryPage from './pages/RisEntryPage.jsx'
import RisOperationsPage from './pages/RisOperationsPage.jsx'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

function GlobalWebAlert() {
  const [notice, setNotice] = useState(null)
  useEffect(() => {
    const nativeAlert = window.alert
    let timer
    window.alert = (message) => {
      const text = String(message || '')
      const error = /ไม่สำเร็จ|ผิดพลาด|กรุณา|เกิน|ไม่พบ|error|failed/i.test(text)
      setNotice({ text, error })
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setNotice(null), 4000)
    }
    return () => { window.alert = nativeAlert; window.clearTimeout(timer) }
  }, [])
  if (!notice) return null
  return <div className={`fixed left-1/2 top-4 z-[200] flex w-[min(92vw,520px)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${notice.error ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-600'}`}>{notice.error ? <XCircle size={20}/> : <CheckCircle2 size={20}/>}<span className="flex-1 text-[13px] font-medium">{notice.text}</span><button onClick={() => setNotice(null)} className="text-slate-400"><X size={17}/></button></div>
}

function ProtectedLayout() {
  const isAuthenticated = sessionStorage.getItem('or-smart-auth') === 'true'
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <><GlobalWebAlert /><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ris-entry" element={<RisEntryPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<ProtectedLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="or-validation" element={<RegistryPage type="validation" />} />
        <Route path="opd-queue" element={<RegistryPage type="opd" />} />
        <Route path="ipd-queue" element={<RegistryPage type="ipd" />} />
        <Route path="my-follow-ups" element={<RegistryPage type="followUp" />} />
        <Route path="history" element={<RegistryPage type="history" />} />
        <Route path="suspected-ssi" element={<RegistryPage type="suspected" />} />
        <Route path="confirmed-ssi" element={<RegistryPage type="confirmed" />} />
        <Route path="doctor-review" element={<RegistryPage type="doctor" />} />
        <Route path="notifications" element={<RegistryPage type="notifications" />} />
        <Route path="central-search" element={<RegistryPage type="search" />} />
        <Route path="his-sync" element={<RegistryPage type="sync" />} />
        <Route path="ris-operations" element={<RisOperationsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="cases/:id/create-follow-up" element={<CreateFollowUpPage />} />
        <Route path="follow-ups/:id" element={<CaseDetailPage />} />
        <Route path="suspected-cases/:id" element={<Navigate to="info" replace />} />
        <Route path="suspected-cases/:id/:subtab" element={<CaseDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes></>
  )
}

export default App
