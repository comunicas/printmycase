import { cn } from '@/lib/utils';

type DsBadgeVariant = 'brand' | 'discount' | 'new' | 'top' | 'outline' | 'muted';

interface DsBadgeProps {
  variant?: DsBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<DsBadgeVariant, string> = {
  brand: 'bg-primary/10 text-primary border border-primary/20',
  discount: 'bg-red-500 text-white',
  new: 'bg-primary text-primary-foreground',
  top: 'bg-orange-500 text-white',
  outline: 'border border-border text-foreground bg-transparent',
  muted: 'bg-muted text-muted-foreground',
};

export default function DsBadge({ variant = 'brand', children, className }: DsBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full text-xs font-semibold px-2.5 py-0.5 inline-flex items-center',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
