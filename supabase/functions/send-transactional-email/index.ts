import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2.49.8'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'
import { DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME, sendWithResend } from '../_shared/resend.ts'

const SITE_NAME = DEFAULT_FROM_NAME
const FROM_EMAIL = DEFAULT_FROM_EMAIL

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

// Generate a cryptographically random 32-byte hex token
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}


async function insertEmailLog(
  supabase: any,
  payload: {
    message_id: string
    template_name: string
    recipient_email: string
    status: string
    metadata?: Record<string, unknown>
    error_message?: string
  }
) {
  const { error } = await supabase.from('email_send_log').insert(payload)

  if (error) {
    console.error('Failed to persist email_send_log entry', {
      error,
      messageId: payload.message_id,
      templateName: payload.template_name,
      status: payload.status,
    })
  }

  return error
}

function isUniqueViolation(error: unknown, constraintName?: string) {
  if (!error || typeof error !== 'object') return false

  const code = 'code' in error ? String(error.code ?? '') : ''
  const message = 'message' in error ? String(error.message ?? '') : ''
  const details = 'details' in error ? String(error.details ?? '') : ''
  const haystack = `${message} ${details}`

  return code === '23505' && (!constraintName || haystack.includes(constraintName))
}

async function resolveRequestContext(
  token: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceKey: string,
) {
  if (token === supabaseServiceKey) {
    return { mode: 'service_role' as const }
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token)

  // Only trust cryptographically verified claims. Never accept unsigned/forged
  // JWTs claiming `role: service_role` — service_role is granted only when
  // the caller presents the actual service role key (handled above).
  if (claimsError || !claimsData?.claims) {
    throw new Error('UNAUTHORIZED')
  }

  const verifiedClaims = claimsData.claims

  if (verifiedClaims.role === 'service_role') {
    return { mode: 'service_role' as const }
  }

  const userId = verifiedClaims.sub
  const userEmail = verifiedClaims.email

  if (typeof userId !== 'string' || typeof userEmail !== 'string') {
    throw new Error('UNAUTHORIZED')
  }

  return {
    mode: 'user' as const,
    userId,
    userEmail: userEmail.toLowerCase(),
  }
}

// Auth: service_role can send any registered app email.
// Authenticated end users can only self-trigger the welcome email once.

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Enforce service_role-only access
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  let requestContext: Awaited<ReturnType<typeof resolveRequestContext>>
  try {
    requestContext = await resolveRequestContext(
      token,
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey,
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Resolved send-transactional-email request context', {
    mode: requestContext.mode,
    userId: requestContext.mode === 'user' ? requestContext.userId : null,
  })

  // Parse request body
  let templateName: string
  let recipientEmail: string
  let idempotencyKey: string
  let messageId: string
  let templateData: Record<string, any> = {}
  try {
    const body = await req.json()
    templateName = body.templateName || body.template_name
    recipientEmail = body.recipientEmail || body.recipient_email
    messageId = body.messageId || body.message_id || body.idempotencyKey || body.idempotency_key || crypto.randomUUID()
    idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId
    if (body.templateData && typeof body.templateData === 'object') {
      templateData = body.templateData
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (!templateName) {
    return new Response(
      JSON.stringify({ error: 'templateName is required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 1. Look up template from registry (early — needed to resolve recipient)
  const template = TEMPLATES[templateName]

  if (!template) {
    console.error('Template not found in registry', { templateName })
    return new Response(
      JSON.stringify({
        error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (requestContext.mode === 'user') {
    if (templateName !== 'welcome-email') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: only welcome-email is allowed for authenticated users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expectedMessageId = `welcome-${requestContext.userId}`
    if (messageId !== expectedMessageId || idempotencyKey !== expectedMessageId) {
      return new Response(
        JSON.stringify({ error: 'Invalid welcome email request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (recipientEmail && recipientEmail.toLowerCase() !== requestContext.userEmail) {
      return new Response(
        JSON.stringify({ error: 'Recipient mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    recipientEmail = requestContext.userEmail
  }

  // Resolve effective recipient: template-level `to` takes precedence over
  // the caller-provided recipientEmail. This allows notification templates
  // to always send to a fixed address (e.g., site owner from env var).
  const effectiveRecipient = (template.to || recipientEmail || '').toLowerCase()

  if (!effectiveRecipient) {
    return new Response(
      JSON.stringify({
        error: 'recipientEmail is required (unless the template defines a fixed recipient)',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (requestContext.mode === 'user' && requestContext.userId) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', requestContext.userId)
      .maybeSingle()

    if (profileError) {
      console.error('Failed to load profile for welcome email', {
        error: profileError,
        userId: requestContext.userId,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to prepare email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    templateData = {
      userName: profileData?.full_name || requestContext.userEmail.split('@')[0],
      recipientEmail: requestContext.userEmail,
    }
  }

  const { data: existingEntries, error: dedupeError } = await supabase
    .from('email_send_log')
    .select('status')
    .eq('message_id', messageId)
    .in('status', ['pending', 'sent', 'suppressed'])
    .limit(1)

  if (dedupeError) {
    console.error('Failed to check email idempotency', {
      error: dedupeError,
      messageId,
      templateName,
    })
    return new Response(
      JSON.stringify({ error: 'Failed to verify idempotency' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if ((existingEntries ?? []).length > 0) {
    return new Response(
      JSON.stringify({ success: true, sent: false, duplicate: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 2. Check suppression list (fail-closed: if we can't verify, don't send)
  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', effectiveRecipient.toLowerCase())
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed — refusing to send', {
      error: suppressionError,
      effectiveRecipient,
    })
    return new Response(
      JSON.stringify({ error: 'Failed to verify suppression status' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (suppressed) {
    // Log the suppressed attempt
    await insertEmailLog(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })

    console.log('Email suppressed', { effectiveRecipient, templateName })
    return new Response(
      JSON.stringify({ success: false, reason: 'email_suppressed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 3. Get or create unsubscribe token (one token per email address)
  const normalizedEmail = effectiveRecipient.toLowerCase()
  let unsubscribeToken: string

  // Check for existing token for this email
  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('Token lookup failed', {
      error: tokenLookupError,
      email: normalizedEmail,
    })
    await insertEmailLog(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to look up unsubscribe token',
    })
    return new Response(
      JSON.stringify({ error: 'Failed to prepare email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (existingToken && !existingToken.used_at) {
    // Reuse existing unused token
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    // Create new token — upsert handles concurrent inserts gracefully
    unsubscribeToken = generateToken()
    const { error: tokenError } = await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (tokenError) {
      console.error('Failed to create unsubscribe token', {
        error: tokenError,
      })
      await insertEmailLog(supabase, {
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to create unsubscribe token',
      })
      return new Response(
        JSON.stringify({ error: 'Failed to prepare email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If another request raced us, our upsert was silently ignored.
    // Re-read to get the actual stored token.
    const { data: storedToken, error: reReadError } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (reReadError || !storedToken) {
      console.error('Failed to read back unsubscribe token after upsert', {
        error: reReadError,
        email: normalizedEmail,
      })
      await insertEmailLog(supabase, {
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to confirm unsubscribe token storage',
      })
      return new Response(
        JSON.stringify({ error: 'Failed to prepare email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    unsubscribeToken = storedToken.token
  } else {
    // Token exists but is already used — email should have been caught by suppression check above.
    // This is a safety fallback; log and skip sending.
    console.warn('Unsubscribe token already used but email not suppressed', {
      email: normalizedEmail,
    })
    await insertEmailLog(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
      error_message:
        'Unsubscribe token used but email missing from suppressed list',
    })
    return new Response(
      JSON.stringify({ success: false, reason: 'email_suppressed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  const pendingLogError = await insertEmailLog(supabase, {
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  if (isUniqueViolation(pendingLogError, 'idx_email_send_log_message_pending_unique')) {
    console.log('Transactional email already in progress, skipping duplicate send', {
      messageId,
      templateName,
      effectiveRecipient,
    })
    return new Response(
      JSON.stringify({ success: true, sent: false, duplicate: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (pendingLogError) {
    return new Response(
      JSON.stringify({ error: 'Failed to persist email state' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 4. Render React Email template to HTML and plain text
  const html = await renderAsync(
    React.createElement(template.component, templateData)
  )
  const plainText = await renderAsync(
    React.createElement(template.component, templateData),
    { plainText: true }
  )

  // Resolve subject — supports static string or dynamic function
  const resolvedSubject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  try {
    const resendResult = await sendWithResend({
      to: effectiveRecipient,
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      subject: resolvedSubject,
      html,
      text: plainText,
      replyTo: 'sac@printmycase.com.br',
      tags: [
        { name: 'template', value: templateName },
        { name: 'message_id', value: messageId },
        { name: 'idempotency_key', value: idempotencyKey },
      ],
    })

    const sentLogError = await insertEmailLog(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'sent',
      metadata: {
        provider: 'resend',
        idempotency_key: idempotencyKey,
        unsubscribe_token: unsubscribeToken,
        provider_message_id: resendResult?.id ?? null,
        from_email: FROM_EMAIL,
        from_name: SITE_NAME,
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        template_name: templateName,
      },
    })

    if (isUniqueViolation(sentLogError, 'idx_email_send_log_message_sent_unique')) {
      console.log('Transactional email already marked as sent, skipping duplicate completion', {
        messageId,
        templateName,
        effectiveRecipient,
      })
      return new Response(
        JSON.stringify({ success: true, sent: false, duplicate: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Transactional email sent via Resend', { templateName, effectiveRecipient })

    return new Response(
      JSON.stringify({ success: true, sent: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Failed to send email via Resend', {
      error,
      templateName,
      effectiveRecipient,
    })

    await insertEmailLog(supabase, {
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Failed to send email',
    })

    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
