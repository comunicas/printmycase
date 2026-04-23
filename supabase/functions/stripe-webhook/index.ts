import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { dispatchCoinPurchaseConfirmation, dispatchOrderStatusEmail } from "../_shared/transactional-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const statusLabels: Record<string, string> = {
  pending: "Pagamento Pendente",
  paid: "Pagamento Confirmado",
  analyzing: "Analisando Imagem",
  rejected: "Imagem Recusada",
  producing: "Produzindo",
  shipped: "Transporte",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "#9ca3af",
  paid: "#22c55e",
  analyzing: "#f59e0b",
  rejected: "#f97316",
  producing: "#3b82f6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function buildEmailHtml(params: {
  userName: string;
  orderId: string;
  productName: string;
  newStatus: string;
  totalCents: number;
  trackingCode?: string | null;
  appUrl: string;
  logoUrl: string;
  extraMessage?: string;
}): string {
  const { userName, orderId, productName, newStatus, totalCents, trackingCode, appUrl, logoUrl, extraMessage } = params;
  const shortId = orderId.slice(0, 8);
  const statusLabel = statusLabels[newStatus] ?? newStatus;
  const statusColor = statusColors[newStatus] ?? "#8b5cf6";
  const price = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const trackingSection = newStatus === "shipped" && trackingCode
    ? `<tr><td style="padding:16px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#555;">Código de rastreio:</p>
        <p style="margin:0;font-size:16px;font-weight:600;font-family:monospace;color:#1a1a1a;">${trackingCode}</p>
        <a href="https://www.linkcorreios.com.br/?id=${trackingCode}" target="_blank" style="display:inline-block;margin-top:8px;font-size:13px;color:hsl(265,83%,57%);">Rastrear nos Correios →</a>
      </td></tr>`
    : "";

  const extraSection = extraMessage
    ? `<tr><td style="padding:16px 0 0;"><p style="margin:0;font-size:14px;color:#555;line-height:1.5;">${extraMessage}</p></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
    <tr><td align="center" style="padding-bottom:32px;">
      <img src="${logoUrl}" alt="PrintMyCase" height="40" style="height:40px;width:auto;" />
    </td></tr>
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a1a;">Olá, ${userName}!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.5;">
        Seu pedido <strong>#${shortId}</strong> teve uma atualização de status.
      </p>
    </td></tr>
    <tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;width:100%;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Novo Status</p>
          <span style="display:inline-block;padding:6px 16px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${statusColor};">${statusLabel}</span>
        </td></tr>
        <tr><td style="padding:0 20px 20px;">
          <p style="margin:0;font-size:13px;color:#888;">Produto: <strong style="color:#1a1a1a;">${productName}</strong></p>
          <p style="margin:4px 0 0;font-size:13px;color:#888;">Total: <strong style="color:#1a1a1a;">${price}</strong></p>
        </td></tr>
      </table>
    </td></tr>
    ${trackingSection}
    ${extraSection}
    <tr><td align="center" style="padding:32px 0;">
      <a href="${appUrl}/orders" target="_blank" style="display:inline-block;padding:14px 32px;background:hsl(265,83%,57%);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:1.5rem;">Ver Meus Pedidos</a>
    </td></tr>
    <tr><td align="center" style="padding-top:24px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#aaa;">PrintMyCase — Capas personalizadas</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

async function registerWebhookEvent(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: { id?: string; type?: string; data?: { object?: { id?: string } } },
): Promise<boolean> {
  const eventId = event.id;
  if (!eventId) {
    console.error("[webhook] Missing event.id");
    return false;
  }

  const { error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .insert({
      event_id: eventId,
      event_type: event.type ?? "unknown",
      stripe_session_id: event.data?.object?.id ?? null,
      payload: event as unknown as Record<string, unknown>,
    });

  if (!error) return true;
  if (error.code === "23505") {
    console.log("[webhook] Duplicate event ignored:", JSON.stringify({ eventId, type: event.type }));
    return false;
  }
  throw error;
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(",");
  let timestamp = "";
  let sig = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") sig = value;
  }

  if (!timestamp || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computed.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("[webhook] STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      console.error("[webhook] Missing Stripe signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!valid) {
      console.error("[webhook] Invalid Stripe webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const event = JSON.parse(body);
    const shouldProcess = await registerWebhookEvent(supabaseAdmin, event);
    if (!shouldProcess) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[webhook] Event received:", JSON.stringify({
      type: event.type,
      eventId: event.id,
      sessionId: event.data?.object?.id,
    }));

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};

      if (metadata.type === "coin_purchase" && metadata.user_id && metadata.coin_amount) {
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const { error: coinError } = await supabaseAdmin
          .from("coin_transactions")
          .insert({
            user_id: metadata.user_id,
            amount: parseInt(metadata.coin_amount),
            type: "coin_purchase",
            expires_at: expiresAt,
            description: `Compra de ${metadata.coin_amount} moedas`,
            stripe_session_id: session.id,
          });

        if (coinError && coinError.code !== "23505") {
          console.error("[webhook] CRITICAL: coin_transactions insert failed:", coinError.message);
        } else {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(metadata.user_id);
            const userEmail = userData?.user?.email;
            if (userEmail) {
              await dispatchCoinPurchaseConfirmation(supabaseAdmin, {
                userId: metadata.user_id,
                userEmail,
                coinsPurchased: parseInt(metadata.coin_amount),
                sessionId: session.id,
                expiresAt,
              });
            }
          } catch (emailErr) {
            console.error("[email] Coin purchase email error (non-blocking):", (emailErr as Error).message);
          }
        }
      } else {
        const { data: bonusAmountRow } = await supabaseAdmin.from("coin_settings").select("value").eq("key", "purchase_bonus_amount").single();
        const { data: bonusDaysRow } = await supabaseAdmin.from("coin_settings").select("value").eq("key", "purchase_bonus_days").single();

        const { data: processedRows, error: processError } = await supabaseAdmin.rpc("process_checkout_session_completed", {
          _stripe_session_id: session.id,
          _bonus_amount: bonusAmountRow?.value ?? 100,
          _bonus_days: bonusDaysRow?.value ?? 30,
        });

        if (processError) {
          console.error("[webhook] Atomic checkout processing failed:", processError.message, "session:", session.id);
        }

        const order = processedRows?.[0];
        if (order?.order_id && order?.user_id) {
          try {
            const [userRes, profileRes, productRes] = await Promise.all([
              supabaseAdmin.auth.admin.getUserById(order.user_id),
              supabaseAdmin.from("profiles").select("full_name").eq("id", order.user_id).single(),
              supabaseAdmin.from("products").select("name").or(`id.eq."${order.product_id}",slug.eq."${order.product_id}"`).limit(1).single(),
            ]);

            const userEmail = userRes.data?.user?.email;
            if (userEmail) {
              await enqueueOrderEmail(supabaseAdmin, {
                userEmail,
                userName: profileRes.data?.full_name || userEmail.split("@")[0],
                orderId: order.order_id,
                productName: productRes.data?.name ?? order.product_id,
                newStatus: "analyzing",
                totalCents: order.total_cents,
                extraMessage: "Recebemos seu pagamento e seu pedido está sendo analisado. Em breve começaremos a produção!",
                templateName: "order_confirmed",
              });
            }
          } catch (emailErr) {
            console.error("[email] Confirmation email error (non-blocking):", (emailErr as Error).message);
          }

          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
            const userEmail = userData?.user?.email;

            const capiPayload = {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: metadata.event_id || null,
              event_source_url: metadata.origin_url || "https://studio.printmycase.com.br",
              user_data: userEmail ? { em: userEmail } : {},
              custom_data: {
                currency: "BRL",
                value: (order.total_cents / 100).toFixed(2),
                content_ids: [metadata.product_id],
              },
            };

            const capiRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-capi`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-cron-secret": Deno.env.get("CRON_SECRET") || "",
              },
              body: JSON.stringify(capiPayload),
            });
            await capiRes.text();
            console.log("[capi] Purchase response:", capiRes.status);
          } catch (capiErr) {
            console.error("[capi] Purchase error (non-blocking):", (capiErr as Error).message);
          }
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const { error: expireError } = await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("stripe_session_id", session.id);
      if (expireError) {
        console.error("[webhook] Expire update failed:", expireError.message, "session:", session.id);
      }

      try {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, user_id, total_cents, product_id")
          .eq("stripe_session_id", session.id)
          .single();

        if (order?.user_id) {
          const [userRes, profileRes, productRes] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(order.user_id),
            supabaseAdmin.from("profiles").select("full_name").eq("id", order.user_id).single(),
            supabaseAdmin.from("products").select("name").or(`id.eq."${order.product_id}",slug.eq."${order.product_id}"`).limit(1).single(),
          ]);

          const userEmail = userRes.data?.user?.email;
          if (userEmail) {
            await enqueueOrderEmail(supabaseAdmin, {
              userEmail,
              userName: profileRes.data?.full_name || userEmail.split("@")[0],
              orderId: order.id,
              productName: productRes.data?.name ?? order.product_id,
              newStatus: "cancelled",
              totalCents: order.total_cents,
              extraMessage: "O prazo de pagamento expirou e seu pedido foi cancelado automaticamente. Você pode fazer um novo pedido a qualquer momento.",
              templateName: "order_cancelled",
            });
          }
        }
      } catch (emailErr) {
        console.error("[email] Cancellation email error (non-blocking):", (emailErr as Error).message);
      }
    } else {
      console.log("[webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[webhook] Unhandled error:", (err as Error).message, (err as Error).stack);
    return new Response(JSON.stringify({ error: "An error occurred processing the webhook" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
