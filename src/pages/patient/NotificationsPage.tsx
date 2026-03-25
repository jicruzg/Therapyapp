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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-gray-500 text-sm mt-1">{notifications.filter(n => !n.read).length} sin leer</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes notificaciones</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`p-4 ${!n.read ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                    <Badge color={typeColor(n.type)}>
                      {n.type === 'test' ? 'Prueba' : n.type === 'appointment' ? 'Cita' : 'General'}
                    </Badge>
                    {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(n.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
