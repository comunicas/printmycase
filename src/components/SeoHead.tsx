import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/data/products";

const SITE_NAME = "ArtisCase";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://artiscase-v2.lovable.app";
const TITLE = "ArtisCase | Capas Personalizadas para iPhone";
const DESCRIPTION =
  "Crie capas de celular personalizadas com suas fotos. Proteção premium, acabamento soft-touch e frete grátis. iPhone 17, 15, 11, SE e mais.";

const SeoHead = () => {
  const { products } = useProducts(8);

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
      "@graph": [
        { "@type": "Organization", name: SITE_NAME, url: SITE_URL, description: DESCRIPTION },
        {
          "@type": "WebSite", name: SITE_NAME, url: SITE_URL,
          potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/catalog?q={search_term_string}`, "query-input": "required name=search_term_string" },
        },
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
                  url: `${SITE_URL}/product/${p.slug}`,
                  image: p.images[0],
                  offers: { "@type": "Offer", price: p.price_cents / 100, priceCurrency: "BRL", availability: "https://schema.org/InStock" },
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
