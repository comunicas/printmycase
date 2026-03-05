import { useState } from "react";
import { Crosshair, Palette, Eye, Cpu, Zap, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScrollReveal from "@/components/ScrollReveal";
import logoEpson from "@/assets/logo-epson.png";
import logoPrecisionCore from "@/assets/logo-precisioncore.png";

const attributes = [
  { icon: Crosshair, title: "Precisão extrema", desc: "Controle microscópico das gotas de tinta para imagens mais nítidas." },
  { icon: Palette, title: "Cores vibrantes", desc: "Transições suaves que reproduzem cada nuance do design." },
  { icon: Eye, title: "Alta definição", desc: "Detalhes impressos com qualidade fotográfica." },
  { icon: Cpu, title: "Tecnologia profissional", desc: "Sistema de impressão baseado na tecnologia Micro Piezo." },
  { icon: Zap, title: "Velocidade e qualidade", desc: "Impressão rápida sem comprometer a definição." },
];

const YOUTUBE_ID = "PMDJZLS7X8w";

const PrintTechSection = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section className="py-20 px-5 bg-zinc-950 text-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Tecnologia de Impressão</h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Utilizamos a tecnologia <span className="text-primary font-semibold">Micro Piezo</span> da Epson para garantir impressões com qualidade profissional em cada case.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Attributes */}
            <div className="space-y-3">
              {attributes.map((a, i) => (
                <ScrollReveal key={a.title} delay={i * 80}>
                  <div className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.08] transition-colors duration-300">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                      <p className="text-xs text-white/50 mt-1">{a.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              {/* Partner logos */}
              <ScrollReveal delay={450}>
                <div className="flex items-center gap-6 pt-4 pl-1">
                  <img src={logoEpson} alt="Epson" className="h-7 opacity-60" />
                  <img src={logoPrecisionCore} alt="PrecisionCore" className="h-8 opacity-60" />
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

export default PrintTechSection;
