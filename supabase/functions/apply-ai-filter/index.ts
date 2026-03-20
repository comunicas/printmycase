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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { imageBase64, filterId } = await req.json();

    if (!imageBase64 || !filterId) {
      return new Response(JSON.stringify({ error: "imageBase64 and filterId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch filter
    const { data: filter, error: filterError } = await serviceClient
      .from("ai_filters")
      .select("prompt, model_url, style_image_url")
      .eq("id", filterId)
      .eq("active", true)
      .single();

    if (filterError || !filter) {
      return new Response(JSON.stringify({ error: "Filter not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ai_filter_cost from coin_settings
    const { data: costSetting } = await serviceClient
      .from("coin_settings")
      .select("value")
      .eq("key", "ai_filter_cost")
      .single();
    const AI_FILTER_COST = costSetting?.value ?? 10;

    // Check coin balance
    const { data: balanceData } = await serviceClient.rpc("get_coin_balance", { _user_id: userId });
    const coinBalance = (balanceData as number) ?? 0;
    if (coinBalance < AI_FILTER_COST) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente", balance: coinBalance, cost: AI_FILTER_COST }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const falApiKey = Deno.env.get("FAL_API_KEY");
    if (!falApiKey) {
      return new Response(JSON.stringify({ error: "FAL_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build Fal.ai request body
    const modelUrl = filter.model_url || "fal-ai/flux/dev/image-to-image";
    const isStyleTransfer = modelUrl.includes("style-transfer");
    const isPhotographyEffects = modelUrl.includes("photography-effects");
    const isLightingRestoration = modelUrl.includes("lighting-restoration");

    let falBody: Record<string, unknown>;

    if (isLightingRestoration) {
      falBody = { image_urls: [imageBase64], image_size: { width: 720, height: 1280 } };
    } else if (isPhotographyEffects) {
      falBody = { image_url: imageBase64, effect_type: filter.prompt, aspect_ratio: { ratio: "9:16" } };
    } else if (isStyleTransfer) {
      falBody = {
        image_url: imageBase64,
        target_style: filter.prompt,
        ...(filter.style_image_url && { style_reference_image_url: filter.style_image_url }),
        aspect_ratio: { ratio: "9:16" },
      };
    } else {
      falBody = {
        image_url: imageBase64,
        prompt: filter.prompt,
        strength: 0.75,
        num_inference_steps: 28,
        guidance_scale: 7.5,
        image_size: { width: 720, height: 1280 },
        aspect_ratio: "9:16",
      };
    }

    // Sanitized log — never log base64 payloads
    console.log("Fal.ai request:", JSON.stringify({ modelUrl, isStyleTransfer, isPhotographyEffects, isLightingRestoration }));

    const falResponse = await fetch(`https://fal.run/${modelUrl}`, {
      method: "POST",
      headers: { Authorization: `Key ${falApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      // Sanitize error log — truncate base64 from error response
      const sanitizedErr = errText.length > 500 ? errText.substring(0, 500) + "...[truncated]" : errText;
      console.error("Fal.ai error:", sanitizedErr);
      let userError = "Erro no processamento de IA";
      try {
        const parsed = JSON.parse(errText);
        const detail = parsed?.detail?.[0];
        if (detail?.type === "image_too_small") {
          userError = `Imagem muito pequena. Dimensões mínimas: ${detail.ctx?.min_width || 256}x${detail.ctx?.min_height || 256}px.`;
        }
      } catch { /* ignore */ }
      return new Response(JSON.stringify({ error: userError }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const falResult = await falResponse.json();
    const outputImage = falResult?.images?.[0];
    const outputUrl = outputImage?.url;
    if (!outputUrl) {
      return new Response(JSON.stringify({ error: "No image returned from AI" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct coins
    await serviceClient
      .from("coin_transactions")
      .insert({
        user_id: userId,
        amount: -AI_FILTER_COST,
        type: "ai_usage",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Filtro IA aplicado",
      });

    // Return URL directly instead of downloading + converting to base64
    return new Response(JSON.stringify({ imageUrl: outputUrl, coinsUsed: AI_FILTER_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("apply-ai-filter error:", err?.message || "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
