import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ArrowUp, ArrowDown } from "lucide-react";
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
import { slugify } from "@/lib/slug";

type Collection = Tables<"collections">;
type Design = Tables<"collection_designs">;

const MAX_EXTRA_IMAGES = 10;

const centsToReais = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const reaisToCents = (val: string): number => {
  const cleaned = val.replace(/[^\d,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
};

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
  const [priceInput, setPriceInput] = useState("49,90");
  const [sortOrder, setSortOrder] = useState(0);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string; image?: string; price?: string }>({});

  useEffect(() => {
    supabase.from("collections").select("*").order("sort_order").then(({ data }) => {
      const cols = data ?? [];
      setCollections(cols);
      setSelectedCollectionId((prev) => prev || (cols[0]?.id ?? ""));
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
    setPriceInput("49,90"); setSortOrder(0); setErrors({});
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
    setPriceInput(centsToReais(d.price_cents));
    setSortOrder(d.sort_order);
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Nome obrigatório";
    if (!slug.trim()) next.slug = "Slug obrigatório";
    if (!imageUrl.trim()) next.image = "Imagem de capa obrigatória";
    const cents = reaisToCents(priceInput);
    if (cents <= 0) next.price = "Preço deve ser maior que zero";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      collection_id: selectedCollectionId,
      name: name.trim(),
      slug: slugify(slug),
      description: description.trim() || null,
      image_url: imageUrl.trim(),
      images: extraImages,
      price_cents: reaisToCents(priceInput),
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
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    }
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = MAX_EXTRA_IMAGES - extraImages.length;
    if (remaining <= 0) {
      toast({ title: `Limite de ${MAX_EXTRA_IMAGES} imagens atingido`, variant: "destructive" });
      e.target.value = "";
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast({ title: `Apenas ${remaining} imagem(ns) será(ão) adicionada(s)`, description: `Limite máximo: ${MAX_EXTRA_IMAGES}` });
    }
    setUploadingExtra(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
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

  const moveExtraImage = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= extraImages.length) return;
    const next = [...extraImages];
    [next[idx], next[target]] = [next[target], next[idx]];
    setExtraImages(next);
  };

  const autoSlug = (val: string) => {
    setName(val);
    if (!editing) setSlug(slugify(val));
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const extraCount = extraImages.length;
  const extraFull = extraCount >= MAX_EXTRA_IMAGES;

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
              <Label>Nome *</Label>
              <Input value={name} onChange={(e) => autoSlug(e.target.value)} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <Input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setErrors((p) => ({ ...p, slug: undefined })); }}
                aria-invalid={!!errors.slug}
              />
              <p className="text-xs text-muted-foreground mt-1">URL: /colecao/.../{slug || "..."}</p>
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
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
              {imageUrl && (
                <div className="relative mb-2">
                  <img src={imageUrl} alt="capa" className="w-full h-40 object-cover rounded-lg" />
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">CAPA</span>
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleCoverUpload} aria-invalid={!!errors.image} />
              {errors.image && <p className="text-xs text-destructive mt-1">{errors.image}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Imagens adicionais (galeria)</Label>
                <span className={`text-xs ${extraFull ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {extraCount}/{MAX_EXTRA_IMAGES}
                </span>
              </div>
              {extraImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {extraImages.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative aspect-square rounded-md overflow-hidden border group">
                      <img src={url} alt={`extra ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveExtraImage(i, -1)}
                          disabled={i === 0}
                          className="p-1 text-white disabled:opacity-30 hover:bg-white/10"
                          aria-label="Mover para esquerda"
                        >
                          <ArrowUp className="h-3 w-3 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExtraImage(i, 1)}
                          disabled={i === extraImages.length - 1}
                          className="p-1 text-white disabled:opacity-30 hover:bg-white/10"
                          aria-label="Mover para direita"
                        >
                          <ArrowDown className="h-3 w-3 -rotate-90" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExtraImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:opacity-90"
                        aria-label="Remover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute top-1 left-1 bg-background/80 text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraUpload}
                disabled={uploadingExtra || extraFull}
              />
              {uploadingExtra && <p className="text-xs text-muted-foreground mt-1">Enviando...</p>}
              {extraFull && <p className="text-xs text-destructive mt-1">Limite máximo de {MAX_EXTRA_IMAGES} imagens atingido.</p>}
            </div>
            <div>
              <Label>Preço (R$) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => { setPriceInput(e.target.value); setErrors((p) => ({ ...p, price: undefined })); }}
                  className="pl-9"
                  placeholder="49,90"
                  aria-invalid={!!errors.price}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reaisToCents(priceInput) > 0 ? `${formatPrice(reaisToCents(priceInput) / 100)} (${reaisToCents(priceInput)} centavos)` : "Digite no formato 49,90"}
              </p>
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">Menor número aparece primeiro.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
            </div>
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
