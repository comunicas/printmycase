import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { extractBrand } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { ArrowLeft, Search, SearchX, X } from "lucide-react";
import { setPageSeo, SITE_URL } from "@/lib/seo";
import { getOptimizedUrl } from "@/lib/image-utils";

const ProductThumb = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full aspect-square">
      {!loaded && <div className="absolute inset-0 rounded-lg bg-muted animate-pulse" aria-hidden />}
      <img
        src={getOptimizedUrl(src, 240)}
        srcSet={`${getOptimizedUrl(src, 160)} 160w, ${getOptimizedUrl(src, 320)} 320w`}
        sizes="(max-width: 640px) 33vw, 200px"
        alt={alt}
        width={300}
        height={300}
        className={`w-full h-full object-contain rounded-lg bg-muted/30 group-hover:scale-105 transition-all duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => { e.currentTarget.style.display = "none"; setLoaded(true); }}
      />
    </div>
  );
};

const SelectModel = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const BEST_SELLER_SLUGS = new Set([
    "iphone-16-pro-max",
    "iphone-15",
    "galaxy-s25",
    "galaxy-a55",
  ]);

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
    return sorted;
  }, [brandCounts]);

  useEffect(() => {
    if (!selectedBrand && brands.length > 0) setSelectedBrand("Todos");
  }, [brands, selectedBrand]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrand && selectedBrand !== "Todos") {
      list = list.filter((p) => extractBrand(p.name) === selectedBrand);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    const SUFFIX_WEIGHT: Record<string, number> = {
      "ultra": 5, "pro max": 4, "pro": 3, "plus": 2, "max": 2,
      "fe": 1, "": 0, "s": -1, "e": -1, "mini": -2,
    };
    const parseModel = (name: string) => {
      const clean = name.replace(/^Capa\s+/i, "");
      const numMatch = clean.match(/(\d+)/);
      const version = numMatch ? parseInt(numMatch[1], 10) : 0;
      const afterNum = numMatch ? clean.slice(numMatch.index! + numMatch[0].length).trim().toLowerCase() : "";
      const suffix = afterNum.replace(/[^a-z\s]/g, "").trim();
      const weight = SUFFIX_WEIGHT[suffix] ?? 0;
      return { version, weight };
    };
    return [...list].sort((a, b) => {
      const A = parseModel(a.name);
      const B = parseModel(b.name);
      if (B.version !== A.version) return B.version - A.version;
      if (B.weight !== A.weight) return B.weight - A.weight;
      return a.name.localeCompare(b.name);
    });
  }, [products, selectedBrand, search]);

  const hasActiveFilters = search.trim() !== "";

  useEffect(() => {
    const cleanup = setPageSeo({
      title: "Selecione o Modelo — Criar Capinha Personalizada | PrintMyCase",
      description: "Escolha o modelo do seu celular e crie sua capinha personalizada com IA. Disponível para iPhone, Samsung, Motorola, Xiaomi e muito mais. Frete grátis.",
      url: `${SITE_URL}/customize`,
    });
    return cleanup;
  }, []);

  const clearFilters = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Selecione seu modelo de celular</h1>
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
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["Todos", ...brands].map((brand) => {
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
              ? `${filtered.length} resultados`
              : `${filtered.length} modelos`}
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
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Search className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">Modelo não encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por outro nome ou{" "}
              <button
                onClick={() => setSearch("")}
                className="text-primary underline underline-offset-2"
              >
                ver todos os modelos
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product, i) => {
              const thumb = product.device_image || product.images?.[0];
              const displayName = product.name.replace(/^Capa\s+/i, "");
              const isBestSeller = BEST_SELLER_SLUGS.has(product.slug);
              return (
                <button
                  key={product.id}
                  onClick={() => navigate(`/customize/${product.slug}`)}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${i * 40}ms`, animationDuration: "350ms" }}
                >
                  <div className="relative w-full">
                    {isBestSeller && (
                      <span className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        + pedido
                      </span>
                    )}
                  {thumb ? (
                    <ProductThumb src={thumb} alt={product.name} />
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
