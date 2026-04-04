import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import BulkPriceDialog from "@/components/admin/BulkPriceDialog";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { type Product } from "@/lib/types";

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
    const { error } = await supabase.from("products").update({ active: newActive }).eq("id", product.id);
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

  const handleEdit = (product: Product) => { setEditingProduct(product); setDialogOpen(true); };
  const handleNew = () => { setEditingProduct(null); setDialogOpen(true); };
  const handleSaved = () => { setDialogOpen(false); setEditingProduct(null); fetchProducts(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Stripe"}
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

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
          <Button size="sm" variant="outline" disabled={!bulkAdjustValue || Number(bulkAdjustValue) <= 0} onClick={() => { setBulkDirection("increase"); setBulkDialogOpen(true); }}>
            + Aumentar
          </Button>
          <Button size="sm" variant="outline" disabled={!bulkAdjustValue || Number(bulkAdjustValue) <= 0} onClick={() => { setBulkDirection("decrease"); setBulkDialogOpen(true); }}>
            − Diminuir
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Limpar seleção</Button>
        </div>
      )}

      <ProductsTablePaginated
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} onSaved={handleSaved} />

      <BulkPriceDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        products={products.filter((p) => selectedIds.has(p.id))}
        adjustType={bulkAdjustType}
        adjustValue={bulkAdjustType === "fixed" ? Math.round(Number(bulkAdjustValue) * 100) : Number(bulkAdjustValue)}
        direction={bulkDirection}
        onDone={() => { setSelectedIds(new Set()); fetchProducts(); }}
      />
    </div>
  );
};

export default ProductsManager;
