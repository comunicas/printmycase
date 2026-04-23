import { cn } from "@/lib/utils";
import { productHighlights } from "@/components/customize/productHighlights";

type ProductHighlightsListProps = {
  compact?: boolean;
  className?: string;
};

const ProductHighlightsList = ({ compact = false, className }: ProductHighlightsListProps) => {
  return (
    <ul className={cn(compact ? "space-y-1.5" : "space-y-2", className)}>
      {productHighlights.map(({ icon: Icon, title, description }) => (
        <li key={title} className={cn("flex items-start", compact ? "gap-1.5" : "gap-2")}>
          <span
            className={cn(
              "mt-0.5 flex flex-shrink-0 items-center justify-center rounded-sm bg-muted/45 text-muted-foreground",
              compact ? "h-4 w-4" : "h-5 w-5",
            )}
          >
            <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </span>
          <div
            className={cn(
              "min-w-0 text-muted-foreground",
              compact ? "max-w-none text-[11px] leading-[1.25]" : "max-w-[220px] text-[12px] leading-[1.3]",
            )}
          >
            <span className="font-normal text-foreground/90">{title}</span>
            <span>{" — "}{description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductHighlightsList;