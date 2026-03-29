import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Availability } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Plus, Trash2, Clock } from 'lucide-react'
import { useLang } from '../../contexts/LangContext'

export default function AvailabilityPage() {
  const { profile } = useAuth()
  const { lang } = useLang()
  const DAYS = lang === 'pt'
    ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f9a825] uppercase tracking-widest mb-1">
            {lang === 'pt' ? 'Agenda' : 'Agenda'}
          </p>
          <h1 className="text-3xl font-bold text-[#0d1b2a]">{lang === 'pt' ? 'Disponibilidade' : 'Disponibilidad'}</h1>
          <p className="text-[#526070] mt-1">{lang === 'pt' ? 'Configure seus horários disponíveis' : 'Configura tus horarios disponibles para citas'}</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm" className="mt-1 gap-2">
          <Plus size={14} /> {lang === 'pt' ? 'Adicionar' : 'Agregar horario'}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />)}</div>
      ) : (
        <div className="grid gap-3">
          {DAYS.map((name, idx) => {
            const slots = availability.filter(a => a.day_of_week === idx)
            if (idx === 0 || idx === 6) return null
            return (
              <Card key={idx} className="p-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="font-bold text-[#0d1b2a] w-28 flex-shrink-0">{name}</p>
                  {slots.length === 0 ? (
                    <p className="text-sm text-[#8096a7]">{lang === 'pt' ? 'Sem horários' : 'Sin horarios'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-[#e8f0f7] border border-[#194067]/20 rounded-xl px-3 py-2">
                          <Clock size={13} className="text-[#f9a825]" />
                          <span className="text-sm font-semibold text-[#194067]">{s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</span>
                          <button onClick={() => deleteSlot(s.id)} className="text-[#8096a7] hover:text-red-500 ml-1 transition-colors">
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={lang === 'pt' ? 'Adicionar horário disponível' : 'Agregar horario disponible'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#0d1b2a] mb-1.5 block">{lang === 'pt' ? 'Dia da semana' : 'Día de la semana'}</label>
            <select
              value={form.day_of_week}
              onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 rounded-xl border border-[#dce5ec] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 bg-white text-[#0d1b2a]"
            >
              {DAYS.slice(1, 6).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#0d1b2a] mb-1.5 block">{lang === 'pt' ? 'Hora início' : 'Hora inicio'}</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#dce5ec] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0d1b2a] mb-1.5 block">{lang === 'pt' ? 'Hora fim' : 'Hora fin'}</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#dce5ec] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">{lang === 'pt' ? 'Cancelar' : 'Cancelar'}</Button>
            <Button onClick={addSlot} loading={saving} className="flex-1">{lang === 'pt' ? 'Salvar' : 'Guardar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
