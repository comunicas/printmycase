import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice, type Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  currentSlug?: string;
  productName: string;
  productImage?: string | null;
}

const stripCapa = (n: string) => n.replace(/^Capa\s+/i, "");
const normalize = (s: string) =>
  stripCapa(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

type BrandKey = "apple" | "samsung" | "xiaomi" | "motorola" | "outros";
const BRAND_ORDER: BrandKey[] = ["apple", "samsung", "xiaomi", "motorola", "outros"];
const BRAND_LABEL: Record<BrandKey, string> = {
  apple: "Apple",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  motorola: "Motorola",
  outros: "Outros",
};

function getBrand(name: string): BrandKey {
  const n = name.toLowerCase();
  if (/\biphone\b/.test(n)) return "apple";
  if (/\bgalaxy\b/.test(n)) return "samsung";
  if (/\b(redmi|poco|xiaomi|mi\s)/.test(n)) return "xiaomi";
  if (/\bmoto(rola)?\b/.test(n)) return "motorola";
  return "outros";
}

const ModelSelector = ({ currentSlug, productName, productImage }: ModelSelectorProps) => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const displayName = stripCapa(productName);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  // Build filtered + grouped + flat list
  const { groups, flat } = useMemo(() => {
    const q = normalize(query);
    const filtered = products.filter((p) => !q || normalize(p.name).includes(q));

    const byBrand = new Map<BrandKey, Product[]>();
    for (const p of filtered) {
      const b = getBrand(p.name);
      if (!byBrand.has(b)) byBrand.set(b, []);
      byBrand.get(b)!.push(p);
    }
    for (const list of byBrand.values()) {
      list.sort((a, b) => naturalSort(stripCapa(a.name), stripCapa(b.name)));
    }

    const orderedGroups: { brand: BrandKey; items: Product[] }[] = [];
    for (const b of BRAND_ORDER) {
      const items = byBrand.get(b);
      if (items?.length) orderedGroups.push({ brand: b, items });
    }

    const flatList: Product[] = orderedGroups.flatMap((g) => g.items);
    return { groups: orderedGroups, flat: flatList };
  }, [products, query]);

  // Keep activeIndex within bounds when results change; auto-select current model on open
  useEffect(() => {
    if (!open) return;
    if (!query) {
      const idx = flat.findIndex((p) => p.slug === currentSlug);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveIndex(0);
    }
  }, [open, query, flat, currentSlug]);

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const selectAt = (idx: number) => {
    const p = flat[idx];
    if (!p) return;
    setOpen(false);
    if (p.slug !== currentSlug) navigate(`/customize/${p.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectAt(activeIndex);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Trocar de modelo"
      >
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            width={28}
            height={28}
            className="w-7 h-7 rounded-md object-cover border border-border flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <span className="text-sm font-medium text-muted-foreground truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 max-w-[560px] w-screen sm:w-[560px] h-[100dvh] sm:h-auto sm:max-h-[80vh] rounded-none sm:rounded-2xl flex flex-col overflow-hidden"
          onKeyDown={onKeyDown}
        >
          <DialogTitle className="sr-only">Buscar modelo de capinha</DialogTitle>
          <DialogDescription className="sr-only">
            Pesquise por marca ou nome do modelo. Use as setas para navegar e Enter para selecionar.
          </DialogDescription>

          {/* Search bar */}
          <div className="relative border-b border-border px-4 py-3 flex-shrink-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar modelo (ex: iPhone 15, S24 Ultra, Redmi)"
              className="w-full bg-muted/40 border border-transparent focus:border-primary/40 focus:bg-background rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none transition-colors"
              aria-label="Buscar modelo"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {flat.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-2">
                <p className="text-sm text-foreground">
                  Nenhum modelo encontrado{query ? ` para "${query}"` : ""}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Não encontrou seu aparelho?{" "}
                  <button
                    type="button"
                    onClick={() => { setOpen(false); navigate("/contato"); }}
                    className="text-primary underline underline-offset-2 hover:opacity-80"
                  >
                    Solicite um modelo
                  </button>
                </p>
              </div>
            ) : (
              groups.map(({ brand, items }) => {
                const startIdx = flat.indexOf(items[0]);
                return (
                  <div key={brand}>
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-1.5 border-b border-border/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {BRAND_LABEL[brand]}
                      </span>
                      <span className="text-[11px] text-muted-foreground/70">{items.length}</span>
                    </div>
                    <ul className="py-1">
                      {items.map((p, i) => {
                        const idx = startIdx + i;
                        const isActive = p.slug === currentSlug;
                        const isHighlighted = idx === activeIndex;
                        const thumb = p.device_image ?? p.images?.[0];
                        const name = stripCapa(p.name);
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              data-idx={idx}
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => selectAt(idx)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                                isHighlighted ? "bg-muted" : "hover:bg-muted/60",
                              )}
                            >
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={p.name}
                                  width={36}
                                  height={36}
                                  loading="lazy"
                                  className="w-9 h-9 rounded-md object-cover border border-border flex-shrink-0 bg-muted"
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-md bg-muted flex-shrink-0" />
                              )}
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className={cn(
                                  "text-sm truncate",
                                  isActive ? "font-semibold text-primary" : "text-foreground",
                                )}>
                                  {name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatPrice(p.price_cents / 100)}
                                </span>
                              </div>
                              {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint (desktop only) */}
          <div className="hidden sm:flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground flex-shrink-0">
            <span>{flat.length} {flat.length === 1 ? "modelo" : "modelos"}</span>
            <span className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> navegar</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> abrir</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> fechar</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModelSelector;
