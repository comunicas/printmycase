import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BRANDS = ["Todos", "Apple", "Samsung", "Motorola", "Xiaomi"] as const;
const PAGE_SIZE = 12;

const Catalog = () => {
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (selectedBrand === "Todos") return products;
    return products.filter((p) => extractBrand(p.name) === selectedBrand);
  }, [products, selectedBrand]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeBrand = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Catálogo" }]} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-5 lg:p-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Nossos Modelos</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} capas disponíveis</span>
        </div>

        {/* Brand filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {BRANDS.map((brand) => (
            <Button
              key={brand}
              size="sm"
              variant={selectedBrand === brand ? "default" : "outline"}
              onClick={() => changeBrand(brand)}
              className="shrink-0"
            >
              {brand}
            </Button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;
