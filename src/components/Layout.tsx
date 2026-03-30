import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import {
  Users, Calendar, ClipboardList, LogOut,
  Bell, BookOpen, Home, ChevronRight, Activity
} from 'lucide-react'

interface LayoutProps { children: ReactNode }

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Users; label: string }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group relative ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/55 hover:text-white hover:bg-white/10'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f9a825] rounded-r-full" />
          )}
          <Icon
            size={18}
            className={`flex-shrink-0 transition-all duration-200 ${
              isActive ? 'text-[#f9a825]' : 'group-hover:scale-110'
            }`}
          />
          <span className="flex-1">{label}</span>
          {isActive && <ChevronRight size={14} className="text-[#f9a825]/50" />}
        </>
      )}
    </NavLink>
  )
}

function SidebarLangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-white/10 rounded-xl p-0.5 gap-0.5">
      {(['es', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            lang === l
              ? 'bg-[#f9a825] text-[#0d1b2a] shadow-sm'
              : 'text-white/45 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function HeaderLangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-[#f0f4f8] rounded-xl p-0.5 gap-0.5">
      {(['es', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            lang === l
              ? 'bg-white text-[#194067] shadow-sm'
              : 'text-[#8096a7] hover:text-[#526070]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function BottomTabItem({ to, icon: Icon, label }: { to: string; icon: typeof Users; label: string }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center flex-1 gap-0.5 py-2 px-1 transition-all duration-200 ${
          isActive ? 'text-[#194067]' : 'text-[#8096a7]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-1.5 rounded-xl transition-all duration-200 ${
            isActive ? 'bg-[#e8f0f7] scale-110' : 'scale-100'
          }`}>
            <Icon
              size={20}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
          </div>
          <span className="text-[10px] font-semibold leading-none truncate max-w-full">
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const therapistNav = [
    { to: '/terapeuta',           icon: Home,         label: t('nav_home') },
    { to: '/terapeuta/pacientes', icon: Users,        label: t('nav_patients') },
    { to: '/terapeuta/citas',     icon: Calendar,     label: t('nav_appointments') },
    { to: '/terapeuta/pruebas',   icon: ClipboardList, label: t('nav_tests') },
  ]

  const patientNav = [
    { to: '/paciente',              icon: Home,         label: t('nav_home') },
    { to: '/paciente/citas',        icon: Calendar,     label: t('nav_my_appointments') },
    { to: '/paciente/pruebas',      icon: ClipboardList, label: t('nav_tests') },
    { to: '/paciente/estado-animo', icon: Activity,     label: t('nav_mood') },
    { to: '/paciente/recursos',     icon: BookOpen,     label: t('nav_resources') },
  ]

  const nav = profile?.role === 'therapist' ? therapistNav : patientNav
  const initials = profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  return (
    <div className="flex h-dvh bg-[#f0f4f8]">

      {/* ── Desktop Sidebar ────────────────────────────────── */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col h-full shadow-[4px_0_32px_rgba(25,64,103,0.12)]">
        <aside className="flex flex-col h-full glass-dark">
          {/* Logo */}
          <div className="px-5 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f9a825] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(249,168,37,0.4)] flex-shrink-0">
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

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {nav.map(item => (
              <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </nav>

          {/* Language toggle */}
          <div className="px-4 pb-3">
            <SidebarLangToggle />
          </div>

          {/* User + sign out */}
          <div className="px-3 pb-5 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/8 mb-2">
              <div className="w-9 h-9 bg-[#f9a825] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(249,168,37,0.3)]">
                <span className="text-[#0d1b2a] text-sm font-bold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name}</p>
                <p className="text-xs text-white/45 font-medium">
                  {profile?.role === 'therapist' ? t('role_therapist') : t('role_patient')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white/45 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-200"
            >
              <LogOut size={16} />
              {t('signout')}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Main content column ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="glass border-b border-[#dce5ec]/60 px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 shadow-[0_1px_0_rgba(25,64,103,0.05)]">

          {/* Mobile: brand mark */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f9a825] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(249,168,37,0.35)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="#0d1b2a" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#0d1b2a]">{t('brand_name')}</span>
          </div>

          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            {/* Lang toggle: light variant for header (mobile only — desktop is in sidebar) */}
            <div className="lg:hidden">
              <HeaderLangToggle />
            </div>

            {/* Notifications bell (patient only) */}
            {profile?.role === 'patient' && (
              <NavLink
                to="/paciente/notificaciones"
                className="relative p-2.5 hover:bg-[#f0f4f8] rounded-xl text-[#526070] hover:text-[#194067] transition-colors"
              >
                <Bell size={19} />
              </NavLink>
            )}

            {/* User avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#dce5ec]">
              <div className="w-8 h-8 bg-[#194067] rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(25,64,103,0.25)]">
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

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-y-auto p-4 pb-28 lg:p-8 lg:pb-8">
          <div className="animate-fadeInUp">
            {children}
          </div>
        </main>
      </div>

      {/* ── Bottom Tab Bar (mobile only) ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[#dce5ec]/70 shadow-[0_-4px_24px_rgba(25,64,103,0.1)] safe-bottom">
        <div className="flex items-stretch h-16">
          {nav.map(item => (
            <BottomTabItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>
      </nav>

    </div>
  )
}
