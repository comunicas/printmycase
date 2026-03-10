import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";
import {
  HelpCircle, Package, Sparkles, CreditCard, User, UserCircle, Shield,
  Search, X, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  HelpCircle, Package, Sparkles, CreditCard, User, UserCircle, Shield,
};

interface KbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  article_count: number;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_name: string;
  category_slug: string;
}

const KnowledgeBase = () => {
  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const fetch = async () => {
      const { data: cats } = await supabase
        .from("kb_categories")
        .select("id, name, slug, icon, description, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!cats) { setLoading(false); return; }

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

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const pattern = `%${term.trim()}%`;
    const { data } = await supabase
      .from("kb_articles")
      .select("id, title, slug, content, kb_categories(name, slug)")
      .eq("active", true)
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .limit(20);

    if (data) {
      setResults(data.map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        content: a.content,
        category_name: a.kb_categories?.name ?? "",
        category_slug: a.kb_categories?.slug ?? "",
      })));
    }
    setSearching(false);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const getSnippet = (content: string, term: string) => {
    const lower = content.toLowerCase();
    const idx = lower.indexOf(term.toLowerCase());
    const start = Math.max(0, idx - 60);
    const end = Math.min(content.length, idx + term.length + 100);
    let snippet = content.slice(start, end).replace(/[#*\-_]/g, "").trim();
    if (start > 0) snippet = "…" + snippet;
    if (end < content.length) snippet += "…";
    return snippet;
  };

  if (loading) return <LoadingSpinner variant="fullPage" />;

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Central de Ajuda" }]} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Escolha uma categoria para encontrar o que precisa.
          </p>
        </ScrollReveal>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar artigos…"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results */}
        {isSearching ? (
          searching ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum resultado para "<span className="font-medium text-foreground">{query}</span>"
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to={`/ajuda/${r.category_slug}/${r.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.category_name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {getSnippet(r.content, query.trim())}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-3" />
                </Link>
              ))}
            </div>
          )
        ) : (
          <>
            {/* Category grid */}
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
          </>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBase;
