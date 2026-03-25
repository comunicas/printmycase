import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse multipart form
    const formData = await req.formData();
    const galleryId = formData.get("gallery_id") as string;
    const zipFile = formData.get("file") as File;

    if (!galleryId || !zipFile) {
      return new Response(JSON.stringify({ error: "gallery_id and file are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify gallery exists
    const { data: gallery } = await adminClient
      .from("image_galleries")
      .select("id")
      .eq("id", galleryId)
      .single();

    if (!gallery) {
      return new Response(JSON.stringify({ error: "Gallery not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get current max sort_order
    const { data: existingImages } = await adminClient
      .from("gallery_images")
      .select("sort_order")
      .eq("gallery_id", galleryId)
      .order("sort_order", { ascending: false })
      .limit(1);

    let nextOrder = (existingImages?.[0]?.sort_order ?? -1) + 1;

    // Extract ZIP
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    const uploaded: string[] = [];

    for (const [filename, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      if (!imageExtensions.includes(ext)) continue;
      // Skip macOS resource fork files
      if (filename.startsWith("__MACOSX") || filename.includes("/.")) continue;

      const blob = await entry.async("blob");
      const storagePath = `galleries/${galleryId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await adminClient.storage
        .from("product-assets")
        .upload(storagePath, blob, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });

      if (uploadError) {
        console.error(`Upload error for ${filename}:`, uploadError.message);
        continue;
      }

      const { data: urlData } = adminClient.storage
        .from("product-assets")
        .getPublicUrl(storagePath);

      const cleanName = filename.split("/").pop()?.replace(/\.[^.]+$/, "") || "";

      await adminClient.from("gallery_images").insert({
        gallery_id: galleryId,
        url: urlData.publicUrl,
        label: cleanName,
        sort_order: nextOrder++,
      });

      uploaded.push(urlData.publicUrl);
    }

    // Auto-set cover_image if null
    if (uploaded.length > 0) {
      const { data: gal } = await adminClient.from("image_galleries").select("cover_image").eq("id", galleryId).single();
      if (!gal?.cover_image) {
        await adminClient.from("image_galleries").update({ cover_image: uploaded[0] }).eq("id", galleryId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: uploaded.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
