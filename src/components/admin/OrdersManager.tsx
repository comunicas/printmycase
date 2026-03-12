import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import OrderImagesPreviewer from "@/components/admin/OrderImagesPreviewer";
import { statusLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/types";
import { resolveProductInfo } from "@/lib/products";
import type { Tables } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type OrderRow = Tables<"orders"> & {
  product_name?: string;
  product_image?: string;
  design_name?: string;
  design_image?: string;
};

const PAGE_SIZE = 10;

const OrdersManager = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
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
    const rows = data ?? [];
    const productIds = rows.map((o) => o.product_id);
    const nameMap = await resolveProductInfo(productIds);

    // Resolve design info
    const designIds = [...new Set(rows.map((o) => o.design_id).filter(Boolean))] as string[];
    const designMap = new Map<string, { name: string; image: string }>();
    if (designIds.length > 0) {
      const { data: designs } = await supabase
        .from("collection_designs")
        .select("id, name, image_url")
        .in("id", designIds);
      designs?.forEach((d) => designMap.set(d.id, { name: d.name, image: d.image_url }));
    }

    const enriched: OrderRow[] = rows.map((o) => ({
      ...o,
      product_name: nameMap.get(o.product_id)?.name ?? o.product_id,
      product_image: nameMap.get(o.product_id)?.image,
      design_name: o.design_id ? designMap.get(o.design_id)?.name : undefined,
      design_image: o.design_id ? designMap.get(o.design_id)?.image : undefined,
    }));
    setOrders(enriched);

    const inputs: Record<string, string> = {};
    rows.forEach((o) => { if (o.tracking_code) inputs[o.id] = o.tracking_code; });
    setTrackingInputs(inputs);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status atualizado para "${statusLabels[newStatus]}"` });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus as Database["public"]["Enums"]["order_status"] } : o));
      supabase.functions.invoke("notify-order-status", {
        body: { order_id: orderId, new_status: newStatus },
      }).catch(() => {});
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) return;
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: code, status: "shipped" as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao salvar rastreio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Código de rastreio salvo" });
      fetchOrders();
      supabase.functions.invoke("notify-order-status", {
        body: { order_id: orderId, new_status: "shipped" },
      }).catch(() => {});
    }
  };

  const filtered = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filter changes
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
          <div className="space-y-3">
            {paginated.map((order) => (
              <div key={order.id} className="border rounded-xl p-4 bg-card space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {order.design_image ? (
                        <>
                          <img src={order.design_image} alt={order.design_name} className="w-10 h-10 rounded-lg object-cover" />
                          {order.product_image && (
                            <img src={order.product_image} alt={order.product_name} className="w-5 h-5 rounded object-cover absolute -bottom-0.5 -right-0.5 border border-card" />
                          )}
                        </>
                      ) : order.product_image ? (
                        <img src={order.product_image} alt={order.product_name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : null}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {order.design_name ? `${order.design_name} — ${order.product_name}` : (order.product_name ?? order.product_id)}
                        </p>
                        {order.design_id && (
                          <span className="inline-flex rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Coleção</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
                      aria-label="Status do pedido"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className="font-semibold text-sm">{formatPrice(order.total_cents / 100)}</span>
                    {order.shipping_cents != null && (
                      <span className="text-xs text-muted-foreground">(frete {formatPrice(order.shipping_cents / 100)})</span>
                    )}
                  </div>
                </div>
                <OrderImagesPreviewer customizationData={(order.customization_data as Record<string, any>) ?? null} />
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Código de rastreio"
                    value={trackingInputs[order.id] ?? ""}
                    onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                    className="max-w-xs text-sm font-mono"
                  />
                  <Button size="sm" variant="outline" onClick={() => handleSaveTracking(order.id)} disabled={!trackingInputs[order.id]?.trim()}>
                    Salvar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersManager;
