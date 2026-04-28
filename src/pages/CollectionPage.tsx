import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useCollection } from "@/hooks/useCollections";
import { formatPrice } from "@/lib/types";
import { BRAND, merchantOffer, defaultAggregateRating } from "@/lib/merchant-jsonld";
import { setPageSeo, SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";

const SITE_NAME = "Studio PrintMyCase";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { collection, designs, loading } = useCollection(slug);
  const navigate = useNavigate();

  useEffect(() => {
    if (!collection) return;
    const title = `Capinhas ${collection.name} | Designs Exclusivos para Celular | PrintMyCase`;
    const desc = collection.description ||
      `Explore ${designs.length > 0 ? designs.length + " " : ""}designs exclusivos da coleção ${collection.name}. Capinhas personalizadas com impressão UV LED premium e frete grátis para todo o Brasil.`;
    const image = collection.cover_image || undefined;
    const url = `${SITE_URL}/colecao/${slug}`;

    const cleanup = setPageSeo({ title, description: desc, url, image });

    const itemListId = `${url}#designs`;
    const hasDesigns = designs.length > 0;

    const graph: any[] = [
      {
        "@type": "CollectionPage",
        name: `Capinhas ${collection.name}`,
        description: desc,
        url,
        inLanguage: "pt-BR",
        ...(image ? { image } : {}),
        ...(hasDesigns ? { mainEntity: { "@id": itemListId } } : {}),
      },
    ];

    if (hasDesigns) {
      graph.push({
        "@type": "ItemList",
        "@id": itemListId,
        name: `Capinhas personalizadas da coleção ${collection.name}`,
        url,
        numberOfItems: designs.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: designs.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: d.name,
            description: d.description || `Capa com design "${d.name}" da coleção ${collection.name}.`,
            sku: d.slug,
            category: "Capas para Celular",
            inLanguage: "pt-BR",
            brand: BRAND,
            image: d.image_url,
            url: `${SITE_URL}/colecao/${slug}/${d.slug}`,
            offers: merchantOffer(d.price_cents / 100, `${SITE_URL}/colecao/${slug}/${d.slug}`),
            aggregateRating: defaultAggregateRating(),
          },
        })),
      });
    }

    graph.push(breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Coleções", url: `${SITE_URL}/colecoes` },
      { name: collection.name, url },
    ]));

    const jsonLd = {
      "@context": "https://schema.org",
      inLanguage: "pt-BR",
      "@graph": graph,
    };
    let script = document.querySelector('script[data-seo="collection-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo", "collection-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); cleanup(); };
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Capinhas {collection.name}
        </h1>
        {collection.description && (
          <p className="text-muted-foreground mb-8">{collection.description}</p>
        )}
        {!collection.description && (
          <p className="text-muted-foreground mb-8">
            {designs.length > 0 ? designs.length : ""} designs exclusivos · impressão UV LED premium · frete grátis para todo o Brasil
          </p>
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
                    alt={`Capinha personalizada ${design.name} — coleção ${collection.name}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {design.name.replace(/^capa personalizada\s*[-–]\s*/i, "")}
                  </h3>
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
