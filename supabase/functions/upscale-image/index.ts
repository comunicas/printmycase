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

    const { imageBase64, imageUrl, step_number, session_id } = await req.json();
    const inputImage = imageUrl || imageBase64;
    if (!inputImage) {
      return new Response(JSON.stringify({ error: "imageUrl (or imageBase64) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch upscale cost from coin_settings
    const { data: costSetting } = await serviceClient
      .from("coin_settings")
      .select("value")
      .eq("key", "ai_upscale_cost")
      .single();
    const UPSCALE_COST = costSetting?.value ?? 5;

    // Check coin balance
    const { data: balanceData } = await serviceClient.rpc("get_coin_balance", { _user_id: userId });
    const coinBalance = (balanceData as number) ?? 0;
    if (coinBalance < UPSCALE_COST) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente", balance: coinBalance, cost: UPSCALE_COST }), {
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

    console.log("Calling fal-ai/aura-sr for upscale");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const falResponse = await fetch("https://fal.run/fal-ai/aura-sr", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: inputImage,
        upscale_factor: 4,
        overlapping_tiles: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      const sanitizedErr = errText.length > 500 ? errText.substring(0, 500) + "...[truncated]" : errText;
      console.error("Fal.ai upscale error:", sanitizedErr);
      return new Response(JSON.stringify({ error: "Erro no upscale de IA" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const falResult = await falResponse.json();
    const outputImage = falResult?.image;
    const outputUrl = outputImage?.url;
    const outputWidth = outputImage?.width ?? 0;
    const outputHeight = outputImage?.height ?? 0;

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
    const storagePath = `${userId}/upscale_${Date.now()}.jpg`;
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

    // Deduct coins
    await serviceClient
      .from("coin_transactions")
      .insert({
        user_id: userId,
        amount: -UPSCALE_COST,
        type: "ai_usage",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Upscale IA aplicado",
      });

    // Save generation history
    let generationId: string | null = null;
    try {
      const { data: genData } = await serviceClient
        .from("user_ai_generations")
        .insert({
          user_id: userId,
          image_url: signedData.signedUrl,
          storage_path: storagePath,
          generation_type: "upscale",
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

    return new Response(JSON.stringify({
      imageUrl: signedData.signedUrl,
      storagePath,
      width: outputWidth,
      height: outputHeight,
      coinsUsed: UPSCALE_COST,
      generationId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      console.error("upscale-image error: timeout after 120s");
      return new Response(JSON.stringify({ error: "Tempo limite excedido. Tente novamente." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("upscale-image error:", err?.message || "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
