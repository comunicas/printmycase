import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Upload, Trash2, GripVertical } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  label: string;
  sort_order: number;
  active: boolean;
}

const EditableLabel = ({ value, onSave }: { value: string; onSave: (v: string) => void }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
      placeholder="Label (opcional)"
      className="flex-1 max-w-xs text-sm"
    />
  );
};

const GalleryImagesManager = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("product_gallery_images")
      .select("*")
      .order("sort_order");
    setImages((data as GalleryImage[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `gallery/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-assets").upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
      const nextOrder = images.length > 0 ? Math.max(...images.map(i => i.sort_order)) + 1 : 0;

      const { error: insertErr } = await supabase
        .from("product_gallery_images")
        .insert({ url: urlData.publicUrl, label: "", sort_order: nextOrder });
      if (insertErr) throw insertErr;

      toast({ title: "Imagem adicionada!" });
      fetchImages();
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const updateField = async (id: string, field: Partial<GalleryImage>) => {
    const { error } = await supabase.from("product_gallery_images").update(field).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...field } : img));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("product_gallery_images").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Imagem excluída" });
      setImages(prev => prev.filter(i => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    const promises = updated.map((img, i) =>
      supabase.from("product_gallery_images").update({ sort_order: i }).eq("id", img.id)
    );
    await Promise.all(promises);
    setImages(updated.map((img, i) => ({ ...img, sort_order: i })));
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Imagens Ilustrativas (Galeria Global)</h2>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Enviando..." : "Adicionar imagem"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Estas imagens aparecem em todos os produtos como referência ilustrativa (embalagem, material, etc.). Não afetam thumbnails.
      </p>

      {images.length === 0 && (
        <p className="text-muted-foreground text-center py-10">Nenhuma imagem cadastrada. Envie a primeira acima.</p>
      )}

      <div className="space-y-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="flex items-center gap-4 rounded-lg border bg-card p-3"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <GripVertical className="w-4 h-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === images.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            </div>

            <img
              src={img.url}
              alt={img.label || "Ilustrativa"}
              className="h-16 w-16 rounded-md border object-contain bg-background"
            />

            <EditableLabel
              value={img.label}
              onSave={(val) => updateField(img.id, { label: val })}
            />

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={img.active}
                  onChange={(e) => updateField(img.id, { active: e.target.checked })}
                  className="accent-primary w-4 h-4"
                />
                Ativa
              </label>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteTarget(img)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir imagem?"
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default GalleryImagesManager;
