import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import LoadingSpinner from "@/components/ui/loading-spinner";

const slugMap: Record<string, string> = {
  "/termos": "terms",
  "/privacidade": "privacy",
  "/compras": "purchase-policy",
};

const LegalDocument = () => {
  const { pathname } = useLocation();
  const slug = slugMap[pathname];
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("legal_documents")
      .select("title, content")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: title }]} />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-10">
        <article className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-muted-foreground">{line.slice(2, -2)}</p>;
            if (line.startsWith("- **")) {
              const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
              if (match) return <p key={i} className="ml-4">• <strong>{match[1]}</strong>{match[2]}</p>;
            }
            if (line.startsWith("- ")) return <p key={i} className="ml-4">• {line.slice(2)}</p>;
            if (line.startsWith("---")) return <hr key={i} className="my-6 border-border" />;
            if (line.trim() === "") return <div key={i} className="h-2" />;
            return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
          })}
        </article>
      </main>
    </div>
  );
};

export default LegalDocument;
