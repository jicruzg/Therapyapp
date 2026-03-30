import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Notification } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Bell, ClipboardList, Calendar, Info } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function NotificationsPage() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
      setNotifications(data ?? [])
      // Mark all as read
      await supabase.from('notifications').update({ read: true }).eq('patient_id', patient.id).eq('read', false)
      setLoading(false)
    }
    load()
  }, [profile])

  const typeIcon = (type: string) => {
    if (type === 'test') return <ClipboardList size={16} className="text-amber-500" />
    if (type === 'appointment') return <Calendar size={16} className="text-blue-500" />
    return <Info size={16} className="text-gray-500" />
  }

  const typeColor = (type: string): 'yellow' | 'blue' | 'gray' => {
    if (type === 'test') return 'yellow'
    if (type === 'appointment') return 'blue'
    return 'gray'
  }

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Bandeja</p>
        <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Notificaciones</h1>
        <p className="text-[#526070] mt-1 text-sm">{notifications.filter(n => !n.read).length} sin leer</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />)}</div>
      ) : notifications.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium">No tienes notificaciones</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[#f0f4f8]">
            {notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors ${!n.read ? 'bg-[#fff8e1]/40' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  n.type === 'test' ? 'bg-[#fff8e1]' : n.type === 'appointment' ? 'bg-[#e8f0f7]' : 'bg-[#f0f4f8]'
                }`}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-[#0d1b2a] text-sm">{n.title}</p>
                    <Badge color={typeColor(n.type)}>
                      {n.type === 'test' ? 'Prueba' : n.type === 'appointment' ? 'Cita' : 'General'}
                    </Badge>
                    {!n.read && <span className="w-2 h-2 bg-[#f9a825] rounded-full" />}
                  </div>
                  <p className="text-sm text-[#526070]">{n.message}</p>
                  <p className="text-xs text-[#8096a7] mt-1.5 font-medium">{format(new Date(n.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
