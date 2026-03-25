import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Patient, Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TherapistHome() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ patients: 0, todaySessions: 0, pendingTests: 0 })
  const [upcomingSessions, setUpcomingSessions] = useState<(Session & { patient: Patient })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const [patientsRes, sessionsRes, testsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact' }).eq('therapist_id', profile.id).eq('status', 'active'),
        supabase.from('sessions').select('*, patient:patients(*)').eq('therapist_id', profile.id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(5),
        supabase.from('assigned_tests').select('id', { count: 'exact' }).eq('therapist_id', profile.id).eq('status', 'pending'),
      ])
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      const todayRes = await supabase.from('sessions').select('id', { count: 'exact' }).eq('therapist_id', profile.id).gte('scheduled_at', todayStart).lt('scheduled_at', todayEnd).eq('status', 'scheduled')
      setStats({
        patients: patientsRes.count ?? 0,
        todaySessions: todayRes.count ?? 0,
        pendingTests: testsRes.count ?? 0,
      })
      setUpcomingSessions((sessionsRes.data ?? []) as (Session & { patient: Patient })[])
      setLoading(false)
    }
    load()
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const statCards = [
    { label: 'Pacientes activos', value: stats.patients, icon: Users, color: 'bg-indigo-100', iconColor: 'text-indigo-600', href: '/terapeuta/pacientes' },
    { label: 'Citas hoy', value: stats.todaySessions, icon: Calendar, color: 'bg-green-100', iconColor: 'text-green-600', href: '/terapeuta/citas' },
    { label: 'Pruebas pendientes', value: stats.pendingTests, icon: ClipboardList, color: 'bg-amber-100', iconColor: 'text-amber-600', href: '/terapeuta/pruebas' },
  ]

  function getDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Hoy'
    if (isTomorrow(d)) return 'Mañana'
    return format(d, "d MMM", { locale: es })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu jornada</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map(card => (
            <Link key={card.label} to={card.href}>
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <card.icon size={22} className={card.iconColor} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Upcoming sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Próximas citas</h2>
          <Link to="/terapeuta/citas" className="text-sm text-indigo-600 hover:underline">Ver todas</Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No hay citas próximas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-center w-14 flex-shrink-0">
                  <p className="text-xs text-gray-500">{getDateLabel(s.scheduled_at)}</p>
                  <p className="font-semibold text-gray-900 text-sm">{format(new Date(s.scheduled_at), 'HH:mm')}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{s.patient?.full_name}</p>
                  <p className="text-xs text-gray-500">{s.duration_minutes} minutos</p>
                </div>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
