import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { MoodEntry } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { Smile, TrendingUp, Plus } from 'lucide-react'

const MOOD_EMOJIS = ['', '😔', '😢', '😞', '😟', '😐', '🙂', '😊', '😄', '😁', '🤩']
const MOOD_LABELS = ['', 'Muy mal', 'Mal', 'Regular', 'Un poco triste', 'Neutral', 'Bien', 'Bastante bien', 'Muy bien', 'Excelente', 'Increíble']
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#6366f1', '#8b5cf6']

export default function MoodTrackerPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMood, setSelectedMood] = useState<number>(5)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      setPatientId(patient.id)
      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false })
        .limit(30)
      setEntries(data ?? [])
      const today = format(new Date(), 'yyyy-MM-dd')
      setTodayEntry(data?.find(e => e.date === today) ?? null)
      setLoading(false)
    }
    load()
  }, [profile])

  async function saveMood() {
    if (!patientId) return
    setSaving(true)
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.from('mood_entries').upsert({
      patient_id: patientId,
      date: today,
      mood: selectedMood,
      note: note || null,
    }, { onConflict: 'patient_id,date' }).select().single()
    if (!error && data) {
      setEntries(prev => {
        const filtered = prev.filter(e => e.date !== today)
        return [data, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
      })
      setTodayEntry(data)
    }
    setSaving(false)
    setShowModal(false)
    setNote('')
  }

  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
  const entriesByDate = Object.fromEntries(entries.map(e => [e.date, e]))
  const avg = entries.length > 0 ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : '--'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Bienestar</p>
          <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Estado de Ánimo</h1>
          <p className="text-[#526070] mt-1 text-sm">Registro diario de bienestar emocional</p>
        </div>
        <Button onClick={() => { setSelectedMood(todayEntry?.mood ?? 5); setNote(todayEntry?.note ?? ''); setShowModal(true) }} size="sm" className="mt-1 gap-2">
          <Plus size={14} /> {todayEntry ? 'Actualizar hoy' : 'Registrar hoy'}
        </Button>
      </div>

      {/* Today */}
      {todayEntry && (
        <div className="bg-[#194067] rounded-3xl p-5 sm:p-6 flex items-center gap-5 shadow-[0_8px_32px_rgba(25,64,103,0.28)]">
          <span className="text-5xl">{MOOD_EMOJIS[todayEntry.mood]}</span>
          <div className="flex-1">
            <p className="text-white/60 text-sm font-medium">Hoy te sientes</p>
            <p className="text-white text-2xl font-bold">{MOOD_LABELS[todayEntry.mood]}</p>
            {todayEntry.note && <p className="text-white/70 text-sm mt-1 italic">"{todayEntry.note}"</p>}
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#f9a825]">{todayEntry.mood}</p>
            <p className="text-white/40 text-sm">/10</p>
          </div>
        </div>
      )}

      {/* 7-day chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[#0d1b2a]">Últimos 7 días</h2>
          <div className="flex items-center gap-2 text-sm text-[#526070]">
            <TrendingUp size={14} className="text-[#f9a825]" />
            Promedio: <span className="font-bold text-[#0d1b2a] ml-1">{avg}/10</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-28">
          {last7Days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const entry = entriesByDate[dateKey]
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey
            return (
              <div key={dateKey} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                  {entry ? (
                    <div
                      className="w-full rounded-xl transition-all relative group cursor-pointer"
                      style={{ height: `${(entry.mood / 10) * 100}%`, backgroundColor: MOOD_COLORS[entry.mood], minHeight: 10 }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#0d1b2a] text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap items-center gap-1">
                        {MOOD_EMOJIS[entry.mood]} <span className="font-bold">{entry.mood}/10</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full rounded-xl bg-[#f0f4f8]" style={{ height: '10px' }} />
                  )}
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-[#f9a825]' : 'text-[#8096a7]'}`}>
                  {format(day, 'EEE', { locale: es }).slice(0,2)}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-[#f0f4f8]">
          <h2 className="font-bold text-[#0d1b2a]">Historial</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#f0f4f8] rounded-xl animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Smile size={40} className="text-[#8096a7] mx-auto mb-2" />
            <p className="text-[#526070] text-sm font-medium">Aún no has registrado tu estado de ánimo</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f4f8]">
            {entries.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors">
                <span className="text-2xl">{MOOD_EMOJIS[e.mood]}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0d1b2a] capitalize">{format(new Date(e.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                  {e.note && <p className="text-xs text-[#8096a7] italic mt-0.5">"{e.note}"</p>}
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ backgroundColor: MOOD_COLORS[e.mood] }}>
                  {e.mood}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`¿Cómo te sientes hoy? ${MOOD_EMOJIS[selectedMood]}`} size="md">
        <div className="space-y-6">
          <div className="text-center bg-[#f0f4f8] rounded-2xl p-6 sm:p-8">
            <span className="text-7xl mb-3 block">{MOOD_EMOJIS[selectedMood]}</span>
            <p className="text-lg font-bold text-[#0d1b2a] mb-1">{MOOD_LABELS[selectedMood]}</p>
            <p className="text-3xl font-bold" style={{ color: MOOD_COLORS[selectedMood] }}>{selectedMood}<span className="text-lg text-[#8096a7] font-medium">/10</span></p>
          </div>
          <div className="px-2">
            <input type="range" min={1} max={10} value={selectedMood}
              onChange={e => setSelectedMood(parseInt(e.target.value))}
              className="w-full cursor-pointer h-2 rounded-full appearance-none"
              style={{ accentColor: MOOD_COLORS[selectedMood] }}
            />
            <div className="flex justify-between text-xs text-[#8096a7] mt-2 font-medium">
              <span>Muy mal</span><span>Increíble</span>
            </div>
          </div>
          <div className="flex justify-between px-1">
            {[1,2,3,4,5,6,7,8,9,10].map(v => (
              <button key={v} onClick={() => setSelectedMood(v)}
                className={`text-xl transition-all duration-150 ${selectedMood === v ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}>
                {MOOD_EMOJIS[v]}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold text-[#0d1b2a] mb-1.5 block">Nota (opcional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="¿Qué hay en tu mente hoy?" rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 resize-none text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal transition-all duration-200"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={saveMood} loading={saving} className="flex-1">Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
