import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdjustmentsPanel from "./AdjustmentsPanel";
import AiFiltersList from "./AiFiltersList";
import GalleryTab from "./GalleryTab";
import type { MobileTab } from "./MobileTabBar";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";

interface MobileTabOverlayProps {
  activeTab: MobileTab;
  onClose: () => void;
  hasImage: boolean;
  // Adjustments
  scale: number;
  rotation: number;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  onExpand: () => void;
  onUpscale: () => void;
  isHD: boolean;
  upscaleCost: number;
  isUpscaling: boolean;
  // Filters
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
  // Gallery
  onGallerySelect: (imageUrl: string) => void;
}

const tabTitles: Record<MobileTab, string> = {
  ajustes: "Ajustes",
  filtros: "Filtros IA",
  galeria: "Galeria",
};

const MobileTabOverlay = ({
  activeTab, onClose, hasImage,
  scale, rotation, onScaleChange, onRotate, onExpand, onUpscale,
  isHD, upscaleCost, isUpscaling,
  filters, filterCategories, activeFilterId, applyingFilterId, filterCost, filterHistory,
  onFilterClick, onCompareStart, onCompareEnd, onRemoveFilter, onUndoLastFilter,
  onPreviewStart, onPreviewEnd,
  onGallerySelect,
}: MobileTabOverlayProps) => {
  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleGallerySelect = (url: string) => {
    onGallerySelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
      <div
        className="relative flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">{tabTitles[activeTab]}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeTab === "ajustes" && (
            <div className={!hasImage ? "opacity-50 pointer-events-none" : ""}>
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
            </div>
          )}

          {activeTab === "filtros" && (
            <div className={!hasImage ? "opacity-50 pointer-events-none" : ""}>
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
            </div>
          )}

          {activeTab === "galeria" && (
            <GalleryTab onSelect={handleGallerySelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileTabOverlay;
