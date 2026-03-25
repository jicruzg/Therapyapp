import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Calendar, ClipboardList, Smile, BookOpen, Bell } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PatientHome() {
  const { profile } = useAuth()
  const [_patientId, setPatientId] = useState<string | null>(null)
  const [nextSession, setNextSession] = useState<{ scheduled_at: string } | null>(null)
  const [pendingTests, setPendingTests] = useState(0)
  const [notifications, setNotifications] = useState<{ id: string; title: string; type: string; read: boolean }[]>([])
  const [_loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      setPatientId(patient.id)
      const [sessionRes, testsRes, notifRes] = await Promise.all([
        supabase.from('sessions').select('scheduled_at').eq('patient_id', patient.id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1),
        supabase.from('assigned_tests').select('id', { count: 'exact' }).eq('patient_id', patient.id).eq('status', 'pending'),
        supabase.from('notifications').select('id, title, type, read').eq('patient_id', patient.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
      ])
      setNextSession(sessionRes.data?.[0] ?? null)
      setPendingTests(testsRes.count ?? 0)
      setNotifications(notifRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  function getSessionLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return `Hoy a las ${format(d, 'HH:mm')}`
    if (isTomorrow(d)) return `Mañana a las ${format(d, 'HH:mm')}`
    return format(d, "d 'de' MMMM 'a las' HH:mm", { locale: es })
  }

  const quickLinks = [
    { to: '/paciente/citas', icon: Calendar, label: 'Mis Citas', color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { to: '/paciente/pruebas', icon: ClipboardList, label: 'Pruebas', color: 'bg-amber-100', iconColor: 'text-amber-600', badge: pendingTests },
    { to: '/paciente/estado-animo', icon: Smile, label: 'Estado de Ánimo', color: 'bg-green-100', iconColor: 'text-green-600' },
    { to: '/paciente/recursos', icon: BookOpen, label: 'Recursos', color: 'bg-purple-100', iconColor: 'text-purple-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Bienvenido/a a tu espacio de bienestar</p>
      </div>

      {/* Next session */}
      {nextSession && (
        <Card className="p-5 mb-6 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Próxima cita</p>
              <p className="text-indigo-600 font-semibold">{getSessionLabel(nextSession.scheduled_at)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to}>
            <Card className="p-4 text-center hover:shadow-md transition-shadow relative">
              {link.badge ? (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{link.badge}</span>
              ) : null}
              <div className={`w-12 h-12 ${link.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <link.icon size={22} className={link.iconColor} />
              </div>
              <p className="text-sm font-medium text-gray-700">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" /> Notificaciones
            </h2>
            <Link to="/paciente/notificaciones" className="text-sm text-indigo-600 hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50">
                <Badge color="indigo">{n.type === 'test' ? 'Prueba' : n.type === 'appointment' ? 'Cita' : 'General'}</Badge>
                <p className="text-sm text-gray-700 flex-1">{n.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
