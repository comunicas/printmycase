import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram } from "lucide-react";

interface InstaPost {
  id: string;
  post_url: string;
  caption: string;
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const loadEmbedScript = () => {
  if (document.querySelector('script[src*="instagram.com/embed.js"]')) {
    window.instgrm?.Embeds.process();
    return;
  }
  const s = document.createElement("script");
  s.src = "https://www.instagram.com/embed.js";
  s.async = true;
  document.body.appendChild(s);
};

const InstaEmbed = ({ url }: { url: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="background:var(--background);border:1px solid hsl(var(--border));border-radius:var(--radius);margin:0 auto;max-width:540px;width:100%;"></blockquote>`;
    const t = setTimeout(loadEmbedScript, 100);
    return () => clearTimeout(t);
  }, [url]);

  return <div ref={ref} />;
};

const InstagramShowcase = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);

  useEffect(() => {
    supabase
      .from("instagram_posts")
      .select("id, post_url, caption")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data?.length) setPosts(data as InstaPost[]);
      });
  }, []);

  if (!posts.length) return null;

  return (
    <section className="py-8 px-5" aria-label="Instagram PrintMyCase">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {posts.map((p) => (
            <div key={p.id} className="min-w-[300px] snap-center md:min-w-0">
              <InstaEmbed url={p.post_url} />
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href="https://www.instagram.com/printmycasebr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @printmycasebr
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramShowcase;
