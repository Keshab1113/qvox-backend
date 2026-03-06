import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Login from '../src/pages/Login'
import Dashboard from './pages/Dashboard'
import Transcribe from './pages/Transcribe'
import ApiKeys from './pages/ApiKeys'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transcribe" element={<Transcribe />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics/>} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App