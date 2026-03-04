import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import { type Product, formatPrice } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

      <StarRating rating={product.rating} reviewCount={product.review_count} starSize="w-4 h-4" showText />

      <p className="text-3xl font-bold text-foreground">
        {formatPrice(product.price_cents / 100)}
      </p>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Cor:{" "}
          <span className="text-muted-foreground">
            {product.colors.find((c) => c.id === selectedColor)?.name}
          </span>
        </p>
        <div className="flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all",
                selectedColor === color.id
                  ? "border-primary scale-110"
                  : "border-muted hover:border-muted-foreground/40"
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3 pt-1">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => navigate(`/customize/${product.slug}`)}
        >
          Customizar Minha Capa
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button size="lg" variant="outline" className="w-full gap-2" onClick={() => navigate("/catalog")}>
          Ver Catálogo Completo
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
