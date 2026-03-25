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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-500 text-sm mt-1">Agenda y consulta tus sesiones</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={14} /> Nueva cita
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes citas registradas</p>
          <Button onClick={() => setShowModal(true)} className="mt-4" size="sm">Agendar mi primera cita</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-indigo-500 font-medium">{format(new Date(s.scheduled_at), 'MMM', { locale: es }).toUpperCase()}</span>
                  <span className="text-lg font-bold text-indigo-700">{format(new Date(s.scheduled_at), 'd')}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">Sesión de terapia</p>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'blue' : 'gray'}>
                      {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={13} />{format(new Date(s.scheduled_at), 'HH:mm')} · {s.duration_minutes} min
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setSelectedSlot(null); setBooked(false) }} title="Agendar nueva cita" size="md">
        {booked ? (
          <div className="text-center py-8">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">¡Cita agendada!</p>
          </div>
        ) : slotsPerDay.length === 0 ? (
          <p className="text-center text-gray-500 py-8">El terapeuta no tiene disponibilidad configurada aún.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Selecciona un horario disponible:</p>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {slotsPerDay.map(({ date, slots }) => (
                <div key={date.toISOString()}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {DAYS[date.getDay()]} {format(date, 'd MMM', { locale: es })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => {
                      const isSelected = selectedSlot?.date.toDateString() === date.toDateString() && selectedSlot?.slot.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot({ date, slot })}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
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
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={bookAppointment} loading={booking} disabled={!selectedSlot} className="flex-1">Confirmar cita</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
