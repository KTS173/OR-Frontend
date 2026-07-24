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

function ProtectedLayout() {
  const isAuthenticated = sessionStorage.getItem('or-smart-auth') === 'true'
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="cases/:id/create-follow-up" element={<CreateFollowUpPage />} />
        <Route path="follow-ups/:id" element={<CaseDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
