import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import type { PendingCustomizationData } from "@/types/customization";
import { useCallback } from "react";

export type PendingCheckoutRow = Tables<"pending_checkouts">;

export function usePendingCheckout() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const upsert = useCallback(async (
    productId: string,
    customizationData: PendingCustomizationData,
    originalImagePath: string | null,
    editedImagePath: string | null,
    rawImagePath?: string | null,
  ) => {
    if (!userId) return;

    const payload: TablesInsert<"pending_checkouts"> = {
      user_id: userId,
      product_id: productId,
      customization_data: customizationData,
      original_image_path: originalImagePath,
      edited_image_path: editedImagePath,
      raw_image_path: rawImagePath ?? null,
    };

    const { error } = await supabase
      .from("pending_checkouts")
      .upsert(payload, { onConflict: "user_id,product_id" });

    if (error) {
      throw new Error(`Falha ao salvar checkout pendente: ${error.message}`);
    }
  }, [userId]);

  const fetchByProduct = useCallback(async (productId: string): Promise<PendingCheckoutRow | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("pending_checkouts")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) {
      throw new Error(`Falha ao buscar checkout pendente: ${error.message}`);
    }

    return data ?? null;
  }, [userId]);

  const fetchAll = useCallback(async (): Promise<PendingCheckoutRow[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("pending_checkouts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Falha ao listar checkouts pendentes: ${error.message}`);
    }

    return data ?? [];
  }, [userId]);

  const remove = useCallback(async (productId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("pending_checkouts")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      throw new Error(`Falha ao remover checkout pendente: ${error.message}`);
    }
  }, [userId]);

  const getSignedUrl = useCallback(async (path: string): Promise<string | null> => {
    if (!path) return null;
    const { data, error } = await supabase.storage
      .from("customizations")
      .createSignedUrl(path, 3600);

    if (error) {
      throw new Error(`Falha ao assinar URL da customização: ${error.message}`);
    }

    return data?.signedUrl ?? null;
  }, []);

  return { upsert, fetchByProduct, fetchAll, remove, getSignedUrl };
}
