import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Users, Calendar, ClipboardList, LogOut, Menu, X, Bell, BookOpen, BarChart2, Home } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Users; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const therapistNav = [
    { to: '/terapeuta', icon: Home, label: 'Inicio' },
    { to: '/terapeuta/pacientes', icon: Users, label: 'Pacientes' },
    { to: '/terapeuta/citas', icon: Calendar, label: 'Citas' },
    { to: '/terapeuta/pruebas', icon: ClipboardList, label: 'Pruebas' },
    { to: '/terapeuta/disponibilidad', icon: BarChart2, label: 'Disponibilidad' },
  ]

  const patientNav = [
    { to: '/paciente', icon: Home, label: 'Inicio' },
    { to: '/paciente/citas', icon: Calendar, label: 'Mis Citas' },
    { to: '/paciente/pruebas', icon: ClipboardList, label: 'Pruebas' },
    { to: '/paciente/estado-animo', icon: BarChart2, label: 'Estado de Ánimo' },
    { to: '/paciente/recursos', icon: BookOpen, label: 'Recursos' },
  ]

  const nav = profile?.role === 'therapist' ? therapistNav : patientNav

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">Centro de Terapia</p>
            <p className="text-xs text-indigo-600 leading-tight">Conductual Contextual</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-700 text-sm font-semibold">
              {profile?.full_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role === 'therapist' ? 'Terapeuta' : 'Paciente'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#f8f9ff]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0 bg-white border-r border-gray-100 flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 h-14 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {profile?.role === 'patient' && (
              <NavLink to="/paciente/notificaciones" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} className="text-gray-600" />
              </NavLink>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
