import { Shield, Palette, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import logoEpson from "@/assets/logo-epson.png";
import logoPrecisionCore from "@/assets/logo-precisioncore.png";
import parallaxBg from "@/assets/printmycase-hero.png";

const features = [
  {
    icon: Shield,
    title: "Proteção Real",
    desc: "Policarbonato rígido absorve impactos. TPU flexível protege contra quedas e arranhões. Acabamento soft-touch que não escorrega.",
  },
  {
    icon: Palette,
    title: "Impressão UV Epson",
    desc: "Tecnologia Micro Piezo sem aquecimento: cores vibrantes e detalhes nítidos que não desbotam. Sua arte ganha vida exatamente como você imaginou.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    desc: "Produção em até 48h com embalagem reforçada. Frete acessível para todo o Sudeste.",
  },
];

const WhyArtisCase = () => {
  return (
    <section
      id="beneficios"
      className="relative py-20 px-5 text-white overflow-hidden parallax-bg"
      style={{ backgroundImage: `url(${parallaxBg})` }}
    >
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Proteção e estilo em cada detalhe
          </h2>
          <p className="text-center text-white/60 max-w-xl mx-auto mb-12">
            Materiais premium e impressão profissional em cada case.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 100}>
              <Card className="group text-center border-0 border-l-4 border-l-primary/60 shadow-sm bg-white/5 h-full hover:bg-white/[0.08] transition-all duration-300">
                <CardContent className="pt-8 pb-6 px-6 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-white/60">{f.desc}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={350}>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <img src={logoEpson} alt="Epson" className="h-9 opacity-70" />
              <img src={logoPrecisionCore} alt="PrecisionCore" className="h-10 opacity-70" />
            </div>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/catalog">Crie sua Case →</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default WhyArtisCase;
