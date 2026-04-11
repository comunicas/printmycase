import { useEffect, useState, useCallback, useRef } from "react";
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
  const [isClosing, setIsClosing] = useState(false);
  const [dragDeltaY, setDragDeltaY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setDragDeltaY(0);
    setTimeout(onClose, 300);
  }, [isClosing, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - startYRef.current;
    setDragDeltaY(Math.max(0, delta));
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDeltaY > 80) {
      handleClose();
    } else {
      setDragDeltaY(0);
    }
  }, [isDragging, dragDeltaY, handleClose]);

  const handleGallerySelect = (url: string) => {
    onGallerySelect(url);
    handleClose();
  };

  const handleFilterClick = (filterId: string) => {
    onFilterClick(filterId);
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden h-[60vh] bg-background rounded-t-2xl shadow-lg ${!isDragging ? "transition-transform duration-300 ease-out" : ""} ${isClosing ? "translate-y-full" : dragDeltaY === 0 ? "translate-y-0" : ""}`}
        style={{
          marginBottom: "calc(3rem + 3.5rem)",
          ...(dragDeltaY > 0 && !isClosing ? { transform: `translateY(${dragDeltaY}px)` } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div
          className="flex flex-col items-center pt-2 pb-1 border-b border-border/50 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
          <div className="flex items-center justify-between w-full px-4 pb-1">
            <h3 className="text-sm font-semibold text-foreground">{tabTitles[activeTab]}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 py-4" style={{ height: "calc(100% - 3.5rem)" }}>
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
                hideMobileControls
                onFilterClick={handleFilterClick}
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
    </>
  );
};

export default MobileTabOverlay;
