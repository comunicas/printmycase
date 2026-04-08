import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowLeft, LogIn, Clock, Package, CalendarDays, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/AppHeader";
import PaymentBadges from "@/components/PaymentBadges";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { pixelTrackPurchase } from "@/lib/meta-pixel";

import { formatPrice } from "@/lib/types";
import { resolveProductInfo } from "@/lib/products";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};

type SafeOrderRow = {
  product_id: string;
  total_cents: number;
  shipping_cents: number | null;
  created_at: string;
  customization_data: unknown;
};

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const eventId = searchParams.get("eid");
  const successToken = searchParams.get("st");
  const { user, loading } = useAuth();

  const [orderInfo, setOrderInfo] = useState<{
    productName: string;
    productImage?: string;
    totalCents: number;
    productCents: number;
    shippingCents: number;
    createdAt: string;
    aiFilterApplied: boolean;
  } | null>(null);
  const [detailsUnavailable, setDetailsUnavailable] = useState(false);

  useEffect(() => {
    if (!sessionId || loading) return;

    const hydrateOrderInfo = async (order: SafeOrderRow) => {
      const nameMap = await resolveProductInfo([order.product_id]);
      const info = nameMap.get(order.product_id);
      const cd = order.customization_data as any;
      const shippingCents = order.shipping_cents ?? 0;

      setOrderInfo({
        productName: info?.name ?? order.product_id,
        productImage: info?.image,
        totalCents: order.total_cents,
        productCents: order.total_cents - shippingCents,
        shippingCents,
        createdAt: order.created_at,
        aiFilterApplied: !!cd?.activeFilter,
      });

      pixelTrackPurchase(order.total_cents / 100, order.product_id, eventId || undefined);
    };

    const fetchOrder = async () => {
      if (user) {
        const { data: order } = await supabase
          .from("orders")
          .select("product_id, total_cents, shipping_cents, created_at, customization_data")
          .eq("stripe_session_id", sessionId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!order) {
          setDetailsUnavailable(true);
          return;
        }

        await hydrateOrderInfo(order);
        return;
      }

      if (!successToken) {
        setDetailsUnavailable(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-success-order", {
        body: {
          session_id: sessionId,
          token: successToken,
        },
      });

      if (error || !data?.order) {
        setDetailsUnavailable(true);
        return;
      }

      await hydrateOrderInfo(data.order as SafeOrderRow);
    };

    fetchOrder();
  }, [eventId, loading, sessionId, successToken, user]);

  const breadcrumbs = [{ label: "Pedido Confirmado" }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 flex items-center justify-center p-5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 space-y-6 text-center">
            <img src="/logo-printmycase-sm.webp" alt="PrintMyCase" className="h-20 mx-auto" />

            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Pedido Confirmado!
              </h1>
              <p className="text-muted-foreground">
                Seu pagamento foi processado com sucesso. Você receberá um e-mail
                com os detalhes do pedido.
              </p>
            </div>

            {detailsUnavailable && !orderInfo && (
              <div className="text-sm text-muted-foreground bg-muted/70 rounded-lg px-4 py-3">
                Não foi possível validar os detalhes deste pedido nesta sessão. Seu pagamento foi confirmado,
                e os detalhes completos ficam disponíveis em <strong>Meus Pedidos</strong> após login.
              </div>
            )}

            {orderInfo && (
              <>
                <Separator />
                <div className="space-y-3 text-left">
                  {/* Product */}
                  <div className="flex items-start gap-3">
                    {orderInfo.productImage ? (
                      <img
                        src={orderInfo.productImage}
                        alt={orderInfo.productName}
                        className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {orderInfo.productName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(orderInfo.productCents / 100)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Price breakdown */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produto</span>
                      <span>{formatPrice(orderInfo.productCents / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>{orderInfo.shippingCents > 0 ? formatPrice(orderInfo.shippingCents / 100) : "—"}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground border-t pt-1">
                      <span>Total</span>
                      <span>{formatPrice(orderInfo.totalCents / 100)}</span>
                    </div>
                  </div>

                  {orderInfo.aiFilterApplied && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs">Filtro IA aplicado (coins debitados)</span>
                    </div>
                  )}

                  <Separator />

                  {/* Date & delivery */}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Data do pedido</p>
                      <p className="text-sm text-muted-foreground">{formatDate(orderInfo.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Prazo estimado</p>
                      <p className="text-sm text-muted-foreground">5 a 7 dias úteis</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {sessionId && (
              <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-xs text-muted-foreground font-mono mx-auto">
                Ref: {sessionId.slice(0, 20)}…
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {!loading && user ? (
                <Button
                  className="gap-2"
                  onClick={() => navigate("/orders")}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Meus Pedidos
                </Button>
              ) : !loading ? (
                <Button
                  className="gap-2"
                  onClick={() => navigate("/login?redirect=/orders")}
                >
                  <LogIn className="w-4 h-4" />
                  Entrar para ver pedidos
                </Button>
              ) : null}
              <Button variant="outline" className="gap-2" onClick={() => navigate("/catalog")}>
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Catálogo
              </Button>
            </div>

            <PaymentBadges />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
