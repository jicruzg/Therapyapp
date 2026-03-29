import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session, Availability } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Calendar, Clock, Plus, CheckCircle } from 'lucide-react'
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function PatientAppointmentsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; slot: Availability } | null>(null)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id, therapist_id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      setPatientId(patient.id)
      setTherapistId(patient.therapist_id)
      const [sessionsRes, availRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('patient_id', patient.id).order('scheduled_at', { ascending: false }),
        supabase.from('availability').select('*').eq('therapist_id', patient.therapist_id).order('day_of_week').order('start_time'),
      ])
      setSessions(sessionsRes.data ?? [])
      setAvailability(availRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [profile])

  // Generate next 14 days with available slots
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))
  const slotsPerDay = nextDays.map(day => ({
    date: day,
    slots: availability.filter(a => a.day_of_week === day.getDay()),
  })).filter(d => d.slots.length > 0)

  async function bookAppointment() {
    if (!selectedSlot || !patientId || !therapistId) return
    setBooking(true)
    const [h, m] = selectedSlot.slot.start_time.split(':').map(Number)
    const scheduledAt = setMinutes(setHours(startOfDay(selectedSlot.date), h), m)
    const { data } = await supabase.from('sessions').insert({
      therapist_id: therapistId,
      patient_id: patientId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 60,
      status: 'scheduled',
    }).select().single()
    if (data) {
      setSessions(prev => [data, ...prev])
      // Notification
      await supabase.from('notifications').insert({
        patient_id: patientId,
        title: 'Cita agendada',
        message: `Tu cita fue agendada para el ${format(scheduledAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}`,
        type: 'appointment',
      })
    }
    setBooking(false)
    setBooked(true)
    setSelectedSlot(null)
    setTimeout(() => { setBooked(false); setShowModal(false) }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">Mis Citas</h1>
          <p className="text-[#526070] mt-1">Agenda y consulta tus sesiones</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm" className="mt-1 gap-2">
          <Plus size={14} /> Nueva cita
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />)}</div>
      ) : sessions.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium mb-4">No tienes citas registradas</p>
          <Button onClick={() => setShowModal(true)} size="sm">Agendar mi primera cita</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#194067] rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white/60 font-semibold uppercase">{format(new Date(s.scheduled_at), 'MMM', { locale: es })}</span>
                  <span className="text-xl font-bold text-white leading-tight">{format(new Date(s.scheduled_at), 'd')}</span>
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

      <Modal open={showModal} onClose={() => { setShowModal(false); setSelectedSlot(null); setBooked(false) }} title="Agendar nueva cita" size="md">
        {booked ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-[#0d1b2a]">¡Cita agendada!</p>
          </div>
        ) : slotsPerDay.length === 0 ? (
          <div className="text-center py-10">
            <Calendar size={40} className="text-[#8096a7] mx-auto mb-3" />
            <p className="text-[#526070] font-medium">El terapeuta no tiene disponibilidad configurada aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#526070] font-medium">Selecciona un horario disponible:</p>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {slotsPerDay.map(({ date, slots }) => (
                <div key={date.toISOString()}>
                  <p className="text-xs font-bold text-[#f9a825] uppercase tracking-wider mb-2">
                    {DAYS[date.getDay()]} · {format(date, 'd MMM', { locale: es })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => {
                      const isSelected = selectedSlot?.date.toDateString() === date.toDateString() && selectedSlot?.slot.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot({ date, slot })}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                            isSelected
                              ? 'bg-[#194067] text-white border-[#194067] shadow-md'
                              : 'bg-white text-[#526070] border-[#dce5ec] hover:border-[#194067]/50 hover:text-[#194067]'
                          }`}
                        >
                          {slot.start_time.slice(0,5)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={bookAppointment} loading={booking} disabled={!selectedSlot} className="flex-1">Confirmar cita</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
