import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { brandSlug, ALL_BRAND_SLUGS, getBrandSeo } from "@/lib/brand-seo";
import { setPageSeo, SITE_URL, injectJsonLd } from "@/lib/seo";
import { getOptimizedUrl } from "@/lib/image-utils";
import LoadingSpinner from "@/components/ui/loading-spinner";

const PAGE_TITLE = "Capinha Personalizada por Marca | IA + UV LED + Frete Grátis | PrintMyCase";
const PAGE_DESC =
  "Capinhas personalizadas para iPhone, Samsung, Motorola e Xiaomi com impressão UV LED premium. Aplique filtros de IA, frete grátis para todo o Brasil. A partir de R$119,90.";

const BrandCategoryPage = () => {
  const { products, loading } = useProducts();

  const brandGroups = useMemo(() => {
    const map = new Map<string, { count: number; image: string | null; displayName: string }>();
    for (const p of products) {
      const display = extractBrand(p.name);
      const slug = brandSlug(display);
      const existing = map.get(slug);
      if (!existing) {
        map.set(slug, { count: 1, image: p.device_image ?? p.images[0] ?? null, displayName: display });
      } else {
        existing.count++;
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => {
        const order = ALL_BRAND_SLUGS;
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      });
  }, [products]);

  useEffect(() => {
    const url = `${SITE_URL}/capa-celular`;
    const cleanupSeo = setPageSeo({ title: PAGE_TITLE, description: PAGE_DESC, url });

    const cleanupJsonLd = injectJsonLd("brand-category", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          name: "Marcas de Capas de Celular",
          itemListElement: brandGroups.map(([slug, data], i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: data.displayName,
            url: `${SITE_URL}/capa-celular/${slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Capas de Celular" },
          ],
        },
      ],
    });

    return () => { cleanupSeo(); cleanupJsonLd(); };
  }, [brandGroups]);

  const breadcrumbs = [{ label: "Capas de Celular" }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Capas de Celular Personalizadas
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Escolha a marca do seu celular e personalize sua capa com fotos e filtros de IA.
        </p>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brandGroups.map(([slug, data]) => {
              const seo = getBrandSeo(slug);
              return (
                <Link
                  key={slug}
                  to={`/capa-celular/${slug}`}
                  className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                    {data.image ? (
                      <img
                        src={getOptimizedUrl(data.image, 300)}
                        alt={seo.h1}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width="300"
                        height="300"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">{data.displayName}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-semibold text-foreground text-sm">{seo.h1}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {data.count} {data.count === 1 ? "modelo" : "modelos"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandCategoryPage;
