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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin
    const { data: isAdmin } = await serviceClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch records with signed/expired URLs (contain /sign/ or token=)
    const { data: records, error: fetchErr } = await serviceClient
      .from("user_ai_generations")
      .select("id, storage_path, image_url")
      .or("image_url.ilike.%/sign/%,image_url.ilike.%token=%")
      .limit(200);

    if (fetchErr || !records) {
      return new Response(JSON.stringify({ error: "Failed to fetch records", detail: fetchErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let migrated = 0;
    let failed = 0;

    for (const rec of records) {
      try {
        if (!rec.storage_path) { failed++; continue; }

        // Download from private bucket
        const { data: fileData, error: dlErr } = await serviceClient.storage
          .from("customizations")
          .download(rec.storage_path);
        if (dlErr || !fileData) { failed++; continue; }

        const bytes = new Uint8Array(await fileData.arrayBuffer());
        const publicPath = `generations/${rec.storage_path}`;

        await serviceClient.storage
          .from("product-assets")
          .upload(publicPath, bytes, { contentType: "image/jpeg", upsert: true });

        const { data: pubData } = serviceClient.storage
          .from("product-assets")
          .getPublicUrl(publicPath);

        if (pubData?.publicUrl) {
          await serviceClient
            .from("user_ai_generations")
            .update({ image_url: pubData.publicUrl })
            .eq("id", rec.id);
          migrated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return new Response(JSON.stringify({
      total: records.length,
      migrated,
      failed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("migrate-generation-urls error:", err?.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
