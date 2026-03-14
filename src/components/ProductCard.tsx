import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Product, formatPrice } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product }, ref) => {
    const navigate = useNavigate();

    return (
      <Card
        ref={ref}
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
        onClick={() => navigate(`/product/${product.slug}`)}
      >
        <div className="aspect-square overflow-hidden bg-white flex items-center justify-center">
          {(product.device_image || product.images[0]) ? (
            <img
              src={product.device_image ?? product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span className="text-muted-foreground text-xs">Sem imagem</span>
          )}
        </div>
        <CardContent className="p-2.5">
          <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <span className="inline-block mt-1.5 text-sm font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded-md">
            {formatPrice(product.price_cents / 100)}
          </span>
          <Button
            size="sm"
            className="w-full mt-2 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customize/${product.slug}`);
            }}
          >
            Customizar
          </Button>
        </CardContent>
      </Card>
    );
  }
);
ProductCard.displayName = "ProductCard";

export default ProductCard;
