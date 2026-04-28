import ScrollReveal from '@/components/ScrollReveal';
import { SectionLabel, FloatingBadge } from '@/components/ds';
import { Check, ShieldCheck, CreditCard, UserX } from 'lucide-react';

const features = [
  'Impressão UV 1440 dpi com proteção UV',
  'Capa antichoque com cantos reforçados',
  'Garantia de 90 dias contra desbotamento',
  'Frete grátis em pedidos acima de R$ 99',
];

const pills: { icon: React.ReactNode; label: string }[] = [
  { icon: <UserX className="w-3.5 h-3.5" />, label: 'Sem cadastro' },
  { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Cartão em 1 clique' },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Proteção militar' },
];

export default function TechQualitySection() {
  return (
    <section id="impressao" className="py-20 px-5 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Painel esquerdo — imagem da capinha física */}
        <ScrollReveal>
          <div className="relative">
            <div
              className="aspect-square rounded-3xl border border-border overflow-hidden relative"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="absolute inset-0 flex items-end justify-center p-6">
                <img
                  src="/images/tech-quality-case-new.webp"
                  alt="Capinha personalizada amarela com logo CIMED segurada na mão, impressa em alta qualidade"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  loading="lazy"
                  decoding="async"
                  width="1024"
                  height="1024"
                />
              </div>
            </div>

            <div className="absolute bottom-6 -right-4 md:-right-6">
              <FloatingBadge icon="🛡️" label="90 dias de garantia" />
            </div>
          </div>
        </ScrollReveal>

        {/* Painel direito — conteúdo */}
        <ScrollReveal delay={150}>
          <div className="space-y-6">
            <SectionLabel>IMPRESSÃO PREMIUM</SectionLabel>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground leading-tight">
              Transforme momentos em,{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                uma capa exclusiva.
              </span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Impressão UV de alta definição com acabamento vibrante e resistente.
              Personalize do seu jeito e receba uma capa feita para durar.
            </p>

            <ul className="space-y-3">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <span
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 pt-2">
              {pills.map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {icon}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
