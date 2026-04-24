import { lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Smartphone, Upload, Package, ArrowRight, ChevronRight, Sparkles } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAllDesigns } from "@/hooks/useCollectionDesigns";
import { formatPrice } from "@/lib/types";
import SeoHead from "@/components/SeoHead";
import { getOptimizedUrl } from "@/lib/image-utils";
import AppHeader from "@/components/AppHeader";
import PromoBanner from "@/components/PromoBanner";
import ScrollReveal from "@/components/ScrollReveal";
import PaymentBadges from "@/components/PaymentBadges";
import { DsButton, SectionLabel, FloatingBadge, Ticker, StepCard, TestimonialCard } from "@/components/ds";
import TechQualitySection from "@/components/home/TechQualitySection";

// Lazy-load below-the-fold sections to reduce initial JS bundle (improves FCP/LCP)
const AiCoinsSection = lazy(() => import("@/components/AiCoinsSection"));
const FaqSection = lazy(() => import("@/components/FaqSection"));
const StoreLocator = lazy(() => import("@/components/StoreLocator"));
const InstagramShowcase = lazy(() => import("@/components/InstagramShowcase"));





const Landing = () => {
  const navigate = useNavigate();
  const { designs } = useAllDesigns(7);

  return (
    <>
      <SeoHead />
      <div className="min-h-screen bg-background flex flex-col">
        <main>
          {/* Hero — Light DS v2 */}
          <section aria-label="Banner principal" className="relative bg-background overflow-hidden">
            {/* PromoBanner — flow normal */}
            <div className="relative z-30">
              <PromoBanner />
            </div>

            {/* AppHeader — posição relativa dentro do hero */}
            <div className="relative z-20">
              <AppHeader variant="default" />
            </div>

            {/* Grid de fundo sutil */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Glow decorativo roxo */}
            <div
              className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
              style={{ background: "var(--gradient-glow)" }}
            />

            {/* Conteúdo hero */}
            <div className="relative z-10 max-w-6xl mx-auto px-5 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Painel esquerdo — copy */}
              <div className="space-y-6">
                <SectionLabel>
                  <Sparkles className="w-3.5 h-3.5" />
                  STUDIO COM IA
                </SectionLabel>

                <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
                  Sua capa.
                  <br />
                  Sua arte.
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "var(--gradient-brand)" }}
                  >
                    Com IA.
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-[480px]">
                  Envie uma foto, descreva o que imagina e a nossa IA cria uma capa única
                  pro seu celular. Impressão premium, entrega rápida em todo Brasil.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <DsButton
                    variant="brand"
                    size="lg"
                    icon={<Sparkles className="w-5 h-5" />}
                    onClick={() => navigate("/customize")}
                  >
                    Criar minha capa
                  </DsButton>
                  <DsButton
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/colecoes")}
                  >
                    Ver galeria
                  </DsButton>
                </div>

                {/* Trust social */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="flex -space-x-2">
                    {[
                      { bg: "bg-primary", letter: "I" },
                      { bg: "bg-orange-500", letter: "R" },
                      { bg: "bg-green-500", letter: "T" },
                      { bg: "bg-yellow-500", letter: "L" },
                      { bg: "bg-pink-500", letter: "A" },
                    ].map(({ bg, letter }) => (
                      <div
                        key={letter}
                        className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center text-xs font-bold text-white`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">+10 mil clientes</span>{" "}
                    criaram suas capas únicas
                  </p>
                </div>
              </div>

              {/* Painel direito — mockup */}
              <div className="relative flex justify-center items-center">
                {/* Frame do celular */}
                <div
                  className="relative w-[280px] h-[560px] rounded-[3rem] border-8 border-foreground/90 bg-card overflow-hidden"
                  style={{ boxShadow: "var(--shadow-elevated)" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: "var(--gradient-brand)" }}
                  />
                </div>

                {/* Badges flutuantes */}
                <div className="absolute top-8 -left-4 md:-left-8">
                  <FloatingBadge icon="✨" label="IA criativa" />
                </div>
                <div className="absolute bottom-12 -right-4 md:-right-8">
                  <FloatingBadge icon="🚚" label="Entrega rápida" />
                </div>

                {/* Glow abaixo do celular */}
                <div
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-[80px] rounded-full blur-3xl opacity-50 pointer-events-none"
                  style={{ background: "var(--gradient-brand)" }}
                />
              </div>
            </div>
          </section>

          {/* Ticker — abaixo do hero */}
          <Ticker
            items={[
              "Frete rápido pra todo Brasil",
              "Impressão premium",
              "IA criativa",
              "Garantia de qualidade",
              "+10 mil clientes",
            ]}
          />


          {/* How it works — DS v2 */}
          <section id="como-funciona" className="py-20 px-5 bg-background">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-14 space-y-4">
                  <SectionLabel>COMO FUNCIONA</SectionLabel>
                  <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground">
                    Da sua ideia para o{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'var(--gradient-brand)' }}
                    >
                      seu celular
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Sua capinha personalizada sai do zero e chega na sua porta.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScrollReveal>
                  <StepCard
                    step={1}
                    icon={<Upload className="w-6 h-6 text-white" />}
                    title="Envie sua foto"
                    description="Suba a imagem que quiser ou descreva sua ideia. A gente cuida do resto."
                  />
                </ScrollReveal>
                <ScrollReveal delay={150}>
                  <StepCard
                    step={2}
                    icon={<Sparkles className="w-6 h-6 text-white" />}
                    title="IA transforma em arte"
                    description="Nossa IA cria uma capa única no estilo que você escolher. Filtros artísticos com tecnologia real."
                  />
                </ScrollReveal>
                <ScrollReveal delay={300}>
                  <StepCard
                    step={3}
                    icon={<Package className="w-6 h-6 text-white" />}
                    title="Receba em casa"
                    description="Impressão premium e entrega rápida em todo o Brasil. Pix, cartão ou boleto."
                  />
                </ScrollReveal>
              </div>

              <ScrollReveal delay={500}>
                <div className="text-center mt-12">
                  <DsButton
                    variant="brand"
                    size="lg"
                    icon={<Sparkles className="w-5 h-5" />}
                    onClick={() => navigate("/customize")}
                  >
                    Começar agora
                  </DsButton>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Tech & Quality */}
          <TechQualitySection />


          <section id="destaques" className="py-16 px-5 bg-background">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Crie uma capinha única ou encontre a sua favorita na galeria</h2>
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

                {/* Design Cards */}
                {designs.map((design, i) => (
                  <ScrollReveal key={design.id} delay={(i + 1) * 80}>
                    <Card
                      className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      onClick={() => navigate(`/colecao/${design.collection_slug}/${design.slug}`)}
                    >
                      <div className="aspect-square overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={getOptimizedUrl(design.image_url, 320)}
                          alt={design.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          width="300"
                          height="300"
                        />
                      </div>
                      <CardContent className="p-2.5">
                        <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">
                          {design.name}
                        </h3>
                        <span className="inline-block mt-1.5 text-sm font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded-md">
                          {formatPrice(design.price_cents / 100)}
                        </span>
                      </CardContent>
                    </Card>
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
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <AiCoinsSection />
          </Suspense>

          {/* Store Locator */}
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <StoreLocator />
          </Suspense>

          <Suspense fallback={<div className="min-h-[300px]" />}>
            <InstagramShowcase />
          </Suspense>


          {/* Testimonials — DS v2 */}
          <section id="depoimentos" className="py-20 px-5 bg-background">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12 space-y-4">
                  <SectionLabel>DEPOIMENTOS</SectionLabel>
                  <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground">
                    +10 mil clientes{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'var(--gradient-brand)' }}
                    >
                      apaixonados
                    </span>
                  </h2>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { rating: 5, text: 'Ficou idêntica à foto da minha cachorrinha! A qualidade da impressão é absurda.', name: 'Isabela M.', product: 'iPhone 15 Pro' },
                  { rating: 5, text: 'Pedi a do meu time e chegou em 2 dias. As cores são vibrantes, vale cada centavo.', name: 'Rafael S.', product: 'Galaxy S24' },
                  { rating: 5, text: 'A IA criou uma arte minimalista linda. Recebi 3 elogios no primeiro dia!', name: 'Thais R.', product: 'iPhone 14' },
                  { rating: 5, text: 'Comprei o pack família e todo mundo amou. Atendimento via WhatsApp foi top.', name: 'Lucas O.', product: 'Galaxy A36' },
                ].map((t, i) => (
                  <ScrollReveal key={t.name} delay={i * 100}>
                    <TestimonialCard
                      rating={t.rating}
                      text={t.text}
                      name={t.name}
                      product={t.product}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>




          {/* FAQ */}
          <Suspense fallback={<div className="min-h-[300px]" />}>
            <FaqSection />
          </Suspense>

          {/* Final CTA — DS v2 */}
          <section className="relative py-24 px-5 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative max-w-3xl mx-auto text-center space-y-6">
              <SectionLabel>
                <Sparkles className="w-3.5 h-3.5" />
                COMECE AGORA
              </SectionLabel>

              <h2 className="font-display font-black text-4xl md:text-6xl tracking-tight text-white leading-tight">
                Pronto pra criar{' '}
                <span className="italic">a sua?</span>
              </h2>

              <p className="text-lg text-white/85 max-w-xl mx-auto leading-relaxed">
                Em menos de 3 minutos sua arte personalizada está pronta.
                Sem cadastro, sem complicação.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <DsButton
                  variant="default"
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/customize')}
                >
                  Criar minha capa agora
                </DsButton>
                <DsButton
                  variant="outline"
                  size="lg"
                  icon={<Smartphone className="w-5 h-5" />}
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => navigate('/solicitar-modelo')}
                >
                  Solicitar Modelo
                </DsButton>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card py-10 px-5">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <img src="/logo-printmycase-sm.webp" alt="PrintMyCase" className="h-12 w-auto" loading="lazy" width="48" height="48" />
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
                <a href="https://empresas.printmycase.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors w-fit">Empresas</a>
              </nav>
            </div>
            <div className="space-y-3">
              <span className="font-semibold text-foreground">Contato</span>
              <p className="text-muted-foreground leading-relaxed">
                Dúvidas ou sugestões?
              </p>
              <Link to="/contato" className="inline-block text-primary hover:text-primary/80 font-medium transition-colors">
                Fale Conosco
              </Link>
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