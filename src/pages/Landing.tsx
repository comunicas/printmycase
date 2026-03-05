import { Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Palette, Shield, Truck, Smartphone, Upload, Package, Star, ArrowRight, ChevronRight } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import SeoHead from "@/components/SeoHead";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import heroBg from "@/assets/hero-bg.jpg";
import ScrollReveal from "@/components/ScrollReveal";
import PrintTechSection from "@/components/PrintTechSection";
import FaqSection from "@/components/FaqSection";

const testimonials = [
{ name: "Ana C.", text: "Melhor capinha que já tive! A qualidade é incrível e a personalização ficou perfeita.", rating: 5 },
{ name: "Lucas M.", text: "Surpreendeu demais. O acabamento soft-touch é muito premium. Já pedi a segunda!", rating: 5 },
{ name: "Beatriz R.", text: "Enviei minha foto e ficou exatamente como imaginei. Frete rápido e embalagem top.", rating: 5 }];

const benefits = [
{ icon: Palette, title: "100% Personalizada", desc: "Produzimos sua capa com a mesma tecnologia usada nas máquinas PrintMyCase presentes em shopping centers." },
{ icon: Shield, title: "Proteção Premium", desc: "Policarbonato rígido + TPU flexível. Protege contra quedas de até 1,5m." },
{ icon: Truck, title: "Envio Rápido", desc: "Frete acessível para a região Sudeste. Produção em até 48h e entrega ágil." }];

const steps = [
{ icon: Smartphone, title: "Escolha o modelo da sua capa", desc: "Selecione o modelo do seu celular" },
{ icon: Upload, title: "Envie sua imagem", desc: "Faça upload da sua foto ou design" },
{ icon: Package, title: "Receba sua Case em casa", desc: "Produção em 48h e envio rápido" }];

const fadeIn = (delayMs: number): React.CSSProperties => ({
  animationDelay: `${delayMs}ms`,
  animationFillMode: "forwards",
});

const Landing = () => {
  const navigate = useNavigate();
  const { products: featuredProducts, loading } = useProducts(4);

  return (
    <>
      <SeoHead products={featuredProducts} />
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader variant="transparent" />

        <main>
          {/* Hero — Dark Parallax */}
          <section aria-label="Banner principal" className="relative min-h-[100vh] -mt-[56px] flex items-center justify-center overflow-hidden">
            {/* Parallax BG */}
            <div
              className="absolute inset-0 parallax-bg"
              style={{ backgroundImage: `url(${heroBg})` }} />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            {/* Radial glow */}
            <div className="absolute inset-0 opacity-60" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(265 83% 57% / 0.35), transparent 70%)"
            }} />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl -top-20 -left-20 animate-pulse" />
              <div className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl -bottom-32 -right-32 animate-pulse [animation-delay:2s]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-7 px-5 pt-20 pb-16">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight opacity-0 animate-fade-in" style={fadeIn(0)}>
                Sua Case{" "}
                <span className="text-primary drop-shadow-[0_0_24px_hsl(265_83%_57%/0.6)]">Customizada</span>{" "}
                em 1 minuto.
              </h1>
              <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto opacity-0 animate-fade-in" style={fadeIn(150)}>
                Crie uma capa personalizada usando a tecnologia PrintMyCase e receba em casa.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 opacity-0 animate-fade-in" style={fadeIn(300)}>
                <Button
                  size="lg"
                  className="gap-2 text-base glow-primary"
                  onClick={() => navigate("/catalog")}>
                  
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
                <span className="text-sm text-white/80 font-medium">Mais de 10.000 Cases criadas com tecnologia PrintMyCase</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Benefits */}
          <section id="beneficios" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
                  Capas personalizadas com qualidade profissional
                </h2>
              </ScrollReveal>
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((b, i) =>
                <ScrollReveal key={b.title} delay={i * 100}>
                    <Card className="group text-center border-0 border-l-4 border-l-primary/60 shadow-sm bg-muted/40 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="pt-8 pb-6 px-6 space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <b.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                        <p className="text-sm text-muted-foreground">{b.desc}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* How it works */}
          <section id="como-funciona" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Como funciona</h2>
              </ScrollReveal>
              <div className="grid md:grid-cols-5 gap-4 items-center">
                {steps.map((s, i) =>
                <Fragment key={s.title}>
                  <ScrollReveal delay={i * 150}>
                    <div className="flex flex-col items-center text-center space-y-3 bg-muted/30 rounded-2xl p-6 hover:bg-muted/50 transition-colors duration-300">
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <s.icon className="w-6 h-6 text-primary-foreground" />
                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold flex items-center justify-center ring-2 ring-background">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </ScrollReveal>
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-primary/30 relative">
                        <ChevronRight className="w-5 h-5 text-primary/50 absolute -right-2.5 -top-2.5" />
                      </div>
                    </div>
                  )}
                </Fragment>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Featured Products */}
          <section id="destaques" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Modelos em Destaque</h2>
              </ScrollReveal>
              {loading ?
              <LoadingSpinner /> :

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredProducts.map((product, i) =>
                <ScrollReveal key={product.id} delay={i * 80}>
                      <ProductCard product={product} />
                    </ScrollReveal>
                )}
                </div>
              }
              <ScrollReveal delay={350}>
                <div className="text-center mt-8">
                  <Button variant="outline" className="gap-2" onClick={() => navigate("/catalog")}>
                    Ver Catálogo Completo <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Print Technology */}
          <PrintTechSection />

          <Separator />

          {/* Testimonials */}
          <section id="depoimentos" className="py-16 px-5 bg-muted/30">
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
              <p className="text-lg opacity-90">
                Escolha seu modelo, envie sua foto e receba sua capinha exclusiva na sua porta.
                <br />
                <span className="text-sm opacity-75">Não encontrou seu modelo? Solicite e avisaremos!</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold" onClick={() => navigate("/catalog")}>
                  Comece Agora <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent"
                  onClick={() => navigate("/solicitar-modelo")}
                >
                  <Smartphone className="w-4 h-4" /> Solicitar Modelo
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card py-10 px-5">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            {/* Brand */}
            <div className="space-y-3">
              <span className="text-lg font-bold text-foreground">ArtisCase</span>
              <p className="text-muted-foreground leading-relaxed">
                Capas personalizadas com tecnologia de impressão profissional. Qualidade premium direto na sua porta.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <span className="font-semibold text-foreground">Links Úteis</span>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link to="/catalog" className="hover:text-foreground transition-colors w-fit">Catálogo</Link>
                <Link to="/solicitar-modelo" className="hover:text-foreground transition-colors w-fit">Solicitar Modelo</Link>
                <a href="#faq" className="hover:text-foreground transition-colors w-fit">Perguntas Frequentes</a>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <span className="font-semibold text-foreground">Contato</span>
              <p className="text-muted-foreground leading-relaxed">
                Dúvidas ou sugestões? Entre em contato pelo nosso formulário de solicitação.
              </p>
              <Link
                to="/solicitar-modelo"
                className="inline-block text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Fale Conosco →
              </Link>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© 2026 ArtisCase. Todos os direitos reservados.</span>
            <span>Feito com ❤️ no Brasil</span>
          </div>
        </footer>
      </div>
    </>);

};

export default Landing;
