import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { products, formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

const Catalog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center px-5 py-3 border-b bg-card">
        <h1 className="text-base font-semibold text-foreground">Case Studio</h1>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-5 lg:p-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Nossos Modelos</h2>
          <span className="text-sm text-muted-foreground">{products.length} capas disponíveis</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const fullStars = Math.floor(product.rating);
            const hasHalf = product.rating - fullStars >= 0.5;

            return (
              <Card
                key={product.id}
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
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < fullStars
                              ? "fill-yellow-400 text-yellow-400"
                              : i === fullStars && hasHalf
                                ? "fill-yellow-400/50 text-yellow-400"
                                : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
