import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import ProductsTable from "@/components/admin/ProductsTable";
import ProductFormDialog from "@/components/admin/ProductFormDialog";

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

const Admin = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const { toast } = useToast();

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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
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

    // If deactivating and has stripe product, archive on Stripe
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Admin" }, { label: "Produtos" }]} />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <ProductsTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSaved={handleSaved}
        />
      </main>
    </div>
  );
};

export default Admin;
