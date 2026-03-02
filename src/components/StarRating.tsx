import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  starSize?: string;
  showText?: boolean;
}

const StarRating = ({ rating, reviewCount, starSize = "w-3 h-3", showText = false }: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalf
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)}{reviewCount != null && ` (${reviewCount} avaliações)`}
        </span>
      )}
      {!showText && reviewCount != null && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;
