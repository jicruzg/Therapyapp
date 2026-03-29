import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ZOOM_SCHEDULER_URL = 'https://scheduler.zoom.us/josegaitan/event'

export default function PatientAppointmentsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSessions = useCallback(async (patId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', patId)
      .order('scheduled_at', { ascending: false })
    setSessions(data ?? [])
  }, [])

  useEffect(() => {
    let patId: string | null = null
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase
        .from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      patId = patient.id
      setPatientId(patient.id)
      await loadSessions(patient.id)
      setLoading(false)
    }
    load()
    const interval = setInterval(() => { if (patId) loadSessions(patId) }, 20000)
    return () => clearInterval(interval)
  }, [profile, loadSessions])

  async function refresh() {
    if (!patientId) return
    setRefreshing(true)
    await loadSessions(patientId)
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">Mis Citas</h1>
          <p className="text-[#526070] mt-1">Consulta tus sesiones programadas</p>
        </div>
        <button
          onClick={refresh}
          className="mt-1 p-2 rounded-xl text-[#8096a7] hover:text-[#194067] hover:bg-[#e8f0f7] transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Zoom booking banner */}
      <div className="bg-[#194067] rounded-2xl p-5 flex gap-4 items-center">
        <div className="w-12 h-12 bg-[#f9a825] rounded-xl flex items-center justify-center flex-shrink-0">
          <Calendar size={20} className="text-[#0d1b2a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">¿Quieres agendar una sesión?</p>
          <p className="text-white/60 text-xs mt-0.5">
            Elige un horario disponible en el calendario de tu terapeuta. Tu cita aparecerá aquí una vez confirmada.
          </p>
        </div>
        <Button
          onClick={() => window.open(ZOOM_SCHEDULER_URL, '_blank', 'noopener,noreferrer')}
          className="gap-2 bg-[#f9a825] hover:bg-[#e6971a] text-[#0d1b2a] font-bold flex-shrink-0"
          size="sm"
        >
          <ExternalLink size={13} /> Abrir Zoom
        </Button>
      </div>

      {/* Sessions */}
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
          <p className="text-xs text-[#8096a7]">Tu terapeuta registrará la sesión después de que la agendes en Zoom</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const date = new Date(s.scheduled_at)
            const isUpcoming = s.status === 'scheduled' && date >= new Date()
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${isUpcoming ? 'bg-[#194067]' : 'bg-[#f0f4f8]'}`}>
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
                      <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'navy' : 'gray'}>
                        {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
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
    </div>
  )
}
