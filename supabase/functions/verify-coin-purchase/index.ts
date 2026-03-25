import Stripe from "npm:stripe@18.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return new Response(JSON.stringify({ error: "sessionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[verify-coin] Start:", JSON.stringify({ userId, sessionId }));

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check idempotency — already credited?
    const { data: existing } = await supabaseAdmin
      .from("coin_transactions")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existing) {
      console.log("[verify-coin] Already credited for session:", sessionId);
      return new Response(JSON.stringify({ status: "already_credited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch session from Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("[verify-coin] Stripe session:", JSON.stringify({
      paymentStatus: session.payment_status,
      metadataType: session.metadata?.type,
      metadataUserId: session.metadata?.user_id,
      coinAmount: session.metadata?.coin_amount,
    }));

    // Validate
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: "not_paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.metadata?.type !== "coin_purchase") {
      return new Response(JSON.stringify({ status: "not_coin_purchase" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.metadata?.user_id !== user.id) {
      console.warn("[verify-coin] User mismatch:", user.id, "vs", session.metadata?.user_id);
      return new Response(JSON.stringify({ error: "User mismatch" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const coinAmount = parseInt(session.metadata.coin_amount || "0");
    if (coinAmount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid coin amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credit coins with idempotency key
    const { error: insertError } = await supabaseAdmin
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: coinAmount,
        type: "coin_purchase",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Compra de ${coinAmount} moedas`,
        stripe_session_id: sessionId,
      });

    if (insertError) {
      // Unique constraint violation = already credited (race condition)
      if (insertError.code === "23505") {
        console.log("[verify-coin] Race condition: already credited for session:", sessionId);
        return new Response(JSON.stringify({ status: "already_credited" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("[verify-coin] Insert failed:", insertError.message);
      throw new Error("Failed to credit coins");
    }

    console.log("[verify-coin] Coins credited:", coinAmount, "to user:", user.id);

    return new Response(JSON.stringify({ status: "credited", coins: coinAmount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[verify-coin] Error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
