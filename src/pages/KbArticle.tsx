import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { setPageSeo, SITE_URL } from "@/lib/seo";
import { ArrowLeft, Calendar, FolderOpen } from "lucide-react";

/** Parse inline markdown: **bold** and [text](url) */
const parseInline = (text: string) => {
  const parts: React.ReactNode[] = [];
  // Combined regex for bold and links
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

  useEffect(() => {
    if (!categorySlug || !articleSlug) return;
    const fetchData = async () => {
      const { data: cat } = await supabase
        .from("kb_categories")
        .select("name")
        .eq("slug", categorySlug)
        .eq("active", true)
        .maybeSingle();

      if (cat) setCategoryName(cat.name);

      const { data: art } = await supabase
        .from("kb_articles")
        .select("title, content, updated_at")
        .eq("slug", articleSlug)
        .eq("active", true)
        .maybeSingle();

      if (art) {
        setTitle(art.title);
        setContent(art.content);
        setUpdatedAt(new Date(art.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }));
      }
      setLoading(false);
    };
    fetchData();
  }, [categorySlug, articleSlug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

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
