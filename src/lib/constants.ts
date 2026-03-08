import { CreditCard, Search, Paintbrush, Factory, Truck, CheckCircle, XCircle } from "lucide-react";

export const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  analyzing: "Em Análise",
  customizing: "Customizando",
  producing: "Produzindo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const statusIcons: Record<string, typeof CreditCard> = {
  pending: CreditCard,
  paid: CreditCard,
  analyzing: Search,
  customizing: Paintbrush,
  producing: Factory,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

/** Ordered status flow (excludes cancelled) */
export const statusFlow = [
  "pending",
  "paid",
  "analyzing",
  "customizing",
  "producing",
  "shipped",
  "delivered",
] as const;

export function getStepIndex(status: string) {
  const idx = statusFlow.indexOf(status as any);
  return idx >= 0 ? idx : 0;
}
