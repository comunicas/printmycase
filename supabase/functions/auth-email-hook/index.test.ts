import 'https://deno.land/std@0.224.0/dotenv/load.ts'
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EXPECTED_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
const EXPECTED_FROM_NAME = Deno.env.get('RESEND_FROM_NAME') || 'PrintMyCase'

interface EmailLogRow {
  message_id: string
  status: string
  recipient_email: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface FunctionResponse {
  success?: boolean
  sent?: boolean
  duplicate?: boolean
  error?: string
}

function uniqueEmail(prefix: string) {
  const id = crypto.randomUUID().slice(0, 8)
  return `${prefix}+${id}@example.test`
}

async function waitForStatus(recipientEmail: string, templateName: 'signup' | 'recovery', startedAt: string): Promise<EmailLogRow[]> {
  const timeoutAt = Date.now() + 90_000

  while (Date.now() < timeoutAt) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/email_send_log?select=message_id,status,recipient_email,metadata,created_at&template_name=eq.${templateName}&recipient_email=eq.${encodeURIComponent(recipientEmail)}&created_at=gte.${encodeURIComponent(startedAt)}&order=created_at.asc`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    )
    const data = (await response.json()) as EmailLogRow[]
    if (!response.ok) throw new Error(JSON.stringify(data))

    const statuses = new Set((data ?? []).map((row: EmailLogRow) => row.status))
    if (statuses.has('pending') && statuses.has('sent')) {
      return data ?? []
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }

  throw new Error(`Timeout waiting for pending/sent logs for ${templateName}`)
}

async function fetchEmailLogs(messageId: string): Promise<EmailLogRow[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/email_send_log?select=message_id,status,recipient_email,metadata,created_at&message_id=eq.${encodeURIComponent(messageId)}&order=created_at.asc`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    },
  )
  const data = (await response.json()) as EmailLogRow[]
  if (!response.ok) throw new Error(JSON.stringify(data))
  return data ?? []
}

async function waitForMessageRows(messageId: string): Promise<EmailLogRow[]> {
  const timeoutAt = Date.now() + 90_000

  while (Date.now() < timeoutAt) {
    const rows = await fetchEmailLogs(messageId)
    const pendingCount = rows.filter((row) => row.status === 'pending').length
    const sentCount = rows.filter((row) => row.status === 'sent').length

    if (pendingCount === 1 && sentCount === 1) {
      return rows
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }

  throw new Error(`Timeout waiting for single pending/sent rows for ${messageId}`)
}

async function invokeTransactionalEmail(body: Record<string, unknown>): Promise<FunctionResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json()) as FunctionResponse
  if (!response.ok) {
    throw new Error(JSON.stringify(payload))
  }

  return payload
}

Deno.test('signup e recovery gravam pending/sent com remetente correto', async () => {
  const email = uniqueEmail('auth-e2e')
  const password = `Pmc!${crypto.randomUUID()}123`
  const signupStartedAt = new Date().toISOString()

  const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: { full_name: 'Teste E2E Auth' },
      email_redirect_to: 'https://studio.printmycase.com.br',
    }),
  })
  const signUpPayload = await signUpResponse.json()
  assertEquals(signUpResponse.status, 200)
  assert(signUpPayload !== undefined)

  const signupRows = await waitForStatus(email, 'signup', signupStartedAt)
  const signupSent = signupRows.find((row: EmailLogRow) => row.status === 'sent')
  assert(signupSent)
  assertEquals(signupSent.recipient_email, email)
  assertEquals(signupSent.metadata?.provider, 'resend')
  assertEquals(signupSent.metadata?.from_email, EXPECTED_FROM_EMAIL)
  assertEquals(signupSent.metadata?.from_name, EXPECTED_FROM_NAME)
  assertEquals(signupSent.metadata?.from, `${EXPECTED_FROM_NAME} <${EXPECTED_FROM_EMAIL}>`)
  assert(typeof signupSent.metadata?.provider_message_id === 'string' && signupSent.metadata.provider_message_id.length > 0)

  const recoveryStartedAt = new Date().toISOString()
  const recoveryResponse = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email,
      redirect_to: 'https://studio.printmycase.com.br/reset-password',
    }),
  })
  const recoveryPayload = await recoveryResponse.json()
  assertEquals(recoveryResponse.status, 200)
  assert(recoveryPayload !== undefined)

  const recoveryRows = await waitForStatus(email, 'recovery', recoveryStartedAt)
  const recoverySent = recoveryRows.find((row: EmailLogRow) => row.status === 'sent')
  assert(recoverySent)
  assertEquals(recoverySent.recipient_email, email)
  assertEquals(recoverySent.metadata?.provider, 'resend')
  assertEquals(recoverySent.metadata?.from_email, EXPECTED_FROM_EMAIL)
  assertEquals(recoverySent.metadata?.from_name, EXPECTED_FROM_NAME)
  assertEquals(recoverySent.metadata?.from, `${EXPECTED_FROM_NAME} <${EXPECTED_FROM_EMAIL}>`)
  assert(typeof recoverySent.metadata?.provider_message_id === 'string' && recoverySent.metadata.provider_message_id.length > 0)
})

Deno.test('welcome-email mantém idempotência com uma única trilha pending/sent', async () => {
  const email = uniqueEmail('welcome-e2e')
  const messageId = `welcome-e2e-${crypto.randomUUID()}`

  const [firstResponse, secondResponse] = await Promise.all([
    invokeTransactionalEmail({
      templateName: 'welcome-email',
      recipientEmail: email,
      messageId,
      idempotencyKey: messageId,
      templateData: { userName: 'Teste Welcome', recipientEmail: email },
    }),
    invokeTransactionalEmail({
      templateName: 'welcome-email',
      recipientEmail: email,
      messageId,
      idempotencyKey: messageId,
      templateData: { userName: 'Teste Welcome', recipientEmail: email },
    }),
  ])

  assert(firstResponse.sent || firstResponse.duplicate)
  assert(secondResponse.sent || secondResponse.duplicate)
  assert(firstResponse.duplicate || secondResponse.duplicate)

  const rows = await waitForMessageRows(messageId)
  const pendingRows = rows.filter((row) => row.status === 'pending')
  const sentRows = rows.filter((row) => row.status === 'sent')

  assertEquals(pendingRows.length, 1)
  assertEquals(sentRows.length, 1)
  assertEquals(sentRows[0].recipient_email, email)
  assertEquals(sentRows[0].metadata?.provider, 'resend')
  assertEquals(sentRows[0].metadata?.from_email, EXPECTED_FROM_EMAIL)
  assertEquals(sentRows[0].metadata?.from_name, EXPECTED_FROM_NAME)
  assertEquals(sentRows[0].metadata?.from, `${EXPECTED_FROM_NAME} <${EXPECTED_FROM_EMAIL}>`)
  assert(typeof sentRows[0].metadata?.provider_message_id === 'string' && sentRows[0].metadata.provider_message_id.length > 0)
})
