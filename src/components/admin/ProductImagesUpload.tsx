import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface Props {
  productId: string | null;
  value: string[];
  onChange: (urls: string[]) => void;
}

const ProductImagesUpload = ({ productId, value, onChange }: Props) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast({ title: "Selecione imagens válidas", variant: "destructive" });
      return;
    }

    const id = productId || crypto.randomUUID();
    setUploading(true);

    try {
      const newUrls: string[] = [];
      const startIndex = value.length;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split(".").pop() || "png";
        const path = `${id}/gallery-${startIndex + i}-${Date.now()}.${ext}`;

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
      toast({ title: `${newUrls.length} imagem(ns) enviada(s)!` });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt={`Galeria ${i + 1}`}
                className="h-24 w-full rounded-md border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        {uploading ? (
          <p className="text-sm">Enviando...</p>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <p className="text-sm">Clique ou arraste imagens da galeria</p>
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
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ProductImagesUpload;
