import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useCollection } from "@/hooks/useCollections";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";

const SITE_NAME = "PrintMyCase";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { collection, designs, loading } = useCollection(slug);
  const navigate = useNavigate();

  useEffect(() => {
    if (!collection) return;
    const title = `${collection.name} | ${SITE_NAME}`;
    const desc = collection.description || `Coleção ${collection.name} — designs exclusivos para capas de celular.`;
    const image = collection.cover_image || "";
    const url = `${SITE_URL}/colecao/${slug}`;
    document.title = title;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    if (image) setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    if (image) setMeta("name", "twitter:image", image);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", url);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: collection.name,
      description: desc,
      url,
      ...(image ? { image } : {}),
      ...(designs.length > 0 ? {
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: designs.length,
          itemListElement: designs.map((d, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: d.name,
              image: d.image_url,
              url: `${SITE_URL}/colecao/${slug}/${d.slug}`,
              offers: { "@type": "Offer", price: d.price_cents / 100, priceCurrency: "BRL", availability: "https://schema.org/InStock" },
            },
          })),
        },
      } : {}),
    };
    let script = document.querySelector('script[data-seo="collection-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo", "collection-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); canonical?.remove(); };
  }, [collection, designs, slug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader breadcrumbs={[{ label: "Coleções", to: "/colecoes" }, { label: "Não encontrada" }]} />
        <main className="max-w-5xl mx-auto px-5 py-16 text-center">
          <p className="text-muted-foreground">Coleção não encontrada.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Coleções", to: "/colecoes" }, { label: collection.name }]} />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground mb-8">{collection.description}</p>
        )}

        {designs.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum design disponível nesta coleção.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {designs.map((design) => (
              <Card
                key={design.id}
                className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/colecao/${slug}/${design.slug}`)}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={design.image_url}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{design.name}</h3>
                  <p className="text-base font-bold text-foreground mt-1">
                    {formatPrice(design.price_cents / 100)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CollectionPage;
