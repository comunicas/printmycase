import { CreditCard, Search, Factory, Truck, CheckCircle, XCircle, Ban } from "lucide-react";

export const statusLabels: Record<string, string> = {
  pending: "Pagamento Pendente",
  paid: "Pagamento Confirmado",
  analyzing: "Analisando Imagem",
  rejected: "Imagem Recusada",
  producing: "Produzindo",
  shipped: "Transporte",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const statusIcons: Record<string, typeof CreditCard> = {
  pending: CreditCard,
  paid: CreditCard,
  analyzing: Search,
  rejected: Ban,
  producing: Factory,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

/** Ordered status flow (excludes cancelled and rejected — they are deviations) */
export const statusFlow = [
  "pending",
  "paid",
  "analyzing",
  "producing",
  "shipped",
  "delivered",
] as const;

export function getStepIndex(status: string) {
  const idx = statusFlow.indexOf(status as any);
  return idx >= 0 ? idx : 0;
}
