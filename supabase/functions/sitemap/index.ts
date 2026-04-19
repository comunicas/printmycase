import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Brand mapping matching src/lib/utils.ts extractBrand + src/lib/brand-seo.ts */
const BRAND_PATTERNS: [RegExp, string][] = [
  [/\biphone\b/i, "iphone"],
  [/\bgalaxy\b/i, "samsung"],
  [/\b(motorola|moto)\b/i, "motorola"],
  [/\b(redmi|poco|xiaomi)\b/i, "xiaomi"],
];

function brandSlugFromName(name: string): string {
  for (const [re, slug] of BRAND_PATTERNS) {
    if (re.test(name)) return slug;
  }
  return "outros";
}
const SITE_URL = "https://studio.printmycase.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function urlEntry(
  loc: string,
  priority: string,
  changefreq = "weekly",
  lastmod?: string
) {
  return `  <url>
    <loc>${loc}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all dynamic data in parallel
    const [productsRes, collectionsRes, designsRes, kbCatsRes, kbArtsRes] =
      await Promise.all([
        supabase
          .from("products")
          .select("slug, updated_at")
          .eq("active", true),
        supabase
          .from("collections")
          .select("id, slug, updated_at")
          .eq("active", true),
        supabase
          .from("collection_designs")
          .select("slug, collection_id, created_at")
          .eq("active", true),
        supabase
          .from("kb_categories")
          .select("id, slug, created_at")
          .eq("active", true),
        supabase
          .from("kb_articles")
          .select("slug, category_id, updated_at")
          .eq("active", true),
      ]);

    // Build collection id→slug map for designs
    const collMap = new Map<string, string>();
    for (const c of collectionsRes.data ?? []) {
      collMap.set(c.id ?? "", c.slug);
    }

    // Build kb category id→slug map for articles
    const kbCatMap = new Map<string, string>();
    for (const c of kbCatsRes.data ?? []) {
      kbCatMap.set(c.id ?? "", c.slug);
    }

    const today = new Date().toISOString().split("T")[0];

    const urls: string[] = [];

    // Static routes
    const staticRoutes = [
      { path: "/", priority: "1.0", freq: "daily" },
      { path: "/catalog", priority: "0.9", freq: "daily" },
      { path: "/customize", priority: "0.8", freq: "weekly" },
      { path: "/colecoes", priority: "0.8", freq: "weekly" },
      { path: "/ajuda", priority: "0.6", freq: "monthly" },
      { path: "/solicitar-modelo", priority: "0.5", freq: "monthly" },
      { path: "/termos", priority: "0.3", freq: "monthly" },
      { path: "/privacidade", priority: "0.3", freq: "monthly" },
      { path: "/compras", priority: "0.3", freq: "monthly" },
    ];

    for (const r of staticRoutes) {
      urls.push(urlEntry(`${SITE_URL}${r.path}`, r.priority, r.freq, today));
    }

    // --- SEO Silo: /capa-celular/ ---
    urls.push(urlEntry(`${SITE_URL}/capa-celular`, "0.9", "daily", today));

    // Build brand → products mapping for silo
    const brandProducts = new Map<string, typeof productsRes.data>();
    for (const p of productsRes.data ?? []) {
      const bSlug = brandSlugFromName(p.name ?? "");
      if (!brandProducts.has(bSlug)) brandProducts.set(bSlug, []);
      brandProducts.get(bSlug)!.push(p);
    }

    // Brand hub pages
    for (const [bSlug] of brandProducts) {
      urls.push(urlEntry(`${SITE_URL}/capa-celular/${bSlug}`, "0.8", "weekly", today));
    }

    // Brand model pages
    for (const [bSlug, prods] of brandProducts) {
      for (const p of prods) {
        const lastmod = p.updated_at
          ? new Date(p.updated_at).toISOString().split("T")[0]
          : today;
        urls.push(
          urlEntry(`${SITE_URL}/capa-celular/${bSlug}/${p.slug}`, "0.8", "weekly", lastmod)
        );
      }
    }

    // Legacy product URLs (lower priority, kept for backward compat)
    for (const p of productsRes.data ?? []) {
      const lastmod = p.updated_at
        ? new Date(p.updated_at).toISOString().split("T")[0]
        : today;
      urls.push(
        urlEntry(`${SITE_URL}/product/${p.slug}`, "0.5", "weekly", lastmod)
      );
    }

    // Collections
    for (const c of collectionsRes.data ?? []) {
      const lastmod = c.updated_at
        ? new Date(c.updated_at).toISOString().split("T")[0]
        : today;
      urls.push(
        urlEntry(`${SITE_URL}/colecao/${c.slug}`, "0.7", "weekly", lastmod)
      );
    }

    // Collection designs
    for (const d of designsRes.data ?? []) {
      const collSlug = collMap.get(d.collection_id);
      if (!collSlug) continue;
      const lastmod = d.created_at
        ? new Date(d.created_at).toISOString().split("T")[0]
        : today;
      urls.push(
        urlEntry(`${SITE_URL}/colecao/${collSlug}/${d.slug}`, "0.6", "weekly", lastmod)
      );
    }

    // KB categories
    for (const c of kbCatsRes.data ?? []) {
      urls.push(
        urlEntry(`${SITE_URL}/ajuda/${c.slug}`, "0.5", "monthly")
      );
    }

    // KB articles
    for (const a of kbArtsRes.data ?? []) {
      const catSlug = kbCatMap.get(a.category_id);
      if (!catSlug) continue;
      const lastmod = a.updated_at
        ? new Date(a.updated_at).toISOString().split("T")[0]
        : today;
      urls.push(
        urlEntry(
          `${SITE_URL}/ajuda/${catSlug}/${a.slug}`,
          "0.5",
          "monthly",
          lastmod
        )
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
