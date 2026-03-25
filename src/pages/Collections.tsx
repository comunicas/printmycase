import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Smartphone, Sparkles } from "lucide-react";
import DesignCardSkeleton from "@/components/DesignCardSkeleton";
import AppHeader from "@/components/AppHeader";
import { useDesignsGroupedByCollection } from "@/hooks/useCollectionDesigns";
import { formatPrice } from "@/lib/types";
import { BRAND, merchantOffer } from "@/lib/merchant-jsonld";
import { setPageSeo, setMeta, SITE_URL } from "@/lib/seo";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TITLE = "Capinhas Exclusivas para Celular | PrintMyCase";
const DESC = "Explore nossas coleções de capinhas exclusivas para celular. Designs únicos, proteção premium e acabamento soft-touch. Encontre a capa perfeita ou personalize a sua.";

const Collections = () => {
  const { collections, allDesigns, loading } = useDesignsGroupedByCollection();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredDesigns = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allDesigns.filter((d) => d.name.toLowerCase().includes(q));
  }, [query, allDesigns]);

  const isSearching = query.trim().length > 0;

  /* SEO */
  useEffect(() => {
    const coverImage = collections.length > 0 ? collections[0].cover_image ?? undefined : undefined;
    const cleanup = setPageSeo({
      title: TITLE,
      description: DESC,
      url: `${SITE_URL}/colecoes`,
      image: coverImage,
    });

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Capinhas Exclusivas para Celular",
      description: DESC,
      url: `${SITE_URL}/colecoes`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: allDesigns.length,
        itemListElement: allDesigns.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: d.name,
            sku: d.slug,
            brand: BRAND,
            image: d.image_url,
            url: `${SITE_URL}/colecao/${d.collection_slug}/${d.slug}`,
            offers: merchantOffer(d.price_cents / 100, `${SITE_URL}/colecao/${d.collection_slug}/${d.slug}`),
          },
        })),
      },
    };
    let script = document.querySelector('script[data-seo="collections-jsonld"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-seo", "collections-jsonld"); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);

    return () => { script?.remove(); cleanup(); };
  }, [allDesigns, collections]);

  const scrollToCollection = (slug: string) => {
    setActiveTag(slug);
    setQuery("");
    const el = document.getElementById(`colecao-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  type DesignData = { id: string; name: string; slug: string; image_url: string; price_cents: number; collection_slug: string };

  const DesignCardInner = ({ design }: { design: DesignData }) => (
    <Card
      className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      onClick={() => navigate(`/colecao/${design.collection_slug}/${design.slug}`)}
    >
      <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={design.image_url}
          alt={design.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          width="300"
          height="300"
        />
      </div>
      <CardContent className="p-2.5">
        <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">{design.name}</h3>
        <span className="inline-block mt-1.5 text-sm font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded-md">
          {formatPrice(design.price_cents / 100)}
        </span>
      </CardContent>
    </Card>
  );

  const LazyDesignCard = ({ design }: { design: DesignData }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
        { rootMargin: "200px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    return <div ref={ref}>{inView ? <DesignCardInner design={design} /> : <DesignCardSkeleton />}</div>;
  };

  const CtaCard = () => (
    <Card
      className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
      onClick={() => navigate("/customize")}
    >
      <div className="aspect-square flex flex-col items-center justify-center text-center p-4 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
          <Smartphone className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-primary-foreground leading-tight">Personalize sua Capinha</h3>
          <p className="text-xs text-primary-foreground/70 mt-1">Envie sua foto e crie um design único</p>
        </div>
        <Button size="sm" variant="secondary" className="gap-1 text-xs font-semibold">
          Começar <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Coleções" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 px-5">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Capinhas Exclusivas para Celular
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designs únicos criados por artistas. Proteção premium com acabamento soft-touch. Encontre a capa perfeita ou personalize a sua.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar capinhas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Tags */}
      {!isSearching && collections.length > 1 && (
        <div className="max-w-5xl mx-auto px-5 pt-6 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => { setActiveTag(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeTag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Todas
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => scrollToCollection(col.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTag === col.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 py-6">
        {loading ? (
          <LoadingSpinner />
        ) : isSearching ? (
          /* Search Results */
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredDesigns.length} resultado{filteredDesigns.length !== 1 ? "s" : ""} para "{query}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <CtaCard />
              {filteredDesigns.map((d) => (
                <LazyDesignCard key={d.id} design={d} />
              ))}
            </div>
            {filteredDesigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma capinha encontrada. Que tal criar a sua?</p>
                <Button className="mt-4 gap-2" onClick={() => navigate("/customize")}>
                  Personalizar <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhuma coleção disponível no momento.</p>
        ) : (
          /* Vitrines por Coleção */
          <div className="space-y-12">
            {collections.map((col) => (
              <section key={col.id} id={`colecao-${col.slug}`} className="scroll-mt-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{col.name}</h2>
                  <button
                    onClick={() => navigate(`/colecao/${col.slug}`)}
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Ver tudo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {col.designs.slice(0, 8).map((d) => (
                    <LazyDesignCard key={d.id} design={d} />
                  ))}
                </div>
                {col.designs.length > 8 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/colecao/${col.slug}`)}>
                      Ver todos os {col.designs.length} designs <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* CTA Final */}
        {!isSearching && (
          <section className="mt-16 mb-8 text-center bg-gradient-to-br from-primary/10 to-accent/30 rounded-2xl p-8 md:p-12">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Não encontrou o que procura?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Envie sua própria foto e crie uma capinha totalmente personalizada com acabamento premium.
            </p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/customize")}>
              Personalizar Agora <ArrowRight className="w-4 h-4" />
            </Button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Collections;
