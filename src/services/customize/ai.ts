import { supabase } from "@/integrations/supabase/client";

export async function invokeApplyAiFilter(params: {
  imageUrl: string;
  filterId: string;
  stepNumber: number;
  sessionId: string;
}) {
  return supabase.functions.invoke("apply-ai-filter", {
    body: {
      imageUrl: params.imageUrl,
      filterId: params.filterId,
      step_number: params.stepNumber,
      session_id: params.sessionId,
    },
  });
}

export async function invokeUpscaleImage(params: {
  imageUrl: string;
  stepNumber: number;
  sessionId: string;
}) {
  return supabase.functions.invoke("upscale-image", {
    body: {
      imageUrl: params.imageUrl,
      step_number: params.stepNumber,
      session_id: params.sessionId,
    },
  });
}

export async function invokeMetaCapiAddToCart(payload: {
  eventId: string;
  productId: string;
  value: number;
}) {
  return supabase.functions.invoke("meta-capi", {
    body: {
      event_name: "AddToCart",
      event_id: payload.eventId,
      event_source_url: window.location.href,
      user_data: { client_user_agent: navigator.userAgent },
      custom_data: {
        content_ids: [payload.productId],
        content_type: "product",
        value: payload.value,
        currency: "BRL",
      },
    },
  });
}
