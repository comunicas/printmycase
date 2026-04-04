import { CreditCard, Search, Factory, Truck, CheckCircle, XCircle, Ban } from "lucide-react";
import type { Tables, Database } from "@/integrations/supabase/types";

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

export const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-yellow-100 text-yellow-800 border-yellow-300",
  analyzing: "bg-blue-100 text-blue-800 border-blue-300",
  rejected: "bg-orange-100 text-orange-800 border-orange-300",
  producing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
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

/** Shared enriched order type for admin components */
export type AdminOrderRow = Tables<"orders"> & {
  product_name?: string;
  product_image?: string;
  design_name?: string;
  design_image?: string;
  customer_name?: string;
  customer_city?: string;
  customer_state?: string;
};
