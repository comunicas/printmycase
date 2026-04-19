import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import type { Product } from "@/lib/types";

const SITE_NAME = "Studio PrintMyCase";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";
const TITLE = "Studio PrintMyCase | Capas Personalizadas para Celular";
const DESCRIPTION =
  "Crie capas de celular personalizadas com suas fotos. Proteção premium, acabamento soft-touch e frete grátis para diversos modelos de smartphone.";

interface SeoHeadProps {
  products?: Product[];
}

const SeoHead = ({ products: productsProp }: SeoHeadProps) => {
  const { products: fetchedProducts } = useProducts(productsProp && productsProp.length > 0 ? undefined : 8);
  const products = productsProp && productsProp.length > 0 ? productsProp : fetchedProducts;

  useEffect(() => {
    document.title = TITLE;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", DESCRIPTION);
    setMeta("property", "og:title", TITLE);
    setMeta("property", "og:description", DESCRIPTION);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", SITE_URL);
    setMeta("name", "twitter:title", TITLE);
    setMeta("name", "twitter:description", DESCRIPTION);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", SITE_URL);

    const jsonLd = {
      "@context": "https://schema.org",
      inLanguage: "pt-BR",
      "@graph": [
        { "@type": "Organization", name: SITE_NAME, url: SITE_URL, description: DESCRIPTION, inLanguage: "pt-BR" },
        { "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "pt-BR" },
        ...(products.length > 0
          ? [{
              "@type": "ItemList" as const,
              name: "Capas para Celular",
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Product",
                  name: p.name,
                  description: p.description ?? `Capa personalizada para ${p.name}. Proteção premium com acabamento soft-touch.`,
                  sku: p.slug,
                  brand: BRAND,
                  url: `${SITE_URL}/product/${p.slug}`,
                  image: p.images[0],
                  offers: merchantOffer(p.price_cents / 100, `${SITE_URL}/product/${p.slug}`),
                  aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.review_count },
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

    return () => { script?.remove(); canonical?.remove(); };
  }, [products]);

  return null;
};

export default SeoHead;
