import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, getProduct } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Pago", className: "bg-green-100 text-green-800" },
  shipped: { label: "Enviado", className: "bg-blue-100 text-blue-800" },
  delivered: { label: "Entregue", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, []);

  const breadcrumbs = [{ label: "Meus Pedidos" }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 max-w-3xl mx-auto w-full p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => navigate("/catalog")}
          >
            <ArrowLeft className="w-4 h-4" />
            Catálogo
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Você ainda não tem pedidos.
            </p>
            <Button onClick={() => navigate("/catalog")}>
              Explorar Modelos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusLabels[order.status] ?? statusLabels.pending;
              return (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {getProduct(order.product_id)?.name ?? order.product_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(order.total_cents / 100)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
