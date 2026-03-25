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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estado de Ánimo</h1>
          <p className="text-gray-500 text-sm mt-1">Registro diario de bienestar</p>
        </div>
        <Button onClick={() => { setSelectedMood(todayEntry?.mood ?? 5); setNote(todayEntry?.note ?? ''); setShowModal(true) }} size="sm">
          <Plus size={14} /> {todayEntry ? 'Actualizar hoy' : 'Registrar hoy'}
        </Button>
      </div>

      {/* Today's entry */}
      {todayEntry && (
        <Card className="p-5 mb-6 flex items-center gap-4">
          <span className="text-5xl">{MOOD_EMOJIS[todayEntry.mood]}</span>
          <div>
            <p className="text-sm text-gray-500">Hoy te sientes</p>
            <p className="text-xl font-bold text-gray-900">{MOOD_LABELS[todayEntry.mood]}</p>
            {todayEntry.note && <p className="text-sm text-gray-600 mt-1 italic">"{todayEntry.note}"</p>}
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold text-indigo-600">{todayEntry.mood}</p>
            <p className="text-xs text-gray-400">/10</p>
          </div>
        </Card>
      )}

      {/* Last 7 days chart */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Últimos 7 días</h2>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp size={14} className="text-indigo-500" />
            Promedio: <span className="font-semibold text-gray-900 ml-1">{avg}/10</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {last7Days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const entry = entriesByDate[dateKey]
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey
            return (
              <div key={dateKey} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                  {entry ? (
                    <div
                      className="w-full rounded-t-lg transition-all relative group"
                      style={{ height: `${(entry.mood / 10) * 100}%`, backgroundColor: MOOD_COLORS[entry.mood], minHeight: 8 }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        {MOOD_EMOJIS[entry.mood]} {entry.mood}/10
                      </div>
                    </div>
                  ) : (
                    <div className="w-full rounded-t-lg bg-gray-100" style={{ height: '8px' }} />
                  )}
                </div>
                <span className={`text-xs ${isToday ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                  {format(day, 'EEE', { locale: es }).slice(0,2)}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* History */}
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Historial</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Smile size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Aún no has registrado tu estado de ánimo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(e => (
              <div key={e.id} className="flex items-center gap-3 py-2">
                <span className="text-2xl">{MOOD_EMOJIS[e.mood]}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 capitalize">{format(new Date(e.date), "EEEE d 'de' MMMM", { locale: es })}</p>
                  {e.note && <p className="text-xs text-gray-400 italic mt-0.5">"{e.note}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: MOOD_COLORS[e.mood] }}>
                    {e.mood}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={`¿Cómo te sientes hoy? ${MOOD_EMOJIS[selectedMood]}`} size="md">
        <div className="space-y-6">
          {/* Mood slider */}
          <div className="text-center">
            <span className="text-6xl mb-2 block">{MOOD_EMOJIS[selectedMood]}</span>
            <p className="text-xl font-bold text-gray-900 mb-1">{MOOD_LABELS[selectedMood]}</p>
            <p className="text-2xl font-bold text-indigo-600">{selectedMood}/10</p>
          </div>

          <div className="px-2">
            <input
              type="range"
              min={1}
              max={10}
              value={selectedMood}
              onChange={e => setSelectedMood(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
              style={{ accentColor: MOOD_COLORS[selectedMood] }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Muy mal</span>
              <span>Increíble</span>
            </div>
          </div>

          {/* Emoji row */}
          <div className="flex justify-between">
            {[1,2,3,4,5,6,7,8,9,10].map(v => (
              <button
                key={v}
                onClick={() => setSelectedMood(v)}
                className={`text-lg transition-all ${selectedMood === v ? 'scale-125' : 'opacity-50 hover:opacity-75'}`}
              >
                {MOOD_EMOJIS[v]}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nota (opcional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="¿Qué hay en tu mente hoy?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={saveMood} loading={saving} className="flex-1">Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
