import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/components/StarRating";
import { type Product, formatPrice } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = React.forwardRef<HTMLDivElement, ProductInfoProps>(
  ({ product }, ref) => {
    const navigate = useNavigate();

    return (
      <div ref={ref} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

        <StarRating rating={product.rating} reviewCount={product.review_count} starSize="w-4 h-4" showText />

        <p className="text-3xl font-bold text-foreground">
          {formatPrice(product.price_cents / 100)}
        </p>

        <Separator />

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="flex flex-col gap-3 pt-1">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => navigate(`/customize/${product.slug}`)}
          >
            Customizar Minha Case
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
);
ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
