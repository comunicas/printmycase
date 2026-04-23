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

interface OrderStatusEmailParams {
  userEmail: string
  userName: string
  orderId: string
  productName: string
  newStatus: string
  totalCents: number
  trackingCode?: string | null
  rejectionReason?: string | null
  extraMessage?: string | null
  idempotencyKey: string
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

export async function dispatchOrderStatusEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  params: OrderStatusEmailParams,
): Promise<DispatchResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[email] Missing service role configuration for order status email')
    return { success: false }
  }

  const messageId = params.idempotencyKey
  const { data: existingLog } = await supabaseAdmin
    .from('email_send_log')
    .select('status')
    .eq('message_id', messageId)
    .in('status', ['pending', 'sent'])
    .limit(1)
    .maybeSingle()

  if (existingLog) {
    return { success: true, duplicate: true }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      templateName: 'order-status-update',
      recipientEmail: params.userEmail,
      messageId,
      idempotencyKey: messageId,
      templateData: {
        userName: params.userName,
        orderId: params.orderId,
        productName: params.productName,
        newStatus: params.newStatus,
        totalCents: params.totalCents,
        trackingCode: params.trackingCode ?? null,
        rejectionReason: params.rejectionReason ?? null,
        extraMessage: params.extraMessage ?? null,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[email] Order status dispatch failed:', {
      status: response.status,
      body: errorBody,
      orderId: params.orderId,
      newStatus: params.newStatus,
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