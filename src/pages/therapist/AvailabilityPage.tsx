import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Availability } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Plus, Trash2, Clock } from 'lucide-react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AvailabilityPage() {
  const { profile } = useAuth()
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ day_of_week: 1, start_time: '09:00', end_time: '10:00' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data } = await supabase.from('availability').select('*').eq('therapist_id', profile.id).order('day_of_week').order('start_time')
      setAvailability(data ?? [])
      setLoading(false)
    }
    load()
  }, [profile])

  async function addSlot() {
    setSaving(true)
    const { data, error } = await supabase.from('availability').insert({
      therapist_id: profile!.id,
      ...form,
    }).select().single()
    if (!error && data) setAvailability(prev => [...prev, data].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)))
    setSaving(false)
    setShowModal(false)
  }

  async function deleteSlot(id: string) {
    await supabase.from('availability').delete().eq('id', id)
    setAvailability(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilidad</h1>
          <p className="text-gray-500 text-sm mt-1">Configura tus horarios disponibles para citas</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={14} /> Agregar horario
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="grid gap-3">
          {DAYS.map((name, idx) => {
            const slots = availability.filter(a => a.day_of_week === idx)
            if (idx === 0 || idx === 6) return null
            return (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 w-28">{name}</p>
                  {slots.length === 0 ? (
                    <p className="text-sm text-gray-400 flex-1">Sin horarios</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 flex-1">
                      {slots.map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
                          <Clock size={13} className="text-indigo-500" />
                          <span className="text-sm font-medium text-indigo-700">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                          <button onClick={() => deleteSlot(s.id)} className="text-red-400 hover:text-red-600 ml-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Agregar horario disponible" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Día de la semana</label>
            <select
              value={form.day_of_week}
              onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
            >
              {DAYS.slice(1, 6).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Hora inicio</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Hora fin</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={addSlot} loading={saving} className="flex-1">Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
