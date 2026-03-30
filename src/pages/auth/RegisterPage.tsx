import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

const LOGO_PATH = "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"

function PasswordField({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
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

export default function RegisterPage() {
  const { t } = useLang()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [verifyingToken, setVerifyingToken] = useState(!!token)
  const [patientData, setPatientData] = useState<{ full_name: string; email: string } | null>(null)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp }  = useAuth()
  const navigate    = useNavigate()

  useEffect(() => {
    if (!token) return
    async function verifyToken() {
      const { data } = await supabase
        .from('patients').select('full_name, email')
        .eq('invitation_token', token).eq('status', 'pending').single()
      if (data) { setPatientData(data); setFullName(data.full_name); setEmail(data.email) }
      else       { setError(t('invalid_token')) }
      setVerifyingToken(false)
    }
    verifyToken()
  }, [token])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError(t('passwords_no_match')); return }
    if (password.length < 6)  { setError(t('password_too_short')); return }
    setLoading(true)
    const role = token ? 'patient' : 'therapist'
    const { error } = await signUp(email, password, fullName, role, token || undefined)
    setLoading(false)
    if (error) { setError(error.message || t('error_creating')) }
    else        { setSuccess(true); setTimeout(() => navigate('/'), 2500) }
  }

  /* ── Loading state ── */
  if (verifyingToken) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f0f4f8]">
        <div className="text-center animate-fadeIn">
          <Loader2 className="animate-spin text-[#194067] mx-auto mb-4" size={36} />
          <p className="text-[#526070] font-medium">{t('verifying')}</p>
        </div>
      </div>
    )
  }

  /* ── Success state ── */
  if (success) {
    return (
      <div className="min-h-dvh bg-[#f0f4f8] flex items-center justify-center p-4">
        <div className="text-center animate-scaleIn">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.25)]">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0d1b2a] mb-2">{t('account_created')}</h2>
          <p className="text-[#526070]">{t('redirecting')}</p>
        </div>
      </div>
    )
  }

  /* ── Register form ── */
  return (
    <div className="min-h-dvh bg-[#f0f4f8] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md animate-fadeInUp">

        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#194067] rounded-2xl mb-4 shadow-[0_8px_24px_rgba(25,64,103,0.3)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="#f9a825" strokeWidth={2.1}>
              <path strokeLinecap="round" strokeLinejoin="round" d={LOGO_PATH} />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#0d1b2a]">{t('brand_name')}</h1>
          <p className="text-sm text-[#f9a825] font-semibold mt-0.5">{t('brand_subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(25,64,103,0.12),0_2px_8px_rgba(0,0,0,0.04)] border border-[#dce5ec]/80 p-8">
          <h2 className="text-xl font-bold text-[#0d1b2a] mb-0.5">
            {token ? t('register_patient') : t('register_therapist')}
          </h2>
          {patientData && (
            <p className="text-sm text-[#f9a825] font-semibold mb-5">
              {t('invite_for')} {patientData.full_name}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5 font-medium flex items-center gap-2.5">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-xs leading-none">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <Input
              label={t('full_name')}
              type="text"
              placeholder={t('full_name_placeholder')}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              readOnly={!!patientData}
            />
            <Input
              label={t('email')}
              type="email"
              placeholder={t('email_placeholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              readOnly={!!patientData}
            />
            <PasswordField
              label={t('password')}
              placeholder={t('password_min')}
              value={password}
              onChange={setPassword}
            />
            <PasswordField
              label={t('confirm_password')}
              placeholder={t('confirm_placeholder')}
              value={confirm}
              onChange={setConfirm}
            />

            <div className="pt-1">
              <Button type="submit" loading={loading} className="w-full" size="lg">
                {t('submit_register')}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#f0f4f8] text-center">
            <p className="text-sm text-[#526070]">
              {t('have_account')}{' '}
              <Link to="/login" className="text-[#194067] font-bold hover:text-[#f9a825] transition-colors">
                {t('signin_link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
