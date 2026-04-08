import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import { formatPrice } from "@/lib/types";
import { statusLabels, statusIcons, statusFlow, getStepIndex } from "@/lib/constants";
import { ordersService, type OrderWithProduct } from "@/services/orders/ordersService";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PendingCheckoutCards from "@/components/PendingCheckoutCards";


const PAGE_SIZE = 8;

const activeStatuses = ["pending", "paid", "analyzing", "producing", "rejected"];
const doneStatuses = ["shipped", "delivered"];

function filterByTab(orders: OrderWithProduct[], tab: string) {
  if (tab === "active") return orders.filter((o) => activeStatuses.includes(o.status));
  if (tab === "done") return orders.filter((o) => doneStatuses.includes(o.status));
  if (tab === "cancelled") return orders.filter((o) => o.status === "cancelled");
  return orders;
}

/* Compact progress bar for order status */
const OrderProgress = ({ status }: { status: string }) => {
  if (status === "cancelled") {
    const Icon = statusIcons.cancelled;
    return (
      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
        <Icon className="w-4 h-4" />
        {statusLabels.cancelled}
      </div>
    );
  }

  if (status === "rejected") {
    const Icon = statusIcons.rejected;
    return (
      <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 rounded-lg px-3 py-2">
        <Icon className="w-4 h-4" />
        {statusLabels.rejected}
      </div>
    );
  }

  const stepIdx = getStepIndex(status);
  const total = statusFlow.length;
  const pct = ((stepIdx + 1) / total) * 100;
  const Icon = statusIcons[status] ?? statusIcons.pending;
  const label = statusLabels[status] ?? status;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-muted-foreground">{stepIdx + 1}/{total}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await ordersService.fetchUserOrders();
      if (error) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(data ?? []);
      setLoading(false);
    };
    fetchOrders();

    if (!user?.id) return;

    const unsubscribe = ordersService.subscribeUserOrders(user.id, (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== updatedOrder.id) return o;
          const { product_name, product_image, design_name, design_image, ...rest } = o;
          return {
            ...rest,
            ...updatedOrder,
            product_name,
            product_image,
            design_name,
            design_image,
          };
        })
      );
    });

    return unsubscribe;
  }, [user?.id]);

  const filtered = useMemo(() => filterByTab(orders, activeTab), [orders, activeTab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabCounts = useMemo(() => ({
    active: orders.filter((o) => activeStatuses.includes(o.status)).length,
    done: orders.filter((o) => doneStatuses.includes(o.status)).length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }), [orders]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={[{ label: "Meus Pedidos" }]} />

      <main className="flex-1 max-w-3xl mx-auto w-full p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Meus Pedidos</h1>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="w-4 h-4" /> Catálogo
          </Button>
        </div>

        <PendingCheckoutCards />

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Você ainda não tem pedidos.</p>
            <Button onClick={() => navigate("/catalog")}>Explorar Modelos</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                Ativos {tabCounts.active > 0 && <span className="ml-1 text-xs opacity-70">({tabCounts.active})</span>}
              </TabsTrigger>
              <TabsTrigger value="done" className="flex-1">
                Concluídos {tabCounts.done > 0 && <span className="ml-1 text-xs opacity-70">({tabCounts.done})</span>}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Cancelados {tabCounts.cancelled > 0 && <span className="ml-1 text-xs opacity-70">({tabCounts.cancelled})</span>}
              </TabsTrigger>
            </TabsList>

            {["active", "done", "cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum pedido nesta categoria.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginated.map((order) => (
                      <div key={order.id} className="border rounded-xl p-5 bg-card space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            {order.design_image ? (
                              <>
                                <img src={order.design_image} alt={order.design_name} className="w-[60px] h-[60px] rounded-lg object-cover" />
                                {order.product_image && (
                                  <img src={order.product_image} alt={order.product_name} className="w-7 h-7 rounded-md object-cover absolute -bottom-1 -right-1 border-2 border-card" />
                                )}
                              </>
                            ) : order.product_image ? (
                              <img src={order.product_image} alt={order.product_name} className="w-[60px] h-[60px] rounded-lg object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground truncate">
                                {order.design_name ? `${order.design_name} — ${order.product_name}` : order.product_name}
                              </p>
                              {order.design_id && (
                                <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary flex-shrink-0">
                                  Coleção
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className="font-semibold text-foreground text-lg flex-shrink-0">
                            {formatPrice(order.total_cents / 100)}
                          </span>
                        </div>

                        {/* Status progress */}
                        <OrderProgress status={order.status} />

                        {order.status === "rejected" && order.rejection_reason && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm space-y-1">
                            <p className="font-semibold text-orange-800">Motivo da recusa:</p>
                            <p className="text-orange-700">{order.rejection_reason}</p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          Prazo: 5 a 7 dias úteis
                          {order.tracking_code && (
                            <a
                              href={`https://www.linkcorreios.com.br/?id=${order.tracking_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-primary hover:underline font-medium"
                            >
                              Rastreio: {order.tracking_code}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <Button size="icon" variant="outline" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{safePage} / {totalPages}</span>
                        <Button size="icon" variant="outline" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Orders;
