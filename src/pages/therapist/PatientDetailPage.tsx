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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-[#194067] border-t-transparent rounded-full" />
    </div>
  )
  if (!patient) return <div className="text-center py-16 text-[#526070] font-medium">Paciente no encontrado</div>

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'overview', label: 'Resumen', icon: FileText },
    { key: 'notes', label: 'Notas de sesión', icon: FileText },
    { key: 'tests', label: 'Pruebas', icon: ClipboardList },
    { key: 'mood', label: 'Estado de ánimo', icon: BarChart2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/terapeuta/pacientes" className="flex items-center gap-2 text-sm text-[#526070] hover:text-[#194067] mb-4 font-medium transition-colors w-fit">
          <ArrowLeft size={16} /> Volver a pacientes
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#194067] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(25,64,103,0.25)]">
            <span className="text-white text-2xl font-bold">{patient.full_name[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0d1b2a]">{patient.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-sm text-[#526070] flex items-center gap-1.5"><Mail size={13} className="text-[#8096a7]" />{patient.email}</span>
              {patient.phone && <span className="text-sm text-[#526070] flex items-center gap-1.5"><Phone size={13} className="text-[#8096a7]" />{patient.phone}</span>}
              {patient.birth_date && <span className="text-sm text-[#526070] flex items-center gap-1.5"><Cake size={13} className="text-[#8096a7]" />{format(new Date(patient.birth_date), 'd MMM yyyy', { locale: es })}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0f4f8] rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-white text-[#0d1b2a] shadow-sm' : 'text-[#526070] hover:text-[#194067]'
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
            <h3 className="font-bold text-[#0d1b2a] mb-3">Información</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[#8096a7] text-xs font-semibold uppercase tracking-wider">Diagnóstico</span>
                <p className="text-[#0d1b2a] mt-0.5 font-medium">{patient.diagnosis || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-[#8096a7] text-xs font-semibold uppercase tracking-wider">Estado</span>
                <div className="mt-0.5">
                  <Badge color={patient.status === 'active' ? 'green' : 'gray'}>{patient.status === 'active' ? 'Activo' : patient.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-[#8096a7] text-xs font-semibold uppercase tracking-wider">Notas generales</span>
                <p className="text-[#526070] mt-0.5">{patient.notes || 'Sin notas'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-[#0d1b2a] mb-3">Actividad reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#f0f4f8]">
                <span className="text-sm text-[#526070]">Sesiones registradas</span>
                <span className="font-bold text-[#0d1b2a]">{sessions.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f0f4f8]">
                <span className="text-sm text-[#526070]">Pruebas asignadas</span>
                <span className="font-bold text-[#0d1b2a]">{assignedTests.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#526070]">Pruebas completadas</span>
                <span className="font-bold text-emerald-600">{assignedTests.filter(t => t.status === 'completed').length}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <Card className="p-10 text-center text-[#8096a7] font-medium">No hay sesiones registradas</Card>
          ) : (
            sessions.map(s => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0d1b2a]">{format(new Date(s.scheduled_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
                    <Badge color={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'navy' : 'gray'} className="mt-1">
                      {s.status === 'completed' ? 'Completada' : s.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setShowNoteModal(s); setNoteText(s.notes ?? '') }}
                    className="gap-1.5"
                  >
                    <FileText size={14} />
                    {s.notes ? 'Editar nota' : 'Agregar nota'}
                  </Button>
                </div>
                {s.notes && (
                  <div className="bg-[#f0f4f8] rounded-xl p-4 text-sm text-[#526070] whitespace-pre-wrap border border-[#dce5ec]">
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
            <Button onClick={() => setShowTestModal(true)} size="sm" className="gap-1.5">
              <Plus size={14} /> Asignar prueba
            </Button>
          </div>
          {assignedTests.length === 0 ? (
            <Card className="p-10 text-center text-[#8096a7] font-medium">No hay pruebas asignadas</Card>
          ) : (
            <div className="space-y-3">
              {assignedTests.map(t => {
                const testDef = TESTS[t.test_code]
                const interp = t.score ? testDef?.interpretation(t.score) : null
                return (
                  <Card key={t.id} className="p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <div className="w-10 h-10 bg-[#e8f0f7] rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={18} className="text-[#194067]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0d1b2a]">{testDef?.name ?? t.test_code}</p>
                      <p className="text-xs text-[#8096a7] mt-0.5">{testDef?.description}</p>
                      <p className="text-xs text-[#8096a7] mt-0.5">Asignado: {format(new Date(t.assigned_at), "d MMM yyyy", { locale: es })}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
                      <Badge color={t.status === 'completed' ? 'green' : 'orange'}>
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
          <p className="text-sm text-[#8096a7]">Solo visible para el terapeuta</p>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Escribe las notas de esta sesión..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-[#dce5ec] text-sm font-medium focus:outline-none focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 resize-none text-[#0d1b2a] placeholder:text-[#8096a7] placeholder:font-normal"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowNoteModal(null)} className="flex-1">Cancelar</Button>
            <Button onClick={saveNote} loading={savingNote} className="flex-1">Guardar nota</Button>
          </div>
        </div>
      </Modal>

      {/* Assign test modal */}
      <Modal open={showTestModal} onClose={() => setShowTestModal(false)} title="Asignar prueba" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#0d1b2a] mb-2 block">Selecciona la prueba</label>
            <div className="space-y-2">
              {Object.values(TESTS).map(t => (
                <label key={t.code} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedTest === t.code ? 'border-[#194067]/40 bg-[#e8f0f7]' : 'border-[#dce5ec] hover:border-[#194067]/20'}`}>
                  <input type="radio" name="test" value={t.code} checked={selectedTest === t.code} onChange={() => setSelectedTest(t.code)} className="mt-0.5 accent-[#194067]" />
                  <div>
                    <p className="font-semibold text-sm text-[#0d1b2a]">{t.name}</p>
                    <p className="text-xs text-[#8096a7]">{t.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowTestModal(false)} className="flex-1">Cancelar</Button>
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
                <p className="font-bold text-lg text-[#0d1b2a]">{testDef?.name}</p>
                {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
              </div>
              {interp && (
                <div className={`p-4 rounded-xl border ${interp.color === 'green' ? 'bg-emerald-50 border-emerald-200' : interp.color === 'yellow' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-sm text-[#526070]">{interp.description}</p>
                </div>
              )}
              <div className="bg-[#f0f4f8] rounded-xl p-4 space-y-2">
                {scores && Object.entries(scores).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-[#526070] capitalize font-medium">{key}</span>
                    <span className="font-bold text-[#0d1b2a]">{typeof val === 'number' ? Math.round(val * 100) / 100 : val}</span>
                  </div>
                ))}
              </div>
              {showResultModal.completed_at && (
                <p className="text-xs text-[#8096a7]">Completado: {format(new Date(showResultModal.completed_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
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

  if (loading) return <div className="animate-pulse h-40 bg-[#f0f4f8] rounded-2xl" />

  const moodColors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#6366f1', '#8b5cf6', '#ec4899']

  return (
    <Card className="p-6">
      <h3 className="font-bold text-[#0d1b2a] mb-4">Estado de ánimo (últimos 30 días)</h3>
      {entries.length === 0 ? (
        <p className="text-[#8096a7] text-center py-8 font-medium">El paciente aún no ha registrado su estado de ánimo</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end gap-1.5 h-40">
            {entries.map(e => (
              <div key={e.date} className="flex-1 flex flex-col items-center gap-1" title={`${format(new Date(e.date), 'd MMM')}: ${e.mood}/10`}>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${(e.mood / 10) * 100}%`, backgroundColor: moodColors[e.mood] }}
                />
                <span className="text-xs text-[#8096a7] rotate-45 origin-left">{format(new Date(e.date), 'd/M')}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8096a7] font-medium">
            <span>Bajo (1)</span>
            <span className="text-[#0d1b2a] font-bold">Promedio: {(entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)}/10</span>
            <span>Alto (10)</span>
          </div>
        </div>
      )}
    </Card>
  )
}
