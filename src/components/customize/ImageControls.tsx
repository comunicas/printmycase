import { SlidersHorizontal, Wand2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdjustmentsPanel from "./AdjustmentsPanel";
import AiFiltersList from "./AiFiltersList";
import type { AiFilter } from "@/lib/customize-types";

interface ImageControlsProps {
  hasImage: boolean;
  scale: number;
  rotation: number;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  onExpand: () => void;
  onUpscale: () => void;
  isHD: boolean;
  upscaleCost: number;
  isUpscaling: boolean;
  filters: AiFilter[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  filterCost: number;
  onFilterClick: (filterId: string) => void;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onRemoveFilter: () => void;
}

const ImageControls = ({
  hasImage, scale, rotation, onScaleChange, onRotate, onExpand, onUpscale,
  isHD, upscaleCost, isUpscaling,
  filters, activeFilterId, applyingFilterId, filterCost, onFilterClick,
  onCompareStart, onCompareEnd, onRemoveFilter,
}: ImageControlsProps) => (
  <div className={`w-full max-w-xs ${!hasImage ? "opacity-50 pointer-events-none" : ""}`}>
    <Tabs defaultValue="ajustes">
      <TabsList className="grid w-full grid-cols-2 h-9">
        <TabsTrigger value="ajustes" className="gap-1.5 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Ajustes
        </TabsTrigger>
        {filters.length > 0 && (
          <TabsTrigger value="filtros" className="gap-1.5 text-xs">
            <Wand2 className="w-3.5 h-3.5" />
            Filtros IA
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="ajustes" className="space-y-3 mt-2">
        <AdjustmentsPanel
          scale={scale}
          rotation={rotation}
          onScaleChange={onScaleChange}
          onRotate={onRotate}
          onExpand={onExpand}
          onUpscale={onUpscale}
          disabled={!hasImage}
          isHD={isHD}
          upscaleCost={upscaleCost}
          isUpscaling={isUpscaling}
        />
      </TabsContent>

      {filters.length > 0 && (
        <TabsContent value="filtros" className="mt-2">
          <AiFiltersList
            filters={filters}
            activeFilterId={activeFilterId}
            applyingFilterId={applyingFilterId}
            disabled={!hasImage}
            filterCost={filterCost}
            onFilterClick={onFilterClick}
            onCompareStart={onCompareStart}
            onCompareEnd={onCompareEnd}
            onRemoveFilter={onRemoveFilter}
          />
        </TabsContent>
      )}
    </Tabs>
  </div>
);

export default ImageControls;
