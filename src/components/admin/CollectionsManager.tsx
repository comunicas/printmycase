import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { Tables } from "@/integrations/supabase/types";
import { optimizeForUpload } from "@/lib/image-utils";

type Collection = Tables<"collections">;

const CollectionsManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order");
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setCollections(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const openNew = () => {
    setEditing(null);
    setName(""); setSlug(""); setDescription(""); setCoverImage(""); setSortOrder(0);
    setDialogOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setName(c.name); setSlug(c.slug); setDescription(c.description || ""); setCoverImage(c.cover_image || ""); setSortOrder(c.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({ title: "Nome e slug são obrigatórios", variant: "destructive" });
      return;
    }
    const payload = { name: name.trim(), slug: slug.trim(), description: description.trim() || null, cover_image: coverImage.trim() || null, sort_order: sortOrder };

    if (editing) {
      const { error } = await supabase.from("collections").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Coleção atualizada" });
    } else {
      const { error } = await supabase.from("collections").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Coleção criada" });
    }
    setDialogOpen(false);
    fetchCollections();
  };

  const handleToggleActive = async (c: Collection) => {
    await supabase.from("collections").update({ active: !c.active }).eq("id", c.id);
    fetchCollections();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("collections").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Coleção excluída" });
    setDeleteTarget(null);
    fetchCollections();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `collections/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-assets").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("product-assets").getPublicUrl(path);
    setCoverImage(publicUrl);
  };

  const autoSlug = (val: string) => {
    setName(val);
    if (!editing) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Coleções</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova Coleção</Button>
      </div>

      {loading ? <LoadingSpinner /> : collections.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma coleção cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {collections.map((c) => (
            <div key={c.id} className="border rounded-xl p-4 bg-card flex items-center gap-4">
              {c.cover_image && <img src={c.cover_image} alt={c.name} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug} · Ordem: {c.sort_order}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleToggleActive(c)} title={c.active ? "Desativar" : "Ativar"}>
                  {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Coleção" : "Nova Coleção"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => autoSlug(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              />
            </div>
            <div>
              <Label>Imagem de capa</Label>
              {coverImage && <img src={coverImage} alt="cover" className="w-full h-32 object-cover rounded-lg mb-2" />}
              <Input type="file" accept="image/*" onChange={handleCoverUpload} />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
            <Button className="w-full" onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir coleção?"
        description={`"${deleteTarget?.name}" e todos os seus designs serão excluídos permanentemente.`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
};

export default CollectionsManager;
