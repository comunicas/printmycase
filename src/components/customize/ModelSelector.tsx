import { useNavigate } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/types";

interface ModelSelectorProps {
  currentSlug?: string;
  productName: string;
  productImage?: string | null;
}

const ModelSelector = ({ currentSlug, productName, productImage }: ModelSelectorProps) => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const displayName = productName.replace(/^Capa\s+/i, "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 min-w-0 outline-none">
        {productImage && (
          <img
            src={productImage}
            alt={productName}
            className="w-7 h-7 rounded-md object-cover border border-border flex-shrink-0"
          />
        )}
        <span className="text-sm font-medium text-muted-foreground truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="max-h-72 overflow-y-auto w-64">
        {products.map((p) => {
          const isActive = p.slug === currentSlug;
          const thumb = p.device_image ?? p.images?.[0];
          const name = p.name.replace(/^Capa\s+/i, "");

          return (
            <DropdownMenuItem
              key={p.id}
              className="flex items-center gap-2.5 py-2 cursor-pointer"
              onSelect={() => {
                if (!isActive) navigate(`/customize/${p.slug}`);
              }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={p.name}
                  className="w-8 h-8 rounded-md object-cover border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-muted flex-shrink-0" />
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`text-sm truncate ${isActive ? "font-semibold text-foreground" : "text-foreground"}`}>
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatPrice(p.price_cents / 100)}
                </span>
              </div>
              {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
