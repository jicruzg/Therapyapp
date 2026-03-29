import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Calendar, ClipboardList, Activity, BookOpen, Bell, ArrowRight, Clock } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es, ptBR } from 'date-fns/locale'

export default function PatientHome() {
  const { profile } = useAuth()
  const { t, lang } = useLang()
  const locale = lang === 'pt' ? ptBR : es
  const [nextSession, setNextSession] = useState<{ scheduled_at: string } | null>(null)
  const [pendingTests, setPendingTests] = useState(0)
  const [notifications, setNotifications] = useState<{ id: string; title: string; type: string; read: boolean }[]>([])

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) return
      const [sessionRes, testsRes, notifRes] = await Promise.all([
        supabase.from('sessions').select('scheduled_at').eq('patient_id', patient.id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1),
        supabase.from('assigned_tests').select('id', { count: 'exact' }).eq('patient_id', patient.id).eq('status', 'pending'),
        supabase.from('notifications').select('id, title, type, read').eq('patient_id', patient.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
      ])
      setNextSession(sessionRes.data?.[0] ?? null)
      setPendingTests(testsRes.count ?? 0)
      setNotifications(notifRes.data ?? [])
    }
    load()
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening')
  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  function getSessionLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return `${t('today')}, ${format(d, 'HH:mm')}`
    if (isTomorrow(d)) return `${t('tomorrow')}, ${format(d, 'HH:mm')}`
    return format(d, "d 'de' MMMM, HH:mm", { locale })
  }

  const quickLinks = [
    { to: '/paciente/citas', icon: Calendar, label: t('nav_my_appointments'), accent: '#194067', bg: '#e8f0f7' },
    { to: '/paciente/pruebas', icon: ClipboardList, label: t('nav_tests'), accent: '#e6971a', bg: '#fff8e1', badge: pendingTests },
    { to: '/paciente/estado-animo', icon: Activity, label: t('nav_mood'), accent: '#059669', bg: '#d1fae5' },
    { to: '/paciente/recursos', icon: BookOpen, label: t('nav_resources'), accent: '#7c3aed', bg: '#ede9fe' },
  ]

  const notifTypeLabel: Record<string, string> = {
    test: lang === 'pt' ? 'Avaliação' : 'Prueba',
    appointment: lang === 'pt' ? 'Consulta' : 'Cita',
    general: lang === 'pt' ? 'Geral' : 'General',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">{greeting}</p>
        <h1 className="text-3xl font-bold text-[#0d1b2a]">{firstName}</h1>
        <p className="text-[#526070] mt-1">{t('patient_subtitle')}</p>
      </div>

      {/* Next session banner */}
      {nextSession && (
        <div className="bg-[#194067] rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_24px_rgba(25,64,103,0.2)]">
          <div className="w-12 h-12 bg-[#f9a825] rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={22} className="text-[#0d1b2a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-sm font-medium">{t('next_appointment')}</p>
            <p className="text-white font-bold text-lg leading-tight">{getSessionLabel(nextSession.scheduled_at)}</p>
          </div>
          <Link to="/paciente/citas" className="flex-shrink-0">
            <div className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-colors">
              <ArrowRight size={18} className="text-white" />
            </div>
          </Link>
        </div>
      )}

      {/* Quick links grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} className="group">
            <Card hover className="p-5 text-center relative transition-all duration-200">
              {link.badge ? (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-sm z-10">
                  {link.badge}
                </span>
              ) : null}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200"
                style={{ background: link.bg }}
              >
                <link.icon size={24} style={{ color: link.accent }} />
              </div>
              <p className="text-sm font-semibold text-[#0d1b2a] leading-tight">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f4f8]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#fff8e1] rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-[#e6971a]" />
              </div>
              <h2 className="font-bold text-[#0d1b2a]">{t('nav_notifications')}</h2>
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </div>
            <Link to="/paciente/notificaciones" className="text-sm font-semibold text-[#194067] hover:text-[#f9a825] transition-colors flex items-center gap-1">
              {t('see_all')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {notifications.map(n => (
              <div key={n.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors">
                <Badge color={n.type === 'test' ? 'orange' : n.type === 'appointment' ? 'navy' : 'gray'}>
                  {notifTypeLabel[n.type] ?? n.type}
                </Badge>
                <p className="text-sm text-[#0d1b2a] font-medium flex-1">{n.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state when no session and no notifications */}
      {!nextSession && notifications.length === 0 && (
        <Card className="p-10 text-center">
          <div className="w-16 h-16 bg-[#e8f0f7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-[#194067]" />
          </div>
          <p className="font-semibold text-[#0d1b2a] mb-1">Todo al día</p>
          <p className="text-sm text-[#526070]">No tienes citas ni notificaciones pendientes.</p>
        </Card>
      )}
    </div>
  )
}
