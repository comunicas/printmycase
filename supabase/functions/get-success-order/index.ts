import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHECKOUT_SESSION_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";

function b64urlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function b64urlEncode(input: Uint8Array): string {
  return btoa(String.fromCharCode(...input)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64urlEncode(new Uint8Array(signature));
}

type SuccessTokenPayload = {
  sid: string;
  nonce: string;
  exp: number;
};

async function validateSuccessToken(rawToken: string, expectedSessionId: string, secret: string): Promise<SuccessTokenPayload | null> {
  const [payloadEncoded, providedSignature] = rawToken.split(".");
  if (!payloadEncoded || !providedSignature) return null;

  let payload: SuccessTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadEncoded)));
  } catch {
    return null;
  }

  if (!payload?.sid || !payload?.nonce || !payload?.exp) return null;
  if (payload.sid !== expectedSessionId) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  const normalizedPayload = JSON.stringify({
    sid: CHECKOUT_SESSION_PLACEHOLDER,
    nonce: payload.nonce,
    exp: payload.exp,
  });
  const expectedSignature = await signPayload(normalizedPayload, secret);

  if (expectedSignature !== providedSignature) return null;
  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id: sessionId, token } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const tokenSecret = Deno.env.get("CHECKOUT_SUCCESS_TOKEN_SECRET");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
    );

    let authenticatedUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const bearer = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await userClient.auth.getClaims(bearer);
      authenticatedUserId = (claimsData?.claims?.sub as string | undefined) || null;
    }

    if (authenticatedUserId) {
      const { data: order } = await userClient
        .from("orders")
        .select("product_id, total_cents, shipping_cents, created_at, customization_data")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", authenticatedUserId)
        .maybeSingle();

      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!token || !tokenSecret) {
      return new Response(JSON.stringify({ error: "Invalid success token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await validateSuccessToken(token, sessionId, tokenSecret);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid success token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order } = await adminClient
      .from("orders")
      .select("product_id, total_cents, shipping_cents, created_at, customization_data")
      .eq("stripe_session_id", sessionId)
      .eq("public_success_nonce", payload.nonce)
      .maybeSingle();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[get-success-order] Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
