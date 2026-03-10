import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";

import LoadingSpinner from "@/components/ui/loading-spinner";

const KbArticle = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { categorySlug, articleSlug } = useParams<{
    categorySlug: string;
    articleSlug: string;
  }>();
  const [categoryName, setCategoryName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug || !articleSlug) return;
    const fetch = async () => {
      // Get category name
      const { data: cat } = await supabase
        .from("kb_categories")
        .select("name")
        .eq("slug", categorySlug)
        .eq("active", true)
        .maybeSingle();

      if (cat) setCategoryName(cat.name);

      // Get article
      const { data: art } = await supabase
        .from("kb_articles")
        .select("title, content")
        .eq("slug", articleSlug)
        .eq("active", true)
        .maybeSingle();

      if (art) {
        setTitle(art.title);
        setContent(art.content);
      }
      setLoading(false);
    };
    fetch();
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
          <article className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {content.split("\n").map((line, i) => {
              if (line.startsWith("# "))
                return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
              if (line.startsWith("## "))
                return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith("### "))
                return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("**") && line.endsWith("**"))
                return <p key={i} className="font-semibold text-muted-foreground">{line.slice(2, -2)}</p>;
              if (line.startsWith("- **")) {
                const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
                if (match) return <p key={i} className="ml-4">• <strong>{match[1]}</strong>{match[2]}</p>;
              }
              if (line.startsWith("- "))
                return <p key={i} className="ml-4">• {line.slice(2)}</p>;
              if (line.startsWith("---"))
                return <hr key={i} className="my-6 border-border" />;
              if (line.trim() === "")
                return <div key={i} className="h-2" />;
              return <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>;
            })}
          </article>
        </main>
      </div>
  );
};

export default KbArticle;
