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

interface KbArticle {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  content: string;
  sort_order: number;
  active: boolean;
}

interface KbCategory {
  id: string;
  name: string;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const KbArticlesManager = () => {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KbArticle | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KbArticle | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: cats }, { data: arts }] = await Promise.all([
      supabase.from("kb_categories").select("id, name").order("sort_order", { ascending: true }),
      supabase.from("kb_articles").select("*").order("sort_order", { ascending: true }),
    ]);
    setCategories(cats ?? []);
    setArticles(arts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filterCat ? articles.filter((a) => a.category_id === filterCat) : articles;

  const openNew = () => {
    setEditing(null); setTitle(""); setSlug(""); setContent("");
    setCategoryId(categories[0]?.id ?? "");
    setDialogOpen(true);
  };

  const openEdit = (a: KbArticle) => {
    setEditing(a); setTitle(a.title); setSlug(a.slug);
    setContent(a.content); setCategoryId(a.category_id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !categoryId) return;
    const finalSlug = slug.trim() || slugify(title);
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from("kb_articles")
        .update({ title: title.trim(), slug: finalSlug, content, category_id: categoryId })
        .eq("id", editing.id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Artigo atualizado" });
    } else {
      const sameCategory = articles.filter((a) => a.category_id === categoryId);
      const maxOrder = sameCategory.length > 0 ? Math.max(...sameCategory.map((a) => a.sort_order)) : 0;
      const { error } = await supabase.from("kb_articles")
        .insert({ title: title.trim(), slug: finalSlug, content, category_id: categoryId, sort_order: maxOrder + 1 });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Artigo criado" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleToggle = async (a: KbArticle) => {
    await supabase.from("kb_articles").update({ active: !a.active }).eq("id", a.id);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("kb_articles").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Artigo excluído" }); fetchData(); }
    setDeleteTarget(null);
  };

  const handleMove = async (a: KbArticle, dir: "up" | "down") => {
    const list = filtered;
    const idx = list.findIndex((x) => x.id === a.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const other = list[swapIdx];
    await Promise.all([
      supabase.from("kb_articles").update({ sort_order: other.sort_order }).eq("id", a.id),
      supabase.from("kb_articles").update({ sort_order: a.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  const { paginated: paginatedArticles, page, setPage, totalPages, totalItems } = usePagination(filtered, 10);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Artigos</h2>
        <Button onClick={openNew} disabled={categories.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Novo Artigo
        </Button>
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button size="sm" variant={filterCat === "" ? "default" : "outline"} onClick={() => setFilterCat("")}>Todos</Button>
          {categories.map((c) => (
            <Button key={c.id} size="sm" variant={filterCat === c.id ? "default" : "outline"} onClick={() => setFilterCat(c.id)}>
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum artigo cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {paginatedArticles.map((a) => {
            const globalIdx = filtered.findIndex((x) => x.id === a.id);
            return (
            <div key={a.id} className={`border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3 ${!a.active ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5 mr-2">
                <button onClick={() => handleMove(a, "up")} disabled={globalIdx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(a, "down")} disabled={globalIdx === filtered.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{catName(a.category_id)} • /{a.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => handleToggle(a)} title={a.active ? "Desativar" : "Ativar"}>
                  {a.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(a)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Categoria" id="kb-art-cat" required>
              <select
                id="kb-art-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Título" id="kb-art-title" required>
              <Input id="kb-art-title" value={title} onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }} placeholder="Ex: Como rastrear meu pedido?" />
            </FormField>
            <FormField label="Slug" id="kb-art-slug" required>
              <Input id="kb-art-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="como-rastrear-meu-pedido" />
            </FormField>
            <FormField label="Conteúdo (Markdown)" id="kb-art-content" required>
              <textarea
                id="kb-art-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do artigo em Markdown..."
                rows={12}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim() || !categoryId}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title={`Excluir "${deleteTarget?.title}"?`}
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default KbArticlesManager;
