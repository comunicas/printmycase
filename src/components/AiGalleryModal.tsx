import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  initialImageUrl?: string | null;
}

const truncateFilter = (name: string, max = 20) =>
  name.length > max ? name.slice(0, max) + "…" : name;

const AiGalleryModal = ({ open, onClose, initialImageUrl }: AiGalleryModalProps) => {
  const navigate = useNavigate();
  const [images, setImages] = useState<PublicGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const getUrl = (img: PublicGeneration) => img.public_image_url || img.image_url;

  useEffect(() => {
    if (!open) return;
    setLightboxIndex(null);
    supabase
      .from("public_ai_generations" as never)
      .select("id, image_url, public_image_url, filter_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const items = data ?? [];
        setImages(items);
        setLoading(false);

        if (initialImageUrl && items.length > 0) {
          const idx = items.findIndex(
            (img) => getUrl(img) === initialImageUrl || getOptimizedUrl(getUrl(img), 800) === initialImageUrl
          );
          if (idx !== -1) setLightboxIndex(idx);
        }
      });
  }, [open, initialImageUrl]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((i) => (i === null ? null : i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((i) => (i === null ? null : i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const delta = touchStartX.current - touchEndX.current;
    if (delta > 50) nextImage();
    else if (delta < -50) prevImage();
  };

  if (!open) return null;

  // Lightbox view
  if (lightboxIndex !== null && images[lightboxIndex]) {
    const currentImg = images[lightboxIndex];
    const lightboxUrl = getOptimizedUrl(getUrl(currentImg), 800);

    return (
      <div
        className="fixed inset-0 z-[2010] bg-black flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 z-20 bg-black/50">
          <button className="text-white/70 hover:text-white p-1" onClick={() => setLightboxIndex(null)}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <span className="text-white/60 text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </span>
          )}
          <button className="text-white/70 hover:text-white p-1" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Image area */}
        <div
          className="flex-1 flex items-center justify-center p-4 relative"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Left arrow */}
          {images.length > 1 && (
            <button
              className="absolute left-2 z-10 text-white/50 hover:text-white bg-black/40 rounded-full p-1.5"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <img
            src={lightboxUrl}
            alt={currentImg.filter_name || "Geração IA"}
            className="max-w-[80vw] max-h-[65vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Right arrow */}
          {images.length > 1 && (
            <button
              className="absolute right-2 z-10 text-white/50 hover:text-white bg-black/40 rounded-full p-1.5"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Gallery grid view
  return (
    <div className="fixed inset-0 z-[2000] bg-background flex flex-col">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Nenhuma geração pública disponível.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden ring-1 ring-border shadow-sm cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <img
                  src={getOptimizedUrl(getUrl(img), 400)}
                  alt={img.filter_name || "Geração IA"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                />
                {img.filter_name && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 md:transition-opacity">
                    <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                      {truncateFilter(img.filter_name)}
                    </span>
                  </div>
                )}
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
