import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://studio.printmycase.com.br";
const SITE_NAME = "PrintMyCase";
const DEFAULT_TITLE = "PrintMyCase | Capas Personalizadas para Celular";
const DEFAULT_DESC =
  "Crie capas de celular personalizadas com suas fotos. Proteção premium, acabamento soft-touch e frete grátis para diversos modelos de smartphone.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function html(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}): Response {
  const { title, description, image, url, type = "website" } = meta;
  const body = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:url" content="${esc(url)}"/>
<meta property="og:type" content="${type}"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
<link rel="canonical" href="${esc(url)}"/>
<meta http-equiv="refresh" content="0;url=${esc(url)}"/>
</head>
<body></body>
</html>`;

  return new Response(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  try {
    // /product/:slug
    const productMatch = path.match(/^\/product\/([^/]+)$/);
    if (productMatch) {
      const slug = decodeURIComponent(productMatch[1]);
      const { data } = await supabase
        .from("products")
        .select("name, description, images, device_image, slug, price_cents")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (data) {
        const image = data.device_image ?? (data.images as string[] | null)?.[0] ?? DEFAULT_IMAGE;
        const nameForTitle = data.name.startsWith("Capa ") ? data.name : `Capa ${data.name}`;
        return html({
          title: `Capa ${data.name} | ${SITE_NAME}`,
          description:
            data.description ??
            `Capa personalizada para ${data.name}. Proteção premium com acabamento soft-touch.`,
          image,
          url: `${SITE_URL}/product/${data.slug}`,
          type: "product",
        });
      }
    }

    // /colecao/:colSlug/:designSlug
    const designMatch = path.match(/^\/colecao\/([^/]+)\/([^/]+)$/);
    if (designMatch) {
      const colSlug = decodeURIComponent(designMatch[1]);
      const designSlug = decodeURIComponent(designMatch[2]);
      const { data } = await supabase
        .from("collection_designs")
        .select("name, image_url, slug, price_cents, collections!inner(name, slug)")
        .eq("slug", designSlug)
        .eq("active", true)
        .single();

      if (data) {
        const col = (data as any).collections;
        return html({
          title: `${data.name} — ${col.name} | ${SITE_NAME}`,
          description: `Capa com design "${data.name}" da coleção ${col.name}. Escolha seu modelo e personalize.`,
          image: data.image_url,
          url: `${SITE_URL}/colecao/${colSlug}/${data.slug}`,
          type: "product",
        });
      }
    }

    // /colecao/:slug (collection page)
    const colMatch = path.match(/^\/colecao\/([^/]+)$/);
    if (colMatch) {
      const slug = decodeURIComponent(colMatch[1]);
      const { data } = await supabase
        .from("collections")
        .select("name, description, cover_image, slug")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (data) {
        return html({
          title: `${data.name} | ${SITE_NAME}`,
          description:
            data.description ??
            `Coleção ${data.name} — designs exclusivos para capas de celular.`,
          image: data.cover_image ?? DEFAULT_IMAGE,
          url: `${SITE_URL}/colecao/${data.slug}`,
        });
      }
    }

    // /colecoes
    if (path === "/colecoes") {
      return html({
        title: `Coleções | ${SITE_NAME}`,
        description:
          "Explore nossas coleções de designs exclusivos para capas de celular personalizadas.",
        image: DEFAULT_IMAGE,
        url: `${SITE_URL}/colecoes`,
      });
    }

    // /catalog
    if (path === "/catalog") {
      return html({
        title: `Catálogo de Modelos | ${SITE_NAME}`,
        description:
          "Encontre a capa perfeita para o seu celular. Modelos para Samsung, Motorola, iPhone e mais.",
        image: DEFAULT_IMAGE,
        url: `${SITE_URL}/catalog`,
      });
    }

    // fallback (landing)
    return html({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      image: DEFAULT_IMAGE,
      url: SITE_URL,
    });
  } catch (e) {
    console.error("prerender error:", e);
    return html({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      image: DEFAULT_IMAGE,
      url: `${SITE_URL}${path}`,
    });
  }
});
