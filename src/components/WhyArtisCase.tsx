import { useState } from "react";
import { Palette, Shield, Truck, Crosshair, Eye, Cpu, Zap, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScrollReveal from "@/components/ScrollReveal";
import logoEpson from "@/assets/logo-epson.png";
import logoPrecisionCore from "@/assets/logo-precisioncore.png";
import parallaxBg from "@/assets/printmycase-hero.png";
const benefits = [
  {
    icon: Shield,
    title: "Proteção Premium",
    desc: "Policarbonato rígido + TPU flexível. Absorve impactos de até 1,5m com acabamento soft-touch que não escorrega.",
  },
  {
    icon: Palette,
    title: "Impressão Profissional",
    desc: "Tecnologia Micro Piezo da Epson. Cores vibrantes, detalhes nítidos e impressão que não desbota com o tempo.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    desc: "Produção em até 48h com embalagem reforçada. Frete acessível para todo o Sudeste.",
  },
];

const techAttributes = [
  { icon: Crosshair, title: "Precisão extrema", desc: "Controle microscópico das gotas de tinta para imagens mais nítidas." },
  { icon: Eye, title: "Alta definição", desc: "Detalhes impressos com qualidade fotográfica." },
  { icon: Cpu, title: "Tecnologia Micro Piezo", desc: "Sistema profissional de impressão Epson." },
  { icon: Zap, title: "Velocidade e qualidade", desc: "Impressão rápida sem comprometer a definição." },
];

const YOUTUBE_ID = "PMDJZLS7X8w";

const WhyArtisCase = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section
        id="beneficios"
        className="relative py-20 px-5 text-white overflow-hidden parallax-bg"
        style={{ backgroundImage: `url(${parallaxBg})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Title */}
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Proteção e estilo em cada detalhe
            </h2>
            <p className="text-center text-white/60 max-w-xl mx-auto mb-12">
              Extrema qualidade final. Sua case protege com estilo exclusivo.
            </p>
          </ScrollReveal>

          {/* 3 main benefit cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {benefits.map((b, i) => (
              <ScrollReveal key={b.title} delay={i * 100}>
                <Card className="group text-center border-0 border-l-4 border-l-primary/60 shadow-sm bg-white/5 h-full hover:bg-white/[0.08] transition-all duration-300">
                  <CardContent className="pt-8 pb-6 px-6 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <b.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                    <p className="text-sm text-white/60">{b.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Tech attributes + video */}
          <ScrollReveal>
            <h3 className="text-xl font-bold text-center mb-2">Tecnologia de Impressão</h3>
            <p className="text-center text-white/50 text-sm max-w-lg mx-auto mb-8">
              Utilizamos a tecnologia <span className="text-primary font-semibold">Micro Piezo</span> da Epson para garantir impressões com qualidade profissional.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Tech list */}
            <div className="space-y-3">
              {techAttributes.map((a, i) => (
                <ScrollReveal key={a.title} delay={i * 80}>
                  <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.08] transition-colors duration-300">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm leading-tight">{a.title}</h4>
                      <p className="text-xs text-white/50 mt-1">{a.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              {/* Partner logos */}
              <ScrollReveal delay={350}>
                <div className="flex items-center gap-8 pt-6 pl-1">
                  <img src={logoEpson} alt="Epson" className="h-9 opacity-70" />
                  <img src={logoPrecisionCore} alt="PrecisionCore" className="h-10 opacity-70" />
                </div>
              </ScrollReveal>
            </div>

            {/* Video thumbnail */}
            <ScrollReveal delay={200}>
              <button
                onClick={() => setShowVideo(true)}
                className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <img
                  src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                  alt="Vídeo sobre tecnologia Micro Piezo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/30">
                    <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
                  </div>
                </div>
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Video modal */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-3xl p-0 bg-black border-white/10 overflow-hidden">
          <div className="aspect-video w-full">
            {showVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1`}
                title="Tecnologia Micro Piezo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhyArtisCase;
