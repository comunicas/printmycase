import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { getOptimizedUrl } from "@/lib/image-utils";
import AiGalleryModal from "@/components/AiGalleryModal";

interface PublicGeneration {
  id: string;
  image_url: string;
  public_image_url: string | null;
  filter_name: string | null;
}

const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]"];

const AiCoinsSection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PublicGeneration[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [lightboxInitial, setLightboxInitial] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("public_ai_generations" as never)
      .select("id, image_url, public_image_url, filter_name")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (error) {
          console.error("public_ai_generations query failed:", error);
          return;
        }
        if (data?.length) setImages(data);
      });
  }, []);

  if (images.length === 0) return null;

  const handleCardClick = (img: PublicGeneration) => {
    setLightboxInitial(getOptimizedUrl(img.public_image_url || img.image_url, 800));
    setGalleryOpen(true);
  };

  return (
    <>
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
                Aplique filtros artísticos com um clique. Pop art, 3D, cartoon e muito mais.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="columns-2 md:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {images.map((img, i) => {
                const aspect = ASPECTS[i % ASPECTS.length];
                return (
                  <div
                    key={img.id}
                    className={`group relative ${aspect} rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/30 break-inside-avoid cursor-pointer`}
                    onClick={() => handleCardClick(img)}
                  >
                    <img
                      src={getOptimizedUrl(img.public_image_url || img.image_url, 400)}
                      alt={img.filter_name || "Geração IA"}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
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
                    {img.filter_name && (
                      <div className="absolute top-1.5 left-1.5 md:hidden">
                        <span className="text-[10px] font-medium text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                          {img.filter_name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 text-base glow-primary"
                onClick={() => navigate("/customize")}
              >
                Crie a Sua
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base border-white/20 text-white hover:bg-white/10"
                onClick={() => { setLightboxInitial(null); setGalleryOpen(true); }}
              >
                <Images className="w-4 h-4" />
                Ver Todas
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AiGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialImageUrl={lightboxInitial}
      />
    </>
  );
};

export default AiCoinsSection;
