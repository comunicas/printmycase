import type { AddressData } from "@/components/checkout/AddressForm";
import type { CustomizationPosition } from "@/types/customization";

interface CheckoutCustomizationPayload {
  scale: number;
  rotation: number;
  activeFilter: string | null;
  position: CustomizationPosition;
  preview_image_url: string | null;
}

interface BuildCreateCheckoutPayloadParams {
  productId: string;
  shippingCents: number;
  eventId: string;
  addressData: AddressData;
  customizationData?: CheckoutCustomizationPayload;
  rawImageUrl?: string | null;
  originalImageUrl?: string | null;
  editedImageUrl?: string | null;
}

export const buildCreateCheckoutPayload = ({
  productId,
  shippingCents,
  eventId,
  addressData,
  customizationData,
  rawImageUrl,
  originalImageUrl,
  editedImageUrl,
}: BuildCreateCheckoutPayloadParams) => {
  const cleanZip = addressData.zipInput.replace(/\D/g, "");

  return {
    product_id: productId,
    customization_data: customizationData,
    raw_image_url: rawImageUrl,
    original_image_url: originalImageUrl,
    edited_image_url: editedImageUrl,
    shipping_cents: shippingCents,
    initiate_checkout_event_id: eventId,
    address_id: addressData.selectedAddressId,
    address_inline: addressData.selectedAddressId ? undefined : {
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement || null,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zip_code: cleanZip,
      label: addressData.addressLabel,
    },
    save_address: !addressData.selectedAddressId && addressData.saveAddress,
  };
};
