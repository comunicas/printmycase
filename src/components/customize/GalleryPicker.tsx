import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Image as ImageIcon, Loader2 } from "lucide-react";

interface Gallery {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
}

interface GalleryImage {
  id: string;
  url: string;
  label: string;
}

interface GalleryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
}

const GalleryPicker = ({ open, onOpenChange, onSelect }: GalleryPickerProps) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setSelectedGallery(null); setImages([]); return; }
    setLoading(true);
    supabase
      .from("image_galleries")
      .select("id, name, slug, cover_image")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setGalleries((data as Gallery[]) ?? []);
        setLoading(false);
      });
  }, [open]);

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

  const handleImageClick = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedGallery && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedGallery(null); setImages([]); }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {selectedGallery ? selectedGallery.name : "Escolher da Galeria"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedGallery ? (
            // Gallery list
            galleries.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma galeria disponível.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-1">
                {galleries.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGallery(g)}
                    className="rounded-xl border bg-card p-3 text-left hover:border-primary transition-colors group"
                  >
                    {g.cover_image ? (
                      <img src={g.cover_image} alt={g.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{g.name}</p>
                  </button>
                ))}
              </div>
            )
          ) : (
            // Images grid
            images.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma imagem nesta galeria.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-1">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => handleImageClick(img.url)}
                    className="rounded-lg overflow-hidden border hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all"
                  >
                    <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryPicker;
