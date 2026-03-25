import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Patient, Session, AssignedTest } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { TESTS } from '../../data/tests'
import {
  ArrowLeft, Calendar, ClipboardList, FileText, Plus, Trash2, Eye,
  BarChart2, Mail, Phone, Cake
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Tab = 'overview' | 'notes' | 'tests' | 'mood'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState<Session | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState('')
  const [assigningTest, setAssigningTest] = useState(false)
  const [showResultModal, setShowResultModal] = useState<AssignedTest | null>(null)

  useEffect(() => {
    async function load() {
      const [patientRes, sessionsRes, testsRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).single(),
        supabase.from('sessions').select('*').eq('patient_id', id).order('scheduled_at', { ascending: false }),
        supabase.from('assigned_tests').select('*').eq('patient_id', id).order('assigned_at', { ascending: false }),
      ])
      setPatient(patientRes.data)
      setSessions(sessionsRes.data ?? [])
      setAssignedTests(testsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function saveNote() {
    if (!showNoteModal) return
    setSavingNote(true)
    await supabase.from('sessions').update({ notes: noteText }).eq('id', showNoteModal.id)
    setSessions(prev => prev.map(s => s.id === showNoteModal.id ? { ...s, notes: noteText } : s))
    setSavingNote(false)
    setShowNoteModal(null)
  }

  async function assignTest() {
    if (!selectedTest || !patient) return
    setAssigningTest(true)
    const { data } = await supabase.from('assigned_tests').insert({
      therapist_id: profile!.id,
      patient_id: patient.id,
      test_code: selectedTest,
      status: 'pending',
    }).select().single()
    // Create notification
    await supabase.from('notifications').insert({
      patient_id: patient.id,
      title: 'Nueva prueba asignada',
      message: `Tu terapeuta te ha asignado el ${TESTS[selectedTest]?.name}. Por favor complétalo.`,
      type: 'test',
    })
    setAssignedTests(prev => [data, ...prev])
    setAssigningTest(false)
    setShowTestModal(false)
    setSelectedTest('')
  }

  async function deleteAssignedTest(testId: string) {
    await supabase.from('assigned_tests').delete().eq('id', testId)
    setAssignedTests(prev => prev.filter(t => t.id !== testId))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
  if (!patient) return <div className="text-center py-16 text-gray-500">Paciente no encontrado</div>

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'overview', label: 'Resumen', icon: FileText },
    { key: 'notes', label: 'Notas de sesión', icon: FileText },
    { key: 'tests', label: 'Pruebas', icon: ClipboardList },
    { key: 'mood', label: 'Estado de ánimo', icon: BarChart2 },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/terapeuta/pacientes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4">
          <ArrowLeft size={16} /> Volver a pacientes
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 text-2xl font-bold">{patient.full_name[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Mail size={13} />{patient.email}</span>
              {patient.phone && <span className="text-sm text-gray-500 flex items-center gap-1"><Phone size={13} />{patient.phone}</span>}
              {patient.birth_date && <span className="text-sm text-gray-500 flex items-center gap-1"><Cake size={13} />{format(new Date(patient.birth_date), 'd MMM yyyy', { locale: es })}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Información</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Diagnóstico:</span><p className="text-gray-900 mt-0.5">{patient.diagnosis || 'No especificado'}</p></div>
              <div><span className="text-gray-500">Estado:</span><Badge color={patient.status === 'active' ? 'green' : 'gray'} className="mt-0.5">{patient.status === 'active' ? 'Activo' : patient.status}</Badge></div>
              <div><span className="text-gray-500">Notas generales:</span><p className="text-gray-900 mt-0.5">{patient.notes || 'Sin notas'}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Actividad reciente</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">{sessions.length}</span> sesiones registradas</p>
              <p><span className="font-medium">{assignedTests.length}</span> pruebas asignadas</p>
              <p><span className="font-medium">{assignedTests.filter(t => t.status === 'completed').length}</span> pruebas completadas</p>
            </div>
          </Card>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <Card className="p-10 text-center text-gray-400">No hay sesiones registradas</Card>
          ) : (
            sessions.map(s => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{format(new Date(s.scheduled_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'blue' : 'gray'} className="mt-1">
                      {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setShowNoteModal(s); setNoteText(s.notes ?? '') }}
                  >
                    <FileText size={14} />
                    {s.notes ? 'Editar nota' : 'Agregar nota'}
                  </Button>
                </div>
                {s.notes && (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {s.notes}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'tests' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowTestModal(true)} size="sm">
              <Plus size={14} /> Asignar prueba
            </Button>
          </div>
          {assignedTests.length === 0 ? (
            <Card className="p-10 text-center text-gray-400">No hay pruebas asignadas</Card>
          ) : (
            <div className="space-y-3">
              {assignedTests.map(t => {
                const testDef = TESTS[t.test_code]
                const interp = t.score ? testDef?.interpretation(t.score) : null
                return (
                  <Card key={t.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{testDef?.name ?? t.test_code}</p>
                      <p className="text-xs text-gray-500">{testDef?.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Asignado: {format(new Date(t.assigned_at), "d MMM yyyy", { locale: es })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
                      <Badge color={t.status === 'completed' ? 'green' : 'yellow'}>
                        {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Badge>
                      {t.status === 'completed' && (
                        <Button variant="ghost" size="sm" onClick={() => setShowResultModal(t)}>
                          <Eye size={14} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteAssignedTest(t.id)}>
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'mood' && <MoodChart patientId={patient.id} />}

      {/* Note modal */}
      <Modal open={!!showNoteModal} onClose={() => setShowNoteModal(null)} title="Nota de sesión" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Solo visible para el terapeuta</p>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Escribe las notas de esta sesión..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowNoteModal(null)} className="flex-1">Cancelar</Button>
            <Button onClick={saveNote} loading={savingNote} className="flex-1">Guardar nota</Button>
          </div>
        </div>
      </Modal>

      {/* Assign test modal */}
      <Modal open={showTestModal} onClose={() => setShowTestModal(false)} title="Asignar prueba" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Selecciona la prueba</label>
            <div className="space-y-2">
              {Object.values(TESTS).map(t => (
                <label key={t.code} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedTest === t.code ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="test" value={t.code} checked={selectedTest === t.code} onChange={() => setSelectedTest(t.code)} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowTestModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={assignTest} loading={assigningTest} disabled={!selectedTest} className="flex-1">Asignar</Button>
          </div>
        </div>
      </Modal>

      {/* Result modal */}
      <Modal open={!!showResultModal} onClose={() => setShowResultModal(null)} title="Resultado de la prueba" size="md">
        {showResultModal && (() => {
          const testDef = TESTS[showResultModal.test_code]
          const scores = showResultModal.score
          const interp = scores ? testDef?.interpretation(scores) : null
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">{testDef?.name}</p>
                {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'} className="text-sm">{interp.label}</Badge>}
              </div>
              {interp && <p className="text-sm text-gray-600">{interp.description}</p>}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {scores && Object.entries(scores).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key}</span>
                    <span className="font-semibold text-gray-900">{typeof val === 'number' ? Math.round(val * 100) / 100 : val}</span>
                  </div>
                ))}
              </div>
              {showResultModal.completed_at && (
                <p className="text-xs text-gray-400">Completado: {format(new Date(showResultModal.completed_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

function MoodChart({ patientId }: { patientId: string }) {
  const [entries, setEntries] = useState<{ date: string; mood: number; note?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('mood_entries').select('*').eq('patient_id', patientId).order('date', { ascending: true }).limit(30)
      setEntries(data ?? [])
      setLoading(false)
    }
    load()
  }, [patientId])

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />

  const moodColors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#6366f1', '#8b5cf6', '#ec4899']

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Estado de ánimo (últimos 30 días)</h3>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-center py-8">El paciente aún no ha registrado su estado de ánimo</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end gap-1.5 h-40">
            {entries.map(e => (
              <div key={e.date} className="flex-1 flex flex-col items-center gap-1" title={`${format(new Date(e.date), 'd MMM')}: ${e.mood}/10`}>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${(e.mood / 10) * 100}%`, backgroundColor: moodColors[e.mood] }}
                />
                <span className="text-xs text-gray-400 rotate-45 origin-left">{format(new Date(e.date), 'd/M')}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Bajo (1)</span>
            <span className="font-medium">Promedio: {(entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)}/10</span>
            <span>Alto (10)</span>
          </div>
        </div>
      )}
    </Card>
  )
}
