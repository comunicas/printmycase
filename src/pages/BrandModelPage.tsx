import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import { useProduct } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { brandFromSlug, brandSlug, getBrandSeo, isValidBrandSlug } from "@/lib/brand-seo";
import { setPageSeo, setMeta, SITE_URL, injectJsonLd } from "@/lib/seo";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import { clarityEvent, clarityTag } from "@/lib/clarity";
import { pixelEvent } from "@/lib/meta-pixel";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

const SITE_NAME = "Studio PrintMyCase";

const BrandModelPage = () => {
  const { brand, model } = useParams<{ brand: string; model: string }>();
  const { product, loading } = useProduct(model);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const isValidBrand = brand ? isValidBrandSlug(brand) : false;
  const brandDisplayName = brand ? brandFromSlug(brand) : undefined;

  useEffect(() => {
    supabase
      .from("product_gallery_images")
      .select("url")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setGalleryImages((data ?? []).map((r: any) => r.url));
      });
  }, []);

  // Validate brand matches product
  const productBrand = product ? extractBrand(product.name) : null;
  const brandMatches = productBrand === brandDisplayName;

  useEffect(() => {
    if (!product || !brand || !brandMatches) return;

    const title = `Capa ${product.name} Personalizada | ${SITE_NAME}`;
    const desc =
      product.description ??
      `Capa personalizada para ${product.name}. Proteção premium com acabamento soft-touch.`;
    const image = product.device_image ?? product.images[0] ?? "";
    const url = `${SITE_URL}/capa-celular/${brand}/${product.slug}`;

    const cleanupSeo = setPageSeo({ title, description: desc, url, image, type: "product" });
    setMeta("property", "product:price:amount", String(product.price_cents / 100));
    setMeta("property", "product:price:currency", "BRL");

    const cleanupJsonLd = injectJsonLd("brand-model", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: product.name,
          image,
          url,
          description: desc,
          sku: product.slug,
          category: "Capas para Celular",
          brand: BRAND,
          offers: merchantOffer(product.price_cents / 100, url),
          ...(product.rating && product.review_count
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.review_count } }
            : {}),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Capas de Celular", item: `${SITE_URL}/capa-celular` },
            { "@type": "ListItem", position: 3, name: getBrandSeo(brand).h1, item: `${SITE_URL}/capa-celular/${brand}` },
            { "@type": "ListItem", position: 4, name: `Capa ${product.name}` },
          ],
        },
      ],
    });

    clarityEvent("product_viewed");
    clarityTag("product_viewed", product.slug);
    pixelEvent("ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price_cents / 100,
      currency: "BRL",
    });

    return () => { cleanupSeo(); cleanupJsonLd(); };
  }, [product, brand, brandMatches]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  if (!isValidBrand || !product || !brandMatches) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Produto não encontrado.</p>
        </div>
      </div>
    );
  }

  const brandSeo = getBrandSeo(brand!);
  const breadcrumbs = [
    { label: "Capas de Celular", to: "/capa-celular" },
    { label: brandSeo.h1, to: `/capa-celular/${brand}` },
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />
      <main className="flex-1 w-full max-w-5xl mx-auto p-5 lg:p-10">
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2">
            <ProductGallery images={product.images} productName={product.name} deviceImage={product.device_image} galleryImages={galleryImages} />
          </div>
          <div className="w-full lg:w-1/2">
            <ProductInfo product={product} />
          </div>
        </section>
        <section className="mt-10">
          <ProductDetails product={product} />
        </section>
      </main>
    </div>
  );
};

export default BrandModelPage;
