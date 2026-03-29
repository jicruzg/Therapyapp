import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import {
  Users, Calendar, ClipboardList, LogOut, Menu, X,
  Bell, BookOpen, BarChart2, Home, ChevronRight, Activity
} from 'lucide-react'

interface LayoutProps { children: ReactNode }

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Users; label: string }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f9a825] rounded-r-full" />
          )}
          <Icon size={18} className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-[#f9a825]' : 'group-hover:scale-110'}`} />
          <span className="flex-1">{label}</span>
          {isActive && <ChevronRight size={14} className="text-[#f9a825]/60" />}
        </>
      )}
    </NavLink>
  )
}

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-white/10 rounded-xl p-1 gap-0.5">
      {(['es', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            lang === l
              ? 'bg-[#f9a825] text-[#0d1b2a] shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const therapistNav = [
    { to: '/terapeuta', icon: Home, label: t('nav_home') },
    { to: '/terapeuta/pacientes', icon: Users, label: t('nav_patients') },
    { to: '/terapeuta/citas', icon: Calendar, label: t('nav_appointments') },
    { to: '/terapeuta/pruebas', icon: ClipboardList, label: t('nav_tests') },
    { to: '/terapeuta/disponibilidad', icon: BarChart2, label: t('nav_availability') },
  ]

  const patientNav = [
    { to: '/paciente', icon: Home, label: t('nav_home') },
    { to: '/paciente/citas', icon: Calendar, label: t('nav_my_appointments') },
    { to: '/paciente/pruebas', icon: ClipboardList, label: t('nav_tests') },
    { to: '/paciente/estado-animo', icon: Activity, label: t('nav_mood') },
    { to: '/paciente/recursos', icon: BookOpen, label: t('nav_resources') },
  ]

  const nav = profile?.role === 'therapist' ? therapistNav : patientNav
  const initials = profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#194067]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f9a825] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#0d1b2a" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">{t('brand_name')}</p>
            <p className="text-xs text-[#f9a825] leading-tight font-medium">{t('brand_subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      {/* Language toggle */}
      <div className="px-4 pb-3">
        <LangToggle />
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-9 h-9 bg-[#f9a825] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#0d1b2a] text-sm font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name}</p>
            <p className="text-xs text-white/50">
              {profile?.role === 'therapist' ? t('role_therapist') : t('role_patient')}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={16} />
          {t('signout')}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#f0f4f8]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col h-full shadow-[4px_0_24px_rgba(25,64,103,0.1)]">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-[#0d1b2a]/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-[#dce5ec] px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 shadow-[0_1px_8px_rgba(25,64,103,0.06)]">
          <button
            className="lg:hidden p-2 hover:bg-[#f0f4f8] rounded-xl text-[#526070] transition-colors"
            onClick={() => setSidebarOpen(v => !v)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page breadcrumb / title placeholder */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile lang toggle */}
            <div className="lg:hidden">
              <LangToggle />
            </div>
            {profile?.role === 'patient' && (
              <NavLink
                to="/paciente/notificaciones"
                className="relative p-2.5 hover:bg-[#f0f4f8] rounded-xl text-[#526070] hover:text-[#194067] transition-colors"
              >
                <Bell size={20} />
              </NavLink>
            )}
            {/* User avatar (header) */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#dce5ec]">
              <div className="w-8 h-8 bg-[#194067] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#0d1b2a] leading-tight">{profile?.full_name?.split(' ')[0]}</p>
                <p className="text-xs text-[#8096a7]">
                  {profile?.role === 'therapist' ? t('role_therapist') : t('role_patient')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
