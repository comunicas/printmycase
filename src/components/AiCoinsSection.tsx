import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const showcaseImages = [
"/lovable-uploads/ai-showcase-1-sm.webp",
"/lovable-uploads/ai-showcase-2-sm.webp",
"/lovable-uploads/ai-showcase-3-sm.webp",
"/lovable-uploads/ai-showcase-4-sm.webp",
"/lovable-uploads/ai-showcase-5-sm.webp"];


const AiCoinsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 px-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
          "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(265 83% 57% / 0.3), transparent 70%)"
        }} />
      

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
              Aplique filtros artísticos com um clique. Pop art, 3D, cartoon e muito mais. Cadastre-se e receba 50 coins grátis.
            
            </p>
          </div>
        </ScrollReveal>

        {/* Image showcase */}
        <ScrollReveal delay={100}>
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
              {[...showcaseImages, ...showcaseImages].map((src, i) =>
              <div
                key={i}
                className="flex-shrink-0 w-36 sm:w-40 md:w-44 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/30">
                
                  <img
                  src={src}
                  alt={`Exemplo de filtro IA ${i % showcaseImages.length + 1}`}
                  className="aspect-square w-full object-cover"
                  loading={i < showcaseImages.length ? "eager" : "lazy"}
                  width={176}
                  height={176} />
                
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={300}>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-2 text-base glow-primary"
              onClick={() => navigate("/signup")}>
              
              Cadastre-se Grátis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>);

};

export default AiCoinsSection;