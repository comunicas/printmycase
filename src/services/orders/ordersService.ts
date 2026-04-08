import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesUpdate } from "@/integrations/supabase/types";
import { resolveProductInfo } from "@/lib/products";
import type { AdminOrderRow } from "@/lib/constants";
import { fail, ok, type ServiceResult } from "@/services/shared";

export type OrderWithProduct = Tables<"orders"> & {
  product_name?: string;
  product_image?: string;
  design_name?: string;
  design_image?: string;
};

type DesignRow = Pick<Tables<"collection_designs">, "id" | "name" | "image_url">;
type ProfileRow = Pick<Tables<"profiles">, "id" | "full_name">;

type ShippingAddressData = {
  city?: string;
  state?: string;
};

const parseShippingAddress = (value: unknown): ShippingAddressData | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    city: typeof record.city === "string" ? record.city : undefined,
    state: typeof record.state === "string" ? record.state : undefined,
  };
};

export const ordersService = {
  async fetchUserOrders(): Promise<ServiceResult<OrderWithProduct[]>> {
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return fail({ code: "DATABASE", message: `Erro ao carregar pedidos: ${error.message}`, cause: error });
    }

    const rows = ordersData ?? [];
    if (rows.length === 0) return ok([]);

    const productIds = rows.map((o) => o.product_id);
    const nameMap = await resolveProductInfo(productIds);

    const designIds = [...new Set(rows.map((o) => o.design_id).filter(Boolean))] as string[];
    const designMap = new Map<string, { name: string; image: string }>();
    if (designIds.length > 0) {
      const { data: designs } = await supabase.from("collection_designs").select("id, name, image_url").in("id", designIds);
      (designs as DesignRow[] | null)?.forEach((d) => designMap.set(d.id, { name: d.name, image: d.image_url }));
    }

    return ok(rows.map((o) => ({
      ...o,
      product_name: nameMap.get(o.product_id)?.name ?? o.product_id,
      product_image: nameMap.get(o.product_id)?.image,
      design_name: o.design_id ? designMap.get(o.design_id)?.name : undefined,
      design_image: o.design_id ? designMap.get(o.design_id)?.image : undefined,
    })));
  },

  subscribeUserOrders(userId: string, onUpdate: (updated: Tables<"orders">) => void) {
    const channel = supabase
      .channel("user-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        (payload) => onUpdate(payload.new as Tables<"orders">),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  async fetchAdminOrders(): Promise<ServiceResult<AdminOrderRow[]>> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return fail({ code: "DATABASE", message: `Erro ao carregar pedidos: ${error.message}`, cause: error });
    }

    const rows = data ?? [];
    const productIds = rows.map((o) => o.product_id);
    const nameMap = await resolveProductInfo(productIds);

    const designIds = [...new Set(rows.map((o) => o.design_id).filter(Boolean))] as string[];
    const designMap = new Map<string, { name: string; image: string }>();
    if (designIds.length > 0) {
      const { data: designs } = await supabase.from("collection_designs").select("id, name, image_url").in("id", designIds);
      (designs as DesignRow[] | null)?.forEach((d) => designMap.set(d.id, { name: d.name, image: d.image_url }));
    }

    const userIds = [...new Set(rows.map((o) => o.user_id))];
    const profileMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      (profiles as ProfileRow[] | null)?.forEach((p) => profileMap.set(p.id, p.full_name));
    }

    return ok(rows.map((o) => {
      const shipping = parseShippingAddress(o.shipping_address);
      return {
        ...o,
        product_name: nameMap.get(o.product_id)?.name ?? o.product_id,
        product_image: nameMap.get(o.product_id)?.image,
        design_name: o.design_id ? designMap.get(o.design_id)?.name : undefined,
        design_image: o.design_id ? designMap.get(o.design_id)?.image : undefined,
        customer_name: profileMap.get(o.user_id) || undefined,
        customer_city: shipping?.city || undefined,
        customer_state: shipping?.state || undefined,
      };
    }));
  },

  async updateOrderStatus(orderId: string, newStatus: string, rejectionReason?: string): Promise<ServiceResult<{ status: Database["public"]["Enums"]["order_status"]; rejection_reason: string | null }>> {
    const status = newStatus as Database["public"]["Enums"]["order_status"];
    const updateData: TablesUpdate<"orders"> = { status };

    if (newStatus === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else if (newStatus !== "rejected") {
      updateData.rejection_reason = null;
    }

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) {
      return fail({ code: "DATABASE", message: `Erro ao atualizar status: ${error.message}`, cause: error });
    }

    return ok({ status, rejection_reason: updateData.rejection_reason ?? null });
  },

  async saveTracking(orderId: string, code: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: code, status: "shipped" as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);

    if (error) {
      return fail({ code: "DATABASE", message: `Erro ao salvar rastreio: ${error.message}`, cause: error });
    }

    return ok(null);
  },

  async notifyOrderStatus(orderId: string, newStatus: string, rejectionReason?: string | null): Promise<void> {
    await supabase.functions.invoke("notify-order-status", {
      body: { order_id: orderId, new_status: newStatus, rejection_reason: rejectionReason ?? null },
    });
  },
};
