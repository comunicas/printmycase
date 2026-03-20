import { Loader2, Eye, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiFilter } from "@/lib/customize-types";

interface AiFiltersListProps {
  filters: AiFilter[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  disabled: boolean;
  filterCost: number;
  onFilterClick: (filterId: string) => void;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onRemoveFilter: () => void;
}

const AiFiltersList = ({
  filters, activeFilterId, applyingFilterId, disabled, filterCost,
  onFilterClick, onCompareStart, onCompareEnd, onRemoveFilter,
}: AiFiltersListProps) => (
  <div className="space-y-2">
    {activeFilterId && (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5"
          onPointerDown={onCompareStart}
          onPointerUp={onCompareEnd}
          onPointerLeave={onCompareEnd}
        >
          <Eye className="w-3.5 h-3.5" />
          Segurar p/ comparar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 text-destructive hover:text-destructive"
          onClick={onRemoveFilter}
        >
          <X className="w-3.5 h-3.5" />
          Remover filtro
        </Button>
      </div>
    )}

    <div className="grid grid-cols-3 gap-2">
      {filters.map((filter) => {
        const isActive = activeFilterId === filter.id;
        const isProcessing = applyingFilterId === filter.id;
        return (
          <button
            key={filter.id}
            className={`relative flex flex-col items-center gap-1 rounded-lg transition-all focus:outline-none disabled:opacity-50 ${
              isActive ? "ring-2 ring-primary ring-offset-1" : ""
            }`}
            onClick={() => onFilterClick(filter.id)}
            disabled={!!applyingFilterId || disabled}
          >
            {/* Thumbnail */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
              {filter.style_image_url ? (
                <img
                  src={filter.style_image_url}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-muted-foreground" />
                </div>
              )}

              {/* Cost badge */}
              <span className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                🪙{filterCost}
              </span>

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Label */}
            <span className="text-[10px] text-center leading-tight text-muted-foreground truncate w-full px-0.5">
              {filter.name}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default AiFiltersList;
