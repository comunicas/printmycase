import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'rounded-full bg-primary/10 text-primary border border-primary/20',
        'text-xs font-semibold tracking-widest uppercase px-3 py-1',
        'inline-flex items-center gap-1.5',
        className,
      )}
    >
      {children}
    </span>
  );
}
