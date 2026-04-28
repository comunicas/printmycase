import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PhonePreview from "@/components/PhonePreview";
import { formatPrice } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import ImageControls from "@/components/customize/ImageControls";
import ContinueBar from "@/components/customize/ContinueBar";
import FilterConfirmDialog from "@/components/customize/FilterConfirmDialog";
import LowResolutionDialog from "@/components/customize/LowResolutionDialog";
import LoginDialog from "@/components/customize/LoginDialog";
import TermsDialog from "@/components/customize/TermsDialog";
import { useCustomize } from "@/hooks/useCustomize.tsx";
import IntroDialog from "@/components/customize/IntroDialog";
import MobileTabBar, { type MobileTab } from "@/components/customize/MobileTabBar";
import MobileTabOverlay from "@/components/customize/MobileTabOverlay";
import FilterHistoryBar from "@/components/customize/FilterHistoryBar";
import ProductHighlightsList from "@/components/customize/ProductHighlightsList";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const c = useCustomize(id);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem("customize_intro_seen"));

  if (c.productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden">
      <div className="relative z-50">
        <CustomizeHeader
          productName={c.productName}
          onBack={() => navigate("/customize")}
          productImage={c.product?.images?.[0] || c.product?.device_image}
          draftSaved={c.draftSaved}
          currentSlug={c.product?.slug}
          onShowIntro={() => setShowIntro(true)}
        />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0 px-4 lg:px-0 overflow-hidden">
        {/* Preview — left side on desktop */}
        <div className="flex items-center justify-center lg:flex-1 lg:h-full">
          <PhonePreview
            image={c.image}
            scale={c.scale}
            position={c.position}
            rotation={c.rotation}
            deviceSlug={c.product?.slug}
            showSafeZone={showSafeZone}
            onPositionChange={c.setPosition}
            onScaleChange={c.setScale}
            onImageUpload={c.handleImageUpload}
            imageResolution={c.imageResolution}
            isProcessing={c.isProcessing}
            uploadState={c.uploadState}
            uploadStatusLabel={c.uploadStatusLabel || undefined}
            processingMessage={c.processingMsg || undefined}
            previewImageUrl={previewImageUrl}
            disabled={c.isProcessing}
          />
        </div>

        {/* Desktop sidebar — right side */}
        <aside className="hidden lg:flex flex-col gap-4 lg:w-[420px] lg:flex-shrink-0 h-full px-8 py-6 overflow-y-auto bg-muted/40 border-l border-border">
          {/* Product summary */}
          <div className="space-y-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <img
                src={c.product?.device_image || c.product?.images?.[0] || "/placeholder.svg"}
                alt={c.productName}
                className="w-16 h-16 object-contain rounded-lg bg-background"
              />
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-foreground leading-tight">{c.productName}</p>
                <p className="text-base text-primary font-semibold">
                  {c.product?.price_cents ? formatPrice(c.product.price_cents / 100) : ""}
                </p>
              </div>
            </div>

            <ProductHighlightsList />
          </div>

          <h2 className="text-lg font-semibold text-foreground">Personalize sua Case</h2>

          <ImageControls
            hasImage={!!c.image}
            scale={c.scale}
            rotation={c.rotation}
            showSafeZone={showSafeZone}
            onScaleChange={c.setScale}
            onRotate={c.handleRotate}
            onExpand={c.handleExpand}
            onShowSafeZoneChange={setShowSafeZone}
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
              hasImage={!!c.image}
            />
          </div>
        </aside>
      </main>

      {/* Mobile bottom sheet overlay */}
      {mobileTab && (
        <MobileTabOverlay
          activeTab={mobileTab}
          onClose={() => setMobileTab(null)}
          productName={c.productName}
          productPrice={c.product?.price_cents ? formatPrice(c.product.price_cents / 100) : ""}
          productImage={c.product?.device_image || c.product?.images?.[0] || "/placeholder.svg"}
          hasImage={!!c.image}
          scale={c.scale}
          rotation={c.rotation}
          showSafeZone={showSafeZone}
          onScaleChange={c.setScale}
          onRotate={c.handleRotate}
          onExpand={c.handleExpand}
          onShowSafeZoneChange={setShowSafeZone}
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
        />
      )}

      {/* Mobile fixed footer: TabBar + ContinueBar */}
      <div className="lg:hidden flex-shrink-0 relative z-[60]">
        <FilterHistoryBar
          filterHistory={c.filterHistory}
          onCompareStart={c.handleCompareStart}
          onCompareEnd={c.handleCompareEnd}
          onUndoLastFilter={c.handleUndoLastFilter}
          onRemoveFilter={c.handleRemoveFilter}
          disabled={c.isProcessing}
        />
        <MobileTabBar
          activeTab={mobileTab}
          onTabClick={(tab) => setMobileTab((prev) => prev === tab ? null : tab)}
          hasFilters={c.filters.length > 0}
          disabled={c.isProcessing || !c.image}
        />
        {!mobileTab && (
          <ContinueBar
            isModified={c.isModified}
            onReset={c.handleReset}
            onContinue={c.handleContinue}
            disabled={!c.image || c.isProcessing}
            isRendering={c.isRendering}
            showDownload={!!c.activeFilterId}
            onDownload={c.handleDownload}
          />
        )}
      </div>

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

      <TermsDialog
        open={c.showTermsDialog}
        onOpenChange={c.setShowTermsDialog}
        onAccept={c.handleTermsAccept}
      />

      <IntroDialog open={showIntro} onOpenChange={setShowIntro} />

      <LowResolutionDialog
        open={c.showLowResDialog}
        onOpenChange={c.setShowLowResDialog}
        resolution={c.imageResolution}
        onUpscale={c.handleLowResUpscale}
        hasUpscaleFilter={c.filters.some((f) => f.model_url?.includes("aura-sr"))}
      />
    </div>
  );
};

export default Customize;
