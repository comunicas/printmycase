import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch stale pending checkouts (older than 30 days)
    const { data: stale, error: fetchError } = await supabaseAdmin
      .from("pending_checkouts")
      .select("id, original_image_path, edited_image_path")
      .lt("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) throw fetchError;
    if (!stale || stale.length === 0) {
      return new Response(JSON.stringify({ deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Collect storage paths to remove
    const paths: string[] = [];
    const ids: string[] = [];
    for (const row of stale) {
      ids.push(row.id);
      if (row.original_image_path) paths.push(row.original_image_path);
      if (row.edited_image_path) paths.push(row.edited_image_path);
    }

    // Delete files from storage
    if (paths.length > 0) {
      await supabaseAdmin.storage.from("customizations").remove(paths);
    }

    // Delete rows
    const { error: delError } = await supabaseAdmin
      .from("pending_checkouts")
      .delete()
      .in("id", ids);

    if (delError) throw delError;

    return new Response(JSON.stringify({ deleted: ids.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
