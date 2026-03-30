import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { AssignedTest } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { TESTS } from '../../data/tests'
import { sendTestResultToSheets } from '../../lib/googleSheets'
import { ClipboardList, CheckCircle, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PatientTestsPage() {
  const { profile } = useAuth()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [tests, setTests] = useState<AssignedTest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTest, setActiveTest] = useState<AssignedTest | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showResult, setShowResult] = useState<AssignedTest | null>(null)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', profile.id).single()
      if (!patient) { setLoading(false); return }
      setPatientId(patient.id)
      const { data } = await supabase.from('assigned_tests').select('*').eq('patient_id', patient.id).order('assigned_at', { ascending: false })
      setTests(data ?? [])
      setLoading(false)
    }
    load()
  }, [profile])

  async function submitTest() {
    if (!activeTest) return
    const testDef = TESTS[activeTest.test_code]
    if (!testDef) return
    setSubmitting(true)
    const completedAt = new Date().toISOString()
    const score = testDef.scoring(answers)
    const { data } = await supabase.from('assigned_tests').update({
      status: 'completed',
      answers,
      score,
      completed_at: completedAt,
    }).eq('id', activeTest.id).select().single()
    // Mark notification as read
    await supabase.from('notifications').update({ read: true }).eq('patient_id', patientId!).ilike('message', `%${testDef.name}%`)
    // Send to Google Sheets (fire-and-forget)
    sendTestResultToSheets({
      testDef,
      answers,
      score,
      patientName: profile?.full_name ?? 'Paciente',
      completedAt,
    })
    setTests(prev => prev.map(t => t.id === activeTest.id ? data : t))
    setSubmitting(false)
    setActiveTest(null)
    setAnswers({})
    setShowResult(data)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-[#194067] border-t-transparent rounded-full" />
    </div>
  )

  const pending = tests.filter(t => t.status === 'pending')
  const completed = tests.filter(t => t.status === 'completed')

  // Active test view
  if (activeTest) {
    const testDef = TESTS[activeTest.test_code]
    if (!testDef) return null
    const allAnswered = testDef.questions.every(q => answers[q.id] !== undefined)
    const progress = Math.round((Object.keys(answers).length / testDef.questions.length) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={() => { setActiveTest(null); setAnswers({}) }} className="text-sm text-[#526070] hover:text-[#194067] mb-3 flex items-center gap-1 font-medium transition-colors">
            ← Volver
          </button>
          <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Evaluación</p>
          <h1 className="text-2xl font-bold text-[#0d1b2a]">{testDef.name}</h1>
          <p className="text-[#526070] text-sm mt-1">{testDef.description}</p>
        </div>

        <Card className="p-4 mb-4 bg-[#e8f0f7] border-[#194067]/20">
          <p className="text-sm text-[#526070] italic">{testDef.instructions}</p>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#8096a7] mb-1.5 font-medium">
            <span>{Object.keys(answers).length}/{testDef.questions.length} preguntas</span>
            <span className="text-[#f9a825] font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-[#f0f4f8] rounded-full overflow-hidden">
            <div className="h-full bg-[#194067] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-5">
          {testDef.questions.map((q, idx) => (
            <Card key={q.id} className={`p-5 ${answers[q.id] !== undefined ? 'border-[#194067]/30' : ''}`}>
              <p className="text-sm font-medium text-[#0d1b2a] mb-4">
                <span className="text-[#f9a825] font-bold mr-2">{idx + 1}.</span>
                {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    answers[q.id] === opt.value ? 'bg-[#e8f0f7] border-[#194067]/30 shadow-[inset_0_1px_3px_rgba(25,64,103,0.06)]' : 'border-[#dce5ec] hover:border-[#b0c8de] hover:bg-[#f8fafc]'
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                      className="accent-[#194067]"
                    />
                    <span className="text-sm text-[#526070]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 mb-8">
          <Button onClick={submitTest} loading={submitting} disabled={!allAnswered} className="w-full" size="lg">
            Enviar respuestas
          </Button>
          {!allAnswered && <p className="text-xs text-center text-[#8096a7] mt-2">Responde todas las preguntas para continuar</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div>
        <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Evaluaciones</p>
        <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Pruebas</h1>
        <p className="text-[#526070] mt-1 text-sm">Evaluaciones asignadas por tu terapeuta</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-[#526070] uppercase tracking-[0.12em] mb-3 px-1">Pendientes</h2>
          <div className="space-y-3">
            {pending.map(t => {
              const testDef = TESTS[t.test_code]
              return (
                <Card key={t.id} className="p-4 sm:p-5 ring-1 ring-[#f9a825]/30 shadow-[0_2px_12px_rgba(249,168,37,0.12)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#fff8e1] rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={18} className="text-[#e6971a]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0d1b2a]">{testDef?.name ?? t.test_code}</p>
                      <p className="text-xs text-[#8096a7] mt-0.5">{testDef?.description}</p>
                    </div>
                    <Button onClick={() => { setActiveTest(t); setAnswers({}) }} size="sm" className="gap-1.5 flex-shrink-0">
                      Responder <ChevronRight size={14} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-[#526070] uppercase tracking-[0.12em] mb-3 px-1">Completadas</h2>
          <div className="space-y-3">
            {completed.map(t => {
              const testDef = TESTS[t.test_code]
              const interp = t.score ? testDef?.interpretation(t.score) : null
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0d1b2a]">{testDef?.name ?? t.test_code}</p>
                      {t.completed_at && <p className="text-xs text-[#8096a7] mt-0.5">{format(new Date(t.completed_at), "d 'de' MMMM yyyy", { locale: es })}</p>}
                    </div>
                    {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
                    <Button variant="secondary" size="sm" onClick={() => setShowResult(t)}>Ver</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium">No tienes pruebas asignadas por el momento</p>
        </Card>
      )}

      {/* Result modal */}
      <Modal open={!!showResult} onClose={() => setShowResult(null)} title="Tu resultado" size="md">
        {showResult && (() => {
          const testDef = TESTS[showResult.test_code]
          const scores = showResult.score
          const interp = scores ? testDef?.interpretation(scores) : null
          return (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-[#0d1b2a]">¡Prueba completada!</p>
                <p className="text-sm text-[#526070] mt-1">{testDef?.name}</p>
              </div>
              {interp && (
                <div className={`p-5 rounded-2xl text-center border ${interp.color === 'green' ? 'bg-emerald-50 border-emerald-200/60' : interp.color === 'yellow' ? 'bg-amber-50 border-amber-200/60' : 'bg-red-50 border-red-200/60'}`}>
                  <Badge color={interp.color as 'green' | 'yellow' | 'red'} className="mb-2">{interp.label}</Badge>
                  <p className="text-sm text-[#526070]">{interp.description}</p>
                </div>
              )}
              <p className="text-xs text-center text-[#8096a7]">Tu terapeuta podrá ver estos resultados para darte un mejor seguimiento.</p>
              <Button onClick={() => setShowResult(null)} className="w-full">Cerrar</Button>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
