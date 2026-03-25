import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { AssignedTest, Patient } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { TESTS } from '../../data/tests'
import { ClipboardList, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type TestWithPatient = AssignedTest & { patient: Patient }

export default function TherapistTestsPage() {
  const { profile } = useAuth()
  const [tests, setTests] = useState<TestWithPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [showResult, setShowResult] = useState<TestWithPatient | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data } = await supabase
        .from('assigned_tests')
        .select('*, patient:patients(*)')
        .eq('therapist_id', profile.id)
        .order('assigned_at', { ascending: false })
      setTests((data ?? []) as TestWithPatient[])
      setLoading(false)
    }
    load()
  }, [profile])

  const filtered = tests.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pruebas asignadas</h1>
        <p className="text-gray-500 text-sm mt-1">Seguimiento de todas las pruebas psicológicas</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay pruebas {filter !== 'all' ? (filter === 'pending' ? 'pendientes' : 'completadas') : ''}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const testDef = TESTS[t.test_code]
            const interp = t.score ? testDef?.interpretation(t.score) : null
            return (
              <Card key={t.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{testDef?.name ?? t.test_code}</p>
                      <Badge color={t.status === 'completed' ? 'green' : 'yellow'}>
                        {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Badge>
                      {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{t.patient?.full_name}</p>
                    <p className="text-xs text-gray-400">{format(new Date(t.assigned_at), "d MMM yyyy", { locale: es })}</p>
                  </div>
                  {t.status === 'completed' && (
                    <Button variant="secondary" size="sm" onClick={() => setShowResult(t)}>
                      <Eye size={14} /> Ver resultado
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Result modal */}
      <Modal open={!!showResult} onClose={() => setShowResult(null)} title="Resultado de prueba" size="md">
        {showResult && (() => {
          const testDef = TESTS[showResult.test_code]
          const scores = showResult.score
          const interp = scores ? testDef?.interpretation(scores) : null
          return (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{testDef?.name}</p>
                <p className="text-sm text-gray-500">Paciente: {showResult.patient?.full_name}</p>
              </div>
              {interp && (
                <div className={`p-4 rounded-xl ${interp.color === 'green' ? 'bg-green-50' : interp.color === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{interp.description}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {scores && Object.entries(scores).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{k}</span>
                    <span className="font-semibold">{typeof v === 'number' ? Math.round(v * 100) / 100 : v}</span>
                  </div>
                ))}
              </div>
              {showResult.completed_at && <p className="text-xs text-gray-400">Completado: {format(new Date(showResult.completed_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
