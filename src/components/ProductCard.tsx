import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { type Product, formatPrice } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="aspect-square overflow-hidden bg-white flex items-center justify-center">
        {(product.device_image || product.images[0]) ? (
          <img
            src={product.device_image ?? product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-muted-foreground text-xs">Sem imagem</span>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
        <p className="text-base font-bold text-foreground mt-1">{formatPrice(product.price_cents / 100)}</p>
        <div className="mt-1">
          <StarRating rating={product.rating} reviewCount={product.review_count} />
        </div>
        <Button
          size="sm"
          className="w-full mt-2"
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
};

export default ProductCard;
