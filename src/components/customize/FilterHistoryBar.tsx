import { Eye, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterHistoryEntry } from "@/lib/customize-types";

interface FilterHistoryBarProps {
  filterHistory: FilterHistoryEntry[];
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onUndoLastFilter: () => void;
  onRemoveFilter: () => void;
}

const FilterHistoryBar = ({
  filterHistory,
  onCompareStart,
  onCompareEnd,
  onUndoLastFilter,
  onRemoveFilter,
}: FilterHistoryBarProps) => {
  if (filterHistory.length === 0) return null;

  return (
    <div className="px-3 py-2 bg-background border-t border-border space-y-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap scrollbar-hide">
        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
          {filterHistory.length} filtro{filterHistory.length > 1 ? "s" : ""}:
        </span>
        {filterHistory.map((entry, i) => (
          <span
            key={`${entry.filterId}-${i}`}
            className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          >
            {i + 1}. {entry.filterName || "Filtro"}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] gap-1"
          onPointerDown={onCompareStart}
          onPointerUp={onCompareEnd}
          onPointerLeave={onCompareEnd}
        >
          <Eye className="w-3 h-3" />
          Comparar
        </Button>
        {filterHistory.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px] gap-1"
            onClick={onUndoLastFilter}
          >
            <Undo2 className="w-3 h-3" />
            Desfazer
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] gap-1 text-destructive hover:text-destructive"
          onClick={onRemoveFilter}
        >
          <X className="w-3 h-3" />
          Remover
        </Button>
      </div>
    </div>
  );
};

export default FilterHistoryBar;
