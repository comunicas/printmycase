import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";

const PAGE_SIZE = 12;

const Catalog = () => {
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const brand = extractBrand(p.name);
      map.set(brand, (map.get(brand) || 0) + 1);
    });
    return map;
  }, [products]);

  const brands = useMemo(() => {
    const priority = ["Apple", "Samsung"];
    const sorted = Array.from(brandCounts.keys()).sort((a, b) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["Todos", ...sorted];
  }, [brandCounts]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrand !== "Todos") {
      list = list.filter((p) => extractBrand(p.name) === selectedBrand);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedBrand, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters = selectedBrand !== "Todos" || search.trim() !== "";

  const changeBrand = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedBrand("Todos");
    setSearch("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build visible page numbers (max 5)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, safePage - 2);
    let end = start + 4;
    if (end > totalPages) {
      end = totalPages;
      start = end - 4;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, safePage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Catálogo" }]} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-5 lg:p-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">Nossos Modelos</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors" />
          <Input
            placeholder="Buscar por modelo, ex: iPhone 16..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9 h-11 border-border/80 focus-visible:ring-primary/50 text-sm"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Brand filters with fade edges */}
        <div className="relative mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {brands.map((brand) => {
              const count = brand === "Todos" ? products.length : (brandCounts.get(brand) || 0);
              const isActive = selectedBrand === brand;
              return (
                <Button
                  key={brand}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => changeBrand(brand)}
                  className={`shrink-0 ${isActive ? "shadow-sm" : ""}`}
                >
                  {brand}
                  <span className={`ml-1 text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    ({count})
                  </span>
                </Button>
              );
            })}
          </div>
          {/* Fade gradient right */}
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `Mostrando ${filtered.length} de ${products.length} capas`
              : `${products.length} capas disponíveis`}
          </span>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <SearchX className="h-10 w-10" />
            <p className="text-sm font-medium">Nenhuma capa encontrada</p>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {paginated.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${i * 50}ms`, animationDuration: "400ms" }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={safePage === 1}
                  onClick={() => goToPage(safePage - 1)}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === safePage ? "default" : "outline"}
                    onClick={() => goToPage(page)}
                    className="h-9 w-9 p-0"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  size="icon"
                  variant="outline"
                  disabled={safePage === totalPages}
                  onClick={() => goToPage(safePage + 1)}
                  className="h-9 w-9"
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
