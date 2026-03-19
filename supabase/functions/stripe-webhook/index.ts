import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  let timestamp = "";
  let sig = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") sig = value;
  }

  if (!timestamp || !sig) return false;

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison
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
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      console.error("Missing Stripe signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!valid) {
      console.error("Invalid Stripe webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};

      if (metadata.type === "coin_purchase" && metadata.user_id && metadata.coin_amount) {
        // Credit purchased coins (365 days expiry)
        await supabaseAdmin
          .from("coin_transactions")
          .insert({
            user_id: metadata.user_id,
            amount: parseInt(metadata.coin_amount),
            type: "coin_purchase",
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            description: `Compra de ${metadata.coin_amount} moedas`,
          });
        console.log(`Credited ${metadata.coin_amount} coins to ${metadata.user_id}`);
      } else {
        // Regular case purchase — update order + credit dynamic bonus coins
        await supabaseAdmin
          .from("orders")
          .update({ status: "analyzing" })
          .eq("stripe_session_id", session.id);

        // Fetch bonus settings
        const { data: bonusAmountRow } = await supabaseAdmin
          .from("coin_settings")
          .select("value")
          .eq("key", "purchase_bonus_amount")
          .single();
        const { data: bonusDaysRow } = await supabaseAdmin
          .from("coin_settings")
          .select("value")
          .eq("key", "purchase_bonus_days")
          .single();
        const bonusAmount = bonusAmountRow?.value ?? 100;
        const bonusDays = bonusDaysRow?.value ?? 30;

        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("user_id, total_cents")
          .eq("stripe_session_id", session.id)
          .single();

        if (order?.user_id) {
          await supabaseAdmin
            .from("coin_transactions")
            .insert({
              user_id: order.user_id,
              amount: bonusAmount,
              type: "purchase_bonus",
              expires_at: new Date(Date.now() + bonusDays * 24 * 60 * 60 * 1000).toISOString(),
              description: "Bônus por compra de case",
            });
          console.log(`Credited ${bonusAmount} bonus coins to ${order.user_id}`);

          // Send server-side Purchase event to Meta CAPI
          try {
            // Get user email for hashing
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
            const userEmail = userData?.user?.email;

            const capiPayload = {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: metadata.event_id || null,
              event_source_url: metadata.origin_url || "https://printmycase.com.br",
              user_data: userEmail ? { em: userEmail } : {},
              custom_data: {
                currency: "BRL",
                value: (order.total_cents / 100).toFixed(2),
                content_ids: [metadata.product_id],
              },
            };

            const capiRes = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-capi`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-cron-secret": Deno.env.get("CRON_SECRET") || "",
                },
                body: JSON.stringify(capiPayload),
              }
            );
            await capiRes.text();
            console.log(`Meta CAPI Purchase response: ${capiRes.status}`);
          } catch (capiErr) {
            // Log but don't block the webhook flow
            console.error("Meta CAPI error (non-blocking):", (capiErr as Error).message);
          }
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("stripe_session_id", session.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response(
      JSON.stringify({ error: "An error occurred processing the webhook" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
