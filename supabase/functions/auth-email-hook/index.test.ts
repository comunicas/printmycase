import 'https://deno.land/std@0.224.0/dotenv/load.ts'
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.49.8'

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EXPECTED_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
const EXPECTED_FROM_NAME = Deno.env.get('RESEND_FROM_NAME') || 'PrintMyCase'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function uniqueEmail(prefix: string) {
  const id = crypto.randomUUID().slice(0, 8)
  return `${prefix}+${id}@example.test`
}

async function waitForStatus(messagePrefix: string, templateName: 'signup' | 'recovery') {
  const timeoutAt = Date.now() + 90_000

  while (Date.now() < timeoutAt) {
    const { data, error } = await admin
      .from('email_send_log')
      .select('message_id, status, recipient_email, metadata, created_at')
      .eq('template_name', templateName)
      .like('message_id', `${messagePrefix}%`)
      .order('created_at', { ascending: true })

    if (error) throw error

    const statuses = new Set((data ?? []).map((row) => row.status))
    if (statuses.has('pending') && statuses.has('sent')) {
      return data ?? []
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }

  throw new Error(`Timeout waiting for pending/sent logs for ${templateName}`)
}

Deno.test('signup e recovery gravam pending/sent com remetente correto', async () => {
  const email = uniqueEmail('auth-e2e')
  const password = `Pmc!${crypto.randomUUID()}123`

  const { error: signUpError } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: 'Teste E2E Auth' },
      emailRedirectTo: 'https://studio.printmycase.com.br',
    },
  })
  assertEquals(signUpError, null)

  const signupRows = await waitForStatus(email, 'signup')
  const signupSent = signupRows.find((row) => row.status === 'sent')
  assert(signupSent)
  assertEquals(signupSent.recipient_email, email)
  assertEquals(signupSent.metadata?.provider, 'resend')
  assertEquals(signupSent.metadata?.from_email, EXPECTED_FROM_EMAIL)
  assertEquals(signupSent.metadata?.from_name, EXPECTED_FROM_NAME)
  assertEquals(signupSent.metadata?.from, `${EXPECTED_FROM_NAME} <${EXPECTED_FROM_EMAIL}>`)
  assert(typeof signupSent.metadata?.provider_message_id === 'string' && signupSent.metadata.provider_message_id.length > 0)

  const { error: recoveryError } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://studio.printmycase.com.br/reset-password',
  })
  assertEquals(recoveryError, null)

  const recoveryRows = await waitForStatus(email, 'recovery')
  const recoverySent = recoveryRows.find((row) => row.status === 'sent')
  assert(recoverySent)
  assertEquals(recoverySent.recipient_email, email)
  assertEquals(recoverySent.metadata?.provider, 'resend')
  assertEquals(recoverySent.metadata?.from_email, EXPECTED_FROM_EMAIL)
  assertEquals(recoverySent.metadata?.from_name, EXPECTED_FROM_NAME)
  assertEquals(recoverySent.metadata?.from, `${EXPECTED_FROM_NAME} <${EXPECTED_FROM_EMAIL}>`)
  assert(typeof recoverySent.metadata?.provider_message_id === 'string' && recoverySent.metadata.provider_message_id.length > 0)
})
