import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Calendar, Clock, Plus, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ZOOM_SCHEDULER_URL = 'https://scheduler.zoom.us/josegaitan/event'

type Step = 'book' | 'confirm' | 'done'

export default function PatientAppointmentsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<Step>('book')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [booking, setBooking] = useState(false)
  const [dateError, setDateError] = useState('')

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
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: false })
      setSessions(data ?? [])
      setLoading(false)
    }
    load()
  }, [profile])

  function openModal() {
    setStep('book')
    setSelectedDate('')
    setSelectedTime('')
    setDateError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
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

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">Mis Citas</h1>
          <p className="text-[#526070] mt-1">Agenda y consulta tus sesiones</p>
        </div>
        <Button onClick={openModal} size="sm" className="mt-1 gap-2">
          <Plus size={14} /> Nueva cita
        </Button>
      </div>

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
          <p className="text-[#526070] font-medium mb-4">No tienes citas registradas</p>
          <Button onClick={openModal} size="sm">Agendar mi primera cita</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#194067] rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white/60 font-semibold uppercase">
                    {format(new Date(s.scheduled_at), 'MMM', { locale: es })}
                  </span>
                  <span className="text-xl font-bold text-white leading-tight">
                    {format(new Date(s.scheduled_at), 'd')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#0d1b2a]">Sesión de terapia</p>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'navy' : 'gray'}>
                      {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#526070] flex items-center gap-1.5 mt-1 font-medium">
                    <Clock size={13} className="text-[#f9a825]" />
                    {format(new Date(s.scheduled_at), 'HH:mm')} · {s.duration_minutes} min
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={step === 'book' ? 'Agendar nueva cita' : step === 'confirm' ? 'Confirmar cita' : '¡Listo!'}
        size="lg"
      >
        {/* Step 1: Zoom Scheduler iframe */}
        {step === 'book' && (
          <div className="space-y-4">
            <div className="bg-[#e8f0f7] border border-[#194067]/20 rounded-xl p-3 flex items-start gap-3">
              <Calendar size={16} className="text-[#194067] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#526070]">
                Elige un horario disponible en el calendario de tu terapeuta. Una vez que confirmes en Zoom, regresa aquí para registrar tu cita.
              </p>
            </div>

            {/* Zoom Scheduler iframe */}
            <div className="rounded-2xl overflow-hidden border border-[#dce5ec] bg-white" style={{ height: 460 }}>
              <iframe
                src={ZOOM_SCHEDULER_URL}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Agendar cita con terapeuta"
                allow="payment"
              />
            </div>

            {/* Fallback if iframe is blocked */}
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs text-[#8096a7]">¿No carga el calendario?</span>
              <a
                href={ZOOM_SCHEDULER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#194067] font-semibold hover:underline flex items-center gap-1"
              >
                Abrir en nueva pestaña <ExternalLink size={11} />
              </a>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={closeModal} className="flex-1">Cancelar</Button>
              <Button onClick={() => setStep('confirm')} className="flex-1 gap-2">
                Ya agendé mi cita <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm date/time to save in Supabase */}
        {step === 'confirm' && (
          <div className="space-y-5">
            <div className="bg-[#fff8e1] border border-[#f9a825]/30 rounded-xl p-3 flex items-start gap-3">
              <CheckCircle size={16} className="text-[#e6971a] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#526070]">
                ¡Casi listo! Ingresa la fecha y hora que seleccionaste en Zoom para registrar tu cita en el sistema.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#0d1b2a] mb-1.5">Fecha de la cita</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  onChange={e => { setSelectedDate(e.target.value); setDateError('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce5ec] text-sm font-medium text-[#0d1b2a] focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d1b2a] mb-1.5">Hora de la cita</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => { setSelectedTime(e.target.value); setDateError('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce5ec] text-sm font-medium text-[#0d1b2a] focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10"
                />
              </div>
            </div>

            {dateError && (
              <p className="text-sm text-red-500 font-medium">{dateError}</p>
            )}

            {selectedDate && selectedTime && (
              <div className="bg-[#e8f0f7] rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#194067] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white/60 font-semibold uppercase leading-none">
                    {format(new Date(`${selectedDate}T${selectedTime}`), 'MMM', { locale: es })}
                  </span>
                  <span className="text-base font-bold text-white leading-tight">
                    {format(new Date(`${selectedDate}T${selectedTime}`), 'd')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0d1b2a] text-sm">
                    {format(new Date(`${selectedDate}T${selectedTime}`), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-xs text-[#526070] mt-0.5 flex items-center gap-1">
                    <Clock size={11} className="text-[#f9a825]" />
                    {selectedTime} · 60 min
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('book')} className="flex-1">← Volver</Button>
              <Button onClick={confirmBooking} loading={booking} disabled={!selectedDate || !selectedTime} className="flex-1">
                Registrar cita
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-[#0d1b2a]">¡Cita registrada!</p>
            <p className="text-sm text-[#526070] mt-2">Tu terapeuta podrá ver la sesión y agregar notas.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
