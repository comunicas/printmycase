import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Plus, Trash2, Upload, ChevronLeft, Image as ImageIcon, Eye, EyeOff } from "lucide-react";

interface Gallery {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  sort_order: number;
  active: boolean;
}

interface GalleryImage {
  id: string;
  gallery_id: string;
  url: string;
  label: string;
  sort_order: number;
  active: boolean;
}

const ImageGalleriesManager = () => {
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "gallery" | "image"; item: any } | null>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [uploading, setUploading] = useState(false);
  const zipRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const fetchGalleries = async () => {
    const { data } = await supabase.from("image_galleries").select("*").order("sort_order");
    setGalleries((data as Gallery[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchGalleries(); }, []);

  const fetchImages = async (galleryId: string) => {
    setImagesLoading(true);
    const { data } = await supabase.from("gallery_images").select("*").eq("gallery_id", galleryId).order("sort_order");
    setImages((data as GalleryImage[]) ?? []);
    setImagesLoading(false);
  };

  const handleSelectGallery = (g: Gallery) => {
    setSelectedGallery(g);
    fetchImages(g.id);
  };

  const handleCreateGallery = async () => {
    if (!newName.trim()) return;
    const slug = newSlug.trim() || newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const nextOrder = galleries.length > 0 ? Math.max(...galleries.map(g => g.sort_order)) + 1 : 0;
    const { error } = await supabase.from("image_galleries").insert({ name: newName.trim(), slug, sort_order: nextOrder });
    if (error) { toast({ title: "Erro ao criar galeria", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Galeria criada!" });
    setNewName(""); setNewSlug("");
    fetchGalleries();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "gallery") {
      await supabase.from("image_galleries").delete().eq("id", deleteTarget.item.id);
      toast({ title: "Galeria excluída" });
      if (selectedGallery?.id === deleteTarget.item.id) { setSelectedGallery(null); setImages([]); }
      fetchGalleries();
    } else {
      await supabase.from("gallery_images").delete().eq("id", deleteTarget.item.id);
      setImages(prev => prev.filter(i => i.id !== deleteTarget.item.id));
      toast({ title: "Imagem excluída" });
    }
    setDeleteTarget(null);
  };

  const handleZipUpload = async (file: File) => {
    if (!selectedGallery) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("gallery_id", selectedGallery.id);
      formData.append("file", file);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/upload-gallery-zip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro no upload");

      toast({ title: `${result.count} imagens adicionadas!` });
      fetchImages(selectedGallery.id);
    } catch (err: any) {
      toast({ title: "Erro no upload ZIP", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSingleUpload = async (file: File) => {
    if (!selectedGallery) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `galleries/${selectedGallery.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-assets").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
      const nextOrder = images.length > 0 ? Math.max(...images.map(i => i.sort_order)) + 1 : 0;
      await supabase.from("gallery_images").insert({ gallery_id: selectedGallery.id, url: urlData.publicUrl, label: file.name.replace(/\.[^.]+$/, ""), sort_order: nextOrder });
      toast({ title: "Imagem adicionada!" });
      fetchImages(selectedGallery.id);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (type: "gallery" | "image", id: string, active: boolean) => {
    const table = type === "gallery" ? "image_galleries" : "gallery_images";
    await supabase.from(table).update({ active }).eq("id", id);
    if (type === "gallery") {
      setGalleries(prev => prev.map(g => g.id === id ? { ...g, active } : g));
    } else {
      setImages(prev => prev.map(i => i.id === id ? { ...i, active } : i));
    }
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  // Gallery images detail view
  if (selectedGallery) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedGallery(null); setImages([]); }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">{selectedGallery.name}</h2>
          <span className="text-sm text-muted-foreground">({images.length} imagens)</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => zipRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" /> {uploading ? "Enviando..." : "Upload ZIP"}
          </Button>
          <Button variant="outline" onClick={() => imgRef.current?.click()} disabled={uploading}>
            <Plus className="w-4 h-4 mr-2" /> Imagem individual
          </Button>
          <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleZipUpload(f); e.target.value = ""; }} />
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSingleUpload(f); e.target.value = ""; }} />
        </div>

        {imagesLoading ? (
          <p className="text-muted-foreground">Carregando imagens...</p>
        ) : images.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">Nenhuma imagem. Envie um ZIP ou imagem individual.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map(img => (
              <div key={img.id} className={`relative group rounded-lg border overflow-hidden ${!img.active ? "opacity-40" : ""}`}>
                <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={() => toggleActive("image", img.id, !img.active)}>
                    {img.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => setDeleteTarget({ type: "image", item: img })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs truncate px-1 py-0.5 bg-background/80">{img.label}</p>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          title="Excluir?"
          description="Esta ação não pode ser desfeita."
          destructive
        />
      </div>
    );
  }

  // Gallery list view
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Galerias de Imagens (Customização)</h2>
      <p className="text-sm text-muted-foreground">
        Galerias de imagens pré-prontas que os usuários podem usar na tela de customização.
      </p>

      <div className="flex gap-2 items-end flex-wrap">
        <div className="space-y-1">
          <label className="text-xs font-medium">Nome</label>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Paisagens" className="w-48" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Slug</label>
          <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="auto" className="w-36" />
        </div>
        <Button onClick={handleCreateGallery} disabled={!newName.trim()}>
          <Plus className="w-4 h-4 mr-2" /> Criar Galeria
        </Button>
      </div>

      {galleries.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Nenhuma galeria criada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {galleries.map(g => (
            <div
              key={g.id}
              className={`rounded-lg border bg-card p-4 cursor-pointer hover:border-primary transition-colors ${!g.active ? "opacity-50" : ""}`}
              onClick={() => handleSelectGallery(g)}
            >
              <div className="flex items-center gap-3">
                {g.cover_image ? (
                  <img src={g.cover_image} alt={g.name} className="w-14 h-14 rounded-md object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">/{g.slug}</p>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive("gallery", g.id, !g.active)}>
                    {g.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: "gallery", item: g })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir galeria?"
        description="Todas as imagens desta galeria serão excluídas."
        destructive
      />
    </div>
  );
};

export default ImageGalleriesManager;
