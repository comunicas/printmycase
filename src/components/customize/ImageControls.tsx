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
  filters: AiFilter[];
  activeFilterId: string | null;
  applyingFilterId: string | null;
  onFilterClick: (filterId: string) => void;
}

const ImageControls = ({
  hasImage, scale, rotation, onScaleChange, onRotate,
  filters, activeFilterId, applyingFilterId, onFilterClick,
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

      <TabsContent value="ajustes" className="space-y-3 mt-3">
        <AdjustmentsPanel
          scale={scale}
          rotation={rotation}
          onScaleChange={onScaleChange}
          onRotate={onRotate}
          disabled={!hasImage}
        />
      </TabsContent>

      {filters.length > 0 && (
        <TabsContent value="filtros" className="mt-3">
          <AiFiltersList
            filters={filters}
            activeFilterId={activeFilterId}
            applyingFilterId={applyingFilterId}
            disabled={!hasImage}
            onFilterClick={onFilterClick}
          />
        </TabsContent>
      )}
    </Tabs>
  </div>
);

export default ImageControls;
