const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIXEL_ID = "772617998947470";
const API_VERSION = "v21.0";

async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Public endpoint: tracking events come from anonymous + authenticated users.
    // Optional CRON_SECRET check is preserved for internal/server-to-server use.
    const cronHeader = req.headers.get("x-cron-secret");
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret && cronHeader && cronHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("META_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("META_ACCESS_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      event_name,
      event_time,
      event_id,
      event_source_url,
      user_data,
      custom_data,
    } = await req.json();

    // Validate event_name against allowlist (prevents arbitrary event injection)
    const ALLOWED_EVENTS = new Set([
      "PageView",
      "ViewContent",
      "AddToCart",
      "InitiateCheckout",
      "AddPaymentInfo",
      "Purchase",
      "Lead",
      "CompleteRegistration",
      "Search",
    ]);
    if (typeof event_name !== "string" || !ALLOWED_EVENTS.has(event_name)) {
      return new Response(JSON.stringify({ error: "Invalid event_name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap custom_data.value to a reasonable upper bound to prevent
    // attribution/metric corruption via inflated revenue values.
    const MAX_VALUE = 100000; // BRL
    if (custom_data && typeof custom_data === "object") {
      const v = (custom_data as Record<string, unknown>).value;
      if (typeof v === "number" && (v < 0 || v > MAX_VALUE || !Number.isFinite(v))) {
        return new Response(JSON.stringify({ error: "Invalid custom_data.value" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fields that Meta requires SHA-256 hashed (lowercased + trimmed before hashing)
    const HASHED_FIELDS = ["em", "fn", "ln", "ph", "ct", "st", "zp", "db", "external_id"] as const;
    // Fields sent in plain text
    const PLAIN_FIELDS = ["fbp", "fbc"] as const;

    const hashedUserData: Record<string, string | string[]> = {};
    for (const f of HASHED_FIELDS) {
      const v = user_data?.[f];
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) {
        hashedUserData[f] = await Promise.all(v.filter(Boolean).map((x: string) => sha256Hash(String(x))));
      } else {
        hashedUserData[f] = await sha256Hash(String(v));
      }
    }
    for (const f of PLAIN_FIELDS) {
      const v = user_data?.[f];
      if (v) hashedUserData[f] = String(v);
    }
    // client_ip_address: prefer provided, otherwise from request headers
    if (user_data?.client_ip_address) {
      hashedUserData.client_ip_address = user_data.client_ip_address;
    } else {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "0.0.0.0";
      hashedUserData.client_ip_address = ip;
    }
    if (user_data?.client_user_agent) {
      hashedUserData.client_user_agent = user_data.client_user_agent;
    } else {
      hashedUserData.client_user_agent = req.headers.get("user-agent") || "unknown";
    }

    const payload = {
      data: [
        {
          event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id,
          event_source_url,
          action_source: "website",
          user_data: hashedUserData,
          custom_data,
        },
      ],
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.text();

    if (!res.ok) {
      console.error("Meta CAPI error:", result);
      return new Response(JSON.stringify({ error: "Meta API error", details: result }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Meta CAPI: ${event_name} sent successfully`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("meta-capi error:", (err as Error).message);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
