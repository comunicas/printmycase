import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  deviceImage?: string | null;
  galleryImages?: string[];
}

const ProductGallery = ({ images, productName, deviceImage }: ProductGalleryProps) => {
  const allImages = [
    ...(deviceImage ? [deviceImage] : []),
    ...images,
  ].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-xl border bg-card overflow-hidden flex items-center justify-center">
        <img src="/placeholder.svg" alt={productName} className="w-24 h-24 opacity-30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="sr-only">Galeria de imagens</h2>
      <div className="relative aspect-square w-full rounded-xl border bg-card overflow-hidden">
        <img
          src={allImages[selectedIndex]}
          alt={`${productName} - Imagem ${selectedIndex + 1}`}
          className="w-full h-full object-contain p-6"
          loading={selectedIndex === 0 ? "eager" : "lazy"}
        />
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "w-16 h-16 rounded-lg border-2 overflow-hidden bg-card transition-colors",
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={img}
                alt={`${productName} - Miniatura ${i + 1}`}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
