import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  deviceImage?: string | null;
  galleryImages?: string[];
}

const ProductGallery = forwardRef<HTMLDivElement, ProductGalleryProps>(
  ({ images, productName, deviceImage, galleryImages = [] }, ref) => {
    const productImages = [
      ...(deviceImage ? [deviceImage] : []),
      ...images,
    ].filter(Boolean);
    const productCount = productImages.length;
    const allImages = [...productImages, ...galleryImages];
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (allImages.length === 0) {
      return (
        <div ref={ref} className="relative aspect-square w-full rounded-xl border bg-card overflow-hidden flex items-center justify-center">
          <img src="/placeholder.svg" alt={productName} className="w-24 h-24 opacity-30" />
        </div>
      );
    }

    return (
      <div ref={ref} className="flex flex-col gap-3">
        <h2 className="sr-only">Galeria de imagens</h2>
        <div className="relative aspect-square w-full rounded-xl border bg-card overflow-hidden">
          <img
            src={allImages[selectedIndex]}
            alt={`${productName} - Imagem ${selectedIndex + 1}`}
            width={600}
            height={600}
            className="w-full h-full object-contain p-6"
            loading={selectedIndex === 0 ? "eager" : "lazy"}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {allImages.map((img, i) => (
              <div key={i} className="flex items-center gap-1">
                {i === productCount && galleryImages.length > 0 && (
                  <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline">|</span>
                )}
                <button
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
                    alt={`${productName} - ${i >= productCount ? "Ilustrativa" : "Miniatura"} ${i + 1}`}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ProductGallery.displayName = "ProductGallery";

export default ProductGallery;
