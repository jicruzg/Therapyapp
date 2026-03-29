import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Eye, EyeOff, ShieldCheck, Users, Calendar } from 'lucide-react'

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center bg-white/20 rounded-xl p-1 gap-0.5">
      {(['es', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            lang === l ? 'bg-white text-[#194067] shadow-sm' : 'text-white/70 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function LoginPage() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    if (error) {
      setError(t('login_error'))
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] flex-col bg-[#194067] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f9a825] rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Top: lang toggle */}
          <div className="flex justify-end">
            <LangToggle />
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-[#f9a825] rounded-2xl flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="#0d1b2a" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">{t('brand_name')}</h1>
                <p className="text-[#f9a825] font-semibold text-sm">{t('brand_subtitle')}</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              {t('brand_tagline')}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-12">
              {t('brand_desc')}
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Users, label: 'Gestión de pacientes' },
                { icon: Calendar, label: 'Citas y seguimiento' },
                { icon: ShieldCheck, label: 'Datos seguros y privados' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Icon size={16} className="text-[#f9a825]" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/30 text-xs text-center">
            © {new Date().getFullYear()} CTCC · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-[#f0f4f8]">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#194067] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#f9a825" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0d1b2a]">{t('brand_name')}</p>
              <p className="text-xs text-[#f9a825] font-semibold">{t('brand_subtitle')}</p>
            </div>
          </div>
          <LangToggle />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0d1b2a] mb-2">{t('login_title')}</h2>
              <p className="text-[#526070]">{t('login_subtitle')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(25,64,103,0.10)] border border-[#dce5ec] p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 font-medium flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-xs">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label={t('email')}
                  type="email"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#0d1b2a]">{t('password')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('password_placeholder')}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#dce5ec] bg-white text-sm font-medium text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8096a7] hover:text-[#526070] transition-colors"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                  {t('submit_login')}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#f0f4f8] text-center">
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
