import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram } from "lucide-react";

interface InstaPost {
  id: string;
  post_url: string;
  thumbnail_url: string | null;
  caption: string;
}

const InstagramShowcase = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabase
      .from("instagram_posts")
      .select("id, post_url, thumbnail_url, caption")
      .eq("active", true)
      .order("sort_order")
      .limit(6)
      .then(({ data }) => {
        if (data?.length) setPosts(data as InstaPost[]);
      });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [posts, inView]);

  if (!posts.length) return null;

  return (
    <section ref={sectionRef} className="py-8 px-5" aria-label="Instagram PrintMyCase">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative min-w-[260px] snap-center md:min-w-0 aspect-square rounded-xl overflow-hidden bg-muted/30 block"
            >
              {inView && p.thumbnail_url ? (
                <img
                  src={p.thumbnail_url}
                  alt={p.caption || "Post do Instagram"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-muted/30" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </a>
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
