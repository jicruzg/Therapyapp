import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { supabase } from '../../lib/supabase'
import type { Patient, Session } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Users, Calendar, ClipboardList, ArrowRight, Clock } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es, ptBR } from 'date-fns/locale'

export default function TherapistHome() {
  const { profile } = useAuth()
  const { t, lang } = useLang()
  const [stats, setStats] = useState({ patients: 0, todaySessions: 0, pendingTests: 0 })
  const [upcomingSessions, setUpcomingSessions] = useState<(Session & { patient: Patient })[]>([])
  const [loading, setLoading] = useState(true)
  const locale = lang === 'pt' ? ptBR : es

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
      setStats({ patients: patientsRes.count ?? 0, todaySessions: todayRes.count ?? 0, pendingTests: testsRes.count ?? 0 })
      setUpcomingSessions((sessionsRes.data ?? []) as (Session & { patient: Patient })[])
      setLoading(false)
    }
    load()
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening')
  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  function getDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return t('today')
    if (isTomorrow(d)) return t('tomorrow')
    return format(d, 'd MMM', { locale })
  }

  const statCards = [
    {
      label: t('active_patients'),
      value: stats.patients,
      icon: Users,
      href: '/terapeuta/pacientes',
      accent: '#194067',
      bg: '#e8f0f7',
    },
    {
      label: t('today_appointments'),
      value: stats.todaySessions,
      icon: Calendar,
      href: '/terapeuta/citas',
      accent: '#059669',
      bg: '#d1fae5',
    },
    {
      label: t('pending_tests'),
      value: stats.pendingTests,
      icon: ClipboardList,
      href: '/terapeuta/pruebas',
      accent: '#e6971a',
      bg: '#fff8e1',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">
          {greeting}
        </p>
        <h1 className="text-3xl font-bold text-[#0d1b2a]">{firstName}</h1>
        <p className="text-[#526070] mt-1">{t('therapist_subtitle')}</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {statCards.map(card => (
            <Link key={card.label} to={card.href} className="group">
              <Card hover className="p-6 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: card.bg }}
                  >
                    <card.icon size={22} style={{ color: card.accent }} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-[#8096a7] group-hover:text-[#194067] group-hover:translate-x-0.5 transition-all duration-200 mt-1"
                  />
                </div>
                <p className="text-4xl font-bold text-[#0d1b2a] mb-1">{card.value}</p>
                <p className="text-sm text-[#526070] font-medium">{card.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Upcoming sessions */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f4f8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e8f0f7] rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-[#194067]" />
            </div>
            <h2 className="font-bold text-[#0d1b2a]">{t('upcoming_appointments')}</h2>
          </div>
          <Link
            to="/terapeuta/citas"
            className="text-sm font-semibold text-[#194067] hover:text-[#f9a825] transition-colors flex items-center gap-1"
          >
            {t('see_all')} <ArrowRight size={14} />
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-[#8096a7]" />
            </div>
            <p className="text-[#526070] font-medium">{t('no_upcoming')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f4f8]">
            {upcomingSessions.map(s => (
              <div key={s.id} className="flex items-center gap-5 px-6 py-4 hover:bg-[#f8fafc] transition-colors">
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <p className="text-xs font-bold text-[#f9a825] uppercase tracking-wide">
                    {getDateLabel(s.scheduled_at)}
                  </p>
                  <p className="text-lg font-bold text-[#0d1b2a] leading-tight">
                    {format(new Date(s.scheduled_at), 'HH:mm')}
                  </p>
                </div>

                <div className="w-px h-10 bg-[#dce5ec] flex-shrink-0" />

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0d1b2a] truncate">{s.patient?.full_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-[#8096a7]" />
                    <p className="text-xs text-[#8096a7]">{s.duration_minutes} {t('minutes')}</p>
                  </div>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 bg-[#194067] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {s.patient?.full_name?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
