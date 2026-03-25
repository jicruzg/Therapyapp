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

export default function PatientsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showInvite, setShowInvite] = useState<Patient | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', birth_date: '', diagnosis: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function loadPatients() {
    if (!profile) return
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('therapist_id', profile.id)
      .order('created_at', { ascending: false })
    setPatients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadPatients() }, [profile])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(patients.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    ))
  }, [search, patients])

  async function handleAdd() {
    setFormError('')
    if (!form.full_name || !form.email) {
      setFormError('Nombre y correo son requeridos.')
      return
    }
    setSaving(true)
    const { data, error } = await supabase.from('patients').insert({
      therapist_id: profile!.id,
      ...form,
      status: 'pending',
      invited_at: new Date().toISOString(),
    }).select().single()
    setSaving(false)
    if (error) {
      setFormError(error.message)
      return
    }
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

  const statusColors: Record<string, 'gray' | 'green' | 'yellow'> = {
    pending: 'yellow',
    active: 'green',
    inactive: 'gray',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    active: 'Activo',
    inactive: 'Inactivo',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} pacientes registrados</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <UserPlus size={16} />
          Agregar paciente
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-400" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <UserPlus size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay pacientes. Agrega uno nuevo.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <Card
              key={p.id}
              className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/terapeuta/pacientes/${p.id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-700 font-semibold">{p.full_name[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{p.full_name}</p>
                  <Badge color={statusColors[p.status]}>{statusLabels[p.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={11} />{p.email}</span>
                  {p.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} />{p.phone}</span>}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Card>
          ))}
        </div>
      )}

      {/* Add patient modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar nuevo paciente" size="md">
        <div className="space-y-4">
          {formError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <Input label="Nombre completo *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nombre del paciente" />
          <Input label="Correo electrónico *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
          <Input label="Teléfono" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 000 000 0000" />
          <Input label="Fecha de nacimiento" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Diagnóstico / Motivo de consulta</label>
            <textarea
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder="Descripción del caso..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleAdd} loading={saving} className="flex-1">Guardar y enviar invitación</Button>
          </div>
        </div>
      </Modal>

      {/* Invite link modal */}
      <Modal open={!!showInvite} onClose={() => setShowInvite(null)} title="Invitar paciente" size="md">
        {showInvite && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Comparte este enlace con <strong>{showInvite.full_name}</strong> para que pueda crear su cuenta:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs break-all text-gray-700">
                {getInviteLink(showInvite)}
              </code>
              <button
                onClick={() => copyLink(showInvite)}
                className="flex-shrink-0 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400">Este enlace es único para este paciente y solo puede usarse una vez.</p>
            <Button onClick={() => setShowInvite(null)} className="w-full">Listo</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
