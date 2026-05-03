import { SlidersHorizontal, Wand2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdjustmentsPanel from "./AdjustmentsPanel";
import AiFiltersList from "./AiFiltersList";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";

interface ImageControlsProps {
  hasImage: boolean;
  scale: number;
  rotation: number;
  showSafeZone: boolean;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  onExpand: () => void;
  onShowSafeZoneChange: (checked: boolean) => void;
  filters: AiFilter[];
  filterCategories: AiFilterCategory[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  filterCost: number;
  filterHistory: FilterHistoryEntry[];
  onFilterClick: (filterId: string) => void;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onRemoveFilter: () => void;
  onUndoLastFilter: () => void;
  onPreviewStart?: (imageUrl: string) => void;
  onPreviewEnd?: () => void;
}

const ImageControls = ({
  hasImage, scale, rotation, showSafeZone, onScaleChange, onRotate, onExpand, onShowSafeZoneChange,
  filters, filterCategories, activeFilterId, applyingFilterId, filterCost, filterHistory, onFilterClick,
  onCompareStart, onCompareEnd, onRemoveFilter, onUndoLastFilter,
  onPreviewStart, onPreviewEnd,
}: ImageControlsProps) => {
  const hasFilters = filters.length > 0;
  const colsClass = hasFilters ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none">
      <Tabs defaultValue="filtros">
        <TabsList className={`grid w-full h-9 ${colsClass}`}>
          <TabsTrigger value="ajustes" className="gap-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Ajustes
          </TabsTrigger>
          {hasFilters && (
            <TabsTrigger value="filtros" className="gap-1.5 text-xs">
              <Wand2 className="w-3.5 h-3.5" />
              Filtros IA
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ajustes" className={`space-y-3 mt-2 ${!hasImage ? "opacity-50 pointer-events-none" : ""}`}>
          <AdjustmentsPanel
            scale={scale}
            rotation={rotation}
            showSafeZone={showSafeZone}
            onScaleChange={onScaleChange}
            onRotate={onRotate}
            onExpand={onExpand}
            onShowSafeZoneChange={onShowSafeZoneChange}
            disabled={!hasImage}
          />
        </TabsContent>

        {hasFilters && (
          <TabsContent value="filtros" className={`mt-2 max-h-[30vh] overflow-y-auto lg:max-h-none lg:overflow-visible ${!hasImage ? "opacity-50 pointer-events-none" : ""}`}>
            <AiFiltersList
              filters={filters}
              categories={filterCategories}
              activeFilterId={activeFilterId}
              applyingFilterId={applyingFilterId}
              disabled={!hasImage}
              filterCost={filterCost}
              filterHistory={filterHistory}
              onFilterClick={onFilterClick}
              onCompareStart={onCompareStart}
              onCompareEnd={onCompareEnd}
              onRemoveFilter={onRemoveFilter}
              onUndoLastFilter={onUndoLastFilter}
              onPreviewStart={onPreviewStart}
              onPreviewEnd={onPreviewEnd}
            />
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
};

export default ImageControls;
