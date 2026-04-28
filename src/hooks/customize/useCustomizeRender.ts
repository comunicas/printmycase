import { useCallback, useState } from "react";
import { renderPhoneMockup, renderSnapshot } from "@/lib/image-utils";
import { uploadPendingCustomizationAssets } from "@/services/customize/storage";
import type { PendingCustomizationData } from "@/types/customization";

export function useCustomizeRender(params: {
  requireAuth: () => boolean;
  navigate: (path: string) => void;
  toast: (payload: { title: string; description?: string; variant?: "destructive" }) => void;
  trackAddToCart: (product: { id: string; name: string; price_cents: number }) => void;
  upsertPending: (productId: string, customizationData: PendingCustomizationData, originalImagePath: string | null, editedImagePath: string | null, rawImagePath?: string | null) => Promise<void>;
}) {
  const { requireAuth, navigate, toast, trackAddToCart, upsertPending } = params;
  const [isRendering, setIsRendering] = useState(false);

  const handleDownload = useCallback(async (src: string | null, productName: string) => {
    if (!src) return;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `printmycase-${productName.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast({ title: "Imagem baixada", description: "A imagem foi salva com sucesso." });
    } catch {
      window.open(src, "_blank");
    }
  }, [toast]);

  const handleContinue = useCallback(async (state: {
    product: { id: string; slug: string; name: string; price_cents: number } | null;
    userId?: string;
    image: string | null;
    rawImage: string | null;
    originalImage: string | null;
    filteredImage: string | null;
    imageFileName: string | null;
    scale: number;
    position: { x: number; y: number };
    rotation: number;
    activeFilterId: string | null;
    filterHistory: { filterId: string }[];
  }) => {
    if (!state.product || !state.image) return;

    setIsRendering(true);
    trackAddToCart({ id: state.product.id, name: state.product.name, price_cents: state.product.price_cents });

    try {
      const finalImage = await renderSnapshot(state.image, state.scale, state.position, state.rotation);
      const previewImage = await renderPhoneMockup(state.image, state.scale, state.position, state.rotation).catch(() => null);

      const customData = {
        rawImage: state.rawImage,
        image: state.image,
        editedImage: finalImage,
        previewImage,
        imageFileName: state.imageFileName,
        scale: state.scale,
        position: state.position,
        rotation: state.rotation,
      };

      try {
        sessionStorage.setItem("customization", JSON.stringify(customData));
      } catch {
        sessionStorage.setItem("customization", JSON.stringify({ ...customData, rawImage: null, image: null, previewImage: null }));
      }

      if (state.userId) {
        try {
          const uploaded = await uploadPendingCustomizationAssets({
            userId: state.userId,
            timestamp: Date.now(),
            imageFileName: state.imageFileName,
            rawSource: state.rawImage || state.originalImage || state.image,
            optimizedSource: state.originalImage || state.image,
            finalSource: finalImage,
            filteredSource: state.filteredImage,
            previewSource: previewImage,
          });

          const pendingData: PendingCustomizationData = {
            scale: state.scale,
            position: state.position,
            rotation: state.rotation,
            activeFilter: state.activeFilterId,
            filteredImagePath: uploaded.filteredPath,
            previewImagePath: uploaded.previewPath,
            filterHistory: state.filterHistory.map((h) => h.filterId),
          };

          await upsertPending(
            state.product.id,
            pendingData,
            uploaded.optimizedPath,
            uploaded.finalPath,
            uploaded.rawPath,
          );
        } catch {
          // ignore pending persistence failures
        }
      }

      sessionStorage.removeItem(`draft-customize-${state.product.slug}`);
      navigate(`/checkout/${state.product.slug}`);
    } catch {
      toast({ title: "Erro ao salvar customização", variant: "destructive" });
    } finally {
      setIsRendering(false);
    }
  }, [requireAuth, trackAddToCart, upsertPending, navigate, toast]);

  return { isRendering, handleContinue, handleDownload };
}
