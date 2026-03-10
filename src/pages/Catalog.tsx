import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";

const PAGE_SIZE = 12;

const Catalog = () => {
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(extractBrand(p.name)));
    const priority = ["Apple", "Samsung"];
    const sorted = Array.from(set).sort((a, b) => {
      const ai = priority.indexOf(a);
      const bi = priority.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["Todos", ...sorted];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrand !== "Todos") {
      list = list.filter((p) => extractBrand(p.name) === selectedBrand);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    // Sort by model number descending so newer models appear first
    return [...list].sort((a, b) => {
      const numA = Math.max(...(a.name.match(/\d+/g) || ["0"]).map(Number));
      const numB = Math.max(...(b.name.match(/\d+/g) || ["0"]).map(Number));
      return numB - numA;
    });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Catálogo" }]} />

      <main className="flex-1 w-full max-w-6xl mx-auto p-5 lg:p-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">Nossos Modelos</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar modelo..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Brand filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {brands.map((brand) => (
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

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "capa encontrada" : "capas encontradas"}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={safePage === 1}
                  onClick={() => goToPage(safePage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={safePage === totalPages}
                  onClick={() => goToPage(safePage + 1)}
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
