import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PendingCheckoutRow {
  id: string;
  user_id: string;
  product_id: string;
  customization_data: Record<string, any>;
  original_image_path: string | null;
  edited_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export function usePendingCheckout() {
  const { user } = useAuth();

  const upsert = async (
    productId: string,
    customizationData: Record<string, any>,
    originalImagePath: string | null,
    editedImagePath: string | null,
  ) => {
    if (!user) return;
    await (supabase as any)
      .from("pending_checkouts")
      .upsert(
        {
          user_id: user.id,
          product_id: productId,
          customization_data: customizationData,
          original_image_path: originalImagePath,
          edited_image_path: editedImagePath,
        },
        { onConflict: "user_id,product_id" },
      );
  };

  const fetchByProduct = async (productId: string): Promise<PendingCheckoutRow | null> => {
    if (!user) return null;
    const { data } = await (supabase as any)
      .from("pending_checkouts")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    return data ?? null;
  };

  const fetchAll = async (): Promise<PendingCheckoutRow[]> => {
    if (!user) return [];
    const { data } = await (supabase as any)
      .from("pending_checkouts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    return data ?? [];
  };

  const remove = async (productId: string) => {
    if (!user) return;
    await (supabase as any)
      .from("pending_checkouts")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    if (!path) return null;
    const { data } = await supabase.storage
      .from("customizations")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  return { upsert, fetchByProduct, fetchAll, remove, getSignedUrl };
}
