import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdjustmentsPanel from "./AdjustmentsPanel";
import AiFiltersList from "./AiFiltersList";
import ProductHighlightsList from "./ProductHighlightsList";
import type { MobileTab } from "./MobileTabBar";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";
import { getOptimizedUrl } from "@/lib/image-utils";

const tabIds: Record<MobileTab, string> = {
  filtros: "customize-mobile-tab-filtros",
  ajustes: "customize-mobile-tab-ajustes",
  info: "customize-mobile-tab-info",
};

const panelIds: Record<MobileTab, string> = {
  filtros: "customize-mobile-panel-filtros",
  ajustes: "customize-mobile-panel-ajustes",
  info: "customize-mobile-panel-info",
};

interface MobileTabOverlayProps {
  activeTab: MobileTab;
  onClose: () => void;
  productName: string;
  productPrice: string;
  productImage: string;
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

const tabTitles: Record<MobileTab, string> = {
  ajustes: "Ajustes",
  info: "Detalhes do produto",
  filtros: "Filtros IA",
};

const MobileTabOverlay = ({
  activeTab, onClose, productName, productPrice, productImage, hasImage,
  scale, rotation, showSafeZone, onScaleChange, onRotate, onExpand, onShowSafeZoneChange,
  filters, filterCategories, activeFilterId, applyingFilterId, filterCost, filterHistory,
  onFilterClick, onCompareStart, onCompareEnd, onRemoveFilter, onUndoLastFilter,
  onPreviewStart, onPreviewEnd,
}: MobileTabOverlayProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [dragDeltaY, setDragDeltaY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [activeTab]);

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
      navigator.vibrate?.(15);
      handleClose();
    } else {
      setDragDeltaY(0);
    }
  }, [isDragging, dragDeltaY, handleClose]);

  const handleFilterClick = (filterId: string) => {
    onFilterClick(filterId);
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity duration-300 motion-reduce:transition-none ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden flex max-h-[46vh] min-h-[32vh] flex-col bg-background rounded-t-xl shadow-lg motion-safe:animate-in motion-safe:slide-in-from-bottom-6 motion-safe:fade-in motion-safe:duration-300 motion-reduce:animate-none ${!isDragging ? "transition-transform duration-300 ease-out motion-reduce:transition-none" : ""} ${isClosing ? "translate-y-full opacity-0" : dragDeltaY === 0 ? "translate-y-0 opacity-100" : ""}`}
        style={{
          marginBottom: "calc(3rem + env(safe-area-inset-bottom))",
          ...(dragDeltaY > 0 && !isClosing ? { transform: `translateY(${dragDeltaY}px)` } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
        role="tabpanel"
        id={panelIds[activeTab]}
        aria-labelledby={tabIds[activeTab]}
        aria-label={tabTitles[activeTab]}
      >
        {/* Handle + Header */}
        <div
          className="flex flex-col items-center border-b border-border/50 pt-1.5 pb-0.5 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mb-1.5 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex w-full items-center justify-between px-3 pb-1">
            <h3 className="text-sm font-semibold text-foreground">{tabTitles[activeTab]}</h3>
            <Button ref={closeButtonRef} variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" onClick={handleClose} aria-label="Fechar painel de detalhes">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-reduce:animate-none">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
                <img
                  src={getOptimizedUrl(productImage, 160)}
                  alt={productName}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 flex-shrink-0 rounded-lg bg-background object-contain"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold leading-tight text-foreground">{productName}</p>
                  <p className="text-sm font-semibold text-primary">{productPrice}</p>
                </div>
              </div>

              <ProductHighlightsList compact className="space-y-2" />
            </div>
          )}

          {activeTab === "ajustes" && (
            <div className={!hasImage ? "opacity-50 pointer-events-none" : ""}>
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
        </div>
      </div>
    </>
  );
};

export default MobileTabOverlay;
