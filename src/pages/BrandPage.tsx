import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { brandFromSlug, brandSlug, getBrandSeo, isValidBrandSlug } from "@/lib/brand-seo";
import { setPageSeo, SITE_URL, injectJsonLd } from "@/lib/seo";
import { merchantOffer, BRAND as MERCHANT_BRAND } from "@/lib/merchant-jsonld";
import { formatPrice } from "@/lib/types";
import { getOptimizedUrl } from "@/lib/image-utils";
import LoadingSpinner from "@/components/ui/loading-spinner";

const BrandPage = () => {
  const { brand } = useParams<{ brand: string }>();
  const { products, loading } = useProducts();

  const isValid = brand ? isValidBrandSlug(brand) : false;
  const displayName = brand ? brandFromSlug(brand) : undefined;

  const filtered = useMemo(() => {
    if (!displayName) return [];
    return products.filter((p) => extractBrand(p.name) === displayName);
  }, [products, displayName]);

  const seo = brand ? getBrandSeo(brand) : null;

  useEffect(() => {
    if (!seo || !brand) return;
    const url = `${SITE_URL}/capa-celular/${brand}`;
    const cleanupSeo = setPageSeo({ title: seo.title, description: seo.description, url });

    const cleanupJsonLd = injectJsonLd("brand-page", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          name: seo.h1,
          itemListElement: filtered.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: `${SITE_URL}/capa-celular/${brand}/${p.slug}`,
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Capas de Celular", item: `${SITE_URL}/capa-celular` },
            { "@type": "ListItem", position: 3, name: seo.h1 },
          ],
        },
      ],
    });

    return () => { cleanupSeo(); cleanupJsonLd(); };
  }, [seo, brand, filtered]);

  if (!loading && !isValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Marca não encontrada.</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Capas de Celular", to: "/capa-celular" },
    { label: seo?.h1 ?? "" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {seo?.h1}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{seo?.description}</p>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">Nenhum modelo disponível.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/capa-celular/${brand}/${product.slug}`}
                className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                  {(product.device_image || product.images[0]) ? (
                    <img
                      src={getOptimizedUrl(product.device_image ?? product.images[0], 320)}
                      srcSet={`${getOptimizedUrl(product.device_image ?? product.images[0], 200)} 200w, ${getOptimizedUrl(product.device_image ?? product.images[0], 400)} 400w, ${getOptimizedUrl(product.device_image ?? product.images[0], 600)} 600w`}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      alt={`Capinha personalizada para ${product.name.replace(/^Capa\s+/i, "").trim()} | PrintMyCase`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      width="300"
                      height="300"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">Sem imagem</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">
                    {product.name.replace(/^Capa\s+/i, "").trim()}
                  </p>
                  <span className="inline-block mt-1.5 text-sm font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded-md">
                    {formatPrice(product.price_cents / 100)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandPage;
