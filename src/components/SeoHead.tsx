import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import type { Product } from "@/lib/types";
import { HOME_SEO, SITE_NAME, SITE_URL, injectJsonLd, setGlobalSeo } from "@/lib/seo";

interface SeoHeadProps {
  products?: Product[];
}

const SeoHead = ({ products: productsProp }: SeoHeadProps) => {
  const { products: fetchedProducts } = useProducts(productsProp && productsProp.length > 0 ? undefined : 8);
  const products = productsProp && productsProp.length > 0 ? productsProp : fetchedProducts;

  useEffect(() => {
    const cleanupMeta = setGlobalSeo(HOME_SEO);

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: SITE_NAME, url: SITE_URL, description: HOME_SEO.description },
        { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
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
    const cleanupJsonLd = injectJsonLd("jsonld", jsonLd);

    return () => {
      cleanupJsonLd();
      cleanupMeta();
    };
  }, [products]);

  return null;
};

export default SeoHead;
