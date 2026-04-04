import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface CoinPackage {
  id: string;
  coins: number;
  price_cents: number;
  badge: string | null;
  sort_order: number;
  active: boolean;
}

const CoinPackagesManager = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState<Record<string, Partial<CoinPackage>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coin_packages")
      .select("*")
      .order("sort_order");
    setPackages((data as CoinPackage[]) ?? []);
    setEdited({});
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const getVal = (pkg: CoinPackage, key: keyof CoinPackage) =>
    edited[pkg.id]?.[key] ?? pkg[key];

  const setField = (id: string, key: string, value: any) =>
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const hasChanges = Object.keys(edited).some((id) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return false;
    const e = edited[id];
    return Object.entries(e).some(([k, v]) => pkg[k as keyof CoinPackage] !== v);
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(edited)
        .filter(([id]) => packages.find((p) => p.id === id))
        .map(([id, changes]) =>
          supabase.from("coin_packages").update(changes).eq("id", id)
        );
      if (updates.length) await Promise.all(updates);
      toast({ title: "Pacotes salvos!" });
      fetch_();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const maxOrder = packages.reduce((m, p) => Math.max(m, p.sort_order), -1);
    const { error } = await supabase.from("coin_packages").insert({
      coins: 100,
      price_cents: 990,
      sort_order: maxOrder + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      fetch_();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("coin_packages").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pacote excluído" });
      fetch_();
    }
    setDeleteId(null);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }
  const { paginated, page, setPage, totalPages, totalItems } = usePagination(packages, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pacotes de moedas</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {paginated.map((pkg) => (
          <div key={pkg.id} className="grid grid-cols-[1fr_1fr_1fr_80px_60px_40px] gap-2 items-center border rounded-lg p-3 bg-card">
            <div className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground">Moedas</label>
              <Input
                type="number"
                value={getVal(pkg, "coins") as number}
                onChange={(e) => setField(pkg.id, "coins", parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground">Preço (centavos)</label>
              <Input
                type="number"
                value={getVal(pkg, "price_cents") as number}
                onChange={(e) => setField(pkg.id, "price_cents", parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground">Badge</label>
              <Input
                value={(getVal(pkg, "badge") as string) || ""}
                onChange={(e) => setField(pkg.id, "badge", e.target.value || null)}
                placeholder="Ex: Mais popular"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground">Ordem</label>
              <Input
                type="number"
                value={getVal(pkg, "sort_order") as number}
                onChange={(e) => setField(pkg.id, "sort_order", parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={getVal(pkg, "active") as boolean}
                  onChange={(e) => setField(pkg.id, "active", e.target.checked)}
                  className="rounded"
                />
                Ativo
              </label>
            </div>
            <div className="flex items-end pb-0.5">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(pkg.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} />

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir pacote?"
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default CoinPackagesManager;
