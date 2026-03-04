import { useNavigate, Link } from "react-router-dom";
import {
  Palette, Shield, Truck, Smartphone, Upload, Package, Star, ArrowRight, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import SeoHead from "@/components/SeoHead";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/ui/loading-spinner";

const testimonials = [
  { name: "Ana C.", text: "Melhor capa que já tive! A qualidade é incrível e a personalização ficou perfeita.", rating: 5 },
  { name: "Lucas M.", text: "Surpreendeu demais. O acabamento soft-touch é muito premium. Já pedi a segunda!", rating: 5 },
  { name: "Beatriz R.", text: "Enviei minha foto e ficou exatamente como imaginei. Frete rápido e embalagem top.", rating: 5 },
];

const benefits = [
  { icon: Palette, title: "100% Personalizada", desc: "Use suas fotos, artes e designs favoritos. Cada capa é única como você." },
  { icon: Shield, title: "Proteção Premium", desc: "Policarbonato rígido + TPU flexível. Protege contra quedas de até 1,5m." },
  { icon: Truck, title: "Envio Rápido", desc: "Frete acessível para a região Sudeste. Produção em até 48h e entrega ágil." },
];

const steps = [
  { icon: Smartphone, title: "Escolha seu modelo", desc: "Selecione o modelo do seu celular" },
  { icon: Upload, title: "Envie sua imagem", desc: "Faça upload da sua foto ou design" },
  { icon: Package, title: "Receba em casa", desc: "Produção em 48h e envio rápido" },
];

const Landing = () => {
  const navigate = useNavigate();
  const { products: featuredProducts, loading } = useProducts(4);

  return (
    <>
      <SeoHead />
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />

        <main>
          {/* Hero */}
          <section className="py-20 md:py-28 px-5">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                Sua capa, sua identidade.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Transforme suas fotos favoritas em capas de celular únicas. Proteção premium com acabamento soft-touch e design 100% seu.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button size="lg" className="gap-2 text-base" onClick={() => navigate("/catalog")}>
                  Criar Minha Capa <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base" onClick={() => navigate("/catalog")}>
                  Ver Modelos
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">Mais de 1.000 capas criadas</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Benefits */}
          <section id="beneficios" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
                Por que escolher a ArtisCase?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((b) => (
                  <Card key={b.title} className="text-center border-0 shadow-none bg-muted/40">
                    <CardContent className="pt-8 pb-6 px-6 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <b.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* How it works */}
          <section id="como-funciona" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Como funciona</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex flex-col items-center text-center space-y-3">
                    <div className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-primary-foreground" />
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* Featured Products */}
          <section id="destaques" className="py-16 px-5">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Modelos em Destaque</h2>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
              <div className="text-center mt-8">
                <Button variant="outline" className="gap-2" onClick={() => navigate("/catalog")}>
                  Ver Catálogo Completo <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>

          <Separator />

          {/* Testimonials */}
          <section id="depoimentos" className="py-16 px-5 bg-muted/30">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">O que nossos clientes dizem</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <Card key={t.name} className="border-0 shadow-sm">
                    <CardContent className="pt-6 pb-5 px-6 space-y-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-foreground italic">"{t.text}"</p>
                      <p className="text-sm font-semibold text-muted-foreground">{t.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 px-5 bg-primary text-primary-foreground">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pronto para criar sua capa única?</h2>
              <p className="text-lg opacity-90">Escolha seu modelo, envie sua foto e receba uma capa exclusiva na sua porta.</p>
              <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold" onClick={() => navigate("/catalog")}>
                Comece Agora <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card py-8 px-5">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">ArtisCase</span>
            <nav className="flex items-center gap-4">
              <Link to="/catalog" className="hover:text-foreground transition-colors">Catálogo</Link>
            </nav>
            <span>© 2026 ArtisCase</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
