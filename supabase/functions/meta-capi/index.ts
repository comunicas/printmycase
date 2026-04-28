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

    // Hash user data fields as required by Meta
    const hashedUserData: Record<string, string> = {};
    if (user_data?.em) {
      hashedUserData.em = await sha256Hash(user_data.em);
    }
    if (user_data?.fn) {
      hashedUserData.fn = await sha256Hash(user_data.fn);
    }
    if (user_data?.ph) {
      hashedUserData.ph = await sha256Hash(user_data.ph);
    }
    // client_ip_address: prefer provided value, otherwise extract from request headers
    if (user_data?.client_ip_address) {
      hashedUserData.client_ip_address = user_data.client_ip_address;
    } else {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "0.0.0.0";
      hashedUserData.client_ip_address = ip;
    }
    // client_user_agent: prefer provided value, otherwise extract from request
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
