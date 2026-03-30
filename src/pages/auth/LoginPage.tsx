import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Button } from '../../components/ui/Button'
import { Eye, EyeOff, ShieldCheck, Users, Calendar } from 'lucide-react'

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-white/15 rounded-xl p-0.5 gap-0.5 backdrop-blur-sm">
      {(['es', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            lang === l ? 'bg-white text-[#194067] shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function PasswordField({
  label, placeholder, value, onChange, autoComplete,
}: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#0d1b2a]">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full px-4 py-3 pr-12 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 focus:bg-white outline-none transition-all duration-200 shadow-[0_1px_3px_rgba(25,64,103,0.05)]"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8096a7] hover:text-[#526070] rounded-lg transition-colors"
          onClick={() => setShow(v => !v)}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  )
}

const LOGO_PATH = "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"

export default function LoginPage() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(t('login_error'))
    else navigate('/')
  }

  return (
    <div className="min-h-dvh flex">

      {/* ── Left brand panel (desktop only) ─────────────── */}
      <div className="hidden lg:flex w-[44%] flex-col bg-[#194067] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#1e5080] rounded-full opacity-50" />
          <div className="absolute -bottom-40 -left-20 w-[420px] h-[420px] bg-[#f9a825]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/3 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Top: lang toggle */}
          <div className="flex justify-end">
            <LangToggle />
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            {/* Logo mark */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-[#f9a825] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(249,168,37,0.45)] flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="#0d1b2a" strokeWidth={2.1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={LOGO_PATH} />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{t('brand_name')}</h1>
                <p className="text-[#f9a825] font-semibold text-sm">{t('brand_subtitle')}</p>
              </div>
            </div>

            <h2 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-4 tracking-tight">
              {t('brand_tagline')}
            </h2>
            <p className="text-white/55 text-base leading-relaxed mb-12">
              {t('brand_desc')}
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Users,      label: t('nav_patients') },
                { icon: Calendar,   label: t('nav_appointments') },
                { icon: ShieldCheck, label: 'Datos seguros y privados' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/8 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/8">
                  <div className="w-8 h-8 bg-[#f9a825]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[#f9a825]" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/25 text-xs text-center">
            © {new Date().getFullYear()} CTCC · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#f0f4f8]">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#194067] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(25,64,103,0.25)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#f9a825" strokeWidth={2.1}>
                <path strokeLinecap="round" strokeLinejoin="round" d={LOGO_PATH} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0d1b2a]">{t('brand_name')}</p>
              <p className="text-xs text-[#f9a825] font-semibold">{t('brand_subtitle')}</p>
            </div>
          </div>
          <LangToggle />
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-fadeInUp">

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1b2a] mb-1.5 tracking-tight">
                {t('login_title')}
              </h2>
              <p className="text-[#526070]">{t('login_subtitle')}</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(25,64,103,0.12),0_2px_8px_rgba(0,0,0,0.04)] border border-[#dce5ec]/80 p-8">
              {error && (
                <div className="bg-red-50 border border-red-200/60 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6 font-medium flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-xs leading-none">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#0d1b2a]">{t('email')}</label>
                  <input
                    type="email"
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 focus:bg-white outline-none transition-all duration-200 shadow-[0_1px_3px_rgba(25,64,103,0.05)]"
                  />
                </div>

                <PasswordField
                  label={t('password')}
                  placeholder={t('password_placeholder')}
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                />

                <div className="pt-1">
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    {t('submit_login')}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-[#f0f4f8] text-center">
                <p className="text-sm text-[#526070]">
                  {t('have_invite')}{' '}
                  <Link to="/registro" className="text-[#194067] font-bold hover:text-[#f9a825] transition-colors">
                    {t('create_account_link')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
