import { Truck } from "lucide-react";
import { formatPrice } from "@/data/products";

interface OrderSummaryProps {
  productPriceCents: number;
  shippingCents: number;
  hasShipping: boolean;
}

const OrderSummary = ({ productPriceCents, shippingCents, hasShipping }: OrderSummaryProps) => {
  const totalCents = productPriceCents + shippingCents;

  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Truck className="w-4 h-4" /> Resumo do pedido
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Produto</span>
          <span>{formatPrice(productPriceCents / 100)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Frete</span>
          <span>{hasShipping ? formatPrice(shippingCents / 100) : "—"}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground border-t pt-1">
          <span>Total</span>
          <span>{hasShipping ? formatPrice(totalCents / 100) : "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
