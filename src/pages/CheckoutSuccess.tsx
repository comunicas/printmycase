import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";

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
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
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

          {sessionId && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              Ref: {sessionId.slice(0, 20)}…
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!loading && user ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="w-4 h-4" />
                Meus Pedidos
              </Button>
            ) : !loading ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/login?redirect=/orders")}
              >
                <LogIn className="w-4 h-4" />
                Entrar para ver pedidos
              </Button>
            ) : null}
            <Button className="gap-2" onClick={() => navigate("/catalog")}>
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Catálogo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
