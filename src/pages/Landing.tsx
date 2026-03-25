import { useNavigate, Link } from "react-router-dom";
import {
  Smartphone, Upload, Package, Star, ArrowRight, ChevronRight } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCollections } from "@/hooks/useCollections";
import SeoHead from "@/components/SeoHead";
import AppHeader from "@/components/AppHeader";
import CollectionCard from "@/components/CollectionCard";
import heroBg from "@/assets/hero-bg-optimized.webp";
import ScrollReveal from "@/components/ScrollReveal";
import AiCoinsSection from "@/components/AiCoinsSection";
import WhyPrintMyCase from "@/components/WhyPrintMyCase";
import FaqSection from "@/components/FaqSection";
import PaymentBadges from "@/components/PaymentBadges";
import PublicGallerySection from "@/components/PublicGallerySection";
import logoPrintMyCase from "@/assets/logo-printmycase-sm.webp";

const testimonials = [
{ name: "Ana C.", text: "Melhor capinha que já tive! A qualidade é incrível e a personalização ficou perfeita.", rating: 5 },
{ name: "Lucas M.", text: "Surpreendeu demais. O acabamento soft-touch é muito premium. Já pedi a segunda!", rating: 5 },
{ name: "Beatriz R.", text: "Enviei minha foto e ficou exatamente como imaginei. Frete rápido e embalagem top.", rating: 5 }];

const steps = [
{ icon: Smartphone, title: "Escolha o Modelo", desc: "Mais de 70 smartphones disponíveis" },
{ icon: Upload, title: "Envie sua Foto", desc: "Aplique filtros artísticos com IA" },
{ icon: Package, title: "Receba em Casa", desc: "Produção em 48h e envio rápido" }];


const fadeIn = (delayMs: number): React.CSSProperties => ({
  animationDelay: `${delayMs}ms`,
  animationFillMode: "forwards"
});

const Landing = () => {
  const navigate = useNavigate();
  const { collections, loading: collectionsLoading } = useCollections();

  return (
    <>
      <SeoHead />
      <div className="min-h-screen bg-background flex flex-col">
        <main>
          {/* Hero — Dark */}
          <section aria-label="Banner principal" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
            {/* Header inside hero */}
            <div className="absolute top-0 left-0 right-0 z-20">
              <AppHeader variant="transparent" />
            </div>

            {/* BG image */}
            <div className="absolute inset-0">
              <img
                src={heroBg}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover" />
              
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-purple-950/55 to-black/80" />
            {/* Radial glow */}
            <div className="absolute inset-0 opacity-40" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 20%, hsl(265 83% 57% / 0.45), transparent 70%)"
            }} />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl -top-20 -left-20 animate-pulse" />
              <div className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl -bottom-32 -right-32 animate-pulse [animation-delay:2s]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5 sm:space-y-7 px-5 pt-20 pb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight opacity-0 animate-fade-in" style={{ ...fadeIn(0), textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                Crie sua capinha{" "}
                <span className="drop-shadow-[0_0_24px_hsl(265_83%_57%/0.6)] text-yellow-300">personalizada</span>{" "}
                e receba em casa.
              </h1>
              <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto opacity-0 animate-fade-in" style={fadeIn(150)}>  Busque o modelo do smartphone, envie sua foto e pronto!  </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 opacity-0 animate-fade-in" style={fadeIn(300)}>
                <Button size="lg" className="gap-2 text-base bg-orange-500 hover:bg-orange-600 text-white glow-orange" onClick={() => navigate("/customize")}>
                  Criar Minha Case <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-base border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent"
                  onClick={() => {
                    document.getElementById("destaques")?.scrollIntoView({ behavior: "smooth" });
                  }}>
                  Ver Modelos
                </Button>
              </div>

              {/* Social proof badge */}
              <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 mx-auto opacity-0 animate-fade-in" style={fadeIn(450)}>
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) =>
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <span className="text-sm text-white/80 font-medium">Mais de 10.000 Cases criadas</span>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="como-funciona" className="py-20 px-5 bg-background">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">Como criar sua capinha personalizada!
</h2>
                <p className="text-center text-muted-foreground max-w-xl mx-auto mb-14">
                  Em apenas 3 passos simples, sua capinha personalizada sai do zero e chega na sua porta.
                </p>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                {steps.map((s, i) => <ScrollReveal key={s.title} delay={i * 150}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Number badge */}
                      <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {/* Icon */}
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <s.icon className="w-10 h-10 text-primary" strokeWidth={1.2} />
                      </div>
                      {/* Text */}
                      <h3 className="text-base font-bold uppercase tracking-wide text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground max-w-[220px]">{s.desc}</p>
                    </div>
                  </ScrollReveal>
                )}
              </div>
              <ScrollReveal delay={500}>
                <div className="text-center mt-12">
                  <Button size="lg" className="gap-2 text-base bg-primary hover:bg-primary/90" onClick={() => navigate("/customize")}>
                    Criar Minha Capinha <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Collections Showcase */}
          <section id="destaques" className="py-16 px-5 bg-background">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Escolha um modelo</h2>
              </ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fixed CTA Card */}
                <ScrollReveal>
                  <Card
                    className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
                    onClick={() => navigate("/customize")}
                  >
                    <div className="aspect-square flex flex-col items-center justify-center text-center p-4 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                        <Smartphone className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary-foreground leading-tight">Personalize sua Capinha</h3>
                        <p className="text-xs text-primary-foreground/70 mt-1">Envie sua foto e crie um design único</p>
                      </div>
                      <Button size="sm" variant="secondary" className="gap-1 text-xs font-semibold">
                        Começar <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                </ScrollReveal>

                {/* Collection Cards */}
                {collections.slice(0, 3).map((col, i) => (
                  <ScrollReveal key={col.id} delay={(i + 1) * 80}>
                    <CollectionCard collection={col} />
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={350}>
                <div className="text-center mt-8">
                  <Button variant="outline" className="gap-2" onClick={() => navigate("/colecoes")}>
                    Ver Todas as Coleções <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* AI Coins */}
          <AiCoinsSection />

          {/* Benefits + Print Tech */}
          <WhyPrintMyCase />


          {/* Public AI Gallery */}
          <PublicGallerySection />

          {/* Testimonials */}
          <section id="depoimentos" className="py-16 px-5 bg-background">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">O que nossos clientes dizem</h2>
              </ScrollReveal>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t, i) =>
                <ScrollReveal key={t.name} delay={i * 100}>
                    <Card className="border-0 shadow-sm h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="pt-6 pb-5 px-6 space-y-3">
                        <div className="flex gap-0.5" aria-hidden="true">
                          {Array.from({ length: t.rating }).map((_, j) =>
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                        </div>
                        <p className="text-sm text-foreground italic">"{t.text}"</p>
                        <p className="text-sm font-semibold text-muted-foreground">{t.name}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <FaqSection />

          {/* Final CTA */}
          <section className="py-20 px-5 bg-primary text-primary-foreground">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pronto para criar sua Case única?</h2>
              <p className="text-lg text-white">
                Escolha seu modelo, envie sua foto e receba sua capinha exclusiva na sua porta.
                <br />
                <span className="text-sm text-white/80">Não encontrou seu modelo? Solicite e avisaremos!</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold" onClick={() => navigate("/customize")}>
                  Comece Agora <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent"
                  onClick={() => navigate("/solicitar-modelo")}>
                  <Smartphone className="w-4 h-4" /> Solicitar Modelo
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card py-10 px-5">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <img src={logoPrintMyCase} alt="PrintMyCase" className="h-12 w-auto" loading="lazy" width="48" height="48" />
              <p className="text-muted-foreground leading-relaxed">
                Capas personalizadas com tecnologia de impressão profissional. Qualidade premium direto na sua porta.
              </p>
            </div>
            <div className="space-y-3">
              <span className="font-semibold text-foreground">Links Úteis</span>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link to="/catalog" className="hover:text-foreground transition-colors w-fit">Catálogo</Link>
                <Link to="/colecoes" className="hover:text-foreground transition-colors w-fit">Coleções</Link>
                <Link to="/solicitar-modelo" className="hover:text-foreground transition-colors w-fit">Solicitar Modelo</Link>
                <Link to="/ajuda" className="hover:text-foreground transition-colors w-fit">Central de Ajuda</Link>
                <Link to="/termos" className="hover:text-foreground transition-colors w-fit">Termos de Uso</Link>
                <Link to="/privacidade" className="hover:text-foreground transition-colors w-fit">Política de Privacidade</Link>
                <Link to="/compras" className="hover:text-foreground transition-colors w-fit">Política de Compra e Devolução</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <span className="font-semibold text-foreground">Contato</span>
              <p className="text-muted-foreground leading-relaxed">
                Dúvidas ou sugestões? Entre em contato:
              </p>
              <a
                href="mailto:sac@printmycase.com.br"
                className="inline-block text-primary hover:text-primary/80 font-medium transition-colors">
                sac@printmycase.com.br
              </a>
            </div>
          </div>

          <Separator className="my-6" />
          <PaymentBadges />
          <Separator className="my-6" />

          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© 2026 RB DIGITAL TECH LTDA — CNPJ 49.841.456/0001-73. Todos os direitos reservados.</span>
            <span>Feito com ❤️ no Brasil</span>
          </div>
        </footer>
      </div>
    </>);

};

export default Landing;