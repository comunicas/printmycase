import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/StarRating";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
        <p className="text-base font-bold text-foreground mt-1">{formatPrice(product.price)}</p>
        <div className="mt-1">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
