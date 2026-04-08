import { supabase } from "@/integrations/supabase/client";
import { fail, ok, type ServiceResult } from "@/services/shared";

type AddressInline = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  label: string;
};

type CreateCheckoutPayload = {
  product_id: string;
  customization_data: Record<string, unknown>;
  raw_image_url: string | null;
  original_image_url: string | null;
  edited_image_url: string | null;
  shipping_cents: number;
  initiate_checkout_event_id: string;
  address_id?: string;
  address_inline?: AddressInline;
  save_address: boolean;
};

export const checkoutService = {
  async uploadCustomizationAsset(path: string, blob: Blob): Promise<ServiceResult<string>> {
    const { error } = await supabase.storage.from("customizations").upload(path, blob);
    if (error) {
      return fail({ code: "STORAGE", message: `Falha ao enviar arquivo: ${error.message}`, cause: error });
    }
    return ok(path);
  },

  async createCheckout(payload: CreateCheckoutPayload): Promise<ServiceResult<{ url: string }>> {
    const { data, error } = await supabase.functions.invoke("create-checkout", { body: payload });

    if (error) {
      return fail({ code: "FUNCTION", message: `Erro ao criar checkout: ${error.message}`, cause: error });
    }

    if (!data?.url || typeof data.url !== "string") {
      return fail({ code: "UNKNOWN", message: "URL de checkout não retornada" });
    }

    return ok({ url: data.url });
  },
};
