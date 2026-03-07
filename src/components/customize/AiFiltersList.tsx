import { Loader2, Eye, X } from "lucide-react";
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
    <p className="text-xs text-muted-foreground">Cada filtro consome 🪙 {filterCost} moedas</p>

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

    <div className="flex flex-wrap gap-2 pb-1 -mb-1">
      {filters.map((filter) => {
        const isActive = activeFilterId === filter.id;
        const isProcessing = applyingFilterId === filter.id;
        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="h-8 px-3 text-xs gap-1.5 flex-shrink-0"
            onClick={() => onFilterClick(filter.id)}
            disabled={!!applyingFilterId || disabled}
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : filter.style_image_url ? (
              <img src={filter.style_image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : null}
            {filter.name}
          </Button>
        );
      })}
    </div>
  </div>
);

export default AiFiltersList;
