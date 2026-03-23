import { useRef, useCallback } from "react";
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
  onPreviewStart?: (imageUrl: string) => void;
  onPreviewEnd?: () => void;
}

const LONG_PRESS_MS = 300;

const AiFiltersList = ({
  filters, activeFilterId, applyingFilterId, disabled, filterCost,
  onFilterClick, onCompareStart, onCompareEnd, onRemoveFilter,
  onPreviewStart, onPreviewEnd,
}: AiFiltersListProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPreviewing = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const handlePointerDown = useCallback((filter: AiFilter) => {
    if (!filter.style_image_url || !onPreviewStart) return;
    isPreviewing.current = false;
    timerRef.current = setTimeout(() => {
      isPreviewing.current = true;
      onPreviewStart(filter.style_image_url!);
    }, LONG_PRESS_MS);
  }, [onPreviewStart]);

  const handlePointerUp = useCallback((filter: AiFilter) => {
    clearTimer();
    if (isPreviewing.current) {
      isPreviewing.current = false;
      onPreviewEnd?.();
    } else {
      onFilterClick(filter.id);
    }
  }, [clearTimer, onPreviewEnd, onFilterClick]);

  const handlePointerLeave = useCallback(() => {
    clearTimer();
    if (isPreviewing.current) {
      isPreviewing.current = false;
      onPreviewEnd?.();
    }
  }, [clearTimer, onPreviewEnd]);

  return (
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
              className={`relative flex flex-col items-center gap-1 rounded-lg transition-all focus:outline-none disabled:opacity-50 select-none ${
                isActive ? "ring-2 ring-primary ring-offset-1" : ""
              }`}
              onPointerDown={() => handlePointerDown(filter)}
              onPointerUp={() => handlePointerUp(filter)}
              onPointerLeave={handlePointerLeave}
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

      {filters.some(f => f.style_image_url) && !activeFilterId && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Segure p/ prévia
        </p>
      )}
    </div>
  );
};

export default AiFiltersList;
