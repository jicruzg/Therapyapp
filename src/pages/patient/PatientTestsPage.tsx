import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { AssignedTest } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { TESTS } from '../../data/tests'
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
    const score = testDef.scoring(answers)
    const { data } = await supabase.from('assigned_tests').update({
      status: 'completed',
      answers,
      score,
      completed_at: new Date().toISOString(),
    }).eq('id', activeTest.id).select().single()
    // Mark notification as read
    await supabase.from('notifications').update({ read: true }).eq('patient_id', patientId!).ilike('message', `%${testDef.name}%`)
    setTests(prev => prev.map(t => t.id === activeTest.id ? data : t))
    setSubmitting(false)
    setActiveTest(null)
    setAnswers({})
    setShowResult(data)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>

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
          <button onClick={() => { setActiveTest(null); setAnswers({}) }} className="text-sm text-gray-500 hover:text-indigo-600 mb-3 flex items-center gap-1">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{testDef.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{testDef.description}</p>
        </div>

        <Card className="p-4 mb-4">
          <p className="text-sm text-gray-600 italic">{testDef.instructions}</p>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{Object.keys(answers).length}/{testDef.questions.length} preguntas</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-5">
          {testDef.questions.map((q, idx) => (
            <Card key={q.id} className={`p-5 ${answers[q.id] !== undefined ? 'border-indigo-200' : ''}`}>
              <p className="text-sm font-medium text-gray-900 mb-4">
                <span className="text-indigo-500 font-bold mr-2">{idx + 1}.</span>
                {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    answers[q.id] === opt.value ? 'bg-indigo-50 border-indigo-300' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
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
          {!allAnswered && <p className="text-xs text-center text-gray-400 mt-2">Responde todas las preguntas para continuar</p>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pruebas</h1>
        <p className="text-gray-500 text-sm mt-1">Evaluaciones asignadas por tu terapeuta</p>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Pendientes</h2>
          <div className="space-y-3">
            {pending.map(t => {
              const testDef = TESTS[t.test_code]
              return (
                <Card key={t.id} className="p-4 border-l-4 border-amber-400">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{testDef?.name ?? t.test_code}</p>
                      <p className="text-xs text-gray-500">{testDef?.description}</p>
                    </div>
                    <Button onClick={() => { setActiveTest(t); setAnswers({}) }} size="sm">
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
          <h2 className="font-semibold text-gray-700 mb-3">Completadas</h2>
          <div className="space-y-3">
            {completed.map(t => {
              const testDef = TESTS[t.test_code]
              const interp = t.score ? testDef?.interpretation(t.score) : null
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{testDef?.name ?? t.test_code}</p>
                      {t.completed_at && <p className="text-xs text-gray-400">{format(new Date(t.completed_at), "d 'de' MMMM yyyy", { locale: es })}</p>}
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
        <Card className="p-12 text-center">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tienes pruebas asignadas por el momento</p>
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
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <p className="text-xl font-semibold text-gray-900">¡Prueba completada!</p>
                <p className="text-sm text-gray-500 mt-1">{testDef?.name}</p>
              </div>
              {interp && (
                <div className={`p-4 rounded-xl text-center ${interp.color === 'green' ? 'bg-green-50' : interp.color === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                  <Badge color={interp.color as 'green' | 'yellow' | 'red'} className="text-sm mb-2">{interp.label}</Badge>
                  <p className="text-sm text-gray-600">{interp.description}</p>
                </div>
              )}
              <p className="text-xs text-center text-gray-400">Tu terapeuta podrá ver estos resultados para darte un mejor seguimiento.</p>
              <Button onClick={() => setShowResult(null)} className="w-full">Cerrar</Button>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
