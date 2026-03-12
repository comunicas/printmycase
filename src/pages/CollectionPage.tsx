import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useCollection } from "@/hooks/useCollections";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";


const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { collection, designs, loading } = useCollection(slug);
  const navigate = useNavigate();

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
      <SeoHead title={`${collection.name} | ArtisCase`} description={collection.description || `Coleção ${collection.name} de designs exclusivos.`} />
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
