import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import SeoHead from "@/components/SeoHead";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ScrollReveal from "@/components/ScrollReveal";
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

  useEffect(() => {
    if (!categorySlug) return;
    const fetch = async () => {
      const { data: cat } = await supabase
        .from("kb_categories")
        .select("id, name")
        .eq("slug", categorySlug)
        .eq("active", true)
        .maybeSingle();

      if (!cat) { setLoading(false); return; }
      setCategoryName(cat.name);

      const { data: arts } = await supabase
        .from("kb_articles")
        .select("id, title, slug, sort_order")
        .eq("category_id", cat.id)
        .eq("active", true)
        .order("sort_order", { ascending: true });

      setArticles(arts ?? []);
      setLoading(false);
    };
    fetch();
  }, [categorySlug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  return (
    <>
      <SeoHead
        title={`${categoryName || "Categoria"} | Central de Ajuda | ArtisCase`}
        description={`Artigos sobre ${categoryName}`}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader
          breadcrumbs={[
            { label: "Central de Ajuda", href: "/ajuda" },
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
    </>
  );
};

export default KbCategory;
