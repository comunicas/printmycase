import { useCallback } from "react";
import { clarityEvent } from "@/lib/clarity";
import { generateEventId, pixelEvent } from "@/lib/meta-pixel";
import { invokeMetaCapiAddToCart } from "@/services/customize/ai";

export function useCustomizeTracking() {
  const trackImageUploaded = useCallback(() => clarityEvent("customize_image_uploaded"), []);
  const trackFilterApplied = useCallback(() => clarityEvent("customize_filter_applied"), []);
  const trackGalleryImageSelected = useCallback(() => clarityEvent("customize_gallery_image_selected"), []);

  const trackAddToCart = useCallback((product: { id: string; name: string; price_cents: number }) => {
    const eventId = generateEventId();
    pixelEvent(
      "AddToCart",
      {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: product.price_cents / 100,
        currency: "BRL",
      },
      eventId,
    );

    invokeMetaCapiAddToCart({
      eventId,
      productId: product.id,
      value: product.price_cents / 100,
    }).catch(() => undefined);
  }, []);

  return { trackImageUploaded, trackFilterApplied, trackGalleryImageSelected, trackAddToCart };
}
