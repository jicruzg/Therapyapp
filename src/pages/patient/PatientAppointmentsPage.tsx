import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Calendar, Clock, CheckCircle, ExternalLink, RefreshCw, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ZOOM_SCHEDULER_URL = 'https://scheduler.zoom.us/josegaitan/event'

type Step = 'idle' | 'confirm' | 'done'

export default function PatientAppointmentsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [booking, setBooking] = useState(false)
  const [dateError, setDateError] = useState('')

  const loadSessions = useCallback(async (patId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', patId)
      .order('scheduled_at', { ascending: false })
    setSessions(data ?? [])
  }, [])

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase
        .from('patients')
        .select('id, therapist_id')
        .eq('profile_id', profile.id)
        .single()
      if (!patient) { setLoading(false); return }
      setPatientId(patient.id)
      setTherapistId(patient.therapist_id)
      await loadSessions(patient.id)
      setLoading(false)
    }
    load()
  }, [profile, loadSessions])

  async function refresh() {
    if (!patientId) return
    setRefreshing(true)
    await loadSessions(patientId)
    setRefreshing(false)
  }

  function openZoom() {
    window.open(ZOOM_SCHEDULER_URL, '_blank', 'noopener,noreferrer')
  }

  function openConfirmModal() {
    setSelectedDate('')
    setSelectedTime('')
    setDateError('')
    setStep('confirm')
  }

  function closeModal() {
    setStep('idle')
  }

  async function confirmBooking() {
    if (!selectedDate || !selectedTime) {
      setDateError('Por favor selecciona fecha y hora.')
      return
    }
    if (!patientId || !therapistId) return
    setDateError('')
    setBooking(true)

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`)
    const { data } = await supabase.from('sessions').insert({
      therapist_id: therapistId,
      patient_id: patientId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 60,
      status: 'scheduled',
    }).select().single()

    if (data) {
      setSessions(prev => [data, ...prev])
      await supabase.from('notifications').insert({
        patient_id: patientId,
        title: 'Cita agendada',
        message: `Tu cita fue registrada para el ${format(scheduledAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}`,
        type: 'appointment',
      })
    }
    setBooking(false)
    setStep('done')
    setTimeout(() => closeModal(), 2000)
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const previewDate =
    selectedDate && selectedTime
      ? new Date(`${selectedDate}T${selectedTime}`)
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">Mis Citas</h1>
          <p className="text-[#526070] mt-1">Agenda y consulta tus sesiones</p>
        </div>
        <button
          onClick={refresh}
          className="mt-1 p-2 rounded-xl text-[#8096a7] hover:text-[#194067] hover:bg-[#e8f0f7] transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* How-to card */}
      <div className="bg-[#194067] rounded-2xl p-5 flex gap-4 items-start">
        <div className="w-10 h-10 bg-[#f9a825] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Calendar size={18} className="text-[#0d1b2a]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm mb-1">¿Cómo agendar tu cita?</p>
          <ol className="text-white/70 text-xs space-y-1 leading-relaxed list-none">
            <li><span className="text-[#f9a825] font-bold">1.</span> Abre el calendario de Zoom de tu terapeuta</li>
            <li><span className="text-[#f9a825] font-bold">2.</span> Elige fecha y hora disponible y confirma en Zoom</li>
            <li><span className="text-[#f9a825] font-bold">3.</span> Vuelve aquí y haz clic en <strong className="text-white">"Ya agendé en Zoom"</strong> para registrar tu cita</li>
          </ol>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={openZoom}
              className="gap-2 bg-[#f9a825] hover:bg-[#e6971a] text-[#0d1b2a] font-bold"
            >
              <ExternalLink size={13} /> Abrir Zoom
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openConfirmModal}
              className="gap-2 border-white/30 text-white hover:bg-white/10"
            >
              Ya agendé en Zoom <ArrowRight size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium mb-1">No tienes citas registradas aún</p>
          <p className="text-xs text-[#8096a7] mb-5">Agenda tu primera sesión con tu terapeuta</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={openZoom} size="sm" variant="secondary" className="gap-2">
              <ExternalLink size={13} /> Abrir Zoom
            </Button>
            <Button onClick={openConfirmModal} size="sm" className="gap-2">
              Ya agendé <ArrowRight size={13} />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const date = new Date(s.scheduled_at)
            const isPast = date < new Date()
            const isUpcoming = s.status === 'scheduled' && !isPast
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                    isUpcoming ? 'bg-[#194067]' : 'bg-[#f0f4f8]'
                  }`}>
                    <span className={`text-xs font-semibold uppercase ${isUpcoming ? 'text-white/60' : 'text-[#8096a7]'}`}>
                      {format(date, 'MMM', { locale: es })}
                    </span>
                    <span className={`text-xl font-bold leading-tight ${isUpcoming ? 'text-white' : 'text-[#526070]'}`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#0d1b2a]">Sesión de terapia</p>
                      <Badge color={
                        s.status === 'completed' ? 'green' :
                        s.status === 'scheduled' ? 'navy' : 'gray'
                      }>
                        {s.status === 'completed' ? 'Completada' :
                         s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#526070] flex items-center gap-1.5 mt-1 font-medium">
                      <Clock size={13} className="text-[#f9a825]" />
                      {format(date, "EEEE d 'de' MMMM", { locale: es })} · {format(date, 'HH:mm')} · {s.duration_minutes} min
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirm booking modal */}
      <Modal
        open={step !== 'idle'}
        onClose={closeModal}
        title={step === 'done' ? '¡Cita registrada!' : 'Registrar cita de Zoom'}
        size="sm"
      >
        {step === 'done' ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-[#0d1b2a]">¡Cita registrada!</p>
            <p className="text-sm text-[#526070] mt-2">Tu terapeuta podrá agregar notas de sesión.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-[#526070]">
              Ingresa la fecha y hora que seleccionaste en Zoom para registrar tu cita en el sistema.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#0d1b2a] mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  onChange={e => { setSelectedDate(e.target.value); setDateError('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce5ec] text-sm font-medium text-[#0d1b2a] focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d1b2a] mb-1.5">Hora</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => { setSelectedTime(e.target.value); setDateError('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce5ec] text-sm font-medium text-[#0d1b2a] focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10"
                />
              </div>
            </div>

            {dateError && <p className="text-sm text-red-500 font-medium">{dateError}</p>}

            {previewDate && (
              <div className="bg-[#e8f0f7] rounded-xl p-4 flex items-center gap-3 border border-[#194067]/15">
                <div className="w-10 h-10 bg-[#194067] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white/60 font-semibold uppercase leading-none">
                    {format(previewDate, 'MMM', { locale: es })}
                  </span>
                  <span className="text-base font-bold text-white leading-tight">
                    {format(previewDate, 'd')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0d1b2a] text-sm capitalize">
                    {format(previewDate, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-xs text-[#526070] mt-0.5 flex items-center gap-1">
                    <Clock size={11} className="text-[#f9a825]" />
                    {format(previewDate, 'HH:mm')} · 60 min
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={closeModal} className="flex-1">Cancelar</Button>
              <Button
                onClick={confirmBooking}
                loading={booking}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Registrar cita
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
