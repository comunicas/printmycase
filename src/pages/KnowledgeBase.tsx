import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";
import {
  HelpCircle, Package, Sparkles, CreditCard, User, Shield,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  HelpCircle, Package, Sparkles, CreditCard, User, Shield,
};

interface KbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  article_count: number;
}

const KnowledgeBase = () => {
  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: cats } = await supabase
        .from("kb_categories")
        .select("id, name, slug, icon, description, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!cats) { setLoading(false); return; }

      // Count active articles per category
      const { data: articles } = await supabase
        .from("kb_articles")
        .select("category_id")
        .eq("active", true);

      const countMap: Record<string, number> = {};
      articles?.forEach((a) => {
        countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
      });

      setCategories(
        cats.map((c) => ({ ...c, article_count: countMap[c.id] || 0 }))
      );
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader breadcrumbs={[{ label: "Central de Ajuda" }]} />
        <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10">
          <ScrollReveal>
            <h1 className="text-3xl font-bold text-foreground text-center mb-2">
              Central de Ajuda
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Escolha uma categoria para encontrar o que precisa.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => {
              const Icon = (cat.icon && iconMap[cat.icon]) || HelpCircle;
              return (
                <ScrollReveal key={cat.id} delay={i * 60}>
                  <Link to={`/ajuda/${cat.slug}`}>
                    <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border">
                      <CardContent className="p-6 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-semibold text-foreground">{cat.name}</h2>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {cat.description}
                          </p>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {cat.article_count} {cat.article_count === 1 ? "artigo" : "artigos"}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              Nenhuma categoria disponível ainda.
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default KnowledgeBase;
