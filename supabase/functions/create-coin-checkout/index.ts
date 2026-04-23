import Stripe from "npm:stripe@18.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_ORIGINS = [
  "https://printmycase.com.br",
  "https://studio.printmycase.com.br",
];
const DEFAULT_ORIGIN = "https://studio.printmycase.com.br";

function getSafeOrigin(req: Request): string {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const url = new URL(raw);
    const origin = url.origin;
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    if (origin.endsWith(".lovable.app")) return origin;
  } catch { /* invalid URL */ }
  return DEFAULT_ORIGIN;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("[coin-checkout] Missing or invalid Authorization header");
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
      console.warn("[coin-checkout] Auth error:", claimsError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    const { coinAmount } = await req.json();

    console.log("[coin-checkout] Start:", JSON.stringify({
      userId,
      email: userEmail,
      coinAmount,
    }));

    // Validate against database packages
    const { data: pkg, error: pkgError } = await supabase
      .from("coin_packages")
      .select("coins, price_cents")
      .eq("coins", coinAmount)
      .eq("active", true)
      .maybeSingle();

    if (pkgError || !pkg) {
      console.warn("[coin-checkout] Invalid package:", coinAmount, pkgError?.message);
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[coin-checkout] Package found:", JSON.stringify({ coins: pkg.coins, priceCents: pkg.price_cents }));

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    console.log("[coin-checkout] Stripe customer:", customerId || "new");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: `${pkg.coins} Moedas PrintMyCase` },
            unit_amount: pkg.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        user_id: userId,
        coin_amount: String(pkg.coins),
        type: "coin_purchase",
      },
      success_url: `${getSafeOrigin(req)}/coins?purchased=${pkg.coins}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSafeOrigin(req)}/coins`,
    });

    console.log("[stripe-session] Created:", JSON.stringify({ id: session.id, url: session.url?.slice(0, 60) }));

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[coin-checkout] Unhandled error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
