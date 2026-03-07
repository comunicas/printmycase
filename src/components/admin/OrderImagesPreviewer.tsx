import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PHONE_W, PHONE_H } from "@/lib/customize-types";
import { renderSnapshot } from "@/lib/image-utils";

interface Props {
  customizationData: Record<string, any> | null;
}

interface ImageState {
  url: string | null;
  loading: boolean;
}

const OrderImagesPreviewer = ({ customizationData }: Props) => {
  const [original, setOriginal] = useState<ImageState>({ url: null, loading: true });
  const [edited, setEdited] = useState<ImageState>({ url: null, loading: true });
  const [preview, setPreview] = useState<ImageState>({ url: null, loading: true });
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const originalPath = customizationData?.original_image_url as string | undefined;
  const editedPath = customizationData?.edited_image_url as string | undefined;

  useEffect(() => {
    if (!originalPath && !editedPath) {
      setOriginal({ url: null, loading: false });
      setEdited({ url: null, loading: false });
      setPreview({ url: null, loading: false });
      return;
    }

    const load = async () => {
      // Generate signed URLs in parallel
      const [origResult, editResult] = await Promise.all([
        originalPath
          ? supabase.storage.from("customizations").createSignedUrl(originalPath, 3600)
          : Promise.resolve({ data: null, error: null }),
        editedPath
          ? supabase.storage.from("customizations").createSignedUrl(editedPath, 3600)
          : Promise.resolve({ data: null, error: null }),
      ]);

      const origUrl = origResult.data?.signedUrl ?? null;
      const editUrl = editResult.data?.signedUrl ?? null;

      setOriginal({ url: origUrl, loading: false });
      setEdited({ url: editUrl, loading: false });

      // Generate phone-frame preview from edited image
      if (editUrl) {
        try {
          const scale = customizationData?.scale ?? 100;
          const position = customizationData?.position ?? { x: 50, y: 50 };
          const rotation = customizationData?.rotation ?? 0;
          const snapshot = await renderSnapshot(editUrl, scale, position, rotation);
          setPreview({ url: snapshot, loading: false });
        } catch {
          setPreview({ url: null, loading: false });
        }
      } else {
        setPreview({ url: null, loading: false });
      }
    };

    load();
  }, [originalPath, editedPath, customizationData?.scale, customizationData?.position?.x, customizationData?.position?.y, customizationData?.rotation]);

  if (!originalPath && !editedPath) return null;

  const items = [
    { label: "Original", state: original, path: originalPath },
    { label: "Editada", state: edited, path: editedPath },
    { label: "Preview", state: preview, path: null },
  ];

  return (
    <>
      <div className="flex gap-2 mt-2">
        {items.map(({ label, state, path }) => {
          if (!state.url && !state.loading) return null;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              {state.loading ? (
                <div className="w-14 h-20 rounded-md bg-muted animate-pulse" />
              ) : (
                <div className="relative group">
                  <button
                    onClick={() => state.url && setLightbox({ url: state.url, label })}
                    className="block rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors"
                  >
                    <img
                      src={state.url!}
                      alt={label}
                      className={`object-cover ${label === "Preview" ? "w-[42px] h-[86px]" : "w-14 h-20"}`}
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
        <DialogContent className="max-w-lg p-2">
          {lightbox && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium">{lightbox.label}</p>
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderImagesPreviewer;
