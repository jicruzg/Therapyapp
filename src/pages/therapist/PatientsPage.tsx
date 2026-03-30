import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Patient } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { UserPlus, Search, Mail, Phone, ChevronRight, Copy, Check, Loader2 } from 'lucide-react'
import { useLang } from '../../contexts/LangContext'

export default function PatientsPage() {
  const { profile }  = useAuth()
  const { lang }     = useLang()
  const navigate     = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [showInvite, setShowInvite] = useState<Patient | null>(null)
  const [copied, setCopied]     = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', birth_date: '', diagnosis: '' })
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  async function loadPatients() {
    if (!profile) return
    const { data } = await supabase.from('patients').select('*').eq('therapist_id', profile.id).order('created_at', { ascending: false })
    setPatients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadPatients() }, [profile])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(patients.filter(p => p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)))
  }, [search, patients])

  async function handleAdd() {
    setFormError('')
    if (!form.full_name || !form.email) { setFormError('Nombre y correo son requeridos.'); return }
    setSaving(true)
    const { data, error } = await supabase.from('patients').insert({
      therapist_id: profile!.id, ...form, status: 'pending', invited_at: new Date().toISOString(),
    }).select().single()
    setSaving(false)
    if (error) { setFormError(error.message); return }
    setPatients(prev => [data, ...prev])
    setShowAdd(false)
    setForm({ full_name: '', email: '', phone: '', birth_date: '', diagnosis: '' })
    setShowInvite(data)
  }

  function getInviteLink(patient: Patient) {
    return `${window.location.origin}/registro?token=${patient.invitation_token}`
  }

  async function copyLink(patient: Patient) {
    await navigator.clipboard.writeText(getInviteLink(patient))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColors: Record<string, 'gray' | 'green' | 'orange'> = {
    pending: 'orange', active: 'green', inactive: 'gray',
  }
  const statusLabels: Record<string, string> = lang === 'pt'
    ? { pending: 'Pendente', active: 'Ativo', inactive: 'Inativo' }
    : { pending: 'Pendiente', active: 'Activo', inactive: 'Inactivo' }

  const selectClass = "w-full px-4 py-3 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium text-[#0d1b2a] focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 shadow-[0_1px_3px_rgba(25,64,103,0.05)]"
  const textareaClass = "w-full px-4 py-3 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 resize-none text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal shadow-[0_1px_3px_rgba(25,64,103,0.05)]"

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">
            {lang === 'pt' ? 'Gestão' : 'Gestión'}
          </p>
          <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">
            {lang === 'pt' ? 'Pacientes' : 'Pacientes'}
          </h1>
          <p className="text-[#526070] mt-1 text-sm">
            {patients.length} {lang === 'pt' ? 'pacientes registrados' : 'pacientes registrados'}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 mt-1 flex-shrink-0">
          <UserPlus size={16} />
          <span className="hidden sm:inline">{lang === 'pt' ? 'Adicionar' : 'Agregar paciente'}</span>
          <span className="sm:hidden">{lang === 'pt' ? 'Adicionar' : 'Agregar'}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8096a7] pointer-events-none" />
        <input
          type="text"
          placeholder={lang === 'pt' ? 'Buscar por nome ou e-mail...' : 'Buscar por nombre o correo...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 focus:bg-white text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal transition-all duration-200 shadow-[0_1px_3px_rgba(25,64,103,0.05)]"
        />
      </div>

      {/* Patient list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#194067]" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={26} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium">
            {lang === 'pt' ? 'Nenhum paciente encontrado.' : 'No hay pacientes. Agrega uno nuevo.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map(p => (
            <Card
              key={p.id}
              hover
              className="flex items-center gap-4 px-4 py-4 sm:px-5"
              onClick={() => navigate(`/terapeuta/pacientes/${p.id}`)}
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-[#194067] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(25,64,103,0.22)]">
                <span className="text-white font-bold text-sm">{p.full_name[0].toUpperCase()}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#0d1b2a] truncate text-sm sm:text-base">{p.full_name}</p>
                  <Badge color={statusColors[p.status]}>{statusLabels[p.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-[#8096a7] flex items-center gap-1">
                    <Mail size={11} />{p.email}
                  </span>
                  {p.phone && (
                    <span className="text-xs text-[#8096a7] flex items-center gap-1">
                      <Phone size={11} />{p.phone}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={17} className="text-[#b0c8de] flex-shrink-0" />
            </Card>
          ))}
        </div>
      )}

      {/* ── Add patient modal ── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title={lang === 'pt' ? 'Adicionar novo paciente' : 'Agregar nuevo paciente'}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200/60 text-red-600 text-sm px-4 py-3 rounded-2xl font-medium flex items-center gap-2">
              <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-500 font-bold text-[10px]">!</span>
              {formError}
            </div>
          )}
          <Input label={lang === 'pt' ? 'Nome completo *' : 'Nombre completo *'} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder={lang === 'pt' ? 'Nome do paciente' : 'Nombre del paciente'} />
          <Input label={lang === 'pt' ? 'E-mail *' : 'Correo electrónico *'} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
          <Input label={lang === 'pt' ? 'Telefone' : 'Teléfono'} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 000 000 0000" />
          <Input label={lang === 'pt' ? 'Data de nascimento' : 'Fecha de nacimiento'} type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
          <div>
            <label className="text-sm font-semibold text-[#0d1b2a] mb-1.5 block">
              {lang === 'pt' ? 'Diagnóstico / Motivo' : 'Diagnóstico / Motivo de consulta'}
            </label>
            <textarea
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder={lang === 'pt' ? 'Descrição do caso...' : 'Descripción del caso...'}
              rows={3}
              className={textareaClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleAdd} loading={saving} className="flex-1">
              {lang === 'pt' ? 'Salvar e convidar' : 'Guardar y enviar invitación'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Invite link modal ── */}
      <Modal
        open={!!showInvite}
        onClose={() => setShowInvite(null)}
        title={lang === 'pt' ? 'Convidar paciente' : 'Invitar paciente'}
        size="md"
      >
        {showInvite && (
          <div className="space-y-4">
            <p className="text-sm text-[#526070]">
              {lang === 'pt' ? 'Compartilhe este link com' : 'Comparte este enlace con'}{' '}
              <strong className="text-[#0d1b2a]">{showInvite.full_name}</strong>{' '}
              {lang === 'pt' ? 'para criar sua conta:' : 'para que pueda crear su cuenta:'}
            </p>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 bg-[#f0f4f8] border border-[#dce5ec] rounded-2xl px-4 py-3 overflow-hidden">
                <code className="text-xs break-all text-[#526070] font-mono leading-relaxed">
                  {getInviteLink(showInvite)}
                </code>
              </div>
              <button
                onClick={() => copyLink(showInvite)}
                className={`flex-shrink-0 px-4 rounded-2xl transition-all duration-200 font-semibold flex items-center gap-2 text-sm ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
                    : 'bg-[#194067] text-white hover:bg-[#1e5080] shadow-[0_4px_12px_rgba(25,64,103,0.25)]'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-xs text-[#8096a7]">
              {lang === 'pt' ? 'Este link é único e só pode ser usado uma vez.' : 'Este enlace es único para este paciente y solo puede usarse una vez.'}
            </p>
            <Button onClick={() => setShowInvite(null)} className="w-full">
              {lang === 'pt' ? 'Fechar' : 'Listo'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
