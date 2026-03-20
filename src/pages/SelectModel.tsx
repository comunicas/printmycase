import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { ArrowLeft, Search, SearchX, X } from "lucide-react";

const SelectModel = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [search, setSearch] = useState("");

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

  const hasActiveFilters = selectedBrand !== "Todos" || search.trim() !== "";

  const clearFilters = () => {
    setSelectedBrand("Todos");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Selecione seu modelo</h1>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-5">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar modelo, ex: iPhone 16..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-11 border-border/80 focus-visible:ring-primary/50 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Brand filters */}
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
                  onClick={() => setSelectedBrand(brand)}
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
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `${filtered.length} de ${products.length} modelos`
              : `${products.length} modelos disponíveis`}
          </span>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <SearchX className="h-10 w-10" />
            <p className="text-sm font-medium">Nenhum modelo encontrado</p>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product, i) => {
              const thumb = product.device_image || product.images?.[0];
              const displayName = product.name.replace(/^Capa\s+/i, "");
              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/customize/${product.slug}`)}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${i * 40}ms`, animationDuration: "350ms" }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={product.name}
                      className="w-full aspect-square object-contain rounded-lg bg-muted/30 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
                      Sem imagem
                    </div>
                  )}
                  <div className="w-full space-y-0.5">
                    <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(product.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SelectModel;
