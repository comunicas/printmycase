import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import type { Product } from "@/lib/types";

const SITE_NAME = "PrintMyCase";
const SITE_URL = "https://studio.printmycase.com.br";
const DEFAULT_TITLE = "Capinha Personalizada com IA | Frete Grátis | PrintMyCase";
const DEFAULT_DESC = "Crie sua capinha personalizada com IA em minutos. Impressão UV LED premium, frete grátis para todo o Brasil. Mais de 10 mil capas entregues.";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/jKnNwvpAIVdBeybAyDS6bLEVBhW2/social-images/social-1776483832743-9d89ba3a-6310-4380-8954-773a13eb38c7.webp";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  products?: Product[];
}

const SeoHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_IMAGE,
  products: productsProp,
}: SeoHeadProps) => {
  const { products: fetchedProducts } = useProducts(
    productsProp && productsProp.length > 0 ? undefined : 8
  );
  const products = productsProp && productsProp.length > 0 ? productsProp : fetchedProducts;

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const pageUrl = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", pageUrl);

    const jsonLd = {
      "@context": "https://schema.org",
      inLanguage: "pt-BR",
      "@graph": [
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESC,
          inLanguage: "pt-BR",
        },
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/customize?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        },
        ...(products.length > 0
          ? [{
              "@type": "ItemList" as const,
              name: "Capinhas Personalizadas para Celular",
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Product",
                  name: p.name,
                  description: p.description ?? `Capinha personalizada para ${p.name}. Impressão UV LED com frete grátis.`,
                  sku: p.slug,
                  brand: BRAND,
                  url: `${SITE_URL}/capa-celular/iphone/${p.slug}`,
                  image: p.images[0],
                  offers: merchantOffer(p.price_cents / 100, `${SITE_URL}/capa-celular/iphone/${p.slug}`),
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: p.rating,
                    reviewCount: p.review_count,
                  },
                },
              })),
            }]
          : []),
      ],
    };

    let script = document.querySelector('script[data-seo="jsonld"]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "jsonld");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      script?.remove();
      canonicalEl?.remove();
    };
  }, [title, description, canonical, ogImage, products]);

  return null;
};

export default SeoHead;
