import { SlidersHorizontal, Wand2, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdjustmentsPanel from "./AdjustmentsPanel";
import AiFiltersList from "./AiFiltersList";
import GalleryTab from "./GalleryTab";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";

interface ImageControlsProps {
  hasImage: boolean;
  scale: number;
  rotation: number;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  onExpand: () => void;
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
  onGallerySelect: (imageUrl: string) => void;
  isProcessing?: boolean;
}

const ImageControls = ({
  hasImage, scale, rotation, onScaleChange, onRotate, onExpand,
  filters, filterCategories, activeFilterId, applyingFilterId, filterCost, filterHistory, onFilterClick,
  onCompareStart, onCompareEnd, onRemoveFilter, onUndoLastFilter,
  onPreviewStart, onPreviewEnd,
  onGallerySelect, isProcessing,
}: ImageControlsProps) => {
  const hasFilters = filters.length > 0;
  const colsClass = hasFilters ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none">
      <Tabs defaultValue="ajustes">
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
          <TabsTrigger value="galeria" className="gap-1.5 text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Galeria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ajustes" className={`space-y-3 mt-2 ${!hasImage ? "opacity-50 pointer-events-none" : ""}`}>
          <AdjustmentsPanel
            scale={scale}
            rotation={rotation}
            onScaleChange={onScaleChange}
            onRotate={onRotate}
            onExpand={onExpand}
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

        <TabsContent value="galeria" className="mt-2 max-h-[30vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          <GalleryTab onSelect={onGallerySelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageControls;
