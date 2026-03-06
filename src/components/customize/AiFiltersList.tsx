import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiFilter } from "@/lib/customize-types";

interface AiFiltersListProps {
  filters: AiFilter[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  disabled: boolean;
  onFilterClick: (filterId: string) => void;
}

const AiFiltersList = ({ filters, activeFilterId, applyingFilterId, disabled, onFilterClick }: AiFiltersListProps) => (
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
);

export default AiFiltersList;
