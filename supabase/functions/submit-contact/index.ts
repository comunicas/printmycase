import { createClient } from 'npm:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server configuration error' }, 500)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const message = String(body.message || '').trim()
  const website = String(body.website || '').trim()

  if (website) return json({ success: true, ignored: true })
  if (!name || !email || !message) return json({ error: 'Missing required fields' }, 400)
  if (!emailRegex.test(email)) return json({ error: 'Invalid email' }, 400)
  if (name.length > 100 || email.length > 255 || message.length > 1000) return json({ error: 'Field too long' }, 400)

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const contactId = crypto.randomUUID()

  const { error: insertError } = await supabase.from('contact_messages').insert({ id: contactId, name, email, message })
  if (insertError) return json({ error: 'Failed to save contact message' }, 500)

  const authHeaders = { Authorization: `Bearer ${serviceRoleKey}` }
  const confirmationPromise = supabase.functions.invoke('send-transactional-email', {
    headers: authHeaders,
    body: {
      templateName: 'contact-confirmation',
      recipientEmail: email,
      messageId: `contact-confirmation-${contactId}`,
      idempotencyKey: `contact-confirmation-${contactId}`,
      templateData: { name },
    },
  })

  const notificationPromise = supabase.functions.invoke('send-transactional-email', {
    headers: authHeaders,
    body: {
      templateName: 'contact-notification',
      messageId: `contact-notification-${contactId}`,
      idempotencyKey: `contact-notification-${contactId}`,
      templateData: { name, email, message },
    },
  })

  const [confirmationResult, notificationResult] = await Promise.allSettled([confirmationPromise, notificationPromise])

  if (confirmationResult.status === 'rejected' || notificationResult.status === 'rejected') {
    console.error('Contact email dispatch promise rejected', { contactId })
  }

  if (confirmationResult.status === 'fulfilled' && confirmationResult.value.error) {
    console.error('Contact confirmation email failed', confirmationResult.value.error)
  }
  if (notificationResult.status === 'fulfilled' && notificationResult.value.error) {
    console.error('Contact notification email failed', notificationResult.value.error)
  }

  return json({ success: true, id: contactId })
})