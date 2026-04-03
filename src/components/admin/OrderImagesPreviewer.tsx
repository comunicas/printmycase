import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  customizationData: Record<string, any> | null;
}

interface ImageState {
  url: string | null;
  loading: boolean;
}

const OrderImagesPreviewer = ({ customizationData }: Props) => {
  const [raw, setRaw] = useState<ImageState>({ url: null, loading: true });
  const [optimized, setOptimized] = useState<ImageState>({ url: null, loading: true });
  const [final_, setFinal] = useState<ImageState>({ url: null, loading: true });
  const [preview, setPreview] = useState<ImageState>({ url: null, loading: true });
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const rawPath = customizationData?.raw_image_url as string | undefined;
  const optimizedPath = customizationData?.original_image_url as string | undefined;
  const finalPath = customizationData?.edited_image_url as string | undefined;
  const previewPath = customizationData?.preview_image_url as string | undefined;

  useEffect(() => {
    if (!rawPath && !optimizedPath && !finalPath && !previewPath) {
      setRaw({ url: null, loading: false });
      setOptimized({ url: null, loading: false });
      setFinal({ url: null, loading: false });
      setPreview({ url: null, loading: false });
      return;
    }

    const load = async () => {
      const [rawRes, optimRes, finalRes, previewRes] = await Promise.all([
        rawPath
          ? supabase.storage.from("customizations").createSignedUrl(rawPath, 3600)
          : Promise.resolve({ data: null, error: null }),
        optimizedPath
          ? supabase.storage.from("customizations").createSignedUrl(optimizedPath, 3600)
          : Promise.resolve({ data: null, error: null }),
        finalPath
          ? supabase.storage.from("customizations").createSignedUrl(finalPath, 3600)
          : Promise.resolve({ data: null, error: null }),
        previewPath
          ? supabase.storage.from("customizations").createSignedUrl(previewPath, 3600)
          : Promise.resolve({ data: null, error: null }),
      ]);

      setRaw({ url: rawRes.data?.signedUrl ?? null, loading: false });
      setOptimized({ url: optimRes.data?.signedUrl ?? null, loading: false });
      setFinal({ url: finalRes.data?.signedUrl ?? null, loading: false });
      setPreview({ url: previewRes.data?.signedUrl ?? null, loading: false });
    };

    load();
  }, [rawPath, optimizedPath, finalPath, previewPath]);

  if (!rawPath && !optimizedPath && !finalPath && !previewPath) return null;

  const items = [
    { label: "Original", state: raw, path: rawPath },
    { label: "Otimizada", state: optimized, path: optimizedPath },
    { label: "Imagem Posição", state: final_, path: finalPath },
    { label: "Preview", state: preview, path: previewPath },
  ];

  const handleDownload = async (url: string, label: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pedido-${label.toLowerCase().replace(/\s+/g, "-")}.${blob.type.includes("png") ? "png" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-2">
        {items.map(({ label, state, path }) => {
          if (!state.url && !state.loading) return null;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              {state.loading ? (
                <div className="w-16 h-24 rounded-md bg-muted animate-pulse" />
              ) : (
                <div className="relative group">
                  <button
                    onClick={() => state.url && setLightbox({ url: state.url, label })}
                    className="block rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors"
                  >
                    <img
                      src={state.url!}
                      alt={label}
                      width={64}
                      height={96}
                      className="w-16 h-24 object-cover"
                      loading="lazy"
                    />
                  </button>
                  {path && state.url && (
                    <a
                      href={state.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-lg p-4">
          {lightbox && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium">{lightbox.label}</p>
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => handleDownload(lightbox.url, lightbox.label)}
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </Button>
                <a href={lightbox.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Nova aba
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderImagesPreviewer;
