import { createClient } from 'npm:@supabase/supabase-js@2.49.8'

interface CoinPurchaseEmailParams {
  userId: string
  userEmail: string
  coinsPurchased: number
  sessionId: string
  expiresAt: string
}

interface DispatchResult {
  success: boolean
  duplicate?: boolean
}

export async function dispatchCoinPurchaseConfirmation(
  supabaseAdmin: ReturnType<typeof createClient>,
  params: CoinPurchaseEmailParams,
): Promise<DispatchResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[email] Missing service role configuration for coin purchase email')
    return { success: false }
  }

  const messageId = `coin-purchase-${params.sessionId}`
  const { data: existingLog, error: existingLogError } = await supabaseAdmin
    .from('email_send_log')
    .select('status')
    .eq('message_id', messageId)
    .in('status', ['pending', 'sent'])
    .limit(1)
    .maybeSingle()

  if (existingLogError) {
    console.error('[email] Failed to inspect previous coin email log:', existingLogError.message)
  }

  if (existingLog) {
    return { success: true, duplicate: true }
  }

  const [{ data: profileRes }, { data: balanceAfterRes }] = await Promise.all([
    supabaseAdmin.from('profiles').select('full_name').eq('id', params.userId).maybeSingle(),
    supabaseAdmin.rpc('get_coin_balance', { _user_id: params.userId }),
  ])

  const response = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      templateName: 'coin-purchase-confirmation',
      recipientEmail: params.userEmail,
      messageId,
      idempotencyKey: messageId,
      templateData: {
        userName: profileRes?.full_name || params.userEmail.split('@')[0],
        coinsPurchased: params.coinsPurchased,
        balanceAfter: typeof balanceAfterRes === 'number' ? balanceAfterRes : null,
        expiresAt: params.expiresAt,
        orderReference: params.sessionId,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[email] Coin purchase dispatch failed:', {
      status: response.status,
      body: errorBody,
    })
    return { success: false }
  }

  const payload: unknown = await response.json().catch(() => null)
  return {
    success: true,
    duplicate:
      typeof payload === 'object' && payload !== null && 'duplicate' in payload
        ? Boolean((payload as { duplicate?: unknown }).duplicate)
        : false,
  }
}