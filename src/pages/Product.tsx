import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductDetails from "@/components/ProductDetails";
import AppHeader from "@/components/AppHeader";
import { useProduct } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import { setPageSeo, setMeta, SITE_URL } from "@/lib/seo";
import { clarityEvent, clarityTag } from "@/lib/clarity";
import { pixelEvent } from "@/lib/meta-pixel";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

const SITE_NAME = "PrintMyCase";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id);

  const brand = product ? extractBrand(product.name) : "";
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

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

  // --- SEO injection ---
  useEffect(() => {
    if (!product) return;

    const title = `Capa ${product.name} | ${SITE_NAME}`;
    const desc =
      product.description ??
      `Capa personalizada para ${product.name}. Proteção premium com acabamento soft-touch.`;
    const image = product.device_image ?? product.images[0] ?? "";
    const url = `${SITE_URL}/product/${product.slug}`;
    const brandName = extractBrand(product.name);

    const cleanup = setPageSeo({ title, description: desc, url, image, type: "product" });
    setMeta("property", "product:price:amount", String(product.price_cents / 100));
    setMeta("property", "product:price:currency", "BRL");

    const jsonLd = {
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
            {
              "@type": "ListItem",
              position: 1,
              name: "Catálogo",
              item: `${SITE_URL}/catalog`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: brandName,
              item: `${SITE_URL}/catalog?brand=${encodeURIComponent(brandName)}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: `Capa ${product.name}`,
            },
          ],
        },
      ],
    };

    let script = document.querySelector('script[data-seo="product-jsonld"]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "product-jsonld");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    clarityEvent("product_viewed");
    clarityTag("product_viewed", product.slug);
    pixelEvent("ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price_cents / 100,
      currency: "BRL",
    });

    return () => {
      script?.remove();
      canonical?.remove();
    };
  }, [product]);

  if (loading) {
    return <LoadingSpinner variant="fullPage" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Catálogo", to: "/catalog" },
    { label: brand, to: `/catalog?brand=${encodeURIComponent(brand)}` },
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

export default Product;
