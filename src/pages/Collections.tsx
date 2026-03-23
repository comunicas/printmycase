import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useCollections } from "@/hooks/useCollections";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";


const Collections = () => {
  const { collections, loading } = useCollections();
  const navigate = useNavigate();

  useEffect(() => {
    const title = "Coleções Exclusivas | PrintMyCase";
    const desc = "Explore nossas coleções de designs exclusivos para capas de celular. Proteção premium com estilo.";
    document.title = title;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", `${SITE_URL}/colecoes`);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${SITE_URL}/colecoes`);
    return () => { canonical?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      <AppHeader breadcrumbs={[{ label: "Coleções" }]} />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Coleções</h1>
        <p className="text-muted-foreground mb-8">Designs exclusivos prontos para o seu celular.</p>

        {loading ? (
          <LoadingSpinner />
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma coleção disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Card
                key={col.id}
                className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/colecao/${col.slug}`)}
              >
                <div className="aspect-[3/2] overflow-hidden bg-muted">
                  {col.cover_image ? (
                    <img
                      src={col.cover_image}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Sem capa
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-foreground">{col.name}</h2>
                  {col.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{col.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Collections;
