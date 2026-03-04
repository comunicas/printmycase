import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Clock, Search, Paintbrush, Factory, Truck, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";

type OrderRow = {
  id: string;
  product_id: string;
  total_cents: number;
  status: string;
  created_at: string;
  tracking_code?: string | null;
};

const statusFlow = [
  { key: "pending", label: "Aguardando Pagamento", icon: CreditCard },
  { key: "analyzing", label: "Em Análise", icon: Search },
  { key: "customizing", label: "Customizando", icon: Paintbrush },
  { key: "producing", label: "Produzindo", icon: Factory },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregue", icon: CheckCircle },
];

function getStepIndex(status: string) {
  const idx = statusFlow.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(OrderRow & { product_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const productIds = [...new Set(ordersData.map((o) => o.product_id))];
      const { data: productsData } = await supabase
        .from("products")
        .select("slug, name")
        .in("slug", productIds);

      const nameMap = new Map((productsData ?? []).map((p) => [p.slug, p.name]));

      setOrders(
        ordersData.map((o: any) => ({
          ...o,
          product_name: nameMap.get(o.product_id) ?? o.product_id,
        }))
      );
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const breadcrumbs = [{ label: "Meus Pedidos" }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 max-w-3xl mx-auto w-full p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="w-4 h-4" /> Catálogo
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Você ainda não tem pedidos.</p>
            <Button onClick={() => navigate("/catalog")}>Explorar Modelos</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isCancelled = order.status === "cancelled";
              const currentStep = getStepIndex(order.status);

              return (
                <div key={order.id} className="border rounded-xl p-5 bg-card space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        Capa Personalizada - {order.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground text-lg">
                      {formatPrice(order.total_cents / 100)}
                    </span>
                  </div>

                  {/* Status */}
                  {isCancelled ? (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      <XCircle className="w-4 h-4" />
                      Cancelado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {statusFlow.map((step, i) => {
                        const Icon = step.icon;
                        const isActive = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <div key={step.key} className="flex items-center">
                            <div className="flex flex-col items-center gap-1 min-w-[56px]">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : isActive
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[10px] text-center leading-tight ${
                                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div
                                className={`w-4 h-0.5 mt-[-16px] ${
                                  i < currentStep ? "bg-primary/40" : "bg-muted"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Prazo: 5 a 7 dias úteis
                    {order.tracking_code && (
                      <a
                        href="https://rastreamento.correios.com.br/app/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-primary hover:underline font-medium"
                      >
                        Rastreio: {order.tracking_code}
                      </a>
                    )}
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
