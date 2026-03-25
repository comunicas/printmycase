import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

interface PublicGeneration {
  id: string;
  image_url: string;
  public_image_url: string | null;
  filter_name: string | null;
  generation_type: string;
}

const PublicGallerySection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PublicGeneration[]>([]);

  useEffect(() => {
    supabase
      .from("user_ai_generations")
      .select("id, image_url, public_image_url, filter_name, generation_type")
      .eq("public", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data?.length) setImages(data);
      });
  }, []);

  if (!images.length) return null;

  return (
    <section className="py-16 px-5 bg-background">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Feito com IA
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Galeria de Inspiração
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Veja o que outros usuários criaram com nossos filtros de IA
            </p>
          </div>
        </ScrollReveal>

        <div className="columns-2 md:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {images.map((img, i) => {
            const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]"];
            const aspect = aspects[i % aspects.length];
            return (
              <ScrollReveal key={img.id} delay={i * 80}>
                <div className={`group relative ${aspect} rounded-xl overflow-hidden bg-muted break-inside-avoid`}>
                  <img
                    src={img.public_image_url || img.image_url}
                    alt={img.filter_name || "Geração IA"}
                    loading="lazy"
                    width={400}
                    height={400}
                    onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
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
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center mt-10">
            <Button
              size="lg"
              className="gap-2 text-base"
              onClick={() => navigate("/customize")}
            >
              Crie a Sua <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PublicGallerySection;
