import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session, Patient } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

type SessionWithPatient = Session & { patient: Patient }

export default function TherapistSessionsPage() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<SessionWithPatient[]>([])
  const [selected, setSelected] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showSession, setShowSession] = useState<SessionWithPatient | null>(null)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data } = await supabase
        .from('sessions')
        .select('*, patient:patients(*)')
        .eq('therapist_id', profile.id)
        .order('scheduled_at', { ascending: false })
      setSessions((data ?? []) as SessionWithPatient[])
      setLoading(false)
    }
    load()
  }, [profile])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  function sessionsOnDay(day: Date) {
    return sessions.filter(s => isSameDay(new Date(s.scheduled_at), day))
  }

  const selectedDaySessions = sessionsOnDay(selected)

  async function updateStatus(sessionId: string, status: 'completed' | 'cancelled') {
    await supabase.from('sessions').update({ status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s))
    if (showSession?.id === sessionId) setShowSession(prev => prev ? { ...prev, status } : null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
        <p className="text-gray-500 text-sm mt-1">{sessions.length} citas registradas</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">‹</button>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                const daySessions = sessionsOnDay(day)
                const isSelected = isSameDay(day, selected)
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelected(day)}
                    className={`relative aspect-square rounded-xl text-sm flex flex-col items-center justify-center transition-all ${
                      isSelected ? 'bg-indigo-600 text-white' :
                      isToday(day) ? 'bg-indigo-50 text-indigo-700 font-semibold' :
                      'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {day.getDate()}
                    {daySessions.length > 0 && (
                      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5`}>
                        {daySessions.slice(0, 3).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Day sessions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 capitalize">
            {isToday(selected) ? 'Hoy' : format(selected, "d 'de' MMMM", { locale: es })}
          </h3>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
          ) : selectedDaySessions.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin citas este día</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDaySessions.map(s => (
                <Card key={s.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowSession(s)}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="font-medium text-sm text-gray-900">{format(new Date(s.scheduled_at), 'HH:mm')}</span>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'blue' : 'gray'}>
                      {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{s.patient?.full_name}</p>
                  <p className="text-xs text-gray-500">{s.duration_minutes} min</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session detail modal */}
      <Modal open={!!showSession} onClose={() => setShowSession(null)} title="Detalle de cita" size="md">
        {showSession && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Paciente:</span><span className="font-medium">{showSession.patient?.full_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span className="font-medium">{format(new Date(showSession.scheduled_at), "d 'de' MMMM yyyy", { locale: es })}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hora:</span><span className="font-medium">{format(new Date(showSession.scheduled_at), 'HH:mm')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duración:</span><span className="font-medium">{showSession.duration_minutes} min</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Estado:</span>
                <Badge color={showSession.status === 'completed' ? 'green' : showSession.status === 'scheduled' ? 'blue' : 'gray'}>
                  {showSession.status === 'completed' ? 'Completada' : showSession.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                </Badge>
              </div>
            </div>
            {showSession.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Notas:</p>
                <div className="bg-indigo-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">{showSession.notes}</div>
              </div>
            )}
            {showSession.status === 'scheduled' && (
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={() => updateStatus(showSession.id, 'cancelled')}>
                  <XCircle size={14} /> Cancelar cita
                </Button>
                <Button size="sm" className="flex-1 gap-2" onClick={() => updateStatus(showSession.id, 'completed')}>
                  <CheckCircle size={14} /> Marcar completada
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
