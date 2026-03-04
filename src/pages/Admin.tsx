import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import BulkPriceDialog from "@/components/admin/BulkPriceDialog";
import { formatPrice } from "@/data/products";

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  images: string[];
  specs: any[];
  colors: any[];
  rating: number;
  review_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

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
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  analyzing: "Em Análise",
  customizing: "Customizando",
  producing: "Produzindo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const Admin = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const { toast } = useToast();

  // Orders
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

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
      setProducts((data as any[]) ?? []);
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
    } else {
      setOrders((data as any[]) ?? []);
      // Pre-fill tracking inputs
      const inputs: Record<string, string> = {};
      (data ?? []).forEach((o: any) => {
        if (o.tracking_code) inputs[o.id] = o.tracking_code;
      });
      setTrackingInputs(inputs);
    }
    setOrdersLoading(false);
  }, [toast]);

  useEffect(() => { fetchProducts(); fetchOrders(); }, [fetchProducts, fetchOrders]);

  const handleEdit = (product: DbProduct) => {
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

  const handleToggleActive = async (product: DbProduct) => {
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
      .update({ status: newStatus as any })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status atualizado para "${statusLabels[newStatus]}"` });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) return;
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: code, status: "shipped" } as any)
      .eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao salvar rastreio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Código de rastreio salvo" });
      fetchOrders();
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
            <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Nenhum pedido encontrado.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-xl p-4 bg-card space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
