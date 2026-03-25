import { Component } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'sans-serif', flexDirection:'column', gap:'16px', padding:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'48px' }}>⚠️</div>
          <h2 style={{ color:'#1e1e2e', margin:0 }}>Error en la aplicación</h2>
          <pre style={{ background:'#f1f5f9', padding:'16px', borderRadius:'12px', fontSize:'12px', maxWidth:'600px', overflow:'auto', textAlign:'left', color:'#dc2626' }}>
            {this.state.error.message}
            {'\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Therapist pages
import TherapistHome from './pages/therapist/TherapistHome'
import PatientsPage from './pages/therapist/PatientsPage'
import PatientDetailPage from './pages/therapist/PatientDetailPage'
import TherapistSessionsPage from './pages/therapist/TherapistSessionsPage'
import TherapistTestsPage from './pages/therapist/TherapistTestsPage'
import AvailabilityPage from './pages/therapist/AvailabilityPage'

// Patient pages
import PatientHome from './pages/patient/PatientHome'
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage'
import PatientTestsPage from './pages/patient/PatientTestsPage'
import MoodTrackerPage from './pages/patient/MoodTrackerPage'
import ResourcesPage from './pages/patient/ResourcesPage'
import NotificationsPage from './pages/patient/NotificationsPage'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4f46e5', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '36px', height: '36px' }} stroke="#4f46e5" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      </div>
      <p style={{ color: 'white', fontSize: '18px', fontFamily: 'sans-serif', margin: 0 }}>Cargando...</p>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'therapist' | 'patient' }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (role && profile && profile.role !== role) {
    return <Navigate to={profile.role === 'therapist' ? '/terapeuta' : '/paciente'} replace />
  }
  return <>{children}</>
}

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'therapist') return <Navigate to="/terapeuta" replace />
  return <Navigate to="/paciente" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Therapist routes */}
      <Route path="/terapeuta" element={
        <ProtectedRoute role="therapist">
          <Layout><TherapistHome /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/terapeuta/pacientes" element={
        <ProtectedRoute role="therapist">
          <Layout><PatientsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/terapeuta/pacientes/:id" element={
        <ProtectedRoute role="therapist">
          <Layout><PatientDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/terapeuta/citas" element={
        <ProtectedRoute role="therapist">
          <Layout><TherapistSessionsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/terapeuta/pruebas" element={
        <ProtectedRoute role="therapist">
          <Layout><TherapistTestsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/terapeuta/disponibilidad" element={
        <ProtectedRoute role="therapist">
          <Layout><AvailabilityPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Patient routes */}
      <Route path="/paciente" element={
        <ProtectedRoute role="patient">
          <Layout><PatientHome /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paciente/citas" element={
        <ProtectedRoute role="patient">
          <Layout><PatientAppointmentsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paciente/pruebas" element={
        <ProtectedRoute role="patient">
          <Layout><PatientTestsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paciente/estado-animo" element={
        <ProtectedRoute role="patient">
          <Layout><MoodTrackerPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paciente/recursos" element={
        <ProtectedRoute role="patient">
          <Layout><ResourcesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paciente/notificaciones" element={
        <ProtectedRoute role="patient">
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
