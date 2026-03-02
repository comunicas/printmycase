import { useEffect } from "react";
import { products } from "@/data/products";

const SITE_NAME = "Case Studio";
const SITE_URL = "https://case-studio-pro-03.lovable.app";
const TITLE = "Case Studio | Capas Personalizadas para iPhone";
const DESCRIPTION =
  "Crie capas de celular personalizadas com suas fotos. Proteção premium, acabamento soft-touch e frete grátis. iPhone 17, 15, 11, SE e mais.";

const SeoHead = () => {
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

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", SITE_URL);

    // JSON-LD
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          description: DESCRIPTION,
        },
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/catalog?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "ItemList",
          name: "Capas para iPhone",
          numberOfItems: products.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.name,
              url: `${SITE_URL}/product/${p.id}`,
              image: p.images[0],
              offers: {
                "@type": "Offer",
                price: p.price,
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.reviewCount,
              },
            },
          })),
        },
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
      canonical?.remove();
    };
  }, []);

  return null;
};

export default SeoHead;
