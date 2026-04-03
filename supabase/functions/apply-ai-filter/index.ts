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
      console.error("[auth] getClaims failed:", claimsError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { imageBase64, imageUrl, filterId, step_number, session_id } = await req.json();
    const inputImage = imageUrl || imageBase64;

    if (!inputImage || !filterId) {
      return new Response(JSON.stringify({ error: "imageUrl (or imageBase64) and filterId are required" }), {
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
      .select("prompt, model_url, style_image_url, send_style_image")
      .eq("id", filterId)
      .eq("active", true)
      .single();

    if (filterError || !filter) {
      console.error("[filter] not found", { filterId, error: filterError?.message });
      return new Response(JSON.stringify({ error: "Filter not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[filter]", JSON.stringify({
      id: filterId,
      prompt: filter.prompt,
      model_url: filter.model_url,
      has_style_image: !!filter.style_image_url,
      send_style_image: filter.send_style_image,
    }));

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
    const isKontext = modelUrl.includes("kontext");
    const isSD35 = modelUrl.includes("stable-diffusion-v35-large");
    const isNanoBanana = modelUrl.includes("nano-banana");

    let falBody: Record<string, unknown>;

    if (isLightingRestoration) {
      falBody = { image_urls: [inputImage], image_size: { width: 720, height: 1280 } };
    } else if (isPhotographyEffects) {
      falBody = { image_url: inputImage, effect_type: filter.prompt, aspect_ratio: { ratio: "9:16" } };
    } else if (isStyleTransfer) {
      const shouldSendStyleImage = filter.send_style_image && !!filter.style_image_url;
      falBody = {
        image_url: inputImage,
        target_style: filter.prompt,
        ...(shouldSendStyleImage && { style_reference_image_url: filter.style_image_url }),
        aspect_ratio: { ratio: "9:16" },
      };
    } else if (isKontext) {
      falBody = {
        image_url: inputImage,
        prompt: filter.prompt,
        aspect_ratio: "9:16",
        output_format: "jpeg",
      };
    } else if (isSD35) {
      falBody = {
        image_url: inputImage,
        prompt: filter.prompt,
        strength: 0.83,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        image_size: "portrait_16_9",
        output_format: "jpeg",
      };
    } else if (isNanoBanana) {
      falBody = {
        image_urls: [inputImage],
        prompt: filter.prompt,
        aspect_ratio: "9:16",
        output_format: "jpeg",
        resolution: "1K",
        safety_tolerance: "4",
        num_images: 1,
      };
    } else {
      falBody = {
        image_url: inputImage,
        prompt: filter.prompt,
        strength: 0.85,
        num_inference_steps: 40,
        guidance_scale: 3.5,
        image_size: { width: 720, height: 1280 },
      };
    }

    const bodyKeys = Object.keys(falBody).filter(k => k !== "image_url" && k !== "image_urls");
    console.log("[fal-request]", JSON.stringify({ model: modelUrl, body_keys: bodyKeys, target_style: falBody.target_style, effect_type: falBody.effect_type, prompt: falBody.prompt }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const falResponse = await fetch(`https://fal.run/${modelUrl}`, {
      method: "POST",
      headers: { Authorization: `Key ${falApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(falBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!falResponse.ok) {
      const errText = await falResponse.text();
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
    console.log("[fal-response]", JSON.stringify({ status: falResponse.status, images_count: falResult?.images?.length ?? 0 }));

    const outputImage = falResult?.images?.[0];
    const outputUrl = outputImage?.url;
    if (!outputUrl) {
      return new Response(JSON.stringify({ error: "No image returned from AI" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download fal.ai result and upload to Supabase Storage
    const imgRes = await fetch(outputUrl);
    if (!imgRes.ok) {
      console.error("Failed to download fal.ai result:", imgRes.status);
      return new Response(JSON.stringify({ error: "Erro ao processar resultado" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
    const filename = `filter_${Date.now()}.jpg`;
    const storagePath = `${userId}/${filename}`;
    const { error: uploadError } = await serviceClient.storage
      .from("customizations")
      .upload(storagePath, imgBytes, { contentType: "image/jpeg", upsert: true });
    if (uploadError) {
      console.error("Storage upload error:", uploadError.message);
      return new Response(JSON.stringify({ error: "Erro ao salvar resultado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: signedData, error: signedError } = await serviceClient.storage
      .from("customizations")
      .createSignedUrl(storagePath, 3600);
    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError?.message);
      return new Response(JSON.stringify({ error: "Erro ao gerar URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Copy to public bucket for permanent URL
    const publicPath = `generations/${userId}/${filename}`;
    let publicImageUrl = signedData.signedUrl; // fallback
    try {
      await serviceClient.storage
        .from("product-assets")
        .upload(publicPath, imgBytes, { contentType: "image/jpeg", upsert: true });
      const { data: pubData } = serviceClient.storage
        .from("product-assets")
        .getPublicUrl(publicPath);
      if (pubData?.publicUrl) publicImageUrl = pubData.publicUrl;
    } catch (e) {
      console.warn("Failed to copy to public bucket:", e?.message);
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

    // Save generation history
    let generationId: string | null = null;
    try {
      const { data: genData } = await serviceClient
        .from("user_ai_generations")
        .insert({
          user_id: userId,
          image_url: publicImageUrl,
          storage_path: storagePath,
          generation_type: "filter",
          filter_id: filterId,
          filter_name: filter.prompt?.substring(0, 100),
          source_image_url: inputImage,
          step_number: step_number ?? 1,
          session_id: session_id ?? null,
        })
        .select("id")
        .single();
      generationId = genData?.id ?? null;
    } catch (e) {
      console.warn("Failed to save generation history:", e?.message);
    }

    console.log("[coins]", JSON.stringify({ userId, cost: AI_FILTER_COST, previous_balance: coinBalance }));

    return new Response(JSON.stringify({ imageUrl: signedData.signedUrl, storagePath, coinsUsed: AI_FILTER_COST, generationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      console.error("apply-ai-filter error: timeout after 120s");
      return new Response(JSON.stringify({ error: "Tempo limite excedido. Tente novamente." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("apply-ai-filter error:", err?.message || "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
