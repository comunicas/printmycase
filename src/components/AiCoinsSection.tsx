import { useNavigate } from "react-router-dom";
import { Sparkles, Coins, Palette, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const showcaseImages = [
  "/lovable-uploads/ai-showcase-1.png",
  "/lovable-uploads/ai-showcase-2.png",
  "/lovable-uploads/ai-showcase-3.png",
  "/lovable-uploads/ai-showcase-4.png",
  "/lovable-uploads/ai-showcase-5.png",
];

const infoCards = [
  {
    icon: Coins,
    value: "50",
    label: "moedas grátis",
    desc: "no cadastro",
    gradient: "from-yellow-500/20 to-amber-500/10",
    iconColor: "text-yellow-400",
  },
  {
    icon: Palette,
    value: "+20",
    label: "estilos artísticos",
    desc: "Pop art, 3D, cartoon…",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Zap,
    value: "10",
    label: "moedas por filtro",
    desc: "resultado instantâneo",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
];

const AiCoinsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 px-5 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      {/* Radial glow accent */}
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
              Novidade — ArtisCoins + IA
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Transforme qualquer foto em{" "}
              <span className="text-yellow-300 drop-shadow-[0_0_20px_hsl(50_100%_60%/0.4)]">
                arte com IA
              </span>
            </h2>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              Use filtros artísticos inteligentes para criar cases únicas. Pop
              art, 3D, cartoon e muito mais — tudo com um clique.
            </p>
          </div>
        </ScrollReveal>

        {/* Image showcase */}
        <ScrollReveal delay={100}>
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
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {infoCards.map((card, i) => (
            <ScrollReveal key={card.label} delay={200 + i * 80}>
              <div className="glass rounded-2xl p-5 text-center space-y-2 hover:scale-105 transition-transform duration-300">
                <div
                  className={`mx-auto w-11 h-11 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <p className="text-2xl font-extrabold text-white">
                  {card.value}
                </p>
                <p className="text-sm font-semibold text-white/90">
                  {card.label}
                </p>
                <p className="text-xs text-white/50">{card.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTAs */}
        <ScrollReveal delay={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="gap-2 text-base glow-primary"
              onClick={() => navigate("/signup")}
            >
              Cadastre-se Grátis e Ganhe 50 🪙
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent"
              onClick={() => navigate("/coins")}
            >
              <Coins className="w-4 h-4" />
              Saiba mais sobre ArtisCoins
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AiCoinsSection;
