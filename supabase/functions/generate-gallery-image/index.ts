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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isAdmin } = await serviceClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image_urls, prompt, seed, image_size, safety_tolerance, output_format } = await req.json();
    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0 || !prompt) {
      return new Response(JSON.stringify({ error: "image_urls (array) and prompt are required" }), {
        status: 400,
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

    const falBody: Record<string, unknown> = {
      image_urls,
      prompt,
    };
    if (seed != null && seed !== "") falBody.seed = Number(seed);
    if (image_size && image_size !== "auto") falBody.image_size = image_size;
    if (safety_tolerance != null) falBody.safety_tolerance = Number(safety_tolerance);
    if (output_format) falBody.output_format = output_format;

    console.log("Calling fal-ai/flux-2-pro/edit with params:", JSON.stringify({ ...falBody, image_urls: `[${image_urls.length} images]` }));
    const falResponse = await fetch("https://fal.run/fal-ai/flux-2-pro/edit", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falBody),
    });

    if (!falResponse.ok) {
      const errText = await falResponse.text();
      console.error("Fal.ai error:", errText.substring(0, 500));
      return new Response(JSON.stringify({ error: "Erro na geração de IA", details: errText.substring(0, 200) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const falResult = await falResponse.json();
    const outputUrl = falResult?.images?.[0]?.url;
    const resultSeed = falResult?.seed ?? null;

    if (!outputUrl) {
      return new Response(JSON.stringify({ error: "No image returned from AI" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the generated image
    const imgResponse = await fetch(outputUrl);
    if (!imgResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to download generated image" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const imgBlob = await imgResponse.blob();

    const fmt = output_format || "png";
    const path = `generations/${crypto.randomUUID()}.${fmt}`;
    const { error: uploadError } = await serviceClient.storage
      .from("product-assets")
      .upload(path, imgBlob, { contentType: `image/${fmt}` });
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return new Response(JSON.stringify({ error: "Erro ao salvar imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = serviceClient.storage.from("product-assets").getPublicUrl(path);

    // Move temp-refs to permanent ref-images path
    const permanentUrls: string[] = [];
    for (const originalUrl of image_urls as string[]) {
      const match = originalUrl.match(/\/product-assets\/(.+)$/);
      const oldPath = match ? match[1] : null;
      if (oldPath && oldPath.startsWith("temp-refs/")) {
        const newPath = oldPath.replace("temp-refs/", "ref-images/");
        // Download then upload to new path (Supabase storage has no move/copy)
        const dlRes = await fetch(originalUrl);
        if (dlRes.ok) {
          const blob = await dlRes.blob();
          await serviceClient.storage.from("product-assets").upload(newPath, blob, { contentType: blob.type });
          // Delete old temp file
          serviceClient.storage.from("product-assets").remove([oldPath]).catch(() => {});
          const { data: newUrlData } = serviceClient.storage.from("product-assets").getPublicUrl(newPath);
          permanentUrls.push(newUrlData.publicUrl);
        } else {
          permanentUrls.push(originalUrl); // fallback
        }
      } else {
        permanentUrls.push(originalUrl); // already permanent
      }
    }

    // Insert into ai_generated_images
    const { error: insertError } = await serviceClient
      .from("ai_generated_images")
      .insert({
        url: urlData.publicUrl,
        prompt,
        seed: resultSeed,
        image_size: image_size || "auto",
        image_urls: permanentUrls,
        safety_tolerance: safety_tolerance ?? 2,
        output_format: output_format || "png",
      });

    return new Response(JSON.stringify({ url: urlData.publicUrl, seed: resultSeed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-gallery-image error:", err?.message || "unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
