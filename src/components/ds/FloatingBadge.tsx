import { cn } from '@/lib/utils';

interface FloatingBadgeProps {
  icon: string;
  label: string;
  className?: string;
}

export default function FloatingBadge({ icon, label, className }: FloatingBadgeProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-full',
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground whitespace-nowrap',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
