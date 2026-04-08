import { useCallback } from "react";
import { parsePendingCustomizationData, type CheckoutCustomizationData } from "@/types/customization";
import { usePendingCheckout } from "@/hooks/usePendingCheckout";

export function useRecoverPendingCheckout() {
  const { fetchByProduct, getSignedUrl } = usePendingCheckout();

  const recoverPendingCheckout = useCallback(async (productId: string): Promise<CheckoutCustomizationData | null> => {
    const pending = await fetchByProduct(productId);
    if (!pending) return null;

    const customization = parsePendingCustomizationData(pending.customization_data);

    const [image, editedImage, previewImage] = await Promise.all([
      pending.original_image_path ? getSignedUrl(pending.original_image_path) : Promise.resolve(null),
      pending.edited_image_path ? getSignedUrl(pending.edited_image_path) : Promise.resolve(null),
      customization.previewImagePath ? getSignedUrl(customization.previewImagePath) : Promise.resolve(null),
    ]);

    return {
      rawImage: image,
      image,
      editedImage,
      previewImage,
      imageFileName: null,
      scale: customization.scale ?? 100,
      rotation: customization.rotation ?? 0,
      activeFilter: customization.activeFilter ?? null,
      position: customization.position ?? { x: 50, y: 50 },
    };
  }, [fetchByProduct, getSignedUrl]);

  return { recoverPendingCheckout };
}
