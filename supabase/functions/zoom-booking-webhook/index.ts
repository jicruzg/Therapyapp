import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

/**
 * Zoom sends a verification challenge when you first register the webhook.
 * We must respond with the HMAC-SHA256 of the plainToken using our secret.
 */
async function verifyChallenge(plainToken: string): Promise<string> {
  const secret = Deno.env.get('ZOOM_WEBHOOK_SECRET_TOKEN') ?? ''
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(plainToken))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // ── Zoom URL validation (runs once when you register the webhook) ──
  if (body.event === 'endpoint.url_validation') {
    const payload = body.payload as { plainToken: string }
    const encryptedToken = await verifyChallenge(payload.plainToken)
    return new Response(
      JSON.stringify({ plainToken: payload.plainToken, encryptedToken }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── New booking created ──
  // Zoom Scheduler may send different event names depending on version.
  // We handle both known variants.
  const isBooking =
    body.event === 'scheduler.booking_created' ||
    body.event === 'booking.created' ||
    body.event === 'scheduler.event_booked'

  if (!isBooking) {
    // Unknown event — log and return 200 so Zoom doesn't retry
    console.log('Unhandled Zoom event:', body.event)
    return new Response('OK', { status: 200 })
  }

  // Normalize payload — Zoom Scheduler wraps data in different ways
  const pl = (body.payload ?? body) as Record<string, unknown>
  const booking = (pl.booking ?? pl) as Record<string, unknown>
  const invitee = (booking.invitee ?? pl.invitee) as Record<string, string> | undefined
  const inviteeEmail: string | undefined =
    invitee?.email ?? (pl.invitee_email as string)
  const startTime: string | undefined =
    (booking.start_time as string) ?? (pl.start_time as string)
  const endTime: string | undefined =
    (booking.end_time as string) ?? (pl.end_time as string)

  console.log('Zoom booking event:', JSON.stringify({ inviteeEmail, startTime, endTime }))

  if (!inviteeEmail || !startTime) {
    console.error('Missing required fields. Full body:', JSON.stringify(body))
    return new Response('Missing invitee email or start_time', { status: 400 })
  }

  // ── Find patient by email ──
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', inviteeEmail.toLowerCase().trim())
    .single()

  if (profileError || !profileData) {
    console.error('Profile not found for email:', inviteeEmail)
    // Return 200 so Zoom doesn't keep retrying — patient may not be registered yet
    return new Response('Profile not found', { status: 200 })
  }

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, therapist_id, full_name')
    .eq('profile_id', profileData.id)
    .single()

  if (patientError || !patient) {
    console.error('Patient record not found for profile:', profileData.id)
    return new Response('Patient not found', { status: 200 })
  }

  // ── Check for duplicate (same patient + same start time) ──
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('patient_id', patient.id)
    .eq('scheduled_at', new Date(startTime).toISOString())
    .maybeSingle()

  if (existing) {
    console.log('Duplicate booking ignored:', existing.id)
    return new Response('Already exists', { status: 200 })
  }

  // ── Calculate duration ──
  const durationMinutes = endTime
    ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
    : 60

  // ── Create session ──
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      therapist_id: patient.therapist_id,
      patient_id: patient.id,
      scheduled_at: new Date(startTime).toISOString(),
      duration_minutes: durationMinutes,
      status: 'scheduled',
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Error creating session:', sessionError)
    return new Response('Error creating session', { status: 500 })
  }

  // ── Notification for patient ──
  const dateStr = new Date(startTime).toLocaleString('es-ES', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  })
  await supabase.from('notifications').insert({
    patient_id: patient.id,
    title: 'Cita agendada',
    message: `Tu cita fue confirmada para el ${dateStr}. Recibirás el enlace de Zoom por correo.`,
    type: 'appointment',
  })

  console.log('Session created:', session.id, 'for patient:', patient.full_name)
  return new Response(JSON.stringify({ success: true, session_id: session.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
