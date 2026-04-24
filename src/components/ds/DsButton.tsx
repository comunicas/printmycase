import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type DsButtonVariant = 'brand' | 'default' | 'outline' | 'ghost';
type DsButtonSize = 'sm' | 'md' | 'lg';

interface DsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DsButtonVariant;
  size?: DsButtonSize;
  icon?: React.ReactNode;
  arrow?: boolean;
  href?: string;
}

const VARIANT_CLASSES: Record<DsButtonVariant, string> = {
  brand: 'text-white hover:opacity-90',
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border-2 border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background',
  ghost: 'text-primary bg-transparent hover:bg-primary/10',
};

const SIZE_CLASSES: Record<DsButtonSize, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
};

export default function DsButton({
  variant = 'default',
  size = 'md',
  icon,
  arrow,
  href,
  children,
  className,
  ...rest
}: DsButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

  const brandStyle =
    variant === 'brand'
      ? { background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-elevated)' }
      : undefined;

  const content = (
    <>
      {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {children}
      {arrow && ' →'}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={classes} style={brandStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} style={brandStyle} {...rest}>
      {content}
    </button>
  );
}
