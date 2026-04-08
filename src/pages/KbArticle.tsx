import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { setPageSeo, SITE_URL, injectJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ArrowLeft, Calendar, FolderOpen, ChevronRight } from "lucide-react";

/** Parse inline markdown: **bold** and [text](url) */
const parseInline = (text: string) => {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] && match[3]) {
      parts.push(
        <a key={key++} href={match[3]} className="text-primary underline hover:text-primary/80" target={match[3].startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {match[2]}
        </a>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
}

const KbArticle = () => {
  const { categorySlug, articleSlug } = useParams<{
    categorySlug: string;
    articleSlug: string;
  }>();
  const [categoryName, setCategoryName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);

  useEffect(() => {
    document.title = "Central de Ajuda | Studio PrintMyCase";
  }, []);

  useEffect(() => {
    if (!categorySlug || !articleSlug) return;
    let jsonLdCleanup: (() => void) | null = null;
    let breadcrumbCleanup: (() => void) | null = null;
    let seoCleanup: (() => void) | null = null;

    const fetchData = async () => {
      // First fetch the category to get its id
      const { data: cat } = await supabase
        .from("kb_categories")
        .select("id, name")
        .eq("slug", categorySlug)
        .eq("active", true)
        .maybeSingle();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategoryName(cat.name);

      // Fetch article filtering by category_id to ensure URL consistency
      const { data: art } = await supabase
        .from("kb_articles")
        .select("id, title, content, created_at, updated_at, category_id")
        .eq("slug", articleSlug)
        .eq("category_id", cat.id)
        .eq("active", true)
        .maybeSingle();

      if (!art) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(art.title);
      setContent(art.content);
      const dateStr = new Date(art.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
      setUpdatedAt(dateStr);

      // Fetch related articles from same category
      const { data: related } = await supabase
        .from("kb_articles")
        .select("id, title, slug")
        .eq("category_id", art.category_id)
        .eq("active", true)
        .neq("id", art.id)
        .order("sort_order", { ascending: true })
        .limit(3);
      setRelatedArticles(related ?? []);

      // SEO meta tags
      const desc = art.content.replace(/[#*\-_]/g, "").slice(0, 155).trim();
      const articleUrl = `${SITE_URL}/ajuda/${categorySlug}/${articleSlug}`;

      seoCleanup = setPageSeo({
        title: `${art.title} | Central de Ajuda — Studio PrintMyCase`,
        description: desc,
        url: articleUrl,
        type: "article",
      });

      // BreadcrumbList
      breadcrumbCleanup = injectJsonLd("kb-art-breadcrumb", {
        "@context": "https://schema.org",
        ...breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Central de Ajuda", url: `${SITE_URL}/ajuda` },
          { name: cat.name, url: `${SITE_URL}/ajuda/${categorySlug}` },
          { name: art.title },
        ]),
      });

      // Article JSON-LD with datePublished and mainEntityOfPage
      jsonLdCleanup = injectJsonLd("kb-article", {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: art.title,
        datePublished: art.created_at,
        dateModified: art.updated_at,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
        author: { "@type": "Organization", name: "Studio PrintMyCase" },
        publisher: { "@type": "Organization", name: "Studio PrintMyCase" },
        description: desc,
      });

      setLoading(false);
    };
    fetchData();

    return () => {
      jsonLdCleanup?.();
      breadcrumbCleanup?.();
      seoCleanup?.();
    };
  }, [categorySlug, articleSlug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader breadcrumbs={[{ label: "Central de Ajuda", to: "/ajuda" }]} />
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi removido.</p>
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
          { label: categoryName, to: `/ajuda/${categorySlug}` },
          { label: title },
        ]}
      />
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
        {/* Title + meta */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
          <Link to={`/ajuda/${categorySlug}`} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <FolderOpen className="w-3.5 h-3.5" />
            {categoryName}
          </Link>
          {updatedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Atualizado em {updatedAt}
            </span>
          )}
        </div>

        {/* Content card */}
        <Card className="border">
          <CardContent className="p-6 sm:p-8">
            <article className="prose prose-sm sm:prose dark:prose-invert max-w-none">
              {content.split("\n").map((line, i) => {
                if (line.startsWith("# "))
                  return <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-foreground">{parseInline(line.slice(2))}</h2>;
                if (line.startsWith("## "))
                  return <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground">{parseInline(line.slice(3))}</h3>;
                if (line.startsWith("### "))
                  return <h4 key={i} className="text-base font-semibold mt-4 mb-2 text-foreground">{parseInline(line.slice(4))}</h4>;
                if (line.startsWith("- **")) {
                  const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
                  if (match) return <p key={i} className="ml-4 text-muted-foreground leading-relaxed">• <strong className="text-foreground">{match[1]}</strong>{parseInline(match[2])}</p>;
                }
                if (line.startsWith("- "))
                  return <p key={i} className="ml-4 text-muted-foreground leading-relaxed">• {parseInline(line.slice(2))}</p>;
                if (line.startsWith("---"))
                  return <hr key={i} className="my-6 border-border" />;
                if (line.trim() === "")
                  return <div key={i} className="h-3" />;
                return <p key={i} className="text-muted-foreground leading-relaxed">{parseInline(line)}</p>;
              })}
            </article>
          </CardContent>
        </Card>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Artigos relacionados</h2>
            <div className="space-y-2">
              {relatedArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/ajuda/${categorySlug}/${art.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {art.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/ajuda/${categorySlug}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para {categoryName}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default KbArticle;
