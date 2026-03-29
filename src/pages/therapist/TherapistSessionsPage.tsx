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
import { es, ptBR } from 'date-fns/locale'
import { useLang } from '../../contexts/LangContext'

type SessionWithPatient = Session & { patient: Patient }

export default function TherapistSessionsPage() {
  const { profile } = useAuth()
  const { lang } = useLang()
  const locale = lang === 'pt' ? ptBR : es
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
  const dayNames = lang === 'pt'
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  function sessionsOnDay(day: Date) {
    return sessions.filter(s => isSameDay(new Date(s.scheduled_at), day))
  }

  const selectedDaySessions = sessionsOnDay(selected)

  async function updateStatus(sessionId: string, status: 'completed' | 'cancelled') {
    await supabase.from('sessions').update({ status }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s))
    if (showSession?.id === sessionId) setShowSession(prev => prev ? { ...prev, status } : null)
  }

  const statusLabel = (s: string) => lang === 'pt'
    ? (s === 'completed' ? 'Concluída' : s === 'scheduled' ? 'Agendada' : 'Cancelada')
    : (s === 'completed' ? 'Completada' : s === 'scheduled' ? 'Programada' : 'Cancelada')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">
          {lang === 'pt' ? 'Agenda' : 'Agenda'}
        </p>
        <h1 className="text-3xl font-bold text-[#0d1b2a]">{lang === 'pt' ? 'Consultas' : 'Citas'}</h1>
        <p className="text-[#526070] mt-1">{sessions.length} {lang === 'pt' ? 'consultas registradas' : 'citas registradas'}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#0d1b2a] capitalize text-lg">{format(currentMonth, 'MMMM yyyy', { locale })}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="w-8 h-8 hover:bg-[#f0f4f8] rounded-xl flex items-center justify-center text-[#526070] font-bold transition-colors">‹</button>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="w-8 h-8 hover:bg-[#f0f4f8] rounded-xl flex items-center justify-center text-[#526070] font-bold transition-colors">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => <div key={d} className="text-center text-xs font-bold text-[#8096a7] py-1">{d}</div>)}
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
                    className={`relative aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center transition-all duration-150 ${
                      isSelected ? 'bg-[#194067] text-white shadow-md' :
                      isToday(day) ? 'bg-[#fff8e1] text-[#e6971a] ring-1 ring-[#f9a825]' :
                      'hover:bg-[#f0f4f8] text-[#526070]'
                    }`}
                  >
                    {day.getDate()}
                    {daySessions.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {daySessions.slice(0, 3).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#f9a825]' : 'bg-[#194067]'}`} />
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
          <h3 className="font-bold text-[#0d1b2a] mb-3 capitalize">
            {isToday(selected) ? (lang === 'pt' ? 'Hoje' : 'Hoy') : format(selected, "d 'de' MMMM", { locale })}
          </h3>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />)}</div>
          ) : selectedDaySessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={32} className="text-[#8096a7] mx-auto mb-2" />
              <p className="text-sm text-[#526070]">{lang === 'pt' ? 'Sem consultas neste dia' : 'Sin citas este día'}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDaySessions.map(s => (
                <Card key={s.id} hover className="p-4 cursor-pointer" onClick={() => setShowSession(s)}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={14} className="text-[#f9a825]" />
                    <span className="font-bold text-sm text-[#0d1b2a]">{format(new Date(s.scheduled_at), 'HH:mm')}</span>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'navy' : 'gray'}>
                      {statusLabel(s.status)}
                    </Badge>
                  </div>
                  <p className="font-semibold text-[#0d1b2a]">{s.patient?.full_name}</p>
                  <p className="text-xs text-[#8096a7]">{s.duration_minutes} min</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session detail modal */}
      <Modal open={!!showSession} onClose={() => setShowSession(null)} title={lang === 'pt' ? 'Detalhes da consulta' : 'Detalle de cita'} size="md">
        {showSession && (
          <div className="space-y-4">
            <div className="bg-[#f0f4f8] rounded-xl p-4 space-y-3 text-sm">
              {[
                [lang === 'pt' ? 'Paciente' : 'Paciente', showSession.patient?.full_name],
                [lang === 'pt' ? 'Data' : 'Fecha', format(new Date(showSession.scheduled_at), "d 'de' MMMM yyyy", { locale })],
                [lang === 'pt' ? 'Hora' : 'Hora', format(new Date(showSession.scheduled_at), 'HH:mm')],
                [lang === 'pt' ? 'Duração' : 'Duración', `${showSession.duration_minutes} min`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[#526070] font-medium">{label}:</span>
                  <span className="font-bold text-[#0d1b2a]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-[#526070] font-medium">{lang === 'pt' ? 'Status' : 'Estado'}:</span>
                <Badge color={showSession.status === 'completed' ? 'green' : showSession.status === 'scheduled' ? 'navy' : 'gray'}>
                  {statusLabel(showSession.status)}
                </Badge>
              </div>
            </div>
            {showSession.notes && (
              <div>
                <p className="text-sm font-semibold text-[#0d1b2a] mb-2">{lang === 'pt' ? 'Notas:' : 'Notas:'}</p>
                <div className="bg-[#e8f0f7] rounded-xl p-4 text-sm text-[#0d1b2a] whitespace-pre-wrap">{showSession.notes}</div>
              </div>
            )}
            {showSession.status === 'scheduled' && (
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" className="flex-1 gap-2 text-red-500 hover:bg-red-50" onClick={() => updateStatus(showSession.id, 'cancelled')}>
                  <XCircle size={14} /> {lang === 'pt' ? 'Cancelar' : 'Cancelar cita'}
                </Button>
                <Button size="sm" className="flex-1 gap-2" onClick={() => updateStatus(showSession.id, 'completed')}>
                  <CheckCircle size={14} /> {lang === 'pt' ? 'Concluir' : 'Marcar completada'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
