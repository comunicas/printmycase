import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface Filter {
  id: string;
  name: string;
  cssFilter: string;
}

const filters: Filter[] = [
  { id: "vivid", name: "Vivid", cssFilter: "brightness(1.1) contrast(1.2) saturate(1.3)" },
  { id: "noir", name: "Noir", cssFilter: "brightness(0.9) contrast(1.3) grayscale(1)" },
  { id: "warm", name: "Warm", cssFilter: "brightness(1.05) sepia(0.3) saturate(1.1)" },
  { id: "cool", name: "Cool", cssFilter: "brightness(1.05) hue-rotate(15deg) saturate(0.9)" },
];

interface FilterPresetsProps {
  image: string | null;
  activeFilter: string | null;
  onSelectFilter: (filterId: string | null) => void;
}

const FilterPresets = ({ image, activeFilter, onSelectFilter }: FilterPresetsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">AI Filters</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(isActive ? null : filter.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] group ${
                isActive
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* Thumbnail */}
              <div
                className="absolute inset-0 bg-muted"
                style={
                  image
                    ? {
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: filter.cssFilter,
                      }
                    : { filter: filter.cssFilter }
                }
              />
              {/* Label overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-1.5 pt-4">
                <span className="text-[10px] font-semibold text-background block leading-tight">
                  {filter.name}
                </span>
              </div>
              {/* AI badge */}
              <Badge className="absolute top-1 right-1 px-1 py-0 text-[8px] h-4 bg-primary/90 hover:bg-primary/90">
                AI
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPresets;
export { filters };
export type { Filter };
