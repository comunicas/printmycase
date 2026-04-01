import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_SIZE = 800;
const QUALITY = 80;
const PREFIXES = ["galleries/", "collections/", "gallery/"];
const HEAVY_THRESHOLD = 200_000; // 200KB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const optimized: string[] = [];
    const errors: string[] = [];

    for (const prefix of PREFIXES) {
      const { data: folders } = await admin.storage.from("product-assets").list(prefix, { limit: 500 });
      if (!folders) continue;

      for (const folder of folders) {
        const folderPath = `${prefix}${folder.name}`;

        if (folder.metadata && folder.metadata.size) {
          await processFile(admin, folderPath, folder, optimized, errors);
          continue;
        }

        const { data: files } = await admin.storage.from("product-assets").list(folderPath, { limit: 500 });
        if (!files) continue;

        for (const file of files) {
          if (!file.metadata?.size) continue;
          const filePath = `${folderPath}/${file.name}`;
          await processFile(admin, filePath, file, optimized, errors);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, optimized: optimized.length, errors: errors.length, details: { optimized, errors } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processFile(
  admin: ReturnType<typeof createClient>,
  filePath: string,
  file: { metadata?: { size?: number } },
  optimized: string[],
  errors: string[]
) {
  try {
    if (filePath.endsWith(".webp")) return;
    const size = file.metadata?.size || 0;
    if (size < HEAVY_THRESHOLD) return;

    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    if (!["jpg", "jpeg", "png"].includes(ext)) return;

    // Download original
    const { data: blob, error: dlErr } = await admin.storage
      .from("product-assets")
      .download(filePath);
    if (dlErr || !blob) {
      errors.push(`Download failed: ${filePath}`);
      return;
    }

    // Decode image using ImageScript
    const buffer = new Uint8Array(await blob.arrayBuffer());
    let img: InstanceType<typeof Image>;
    try {
      img = await Image.decode(buffer);
    } catch {
      errors.push(`Decode failed: ${filePath}`);
      return;
    }

    // Resize if larger than MAX_SIZE
    const { width, height } = img;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
      const nw = Math.round(width * ratio);
      const nh = Math.round(height * ratio);
      img.resize(nw, nh);
    }

    // Encode as WebP
    const webpBuffer = await img.encodeWebP(QUALITY);
    const webpBlob = new Blob([webpBuffer], { type: "image/webp" });

    const newPath = filePath.replace(/\.[^.]+$/, ".webp");

    const { error: uploadErr } = await admin.storage
      .from("product-assets")
      .upload(newPath, webpBlob, { contentType: "image/webp", upsert: true });

    if (uploadErr) {
      errors.push(`Upload failed: ${newPath} - ${uploadErr.message}`);
      return;
    }

    const { data: urlData } = admin.storage.from("product-assets").getPublicUrl(newPath);
    const oldUrl = admin.storage.from("product-assets").getPublicUrl(filePath).data.publicUrl;
    const newUrl = urlData.publicUrl;

    // Update all DB references
    const tables = [
      { table: "gallery_images", column: "url" },
      { table: "collection_designs", column: "image_url" },
      { table: "collections", column: "cover_image" },
      { table: "image_galleries", column: "cover_image" },
      { table: "product_gallery_images", column: "url" },
    ];

    for (const { table, column } of tables) {
      await admin.from(table).update({ [column]: newUrl }).eq(column, oldUrl);
    }

    // Also update products.images array and products.device_image
    const { data: products } = await admin.from("products").select("id, images, device_image");
    if (products) {
      for (const p of products) {
        let changed = false;
        const updates: Record<string, unknown> = {};

        if (p.device_image === oldUrl) {
          updates.device_image = newUrl;
          changed = true;
        }

        if (Array.isArray(p.images) && p.images.includes(oldUrl)) {
          updates.images = p.images.map((u: string) => u === oldUrl ? newUrl : u);
          changed = true;
        }

        if (changed) {
          await admin.from("products").update(updates).eq("id", p.id);
        }
      }
    }

    // Delete original file after successful optimization
    await admin.storage.from("product-assets").remove([filePath]);

    optimized.push(filePath);
  } catch (err) {
    errors.push(`${filePath}: ${(err as Error).message}`);
  }
}
