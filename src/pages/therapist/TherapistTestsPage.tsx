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
    <div className="space-y-6 w-full">
      <div className="pt-1 w-full">
        <p className="text-xs font-bold text-[#f9a825] uppercase tracking-[0.15em] mb-1.5">Seguimiento</p>
        <h1 className="text-3xl font-bold text-[#0d1b2a] tracking-tight">Pruebas psicológicas</h1>
        <p className="text-[#526070] mt-1 text-sm">Seguimiento de todas las pruebas asignadas</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              filter === f
                ? 'bg-[#194067] text-white shadow-[0_2px_8px_rgba(25,64,103,0.25)]'
                : 'bg-white text-[#526070] border border-[#dce5ec] hover:border-[#b0c8de]'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[#dce5ec]" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-14 text-center">
          <div className="w-16 h-16 bg-[#f0f4f8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-[#8096a7]" />
          </div>
          <p className="text-[#526070] font-medium">No hay pruebas {filter !== 'all' ? (filter === 'pending' ? 'pendientes' : 'completadas') : ''}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const testDef = TESTS[t.test_code]
            const interp = t.score ? testDef?.interpretation(t.score) : null
            return (
              <Card key={t.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#e8f0f7] rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={20} className="text-[#194067]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#0d1b2a]">{testDef?.name ?? t.test_code}</p>
                      <Badge color={t.status === 'completed' ? 'green' : 'orange'}>
                        {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Badge>
                      {interp && <Badge color={interp.color as 'green' | 'yellow' | 'red'}>{interp.label}</Badge>}
                    </div>
                    <p className="text-sm text-[#526070] mt-0.5 font-medium">{t.patient?.full_name}</p>
                    <p className="text-xs text-[#8096a7]">{format(new Date(t.assigned_at), "d MMM yyyy", { locale: es })}</p>
                  </div>
                  {t.status === 'completed' && (
                    <Button variant="outline" size="sm" onClick={() => setShowResult(t)} className="gap-1.5 flex-shrink-0">
                      <Eye size={14} /> Ver resultado
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!showResult} onClose={() => setShowResult(null)} title="Resultado de prueba" size="md">
        {showResult && (() => {
          const testDef = TESTS[showResult.test_code]
          const scores = showResult.score
          const interp = scores ? testDef?.interpretation(scores) : null
          return (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-bold text-[#0d1b2a]">{testDef?.name}</p>
                <p className="text-sm text-[#526070]">Paciente: {showResult.patient?.full_name}</p>
              </div>
              {interp && (
                <div className={`p-4 rounded-xl border ${interp.color === 'green' ? 'bg-emerald-50 border-emerald-200' : interp.color === 'yellow' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                  <Badge color={interp.color as 'green' | 'yellow' | 'red'} className="mb-2">{interp.label}</Badge>
                  <p className="text-sm text-[#0d1b2a]">{interp.description}</p>
                </div>
              )}
              <div className="bg-[#f0f4f8] rounded-2xl p-4 space-y-2.5">
                {scores && Object.entries(scores).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#526070] capitalize font-medium">{k}</span>
                    <span className="font-bold text-[#0d1b2a]">{typeof v === 'number' ? Math.round(v * 100) / 100 : v}</span>
                  </div>
                ))}
              </div>
              {showResult.completed_at && (
                <p className="text-xs text-[#8096a7]">Completado: {format(new Date(showResult.completed_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}</p>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
