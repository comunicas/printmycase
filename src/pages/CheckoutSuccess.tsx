import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import logoArtisCase from "@/assets/logo-artiscase.png";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading } = useAuth();

  const breadcrumbs = [{ label: "Pedido Confirmado" }];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader breadcrumbs={breadcrumbs} />

      <main className="flex-1 flex items-center justify-center p-5">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 space-y-6 text-center">
            <img src={logoArtisCase} alt="ArtisCase" className="h-10 mx-auto" />

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
              <p className="text-sm text-muted-foreground">
                Acompanhe o status do seu pedido na página <strong>Meus Pedidos</strong>.
              </p>
            </div>

            {sessionId && (
              <>
                <Separator />
                <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-xs text-muted-foreground font-mono mx-auto">
                  Ref: {sessionId.slice(0, 20)}…
                </div>
              </>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
