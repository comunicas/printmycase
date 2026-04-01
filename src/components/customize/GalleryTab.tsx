import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Gallery {
  id: string;
  name: string;
  cover_image: string | null;
}

interface GalleryImage {
  id: string;
  url: string;
  label: string;
}

interface GalleryTabProps {
  onSelect: (imageUrl: string) => void;
}

const GalleryTab = ({ onSelect }: GalleryTabProps) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("image_galleries")
      .select("id, name, cover_image")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setGalleries((data as Gallery[]) ?? []);
        setLoading(false);
      });
  }, []);

  const handleSelectGallery = async (g: Gallery) => {
    setSelectedGallery(g);
    setLoading(true);
    const { data } = await supabase
      .from("gallery_images")
      .select("id, url, label")
      .eq("gallery_id", g.id)
      .eq("active", true)
      .order("sort_order");
    setImages((data as GalleryImage[]) ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (selectedGallery) {
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 px-2"
          onClick={() => { setSelectedGallery(null); setImages([]); }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {selectedGallery.name}
        </Button>
        {images.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">Nenhuma imagem nesta galeria.</p>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {images.map(img => (
              <button
                key={img.id}
                onClick={() => onSelect(img.url)}
                className="rounded-lg overflow-hidden border border-border hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all"
              >
                <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (galleries.length === 0) {
    return <p className="text-center text-xs text-muted-foreground py-6">Nenhuma galeria disponível.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {galleries.map(g => (
        <button
          key={g.id}
          onClick={() => handleSelectGallery(g)}
          className="rounded-xl border border-border bg-card p-2 text-left hover:border-primary transition-colors group"
        >
          {g.cover_image ? (
            <img src={g.cover_image} alt={g.name} className="w-full aspect-square object-cover rounded-lg mb-1.5" loading="lazy" />
          ) : (
            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1.5">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{g.name}</p>
        </button>
      ))}
    </div>
  );
};

export default GalleryTab;
