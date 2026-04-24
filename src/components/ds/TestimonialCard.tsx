import StarRating from '@/components/StarRating';

interface TestimonialCardProps {
  rating: number;
  text: string;
  name: string;
  product: string;
}

export default function TestimonialCard({ rating, text, name, product }: TestimonialCardProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col transition-transform duration-300 hover:-translate-y-1"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <StarRating rating={rating} starSize="w-4 h-4" />
      <p className="text-sm text-foreground leading-relaxed mt-3 italic flex-1">
        {`"${text}"`}
      </p>
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">{name}</span>
          <span className="text-xs text-muted-foreground">{product}</span>
        </div>
      </div>
    </div>
  );
}
