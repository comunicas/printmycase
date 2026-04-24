import { cn } from '@/lib/utils';

interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export default function StepCard({ step, icon, title, description, className }: StepCardProps) {
  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span
        className="absolute top-5 right-5 font-display font-black text-6xl leading-none pointer-events-none select-none"
        style={{ color: 'hsl(var(--primary) / 0.08)' }}
      >
        {String(step).padStart(2, '0')}
      </span>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg mt-4 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-[240px]">
        {description}
      </p>
    </div>
  );
}
