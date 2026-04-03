import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PhonePreview from "@/components/PhonePreview";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import ImageControls from "@/components/customize/ImageControls";
import ContinueBar from "@/components/customize/ContinueBar";
import FilterConfirmDialog from "@/components/customize/FilterConfirmDialog";
import UpscaleConfirmDialog from "@/components/customize/UpscaleConfirmDialog";
import LoginDialog from "@/components/customize/LoginDialog";
import TermsDialog from "@/components/customize/TermsDialog";
import GalleryPicker from "@/components/customize/GalleryPicker";
import { useCustomize } from "@/hooks/useCustomize.tsx";
import IntroDialog from "@/components/customize/IntroDialog";
import UploadSpotlight from "@/components/customize/UploadSpotlight";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const c = useCustomize(id);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem("customize_intro_seen"));
  const [showUploadSpotlight, setShowUploadSpotlight] = useState(() => !localStorage.getItem("customize_upload_seen"));
  const spotlightInputRef = useRef<HTMLInputElement>(null);

  const dismissSpotlight = useCallback(() => {
    setShowUploadSpotlight(false);
    localStorage.setItem("customize_upload_seen", "1");
  }, []);

  const handleSpotlightUpload = useCallback(() => {
    spotlightInputRef.current?.click();
  }, []);

  const handleSpotlightFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      c.handleImageUpload(file);
      dismissSpotlight();
    }
    e.target.value = "";
  }, [c.handleImageUpload, dismissSpotlight]);

  const handleSpotlightGallery = useCallback(() => {
    dismissSpotlight();
    setShowGalleryPicker(true);
  }, [dismissSpotlight]);

  if (c.productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden">
      <CustomizeHeader
        productName={c.productName}
        onBack={() => navigate("/customize")}
        productImage={c.product?.images?.[0] || c.product?.device_image}
        draftSaved={c.draftSaved}
        currentSlug={c.product?.slug}
        onShowIntro={() => setShowIntro(true)}
      />

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0 px-4 lg:px-0 overflow-hidden">
        {/* Preview — left side on desktop */}
        <div className="flex items-center justify-center lg:flex-1 lg:h-full">
          <PhonePreview
            image={c.image}
            scale={c.scale}
            position={c.position}
            rotation={c.rotation}
            onPositionChange={c.setPosition}
            onScaleChange={c.setScale}
            onImageUpload={c.handleImageUpload}
            imageResolution={c.imageResolution}
            isProcessing={c.isProcessing}
            processingMessage={c.processingMsg || undefined}
            onUpscaleClick={!c.isHD && c.image ? c.handleUpscaleClick : undefined}
            previewImageUrl={previewImageUrl}
            onGalleryClick={() => setShowGalleryPicker(true)}
          />
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden w-full flex justify-center max-h-[35vh] overflow-y-auto">
          <ImageControls
            hasImage={!!c.image}
            scale={c.scale}
            rotation={c.rotation}
            onScaleChange={c.setScale}
            onRotate={c.handleRotate}
            onExpand={c.handleExpand}
            onUpscale={c.handleUpscaleClick}
            isHD={c.isHD}
            upscaleCost={c.aiUpscaleCost}
            isUpscaling={c.isUpscaling}
            filters={c.filters}
            filterCategories={c.filterCategories}
            activeFilterId={c.activeFilterId}
            applyingFilterId={c.applyingFilterId}
            filterCost={c.aiFilterCost}
            filterHistory={c.filterHistory}
            onFilterClick={c.handleFilterClick}
            onCompareStart={c.handleCompareStart}
            onCompareEnd={c.handleCompareEnd}
            onRemoveFilter={c.handleRemoveFilter}
            onUndoLastFilter={c.handleUndoLastFilter}
            onPreviewStart={setPreviewImageUrl}
            onPreviewEnd={() => setPreviewImageUrl(null)}
            onGallerySelect={c.handleGalleryImageSelect}
          />
        </div>

        {/* Desktop sidebar — right side */}
        <aside className="hidden lg:flex flex-col gap-4 lg:w-[420px] lg:flex-shrink-0 h-full px-8 py-6 overflow-y-auto bg-muted/40 border-l border-border">
          {/* Product summary */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <img
              src={c.product?.device_image || c.product?.images?.[0] || "/placeholder.svg"}
              alt={c.productName}
              className="w-16 h-16 object-contain rounded-lg bg-background"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{c.productName}</p>
              <p className="text-sm text-primary font-medium">
                {c.product?.price_cents ? formatPrice(c.product.price_cents / 100) : ""}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-foreground">Personalize sua Case</h2>

          <ImageControls
            hasImage={!!c.image}
            scale={c.scale}
            rotation={c.rotation}
            onScaleChange={c.setScale}
            onRotate={c.handleRotate}
            onExpand={c.handleExpand}
            onUpscale={c.handleUpscaleClick}
            isHD={c.isHD}
            upscaleCost={c.aiUpscaleCost}
            isUpscaling={c.isUpscaling}
            filters={c.filters}
            filterCategories={c.filterCategories}
            activeFilterId={c.activeFilterId}
            applyingFilterId={c.applyingFilterId}
            filterCost={c.aiFilterCost}
            filterHistory={c.filterHistory}
            onFilterClick={c.handleFilterClick}
            onCompareStart={c.handleCompareStart}
            onCompareEnd={c.handleCompareEnd}
            onRemoveFilter={c.handleRemoveFilter}
            onUndoLastFilter={c.handleUndoLastFilter}
            onPreviewStart={setPreviewImageUrl}
            onPreviewEnd={() => setPreviewImageUrl(null)}
            onGallerySelect={c.handleGalleryImageSelect}
          />

          <div className="mt-auto">
            <ContinueBar
              isModified={c.isModified}
              onReset={c.handleReset}
              onContinue={c.handleContinue}
              disabled={!c.image || c.isProcessing}
              isRendering={c.isRendering}
              inline
              showDownload={!!c.activeFilterId}
              onDownload={c.handleDownload}
            />
          </div>
        </aside>
      </main>

      {/* Mobile ContinueBar */}
      <ContinueBar
        isModified={c.isModified}
        onReset={c.handleReset}
        onContinue={c.handleContinue}
        disabled={!c.image || c.isProcessing}
        isRendering={c.isRendering}
        showDownload={!!c.activeFilterId}
        onDownload={c.handleDownload}
      />

      <FilterConfirmDialog
        filter={c.filters.find((f) => f.id === c.pendingFilterId) ?? null}
        balance={c.coinBalance}
        cost={c.aiFilterCost}
        open={!!c.pendingFilterId}
        onOpenChange={(open) => { if (!open) c.setPendingFilterId(null); }}
        onConfirm={c.handleFilterConfirm}
      />

      <LoginDialog
        open={c.showLoginDialog}
        onOpenChange={c.setShowLoginDialog}
        redirectUrl={window.location.href}
        reason={c.loginReason}
      />

      <UpscaleConfirmDialog
        balance={c.coinBalance}
        cost={c.aiUpscaleCost}
        open={c.showUpscaleDialog}
        onOpenChange={c.setShowUpscaleDialog}
        onConfirm={c.handleUpscaleConfirm}
      />

      <TermsDialog
        open={c.showTermsDialog}
        onOpenChange={c.setShowTermsDialog}
        onAccept={c.handleTermsAccept}
      />

      <GalleryPicker
        open={showGalleryPicker}
        onOpenChange={setShowGalleryPicker}
        onSelect={c.handleGalleryImageSelect}
      />

      <IntroDialog open={showIntro} onOpenChange={setShowIntro} />
    </div>
  );
};

export default Customize;
