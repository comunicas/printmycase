import { lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Smartphone, Upload, Package, Sparkles } from "lucide-react";
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
              "iPhone 17 Pro",
              "iPhone 16 Pro",
              "iPhone 16",
              "iPhone 15 Pro",
              "Galaxy S25",
              "Galaxy S24",
              "Galaxy A56",
              "Motorola Edge 50",
              "Xiaomi 14",
              "Pixel 9 Pro",
              "Redmi Note 14",
              "Moto G85",
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


          {/* IA em Ação */}
          <section id="ia-em-acao" className="py-20 px-5 bg-background">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12 space-y-4">
                  <SectionLabel>
                    <Sparkles className="w-3.5 h-3.5" />
                    IA EM AÇÃO
                  </SectionLabel>
                  <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground">
                    Sua foto vira{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'var(--gradient-brand)' }}
                    >
                      arte única
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Nossa IA transforma suas fotos em estilos incríveis — cartoon, pixel art,
                    3D e muito mais. Veja o que nossos clientes já criaram.
                  </p>
                </div>
              </ScrollReveal>

              <Suspense fallback={<div className="min-h-[200px]" />}>
                <AiCoinsSection />
              </Suspense>

              <ScrollReveal delay={200}>
                <div className="text-center mt-12">
                  <DsButton
                    variant="brand"
                    size="lg"
                    icon={<Sparkles className="w-5 h-5" />}
                    onClick={() => navigate('/customize')}
                  >
                    Criar com IA agora
                  </DsButton>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Coleções em Destaque */}
          <section id="destaques" className="py-20 px-5 bg-background">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12 space-y-4">
                  <SectionLabel>COLEÇÕES</SectionLabel>
                  <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground">
                    Ou escolha um{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'var(--gradient-brand)' }}
                    >
                      design pronto
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Capinhas com designs exclusivos, prontas para pedir. Escolha a sua favorita.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {designs.map((design, i) => (
                  <ScrollReveal key={design.id} delay={i * 80}>
                    <div
                      className="group cursor-pointer overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                          {design.name}
                        </h3>
                        <span className="inline-block mt-1.5 text-sm font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded-md">
                          {formatPrice(design.price_cents / 100)}
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal delay={350}>
                <div className="text-center mt-12">
                  <DsButton variant="outline" size="lg" href="/colecoes">
                    Ver Todas as Coleções
                  </DsButton>
                </div>
              </ScrollReveal>
            </div>
          </section>



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
              <span className="font-display font-bold text-foreground">Links Úteis</span>
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
              <span className="font-display font-bold text-foreground">Contato</span>
              <p className="text-muted-foreground leading-relaxed">
                Dúvidas ou sugestões?
              </p>
              <a
                href="https://instagram.com/printmycasebr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors w-fit text-sm"
              >
                📸 @printmycasebr
              </a>
              <Link to="/contato" className="inline-block text-primary hover:text-primary/80 font-medium transition-colors">
                Fale Conosco
              </Link>
            </div>
          </div>

          <Separator className="my-6" />
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Pagamento 100% seguro
            </p>
            <PaymentBadges />
          </div>
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