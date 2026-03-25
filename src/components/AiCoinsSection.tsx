import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const showcaseImages = [
  "/lovable-uploads/ai-showcase-1-sm.webp",
  "/lovable-uploads/ai-showcase-2-sm.webp",
  "/lovable-uploads/ai-showcase-3-sm.webp",
  "/lovable-uploads/ai-showcase-4-sm.webp",
  "/lovable-uploads/ai-showcase-5-sm.webp",
];

interface PublicGeneration {
  id: string;
  image_url: string;
  public_image_url: string | null;
  filter_name: string | null;
}

const AiCoinsSection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PublicGeneration[]>([]);

  useEffect(() => {
    supabase
      .from("user_ai_generations")
      .select("id, image_url, public_image_url, filter_name")
      .eq("public", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data?.length) setImages(data);
      });
  }, []);

  const hasPublicImages = images.length > 0;

  return (
    <section className="relative py-20 px-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(265 83% 57% / 0.3), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium text-yellow-300">
              <Sparkles className="w-4 h-4" />
              Novidade — IA Artística
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Transforme qualquer foto em{" "}
              <span className="text-yellow-300 drop-shadow-[0_0_20px_hsl(50_100%_60%/0.4)]">
                arte com IA
              </span>
            </h2>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              Aplique filtros artísticos com um clique. Pop art, 3D, cartoon e
              muito mais. Cadastre-se e receba 50 coins grátis.
            </p>
          </div>
        </ScrollReveal>

        {/* Gallery — public generations or static fallback */}
        <ScrollReveal delay={100}>
          {hasPublicImages ? (
            <div className="columns-2 md:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {images.map((img, i) => {
                const aspects = [
                  "aspect-[3/4]",
                  "aspect-square",
                  "aspect-[4/5]",
                  "aspect-[2/3]",
                ];
                const aspect = aspects[i % aspects.length];
                return (
                  <div
                    key={img.id}
                    className={`group relative ${aspect} rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/30 break-inside-avoid`}
                  >
                    <img
                      src={img.public_image_url || img.image_url}
                      alt={img.filter_name || "Geração IA"}
                      loading="lazy"
                      width={400}
                      height={400}
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      {img.filter_name && (
                        <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          {img.filter_name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
                {[...showcaseImages, ...showcaseImages].map((src, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-36 sm:w-40 md:w-44 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/30"
                  >
                    <img
                      src={src}
                      alt={`Exemplo de filtro IA ${(i % showcaseImages.length) + 1}`}
                      className="aspect-square w-full object-cover"
                      loading={i < showcaseImages.length ? "eager" : "lazy"}
                      width={176}
                      height={176}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={300}>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-2 text-base glow-primary"
              onClick={() => navigate("/customize")}
            >
              Crie a Sua
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AiCoinsSection;
