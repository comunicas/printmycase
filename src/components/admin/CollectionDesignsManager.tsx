import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatPrice } from "@/lib/types";
import type { Tables } from "@/integrations/supabase/types";
import { optimizeForUpload } from "@/lib/image-utils";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/usePagination";

type Collection = Tables<"collections">;
type Design = Tables<"collection_designs">;

const slugify = (val: string) =>
  val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CollectionDesignsManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Design | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Design | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [priceCents, setPriceCents] = useState(4990);
  const [sortOrder, setSortOrder] = useState(0);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  useEffect(() => {
    supabase.from("collections").select("*").order("sort_order").then(({ data }) => {
      const cols = data ?? [];
      setCollections(cols);
      if (cols.length > 0 && !selectedCollectionId) setSelectedCollectionId(cols[0].id);
      setLoading(false);
    });
  }, []);

  const fetchDesigns = useCallback(async () => {
    if (!selectedCollectionId) return;
    setLoading(true);
    const { data } = await supabase
      .from("collection_designs")
      .select("*")
      .eq("collection_id", selectedCollectionId)
      .order("sort_order");
    setDesigns(data ?? []);
    setLoading(false);
  }, [selectedCollectionId]);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  const { paginated: paginatedDesigns, page: designPage, setPage: setDesignPage, totalPages: designTotalPages, totalItems: designTotalItems } = usePagination(designs, 12);

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setImageUrl(""); setExtraImages([]);
    setPriceCents(4990); setSortOrder(0);
  };

  const openNew = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (d: Design) => {
    setEditing(d);
    setName(d.name);
    setSlug(d.slug);
    setDescription(d.description ?? "");
    setImageUrl(d.image_url);
    setExtraImages(d.images ?? []);
    setPriceCents(d.price_cents);
    setSortOrder(d.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim() || !imageUrl.trim()) {
      toast({ title: "Preencha nome, slug e imagem de capa", variant: "destructive" });
      return;
    }
    const payload = {
      collection_id: selectedCollectionId,
      name: name.trim(),
      slug: slugify(slug),
      description: description.trim() || null,
      image_url: imageUrl.trim(),
      images: extraImages,
      price_cents: priceCents,
      sort_order: sortOrder,
    };

    if (editing) {
      const { error } = await supabase.from("collection_designs").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Design atualizado" });
    } else {
      const { error } = await supabase.from("collection_designs").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Design criado" });
    }
    setDialogOpen(false);
    fetchDesigns();
  };

  const handleToggleActive = async (d: Design) => {
    await supabase.from("collection_designs").update({ active: !d.active }).eq("id", d.id);
    fetchDesigns();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("collection_designs").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Design excluído" });
    setDeleteTarget(null);
    fetchDesigns();
  };

  const uploadOne = async (file: File): Promise<string> => {
    const blob = await optimizeForUpload(file);
    const path = `collections/designs/${Date.now()}-${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from("product-assets").upload(path, blob, { contentType: "image/webp" });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("product-assets").getPublicUrl(path);
    return publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadOne(file);
      setImageUrl(url);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    }
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingExtra(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        urls.push(await uploadOne(file));
      }
      setExtraImages([...extraImages, ...urls]);
      toast({ title: `${urls.length} imagem(ns) adicionada(s)` });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingExtra(false);
      e.target.value = "";
    }
  };

  const removeExtraImage = (idx: number) => {
    setExtraImages(extraImages.filter((_, i) => i !== idx));
  };

  const autoSlug = (val: string) => {
    setName(val);
    if (!editing) setSlug(slugify(val));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Designs</h2>
        <Button onClick={openNew} disabled={!selectedCollectionId}><Plus className="mr-2 h-4 w-4" /> Novo Design</Button>
      </div>

      <div className="mb-6">
        <Label>Coleção</Label>
        <select
          value={selectedCollectionId}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : designs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum design nesta coleção.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paginatedDesigns.map((d) => (
              <div key={d.id} className="border rounded-xl overflow-hidden bg-card">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={d.image_url} alt={d.name} width={300} height={300} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                  <p className="text-sm font-bold text-foreground">{formatPrice(d.price_cents / 100)}</p>
                  {d.images?.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">+{d.images.length} foto(s)</p>
                  )}
                  <div className="flex gap-1 pt-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleActive(d)}>
                      {d.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDeleteTarget(d)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={designPage} totalPages={designTotalPages} onPageChange={setDesignPage} totalItems={designTotalItems} />
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Design" : "Novo Design"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => autoSlug(e.target.value)} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Conte a história/inspiração do design, materiais, dicas de uso..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label>Imagem de capa *</Label>
              {imageUrl && <img src={imageUrl} alt="capa" className="w-full h-40 object-cover rounded-lg mb-2" />}
              <Input type="file" accept="image/*" onChange={handleCoverUpload} />
            </div>
            <div>
              <Label>Imagens adicionais (galeria)</Label>
              {extraImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {extraImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={url} alt={`extra ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExtraImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:opacity-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input type="file" accept="image/*" multiple onChange={handleExtraUpload} disabled={uploadingExtra} />
              {uploadingExtra && <p className="text-xs text-muted-foreground mt-1">Enviando...</p>}
            </div>
            <div>
              <Label>Preço (centavos)</Label>
              <Input type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">{formatPrice(priceCents / 100)}</p>
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
        title="Excluir design?"
        description={`"${deleteTarget?.name}" será excluído permanentemente.`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
};

export default CollectionDesignsManager;
