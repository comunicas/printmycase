export const RESEND_GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'

export const DEFAULT_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
export const DEFAULT_FROM_NAME = Deno.env.get('RESEND_FROM_NAME') || 'PrintMyCase'

interface SendResendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string | string[]
  tags?: Array<{ name: string; value: string }>
}

export function getResendEnv() {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!lovableApiKey) throw new Error('LOVABLE_API_KEY is not configured')

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured')

  return { lovableApiKey, resendApiKey }
}

function parseGatewayResponse(responseText: string) {
  if (!responseText) return null

  try {
    return JSON.parse(responseText) as Record<string, unknown>
  } catch {
    return { raw: responseText }
  }
}

export async function sendWithResend({
  to,
  subject,
  html,
  text,
  from = `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
  replyTo,
  tags,
}: SendResendEmailParams) {
  const { lovableApiKey, resendApiKey } = getResendEnv()

  const response = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'X-Connection-Api-Key': resendApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo,
      tags,
    }),
  })

  const responseText = await response.text()
  const payload = parseGatewayResponse(responseText)

  if (!response.ok) {
    throw new Error(
      `Resend API call failed [${response.status}]: ${JSON.stringify(payload ?? { raw: responseText })}`
    )
  }

  return payload as { id?: string; raw?: string }
}