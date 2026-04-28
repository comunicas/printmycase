import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type Product, formatPrice } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = forwardRef<HTMLDivElement, ProductInfoProps>(({ product }, ref) => {
  const navigate = useNavigate();
  const cleanName = product.name.replace(/^Capa\s+/i, "").trim();

  return (
    <div ref={ref} className="flex flex-col gap-5">
      {/* H1 limpo */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
          Capinha Personalizada para {cleanName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie seu design exclusivo com IA · Impressão UV LED premium
        </p>
      </div>

      {/* Preço */}
      <p className="text-3xl font-bold text-foreground">
        {formatPrice(product.price_cents / 100)}
      </p>

      {/* Trust strip */}
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <li>✓ Frete grátis Brasil</li>
        <li>✓ Impressão UV LED</li>
        <li>✓ Entrega em até 2 dias</li>
        <li>✓ Garantia 1 ano</li>
      </ul>

      <Separator />

      {/* CTA principal */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => navigate(`/customize/${product.slug}`)}
        >
          <Sparkles className="w-4 h-4" />
          Criar minha capinha com IA
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Envie uma foto · Aplique filtros de IA · Receba em casa
        </p>
      </div>
    </div>
  );
});

ProductInfo.displayName = "ProductInfo";
export default ProductInfo;
