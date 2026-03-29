import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Clock, Plus, CheckCircle, ExternalLink, RefreshCw, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ZOOM_SCHEDULER_URL = 'https://scheduler.zoom.us/josegaitan/event'

export default function PatientAppointmentsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [zoomOpened, setZoomOpened] = useState(false)

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
    setZoomOpened(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">Mis Citas</h1>
          <p className="text-[#526070] mt-1">Agenda y consulta tus sesiones</p>
        </div>
        <Button onClick={openZoom} size="sm" className="mt-1 gap-2">
          <Plus size={14} /> Nueva cita
        </Button>
      </div>

      {/* Banner: how to book */}
      <div className="bg-[#194067] rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap size={18} className="text-[#f9a825]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">¿Cómo agendar tu cita?</p>
          <p className="text-white/70 text-xs mt-1 leading-relaxed">
            Haz clic en <span className="text-[#f9a825] font-semibold">Nueva cita</span>, elige un horario disponible en el calendario de Zoom de tu terapeuta y confirma. Tu cita aparecerá aquí automáticamente.
          </p>
        </div>
      </div>

      {/* Post-zoom banner (shown after patient clicked the button) */}
      {zoomOpened && (
        <div className="bg-[#fff8e1] border border-[#f9a825]/40 rounded-2xl p-4 flex items-center gap-4">
          <CheckCircle size={20} className="text-[#e6971a] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0d1b2a]">¿Ya agendaste en Zoom?</p>
            <p className="text-xs text-[#526070] mt-0.5">
              Tu cita se registra automáticamente. Si no aparece aún, actualiza la lista.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="gap-1.5 flex-shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        </div>
      )}

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
          <p className="text-[#526070] font-medium mb-2">No tienes citas registradas aún</p>
          <p className="text-xs text-[#8096a7] mb-5">Agenda tu primera sesión con tu terapeuta</p>
          <Button onClick={openZoom} size="sm" className="gap-2 mx-auto">
            <ExternalLink size={14} /> Abrir calendario de Zoom
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const date = new Date(s.scheduled_at)
            const isPast = date < new Date()
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                    s.status === 'completed' || isPast ? 'bg-[#f0f4f8]' : 'bg-[#194067]'
                  }`}>
                    <span className={`text-xs font-semibold uppercase ${
                      s.status === 'completed' || isPast ? 'text-[#8096a7]' : 'text-white/60'
                    }`}>
                      {format(date, 'MMM', { locale: es })}
                    </span>
                    <span className={`text-xl font-bold leading-tight ${
                      s.status === 'completed' || isPast ? 'text-[#526070]' : 'text-white'
                    }`}>
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
                      {format(date, 'HH:mm')} · {s.duration_minutes} min
                    </p>
                  </div>
                  {s.status === 'scheduled' && !isPast && (
                    <a
                      href={ZOOM_SCHEDULER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#194067] font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <ExternalLink size={12} /> Zoom
                    </a>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
