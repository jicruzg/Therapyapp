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
  const [patientId, setPatientId]   = useState<string | null>(null)
  const [sessions, setSessions]     = useState<Session[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSessions = useCallback(async (patId: string) => {
    const { data } = await supabase.from('sessions').select('*').eq('patient_id', patId).order('scheduled_at', { ascending: false })
    setSessions(data ?? [])
  }, [])

  useEffect(() => {
    let patId: string | null = null
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
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

  const upcoming = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) >= new Date())
  const past     = sessions.filter(s => s.status !== 'scheduled' || new Date(s.scheduled_at) < new Date())

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap pt-1">
        <div>
          <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Agenda</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Mis Citas</h1>
          <p className="text-[#526070] mt-1 text-sm">Consulta tus sesiones programadas</p>
        </div>
        <button
          onClick={refresh}
          className="mt-2 p-2.5 rounded-2xl text-[#8096a7] hover:text-[#194067] hover:bg-[#e8f0f7] transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Zoom booking banner ── */}
      <div className="bg-[#194067] rounded-3xl p-5 sm:p-6 flex gap-4 items-center shadow-[0_8px_32px_rgba(25,64,103,0.28)]">
        <div className="w-12 h-12 bg-[#f9a825] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(249,168,37,0.4)]">
          <Calendar size={20} className="text-[#0d1b2a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">¿Quieres agendar una sesión?</p>
          <p className="text-white/55 text-xs mt-0.5 leading-relaxed">
            Elige un horario disponible en el calendario de tu terapeuta. Tu cita aparecerá aquí una vez confirmada.
          </p>
        </div>
        <Button
          onClick={() => window.open(ZOOM_SCHEDULER_URL, '_blank', 'noopener,noreferrer')}
          size="sm"
          className="flex-shrink-0 gap-1.5"
        >
          <ExternalLink size={13} /> Abrir Zoom
        </Button>
      </div>

      {/* ── Sessions ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={26} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium mb-1">No tienes citas registradas aún</p>
          <p className="text-xs text-[#8096a7]">Tu terapeuta registrará la sesión después de que la agendes en Zoom</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[#526070] uppercase tracking-[0.12em] px-1">Próximas</p>
              {upcoming.map(s => <SessionCard key={s.id} s={s} highlight />)}
            </div>
          )}
          {/* Past */}
          {past.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[#526070] uppercase tracking-[0.12em] px-1">Anteriores</p>
              {past.map(s => <SessionCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SessionCard({ s, highlight = false }: { s: Session; highlight?: boolean }) {
  const date = new Date(s.scheduled_at)
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-4">
        {/* Date badge */}
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm ${
          highlight ? 'bg-[#194067] shadow-[0_4px_12px_rgba(25,64,103,0.25)]' : 'bg-[#f0f4f8]'
        }`}>
          <span className={`text-[10px] font-bold uppercase leading-none mb-0.5 ${highlight ? 'text-white/60' : 'text-[#8096a7]'}`}>
            {format(date, 'MMM', { locale: es })}
          </span>
          <span className={`text-xl font-bold leading-tight tabular-nums ${highlight ? 'text-white' : 'text-[#526070]'}`}>
            {format(date, 'd')}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-[#0d1b2a] text-sm sm:text-base">Sesión de terapia</p>
            <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'navy' : 'gray'}>
              {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
            </Badge>
          </div>
          <p className="text-sm text-[#526070] flex items-center gap-1.5 font-medium flex-wrap">
            <Clock size={12} className="text-[#f9a825] flex-shrink-0" />
            <span className="capitalize">{format(date, "EEEE d 'de' MMMM", { locale: es })}</span>
            <span className="text-[#dce5ec]">·</span>
            <span className="tabular-nums">{format(date, 'HH:mm')}</span>
            <span className="text-[#dce5ec]">·</span>
            <span>{s.duration_minutes} min</span>
          </p>
        </div>
      </div>
    </Card>
  )
}
