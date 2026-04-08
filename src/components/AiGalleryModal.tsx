import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getOptimizedUrl } from "@/lib/image-utils";

interface PublicGeneration {
  id: string;
  image_url: string;
  public_image_url: string | null;
  filter_name: string | null;
}

interface AiGalleryModalProps {
  open: boolean;
  onClose: () => void;
  /** If set, opens lightbox directly on this image */
  initialImageUrl?: string | null;
}

const truncateFilter = (name: string, max = 20) =>
  name.length > max ? name.slice(0, max) + "…" : name;

const AiGalleryModal = ({ open, onClose, initialImageUrl }: AiGalleryModalProps) => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PublicGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(initialImageUrl ?? null);

  useEffect(() => {
    if (!open) return;
    setLightboxUrl(initialImageUrl ?? null);
    supabase
      .from("user_ai_generations")
      .select("id, image_url, public_image_url, filter_name")
      .eq("public", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setImages(data ?? []);
        setLoading(false);
      });
  }, [open, initialImageUrl]);

  if (!open) return null;

  const getUrl = (img: PublicGeneration) => img.public_image_url || img.image_url;

  // Lightbox view
  if (lightboxUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={() => setLightboxUrl(null)}>
        <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
        <button className="absolute top-4 left-4 text-white/70 hover:text-white z-10" onClick={(e) => { e.stopPropagation(); setLightboxUrl(null); }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <img
          src={lightboxUrl}
          alt="Geração IA"
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  // Gallery grid view
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold">Galeria de Gerações IA</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Nenhuma geração pública disponível.</p>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden ring-1 ring-border shadow-sm break-inside-avoid cursor-pointer"
                onClick={() => setLightboxUrl(getOptimizedUrl(getUrl(img), 800))}
              >
                <img
                  src={getOptimizedUrl(getUrl(img), 400)}
                  alt={img.filter_name || "Geração IA"}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                />
                {img.filter_name && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 md:transition-opacity">
                    <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                      {truncateFilter(img.filter_name)}
                    </span>
                  </div>
                )}
                {/* Mobile: always show filter badge */}
                {img.filter_name && (
                  <div className="absolute top-1.5 left-1.5 md:hidden">
                    <span className="text-[10px] font-medium text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                      {truncateFilter(img.filter_name)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="px-4 py-3 border-t border-border flex justify-center">
        <Button
          size="lg"
          className="gap-2 glow-primary"
          onClick={() => { onClose(); navigate("/customize"); }}
        >
          Crie a Sua
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AiGalleryModal;
