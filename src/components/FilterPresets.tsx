import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Filter {
  id: string;
  name: string;
  cssFilter: string;
}

const filters: Filter[] = [
  { id: "original", name: "Original", cssFilter: "" },
  { id: "vivid", name: "Vibrante", cssFilter: "brightness(1.1) contrast(1.2) saturate(1.3)" },
  { id: "noir", name: "P&B", cssFilter: "brightness(0.9) contrast(1.3) grayscale(1)" },
  { id: "warm", name: "Quente", cssFilter: "brightness(1.05) sepia(0.3) saturate(1.1)" },
  { id: "cool", name: "Frio", cssFilter: "brightness(1.05) hue-rotate(15deg) saturate(0.9)" },
  { id: "retro", name: "Retrô", cssFilter: "sepia(0.4) contrast(1.1) brightness(0.95) saturate(0.8)" },
  { id: "soft", name: "Suave", cssFilter: "brightness(1.1) contrast(0.9) saturate(0.85)" },
  { id: "dramatic", name: "Dramático", cssFilter: "contrast(1.4) brightness(0.85) saturate(1.2)" },
  { id: "pastel", name: "Pastel", cssFilter: "brightness(1.15) saturate(0.6) contrast(0.95)" },
];

interface FilterPresetsProps {
  image: string | null;
  activeFilter: string | null;
  onSelectFilter: (filterId: string | null) => void;
  disabled?: boolean;
}

const FilterPresets = ({ image, activeFilter, onSelectFilter, disabled }: FilterPresetsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el?.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  const handleSelect = (filterId: string) => {
    if (filterId === "original") {
      onSelectFilter(null);
    } else {
      onSelectFilter(activeFilter === filterId ? null : filterId);
    }
  };

  const isOriginalActive = activeFilter === null;

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filtros</span>
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filters.map((filter) => {
            const isActive = filter.id === "original" ? isOriginalActive : activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleSelect(filter.id)}
                className={`relative flex-shrink-0 w-[68px] rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${
                  isActive
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className="absolute inset-0 bg-muted"
                  style={
                    image
                      ? {
                          backgroundImage: `url(${image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: filter.cssFilter || undefined,
                        }
                      : { filter: filter.cssFilter || undefined }
                  }
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-1 pt-3">
                  <span className="text-[9px] font-semibold text-background block leading-tight text-center">
                    {filter.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterPresets;
export { filters };
export type { Filter };
