import type { TestDefinition } from '../data/tests'

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined

/**
 * Sends completed test results to Google Sheets via Apps Script Web App.
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

  // Build ordered question data (by question index, not ID)
  const questionLabels = testDef.questions.map(
    (q, i) => `${i + 1}. ${q.text.length > 80 ? q.text.slice(0, 80) + '…' : q.text}`
  )

  const answerLabels = testDef.questions.map(q => {
    const val = answers[q.id]
    if (val === undefined) return ''
    const opt = q.options.find(o => o.value === val)
    return opt ? `${val} - ${opt.label}` : String(val)
  })

  const scoreKeys   = Object.keys(score)
  const scoreValues = Object.values(score).map(v => Math.round(v * 100) / 100)

  const interp = testDef.interpretation(score)

  const payload = {
    testName:       testDef.name,
    patientName,
    completedAt,
    questionLabels,
    answerLabels,
    scoreKeys,
    scoreValues,
    interpretation: interp.label,
  }

  try {
    // Content-Type: text/plain avoids CORS preflight with Apps Script
    await fetch(WEBHOOK_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    })
  } catch {
    // Silently ignore — Google Sheets sync is non-critical
  }
}
