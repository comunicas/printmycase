import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Package, Truck, HelpCircle, Smartphone, Wand2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import BulkPriceDialog from "@/components/admin/BulkPriceDialog";
import FaqManager from "@/components/admin/FaqManager";
import AiFiltersManager from "@/components/admin/AiFiltersManager";
import ModelRequestsManager from "@/components/admin/ModelRequestsManager";
import CoinsManager from "@/components/admin/CoinsManager";
import { type Product, formatPrice } from "@/lib/types";
import { statusLabels } from "@/lib/constants";
import OrderImagesPreviewer from "@/components/admin/OrderImagesPreviewer";
import type { Database } from "@/integrations/supabase/types";
import { resolveProductInfo } from "@/lib/products";

interface DbOrder {
  id: string;
  user_id: string;
  product_id: string;
  total_cents: number;
  shipping_cents: number | null;
  tracking_code: string | null;
  status: string;
  created_at: string;
  stripe_session_id: string | null;
  customization_data?: any | null;
  product_name?: string;
  product_image?: string;
}


const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // Orders
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Bulk price
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAdjustType, setBulkAdjustType] = useState<"fixed" | "percent">("percent");
  const [bulkAdjustValue, setBulkAdjustValue] = useState("10");
  const [bulkDirection, setBulkDirection] = useState<"increase" | "decrease">("increase");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar produtos", description: error.message, variant: "destructive" });
    } else {
      setProducts(
        (data ?? []).map((row) => ({
          ...row,
          images: row.images ?? [],
          colors: (row.colors as unknown as Product["colors"]) ?? [],
          specs: (row.specs as unknown as Product["specs"]) ?? [],
          rating: Number(row.rating) || 0,
          review_count: row.review_count ?? 0,
          active: row.active ?? true,
          device_image: row.device_image ?? null,
        }))
      );
    }
    setLoading(false);
  }, [toast]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
      setOrdersLoading(false);
      return;
    }
    const ordersData = data ?? [];

    // Enrich with product info using shared helper
    const productIds = ordersData.map((o) => o.product_id);
    const nameMap = await resolveProductInfo(productIds);

    const enriched = ordersData.map((o) => ({
      ...o,
      product_name: nameMap.get(o.product_id)?.name ?? o.product_id,
      product_image: nameMap.get(o.product_id)?.image,
    }));

    setOrders(enriched);
    const inputs: Record<string, string> = {};
    ordersData.forEach((o) => {
      if (o.tracking_code) inputs[o.id] = o.tracking_code;
    });
    setTrackingInputs(inputs);
    setOrdersLoading(false);
  }, [toast]);

  useEffect(() => { fetchProducts(); fetchOrders(); }, [fetchProducts, fetchOrders]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const [syncing, setSyncing] = useState(false);

  const handleBulkSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-sync-stripe");
      if (error) throw error;
      const result = data as { synced: number; errors: { name: string; error: string }[] };
      if (result.errors?.length > 0) {
        toast({
          title: `${result.synced} sincronizados, ${result.errors.length} erros`,
          description: result.errors.map((e) => e.name).join(", "),
          variant: "destructive",
        });
      } else {
        toast({ title: `${result.synced} produtos sincronizados com Stripe` });
      }
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Erro na sincronização", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newActive = !product.active;
    const { error } = await supabase
      .from("products")
      .update({ active: newActive })
      .eq("id", product.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    if (!newActive && product.stripe_product_id) {
      await supabase.functions.invoke("admin-sync-stripe", {
        body: { action: "archive", product_id: product.id },
      });
    }

    fetchProducts();
    toast({ title: newActive ? "Produto ativado" : "Produto desativado" });
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status atualizado para "${statusLabels[newStatus]}"` });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));

      // Send email notification (fire-and-forget)
      supabase.functions.invoke("notify-order-status", {
        body: { order_id: orderId, new_status: newStatus },
      }).catch((err) => console.error("Email notification error:", err?.message));
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

      // Send shipped notification with tracking code
      supabase.functions.invoke("notify-order-status", {
        body: { order_id: orderId, new_status: "shipped" },
      }).catch((err) => console.error("Email notification error:", err?.message));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Admin" }]} />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="w-4 h-4" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <Truck className="w-4 h-4" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5">
              <HelpCircle className="w-4 h-4" /> FAQ
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <Smartphone className="w-4 h-4" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="ai-filters" className="gap-1.5">
              <Wand2 className="w-4 h-4" /> Filtros IA
            </TabsTrigger>
            <TabsTrigger value="coins" className="gap-1.5">
              <Coins className="w-4 h-4" /> Moedas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Produtos</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBulkSync} disabled={syncing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sincronizando..." : "Sincronizar Stripe"}
                </Button>
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </div>

            {/* Bulk price action bar */}
            {selectedIds.size > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <span className="text-sm font-medium">{selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}</span>
                <select
                          value={bulkAdjustType}
                          onChange={(e) => setBulkAdjustType(e.target.value as "fixed" | "percent")}
                          className="h-9 rounded-md border bg-background px-2 text-sm"
                          aria-label="Tipo de ajuste de preço"
                >
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
                <Input
                  type="number"
                  min="0"
                  step={bulkAdjustType === "fixed" ? "0.01" : "1"}
                  placeholder={bulkAdjustType === "fixed" ? "0,00" : "10"}
                  value={bulkAdjustValue}
                  onChange={(e) => setBulkAdjustValue(e.target.value)}
                  className="w-24 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!bulkAdjustValue || Number(bulkAdjustValue) <= 0}
                  onClick={() => { setBulkDirection("increase"); setBulkDialogOpen(true); }}
                >
                  + Aumentar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!bulkAdjustValue || Number(bulkAdjustValue) <= 0}
                  onClick={() => { setBulkDirection("decrease"); setBulkDialogOpen(true); }}
                >
                  − Diminuir
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Limpar seleção
                </Button>
              </div>
            )}

            <ProductsTable
              products={products}
              loading={loading}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />

            <ProductFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              product={editingProduct}
              onSaved={handleSaved}
            />

            <BulkPriceDialog
              open={bulkDialogOpen}
              onOpenChange={setBulkDialogOpen}
              products={products.filter((p) => selectedIds.has(p.id))}
              adjustType={bulkAdjustType}
              adjustValue={bulkAdjustType === "fixed" ? Math.round(Number(bulkAdjustValue) * 100) : Number(bulkAdjustValue)}
              direction={bulkDirection}
              onDone={() => { setSelectedIds(new Set()); fetchProducts(); }}
            />
          </TabsContent>

          <TabsContent value="orders">
            <h1 className="text-2xl font-bold mb-4">Pedidos</h1>

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

            {ordersLoading ? (
              <LoadingSpinner />
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Nenhum pedido encontrado.</p>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter((o) => statusFilter === "all" || o.status === statusFilter)
                  .map((order) => (
                  <div key={order.id} className="border rounded-xl p-4 bg-card space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {order.product_image && (
                          <img
                            src={order.product_image}
                            alt={order.product_name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {order.product_name ?? order.product_id}
                          </p>
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

                    {/* Customization images */}
                    <OrderImagesPreviewer customizationData={order.customization_data ?? null} />

                    {/* Tracking code input */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Código de rastreio"
                        value={trackingInputs[order.id] ?? ""}
                        onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        className="max-w-xs text-sm font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveTracking(order.id)}
                        disabled={!trackingInputs[order.id]?.trim()}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="faq">
            <FaqManager />
          </TabsContent>
          <TabsContent value="requests">
            <ModelRequestsManager />
          </TabsContent>
          <TabsContent value="ai-filters">
            <AiFiltersManager />
          </TabsContent>
          <TabsContent value="coins">
            <CoinsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
