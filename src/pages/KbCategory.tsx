import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ScrollReveal from "@/components/ScrollReveal";
import { setPageSeo, SITE_URL, injectJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ChevronRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
}

const KbCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categoryName, setCategoryName] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = "Central de Ajuda | Studio PrintMyCase";
  }, []);

  useEffect(() => {
    if (!categorySlug) return;
    let seoCleanup: (() => void) | null = null;
    let breadcrumbCleanup: (() => void) | null = null;
    let itemListCleanup: (() => void) | null = null;

    const fetch = async () => {
      const { data: cat } = await supabase
        .from("kb_categories")
        .select("id, name, description")
        .eq("slug", categorySlug)
        .eq("active", true)
        .maybeSingle();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategoryName(cat.name);

      const { data: arts } = await supabase
        .from("kb_articles")
        .select("id, title, slug, sort_order")
        .eq("category_id", cat.id)
        .eq("active", true)
        .order("sort_order", { ascending: true });

      setArticles(arts ?? []);

      const desc = cat.description || `Artigos sobre ${cat.name} no Studio PrintMyCase.`;
      const url = `${SITE_URL}/ajuda/${categorySlug}`;

      seoCleanup = setPageSeo({
        title: `${cat.name} | Central de Ajuda — Studio PrintMyCase`,
        description: desc,
        url,
      });

      breadcrumbCleanup = injectJsonLd("kb-cat-breadcrumb", {
        "@context": "https://schema.org",
        ...breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Central de Ajuda", url: `${SITE_URL}/ajuda` },
          { name: cat.name, url },
        ]),
      });

      // ItemList JSON-LD for category articles
      if (arts && arts.length > 0) {
        itemListCleanup = injectJsonLd("kb-cat-itemlist", {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: cat.name,
          numberOfItems: arts.length,
          itemListElement: arts.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: a.title,
            url: `${SITE_URL}/ajuda/${categorySlug}/${a.slug}`,
          })),
        });
      }

      setLoading(false);
    };
    fetch();

    return () => {
      seoCleanup?.();
      breadcrumbCleanup?.();
      itemListCleanup?.();
    };
  }, [categorySlug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader breadcrumbs={[{ label: "Central de Ajuda", to: "/ajuda" }]} />
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Categoria não encontrada</h1>
          <p className="text-muted-foreground mb-6">A categoria que você procura não existe ou foi removida.</p>
          <Button variant="outline" asChild>
            <Link to="/ajuda">Voltar para Central de Ajuda</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader
          breadcrumbs={[
            { label: "Central de Ajuda", to: "/ajuda" },
            { label: categoryName },
          ]}
        />
        <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
          <ScrollReveal>
            <h1 className="text-2xl font-bold text-foreground mb-8">{categoryName}</h1>
          </ScrollReveal>

          {articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Nenhum artigo nesta categoria.</p>
          ) : (
            <div className="space-y-2">
              {articles.map((art, i) => (
                <ScrollReveal key={art.id} delay={i * 50}>
                  <Link
                    to={`/ajuda/${categorySlug}/${art.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {art.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </main>
      </div>
  );
};

export default KbCategory;
