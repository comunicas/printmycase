import { useRef, useCallback, forwardRef } from "react";
import { Loader2, Eye, X, Wand2, Undo2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";

interface AiFiltersListProps {
  filters: AiFilter[];
  categories: AiFilterCategory[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  disabled: boolean;
  filterCost: number;
  filterHistory: FilterHistoryEntry[];
  onFilterClick: (filterId: string) => void;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onRemoveFilter: () => void;
  onUndoLastFilter: () => void;
  onPreviewStart?: (imageUrl: string) => void;
  onPreviewEnd?: () => void;
  hideHistory?: boolean;
  onUpscale?: () => void;
  isHD?: boolean;
  upscaleCost?: number;
  isUpscaling?: boolean;
}

const LONG_PRESS_MS = 300;

const AiFiltersList = forwardRef<HTMLDivElement, AiFiltersListProps>(({
  filters, categories, activeFilterId, applyingFilterId, disabled, filterCost, filterHistory,
  onFilterClick, onCompareStart, onCompareEnd, onRemoveFilter, onUndoLastFilter,
  onPreviewStart, onPreviewEnd,
  hideHistory, onUpscale, isHD, upscaleCost, isUpscaling,
}, ref) => {
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

  const renderFilterButton = (filter: AiFilter) => {
    const isActive = activeFilterId === filter.id;
    const historyIndex = filterHistory.findIndex(h => h.filterId === filter.id);
    const isInHistory = historyIndex >= 0;
    const isProcessing = applyingFilterId === filter.id;
    return (
      <button
        key={filter.id}
        className={`relative flex flex-col items-center gap-1 rounded-lg transition-all focus:outline-none disabled:opacity-50 select-none ${
          isActive ? "ring-2 ring-primary ring-offset-1" : isInHistory ? "ring-1 ring-primary/40 ring-offset-1" : ""
        }`}
        onPointerDown={() => handlePointerDown(filter)}
        onPointerUp={() => handlePointerUp(filter)}
        onPointerLeave={handlePointerLeave}
        disabled={!!applyingFilterId || disabled}
      >
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
          {filter.style_image_url ? (
            <img src={filter.style_image_url} alt={filter.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-[9px] font-medium px-1.5 py-0.5 rounded-full">
            🪙{filterCost}
          </span>
          {isInHistory && (
            <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {historyIndex + 1}
            </span>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        <span className="text-[10px] text-center leading-tight text-muted-foreground truncate w-full px-0.5">
          {filter.name}
        </span>
      </button>
    );
  };

  // Group filters by category
  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: filters.filter((f) => f.category_id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  const uncategorized = filters.filter((f) => !f.category_id || !categories.some((c) => c.id === f.category_id));

  return (
    <div ref={ref} className="space-y-2">
      {/* Refinar (upscale) button */}
      {onUpscale && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 mb-1"
          onClick={onUpscale}
          disabled={disabled || isHD || isUpscaling}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs">
            {isUpscaling ? "Processando..." : isHD ? "Já em HD" : "Refinar"}
          </span>
          {!isHD && !isUpscaling && upscaleCost != null && (
            <span className="text-[10px] text-muted-foreground">🪙{upscaleCost}</span>
          )}
        </Button>
      )}

      {/* Filter history chips */}
      {!hideHistory && filterHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap scrollbar-hide pb-0.5">
            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
              {filterHistory.length} filtro{filterHistory.length > 1 ? "s" : ""}:
            </span>
            {filterHistory.map((entry, i) => (
              <span key={`${entry.filterId}-${i}`} className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                {i + 1}. {entry.filterName || "Filtro"}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline" size="sm"
              className="h-7 px-2 text-[11px] gap-1"
              onPointerDown={onCompareStart}
              onPointerUp={onCompareEnd}
              onPointerLeave={onCompareEnd}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Comparar</span>
            </Button>
            {filterHistory.length > 1 && (
              <Button
                variant="outline" size="sm"
                className="h-7 px-2 text-[11px] gap-1"
                onClick={onUndoLastFilter}
              >
                <Undo2 className="w-3 h-3" />
                <span className="hidden sm:inline">Desfazer</span>
              </Button>
            )}
            <Button
              variant="outline" size="sm"
              className="h-7 px-2 text-[11px] gap-1 text-destructive hover:text-destructive"
              onClick={onRemoveFilter}
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Remover</span>
            </Button>
          </div>
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <div key={category.id} className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {category.name}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {items.map(renderFilterButton)}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="space-y-1.5">
          {grouped.length > 0 && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Outros
            </p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {uncategorized.map(renderFilterButton)}
          </div>
        </div>
      )}

      {filters.some(f => f.style_image_url) && filterHistory.length === 0 && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Segure p/ prévia
        </p>
      )}
    </div>
  );
});

AiFiltersList.displayName = "AiFiltersList";

export default AiFiltersList;
