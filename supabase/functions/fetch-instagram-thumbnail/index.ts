import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const postId = body.post_id as string | undefined;

    // Get posts to process
    let query = adminClient.from("instagram_posts").select("id, post_url, thumbnail_url");
    if (postId) {
      query = query.eq("id", postId);
    } else {
      query = query.is("thumbnail_url", null);
    }
    const { data: posts, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ updated: 0, errors: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const post of posts) {
      try {
        const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(post.post_url)}`;
        const resp = await fetch(oembedUrl);
        if (!resp.ok) {
          const text = await resp.text();
          results.push({ id: post.id, ok: false, error: `oEmbed ${resp.status}: ${text.slice(0, 100)}` });
          continue;
        }
        const data = await resp.json();
        if (!data.thumbnail_url) {
          results.push({ id: post.id, ok: false, error: "No thumbnail_url in response" });
          continue;
        }
        const { error: updateErr } = await adminClient
          .from("instagram_posts")
          .update({ thumbnail_url: data.thumbnail_url })
          .eq("id", post.id);
        if (updateErr) {
          results.push({ id: post.id, ok: false, error: updateErr.message });
        } else {
          results.push({ id: post.id, ok: true });
        }
      } catch (e) {
        results.push({ id: post.id, ok: false, error: String(e) });
      }
    }

    const updated = results.filter((r) => r.ok).length;
    const errors = results.filter((r) => !r.ok);

    return new Response(JSON.stringify({ updated, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
