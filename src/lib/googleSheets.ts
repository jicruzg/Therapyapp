import type { TestDefinition } from '../data/tests'

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined

/**
 * Sends completed test results to Google Sheets via Apps Script Web App.
 * Uses GET + URL params to avoid CORS/redirect body-loss issues with doPost.
 * Fire-and-forget — does not block the UI on failure.
 */
export async function sendTestResultToSheets(params: {
  testDef: TestDefinition
  answers: Record<number, number>
  score: Record<string, number>
  patientName: string
  completedAt: string
}): Promise<void> {
  if (!WEBHOOK_URL) return

  const { testDef, answers, score, patientName, completedAt } = params

  const questionLabels = testDef.questions.map(
    (q, i) => `${i + 1}. ${q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text}`
  )

  const answerLabels = testDef.questions.map(q => {
    const val = answers[q.id]
    if (val === undefined) return ''
    const opt = q.options.find(o => o.value === val)
    return opt ? `${val} - ${opt.label}` : String(val)
  })

  const scoreKeys   = Object.keys(score)
  const scoreValues = Object.values(score).map(v => Math.round(v * 100) / 100)
  const interp      = testDef.interpretation(score)

  const payload = {
    testName: testDef.name,
    patientName,
    completedAt,
    questionLabels,
    answerLabels,
    scoreKeys,
    scoreValues,
    interpretation: interp.label,
  }

  try {
    // GET + URL param avoids the redirect body-loss problem of doPost
    const url = new URL(WEBHOOK_URL)
    url.searchParams.set('data', JSON.stringify(payload))
    console.log('[Sheets] Enviando a:', url.toString().slice(0, 120) + '...')
    console.log('[Sheets] Payload size:', JSON.stringify(payload).length, 'chars')
    await fetch(url.toString(), { mode: 'no-cors' })
    console.log('[Sheets] Fetch completado ✓')
  } catch (err) {
    console.error('[Sheets] Error:', err)
  }
}
