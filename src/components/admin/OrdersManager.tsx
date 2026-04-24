import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import OrderDetailDialog from "@/components/admin/OrderDetailDialog";
import { statusLabels, statusColorMap, type AdminOrderRow } from "@/lib/constants";
import { formatPrice } from "@/lib/types";
import { resolveProductInfo } from "@/lib/products";
import type { Database, Tables, TablesUpdate } from "@/integrations/supabase/types";

const PAGE_SIZE = 10;
type OrderRow = Tables<"orders">;
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

const OrdersManager = () => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows: OrderRow[] = data ?? [];
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

    const enriched: AdminOrderRow[] = rows.map((o) => {
      const shipping = parseShippingAddress(o.shipping_address);
      return {
        ...o,
        product_name: nameMap.get(o.product_id)?.name ?? o.product_id,
        product_image: nameMap.get(o.product_id)?.image,
        product_slug: nameMap.get(o.product_id)?.slug,
        design_name: o.design_id ? designMap.get(o.design_id)?.name : undefined,
        design_image: o.design_id ? designMap.get(o.design_id)?.image : undefined,
        customer_name: profileMap.get(o.user_id) || undefined,
        customer_city: shipping?.city || undefined,
        customer_state: shipping?.state || undefined,
      };
    });
    setOrders(enriched);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string, rejectionReason?: string) => {
    const status = newStatus as Database["public"]["Enums"]["order_status"];
    const updateData: TablesUpdate<"orders"> = { status };
    if (newStatus === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else if (newStatus !== "rejected") {
      updateData.rejection_reason = null;
    }
    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status atualizado para "${statusLabels[newStatus]}"` });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status, rejection_reason: updateData.rejection_reason } : o));
      setSelectedOrder((prev) => prev?.id === orderId ? { ...prev, status, rejection_reason: updateData.rejection_reason } : prev);
      supabase.functions.invoke("notify-order-status", { body: { order_id: orderId, new_status: newStatus, rejection_reason: rejectionReason || null } }).catch(() => {});
    }
  };

  const handleSaveTracking = async (orderId: string, code: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: code, status: "shipped" as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao salvar rastreio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Código de rastreio salvo" });
      fetchOrders();
      supabase.functions.invoke("notify-order-status", { body: { order_id: orderId, new_status: "shipped" } }).catch(() => {});
    }
  };

  const filtered = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [statusFilter]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pedidos</h2>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ key: "all", label: "Todos" }, ...Object.entries(statusLabels).map(([key, label]) => ({ key, label }))].map(
          ({ key, label }) => {
            const count = key === "all" ? orders.length : orders.filter((o) => o.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {label} ({count})
              </button>
            );
          }
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum pedido encontrado.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="border rounded-xl p-3 bg-card cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {(order.design_image || order.product_image) && (
                      <img
                        src={order.design_image || order.product_image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground truncate max-w-[160px] sm:max-w-[220px]">
                        {order.design_name ? `${order.design_name} — ${order.product_name}` : (order.product_name ?? order.product_id)}
                      </p>
                      <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</span>
                      {order.customer_name && (
                        <p className="text-xs text-muted-foreground">
                          👤 {order.customer_name}
                          {order.customer_city && ` · ${order.customer_city}/${order.customer_state}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto sm:ml-0 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColorMap[order.status] || ""}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(order.total_cents / 100)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
            </div>
          )}
        </>
      )}

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        onSaveTracking={handleSaveTracking}
      />
    </div>
  );
};

export default OrdersManager;
