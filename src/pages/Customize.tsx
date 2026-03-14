import { useParams, useNavigate } from "react-router-dom";
import PhonePreview from "@/components/PhonePreview";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import ImageControls from "@/components/customize/ImageControls";
import ContinueBar from "@/components/customize/ContinueBar";
import FilterConfirmDialog from "@/components/customize/FilterConfirmDialog";
import UpscaleConfirmDialog from "@/components/customize/UpscaleConfirmDialog";
import LoginDialog from "@/components/customize/LoginDialog";
import { useCustomize } from "@/hooks/useCustomize.tsx";

const Customize = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const c = useCustomize(id);

  if (c.productLoading) return <LoadingSpinner variant="fullPage" />;

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden">
      <CustomizeHeader
        productName={c.productName}
        onBack={() => navigate(c.product ? `/product/${c.product.slug}` : "/catalog")}
        productImage={c.product?.images?.[0] || c.product?.device_image}
        draftSaved={c.draftSaved}
      />

      <main className="flex-1 flex flex-col items-center justify-center gap-2 lg:gap-3 px-4 overflow-hidden">
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
        />

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
          activeFilterId={c.activeFilterId}
          applyingFilterId={c.applyingFilterId}
          filterCost={c.aiFilterCost}
          onFilterClick={c.handleFilterClick}
          onCompareStart={c.handleCompareStart}
          onCompareEnd={c.handleCompareEnd}
          onRemoveFilter={c.handleRemoveFilter}
        />
      </main>

      <ContinueBar
        isModified={c.isModified}
        onReset={c.handleReset}
        onContinue={c.handleContinue}
        disabled={!c.image || c.isProcessing}
        isRendering={c.isRendering}
        productName={c.productName}
        priceCents={c.product?.price_cents}
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
      />

      <UpscaleConfirmDialog
        balance={c.coinBalance}
        cost={c.aiUpscaleCost}
        open={c.showUpscaleDialog}
        onOpenChange={c.setShowUpscaleDialog}
        onConfirm={c.handleUpscaleConfirm}
      />
    </div>
  );
};

export default Customize;
