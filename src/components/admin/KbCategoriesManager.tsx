import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/form-field";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface KbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  active: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const KbCategoriesManager = () => {
  const [items, setItems] = useState<KbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KbCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KbCategory | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kb_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => {
    setEditing(null); setName(""); setSlug(""); setIcon(""); setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (c: KbCategory) => {
    setEditing(c); setName(c.name); setSlug(c.slug);
    setIcon(c.icon ?? ""); setDescription(c.description ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const finalSlug = slug.trim() || slugify(name);
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from("kb_categories")
        .update({ name: name.trim(), slug: finalSlug, icon: icon.trim() || null, description: description.trim() || null })
        .eq("id", editing.id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria atualizada" });
    } else {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : 0;
      const { error } = await supabase.from("kb_categories")
        .insert({ name: name.trim(), slug: finalSlug, icon: icon.trim() || null, description: description.trim() || null, sort_order: maxOrder + 1 });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Categoria criada" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleToggle = async (c: KbCategory) => {
    await supabase.from("kb_categories").update({ active: !c.active }).eq("id", c.id);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("kb_categories").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Categoria excluída" }); fetchData(); }
    setDeleteTarget(null);
  };

  const handleMove = async (c: KbCategory, dir: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === c.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    await Promise.all([
      supabase.from("kb_categories").update({ sort_order: other.sort_order }).eq("id", c.id),
      supabase.from("kb_categories").update({ sort_order: c.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Categorias</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova Categoria</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {items.map((c, idx) => (
            <div key={c.id} className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!c.active ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5 mr-2">
                <button onClick={() => handleMove(c, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(c, "down")} disabled={idx === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">/{c.slug} {c.icon ? `• ${c.icon}` : ""}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleToggle(c)} title={c.active ? "Desativar" : "Ativar"}>
                  {c.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Nome" id="kb-cat-name" required>
              <Input id="kb-cat-name" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }} placeholder="Ex: Pedidos e Envio" />
            </FormField>
            <FormField label="Slug" id="kb-cat-slug" required>
              <Input id="kb-cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pedidos-envio" />
            </FormField>
            <FormField label="Ícone (Lucide)" id="kb-cat-icon">
              <Input id="kb-cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ex: Package, Sparkles, CreditCard" />
            </FormField>
            <FormField label="Descrição" id="kb-cat-desc">
              <Input id="kb-cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição da categoria" />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title={`Excluir "${deleteTarget?.name}"?`}
        description="Todos os artigos desta categoria serão excluídos. Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default KbCategoriesManager;
