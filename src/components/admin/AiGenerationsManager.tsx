import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AiImageGenerator from "@/components/admin/AiImageGenerator";
import { Trash2, Copy, ArrowRightCircle } from "lucide-react";

interface AiGenImage {
  id: string;
  url: string;
  prompt: string;
  seed: number | null;
  image_size: string;
  created_at: string;
}

const AiGenerationsManager = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<AiGenImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AiGenImage | null>(null);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("ai_generated_images")
      .select("*")
      .order("created_at", { ascending: false });
    setImages((data as AiGenImage[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("ai_generated_images").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Imagem excluída" });
      setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const copySeed = (seed: number) => {
    navigator.clipboard.writeText(String(seed));
    toast({ title: `Seed ${seed} copiado!` });
  };

  const moveToGallery = async (img: AiGenImage) => {
    // Get next sort_order
    const { data: maxRow } = await supabase
      .from("product_gallery_images")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = ((maxRow as any)?.sort_order ?? -1) + 1;

    const { error } = await supabase
      .from("product_gallery_images")
      .insert({ url: img.url, label: "", sort_order: nextOrder });
    if (error) {
      toast({ title: "Erro ao mover", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Imagem adicionada à galeria ilustrativa!" });
  };

  return (
    <div className="space-y-6">
      <AiImageGenerator onGenerated={fetchImages} />

      <h2 className="text-xl font-semibold">Imagens Geradas</h2>

      {loading && <p className="text-muted-foreground">Carregando...</p>}

      {!loading && images.length === 0 && (
        <p className="text-muted-foreground text-center py-10">Nenhuma geração ainda. Use o formulário acima.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="rounded-lg border bg-card overflow-hidden">
            <img src={img.url} alt="" className="w-full h-48 object-contain bg-background" />
            <div className="p-3 space-y-2">
              <p className="text-sm line-clamp-2" title={img.prompt}>{img.prompt}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{img.image_size}</span>
                {img.seed != null && (
                  <>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => copySeed(img.seed!)}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" /> {img.seed}
                    </button>
                  </>
                )}
                <span>·</span>
                <span>{new Date(img.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => moveToGallery(img)}
                >
                  <ArrowRightCircle className="h-4 w-4 mr-1" /> Mover p/ Galeria
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(img)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Excluir imagem gerada?"
        description="Esta ação não pode ser desfeita."
        destructive
      />
    </div>
  );
};

export default AiGenerationsManager;
