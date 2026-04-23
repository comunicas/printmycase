import { createClient } from "npm:@supabase/supabase-js@2.49.8";

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

    console.log("Calling fal-ai/aura-sr for upscale (queue mode)");

    // Submit to fal.ai queue
    const submitRes = await fetch("https://queue.fal.run/fal-ai/aura-sr", {
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
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Fal.ai queue submit error:", errText.substring(0, 500));
      return new Response(JSON.stringify({ error: "Erro no upscale de IA" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { request_id } = await submitRes.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "Falha ao iniciar upscale" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Queued upscale request:", request_id);

    // Poll for result (max ~150s with 3s intervals = 50 attempts)
    const MAX_POLLS = 50;
    const POLL_INTERVAL = 3000;
    let falResult: any = null;

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/aura-sr/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${falApiKey}` } }
      );
      if (!statusRes.ok) {
        await statusRes.text();
        continue;
      }
      const statusData = await statusRes.json();

      if (statusData.status === "COMPLETED") {
        // Fetch the actual result
        const resultRes = await fetch(
          `https://queue.fal.run/fal-ai/aura-sr/requests/${request_id}`,
          { headers: { Authorization: `Key ${falApiKey}` } }
        );
        if (resultRes.ok) {
          falResult = await resultRes.json();
        } else {
          await resultRes.text();
        }
        break;
      }

      if (statusData.status === "FAILED") {
        console.error("Fal.ai upscale failed:", JSON.stringify(statusData));
        return new Response(JSON.stringify({ error: "Erro no upscale de IA" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // IN_QUEUE or IN_PROGRESS — keep polling
    }

    if (!falResult) {
      console.error("Upscale timed out after polling");
      return new Response(JSON.stringify({ error: "Tempo limite excedido. Tente novamente." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const filename = `upscale_${Date.now()}.jpg`;
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
          image_url: publicImageUrl,
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
    console.error("upscale-image error:", err?.message || "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
