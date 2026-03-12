import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AiImageGenerator, { type AiSetup } from "@/components/admin/AiImageGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Copy, ArrowRightCircle, ImagePlus, Maximize2, Settings2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

const PAGE_SIZE = 12;

interface AiGenImage {
  id: string;
  url: string;
  prompt: string;
  seed: number | null;
  image_size: string;
  image_urls: string[];
  safety_tolerance: number;
  output_format: string;
  created_at: string;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  images: string[] | null;
}

const AiGenerationsManager = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<AiGenImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AiGenImage | null>(null);
  const [lightboxImage, setLightboxImage] = useState<AiGenImage | null>(null);
  const [addToProductImage, setAddToProductImage] = useState<AiGenImage | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [setupToLoad, setSetupToLoad] = useState<AiSetup | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const fetchImages = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const from = reset ? 0 : offsetRef.current;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("ai_generated_images")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    const rows = (data as unknown as AiGenImage[]) ?? [];

    if (reset) {
      setImages(rows);
    } else {
      setImages((prev) => [...prev, ...rows]);
    }

    offsetRef.current = from + rows.length;
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [loading]);

  // Initial load
  useEffect(() => {
    fetchImages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchImages(false);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchImages]);

  const handleGenerated = () => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchImages(true);
  };

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
    const { data: maxRow } = await supabase
      .from("product_gallery_images")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = ((maxRow as { sort_order: number } | null)?.sort_order ?? -1) + 1;

    const { error } = await supabase
      .from("product_gallery_images")
      .insert({ url: img.url, label: "", sort_order: nextOrder });
    if (error) {
      toast({ title: "Erro ao mover", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Imagem adicionada à galeria ilustrativa!" });
  };

  const openAddToProduct = async (img: AiGenImage) => {
    setAddToProductImage(img);
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, images")
      .order("name");
    setProducts((data as ProductOption[]) ?? []);
    setLoadingProducts(false);
  };

  const addImageToProduct = async (product: ProductOption) => {
    if (!addToProductImage) return;
    const currentImages = product.images ?? [];
    const { error } = await supabase
      .from("products")
      .update({ images: [...currentImages, addToProductImage.url] })
      .eq("id", product.id);
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Imagem adicionada ao produto "${product.name}"!` });
    setAddToProductImage(null);
  };

  const copySetup = (img: AiGenImage) => {
    const setup: AiSetup = {
      prompt: img.prompt,
      seed: img.seed != null ? String(img.seed) : "",
      imageSize: img.image_size,
      safetyTolerance: img.safety_tolerance ?? 2,
      outputFormat: (img.output_format === "jpeg" ? "jpeg" : "png"),
      imageUrls: img.image_urls ?? [],
    };
    setSetupToLoad(setup);
    setLightboxImage(null);
  };

  return (
    <div className="space-y-6">
      <AiImageGenerator
        onGenerated={handleGenerated}
        initialSetup={setupToLoad}
        onSetupConsumed={() => setSetupToLoad(null)}
      />

      <h2 className="text-xl font-semibold">Imagens Geradas</h2>

      {images.length === 0 && !loading && (
        <p className="text-muted-foreground text-center py-10">Nenhuma geração ainda. Use o formulário acima.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="rounded-lg border bg-card overflow-hidden">
            <button
              type="button"
              className="w-full relative group cursor-zoom-in"
              onClick={() => setLightboxImage(img)}
            >
              <img src={img.url} alt="" className="w-full h-48 object-contain bg-background" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
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
                <Button variant="outline" size="sm" className="flex-1" onClick={() => copySetup(img)}>
                  <Settings2 className="h-4 w-4 mr-1" /> Setup
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => moveToGallery(img)}>
                  <ArrowRightCircle className="h-4 w-4 mr-1" /> Galeria
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openAddToProduct(img)}>
                  <ImagePlus className="h-4 w-4 mr-1" /> Produto
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

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />
      {loading && <LoadingSpinner />}

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(o) => !o && setLightboxImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizar imagem</DialogTitle>
            <DialogDescription>Imagem gerada por IA em tamanho completo</DialogDescription>
          </DialogHeader>
          {lightboxImage && (
            <div className="flex flex-col gap-3">
              <img
                src={lightboxImage.url}
                alt=""
                className="w-full max-h-[70vh] object-contain rounded"
              />
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{lightboxImage.prompt}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{lightboxImage.image_size}</span>
                  {lightboxImage.seed != null && (
                    <button
                      type="button"
                      onClick={() => copySeed(lightboxImage.seed!)}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" /> Seed: {lightboxImage.seed}
                    </button>
                  )}
                  <span>{new Date(lightboxImage.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => copySetup(lightboxImage)} className="mt-2">
                  <Settings2 className="h-4 w-4 mr-1" /> Copiar Setup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add to Product Dialog */}
      <Dialog open={!!addToProductImage} onOpenChange={(o) => !o && setAddToProductImage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar a Produto</DialogTitle>
            <DialogDescription>Selecione o produto para adicionar esta imagem.</DialogDescription>
          </DialogHeader>
          {loadingProducts ? (
            <p className="text-muted-foreground text-center py-4">Carregando produtos...</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addImageToProduct(p)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-sm"
                >
                  {p.name}
                </button>
              ))}
              {products.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhum produto encontrado.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
