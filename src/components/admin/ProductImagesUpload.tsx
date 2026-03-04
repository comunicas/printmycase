import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface StorageImage {
  url: string;
  name: string;
}

interface Props {
  productId: string | null;
  value: string[];
  onChange: (urls: string[]) => void;
}

const IGNORED_FILES = new Set([".emptyFolderPlaceholder"]);

const ProductImagesUpload = ({ productId, value, onChange }: Props) => {
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data: folders, error } = await supabase.storage
        .from("product-assets")
        .list("", { limit: 500 });
      if (error) throw error;

      const images: StorageImage[] = [];

      for (const item of folders || []) {
        if (IGNORED_FILES.has(item.name)) continue;

        // List files inside each folder
        const { data: files } = await supabase.storage
          .from("product-assets")
          .list(item.name, { limit: 200 });

        for (const file of files || []) {
          if (!file.name || IGNORED_FILES.has(file.name)) continue;
          const path = `${item.name}/${file.name}`;
          const { data } = supabase.storage
            .from("product-assets")
            .getPublicUrl(path);
          images.push({ url: data.publicUrl, name: file.name });
        }
      }

      setAllImages(images);
    } catch (err: any) {
      toast({ title: "Erro ao carregar imagens", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const toggleImage = (url: string) => {
    if (value.includes(url)) {
      onChange(value.filter((v) => v !== url));
    } else {
      onChange([...value, url]);
    }
  };

  const handleUpload = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const id = productId || crypto.randomUUID();
    setUploading(true);

    try {
      const newUrls: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

        const { error } = await supabase.storage
          .from("product-assets")
          .upload(path, file, { upsert: true });
        if (error) throw error;

        const { data } = supabase.storage
          .from("product-assets")
          .getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      onChange([...value, ...newUrls]);
      await fetchImages();
      toast({ title: `${newUrls.length} imagem(ns) enviada(s)!` });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner variant="inline" className="py-4" />;

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} imagem(ns) selecionada(s)</p>
      )}

      {allImages.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto rounded-md border border-border p-2">
          {allImages.map(({ url, name }) => {
            const selected = value.includes(url);
            return (
              <button
                key={url}
                type="button"
                onClick={() => toggleImage(url)}
                className={`relative flex flex-col items-center rounded-md overflow-hidden border-2 transition-all ${
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/40"
                }`}
              >
                <img src={url} alt={name} className="h-20 w-full object-cover" />
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <Check className="h-5 w-5 text-primary-foreground drop-shadow" />
                  </div>
                )}
                <span className="w-full truncate px-1 py-0.5 text-[10px] text-muted-foreground text-center">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma imagem no storage.</p>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-3 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        {uploading ? (
          <p className="text-sm">Enviando...</p>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <p className="text-sm">Enviar nova imagem ao storage</p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ProductImagesUpload;
