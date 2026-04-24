import ScrollReveal from '@/components/ScrollReveal';
import { SectionLabel, FloatingBadge } from '@/components/ds';
import { Check, Zap, ShieldCheck, CreditCard, UserX } from 'lucide-react';

const features = [
  'Impressão UV 1440 dpi com proteção UV',
  'Capa antichoque com cantos reforçados',
  'Garantia de 90 dias contra desbotamento',
  'Frete grátis em pedidos acima de R$ 99',
];

const pills: { icon: React.ReactNode; label: string }[] = [
  { icon: <UserX className="w-3.5 h-3.5" />, label: 'Sem cadastro' },
  { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Pix em 1 clique' },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Proteção militar' },
];

export default function TechQualitySection() {
  return (
    <section className="py-20 px-5 bg-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Painel esquerdo — visual */}
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
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-32 h-32 text-white/80" strokeWidth={1.2} />
              </div>
            </div>

            <div className="absolute top-6 -left-4 md:-left-6">
              <FloatingBadge icon="⚡" label="Pronta em 3 min" />
            </div>
            <div className="absolute bottom-6 -right-4 md:-right-6">
              <FloatingBadge icon="🛡️" label="90 dias de garantia" />
            </div>
          </div>
        </ScrollReveal>

        {/* Painel direito — conteúdo */}
        <ScrollReveal delay={150}>
          <div className="space-y-6">
            <SectionLabel>TECNOLOGIA PRÓPRIA</SectionLabel>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-foreground leading-tight">
              Impressão na hora,{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                qualidade premium.
              </span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Máquinas próprias com tinta UV de alta resolução. Sua capa sai pronta
              em até 3 minutos, com cores vibrantes que não desbotam.
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
