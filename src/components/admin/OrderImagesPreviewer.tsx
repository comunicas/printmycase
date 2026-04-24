import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Download, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSafeZonePreset } from "@/lib/safe-zone-presets";
import type { OrderCustomizationData } from "@/types/customization";

interface Props {
  customizationData: OrderCustomizationData | null;
  deviceSlug?: string;
}

/** Overlay matching PhonePreview's safe zone — drawn on top of an image
 *  whose container has aspect-[260/532] so percentages line up correctly. */
const SafeZoneOverlay = ({ deviceSlug, mobile = false }: { deviceSlug?: string; mobile?: boolean }) => {
  const preset = getSafeZonePreset(deviceSlug);
  const radius = mobile ? (preset.mobileRadius ?? preset.radius) : preset.radius;
  const bottomRadius = mobile ? (preset.mobileBottomRadius ?? preset.bottomRadius) : preset.bottomRadius;
  return (
    <div
      className="pointer-events-none absolute z-10 border border-foreground bg-foreground/30 box-border"
      aria-hidden="true"
      style={{
        left: preset.width ? (preset.insetX ?? "5%") : preset.insetX,
        right: preset.width ? "auto" : preset.insetX,
        width: preset.width,
        top: preset.top,
        height: preset.height,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomLeftRadius: preset.width ? radius : bottomRadius,
        borderBottomRightRadius: preset.width ? radius : bottomRadius,
        borderColor: "hsl(var(--foreground))",
      }}
    />
  );
};

interface ImageState {
  url: string | null;
  loading: boolean;
  error?: string | null;
}

const OrderImagesPreviewer = ({ customizationData, deviceSlug }: Props) => {
  const [raw, setRaw] = useState<ImageState>({ url: null, loading: true });
  const [optimized, setOptimized] = useState<ImageState>({ url: null, loading: true });
  const [final_, setFinal] = useState<ImageState>({ url: null, loading: true });
  const [preview, setPreview] = useState<ImageState>({ url: null, loading: true });
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const rawPath = customizationData?.rawImageUrl ?? undefined;
  const optimizedPath = customizationData?.originalImageUrl ?? undefined;
  const finalPath = customizationData?.editedImageUrl ?? undefined;
  const previewPath = customizationData?.previewImageUrl ?? undefined;

  useEffect(() => {
    if (!rawPath && !optimizedPath && !finalPath && !previewPath) {
      setRaw({ url: null, loading: false });
      setOptimized({ url: null, loading: false });
      setFinal({ url: null, loading: false });
      setPreview({ url: null, loading: false });
      return;
    }

    const sign = async (path: string | undefined, label: string) => {
      if (!path) return { data: null, error: null };
      const res = await supabase.storage.from("customizations").createSignedUrl(path, 3600);
      if (res.error) {
        console.error(`[OrderImagesPreviewer] Falha ao assinar URL "${label}" (${path}):`, res.error);
      }
      return res;
    };

    const load = async () => {
      const [rawRes, optimRes, finalRes, previewRes] = await Promise.all([
        sign(rawPath, "Original"),
        sign(optimizedPath, "Otimizada"),
        sign(finalPath, "Recorte"),
        sign(previewPath, "Imagem Posição"),
      ]);

      setRaw({ url: rawRes.data?.signedUrl ?? null, loading: false, error: rawRes.error?.message ?? null });
      setOptimized({ url: optimRes.data?.signedUrl ?? null, loading: false, error: optimRes.error?.message ?? null });
      setFinal({ url: finalRes.data?.signedUrl ?? null, loading: false, error: finalRes.error?.message ?? null });
      setPreview({ url: previewRes.data?.signedUrl ?? null, loading: false, error: previewRes.error?.message ?? null });
    };

    load();
  }, [rawPath, optimizedPath, finalPath, previewPath]);

  if (!rawPath && !optimizedPath && !finalPath && !previewPath) {
    return (
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Imagens da customização</p>
        <p className="text-xs text-muted-foreground italic">Sem imagens disponíveis para este pedido.</p>
      </div>
    );
  }

  const items = [
    { label: "Original", state: raw, path: rawPath },
    { label: "Otimizada", state: optimized, path: optimizedPath },
    { label: "Recorte", state: final_, path: finalPath },
    { label: "Imagem Posição", state: preview, path: previewPath },
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
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Imagens da customização</p>
        <div className="flex gap-2 flex-wrap">
        {items.map(({ label, state, path }) => {
          if (!path) return null;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              {state.loading ? (
                <div className="w-16 h-24 rounded-md bg-muted animate-pulse" />
              ) : !state.url ? (
                <div
                  className="w-16 h-24 rounded-md border border-destructive/40 bg-destructive/5 flex items-center justify-center"
                  title={`Falha ao carregar (${path})${state.error ? `: ${state.error}` : ""}`}
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
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
