import { useState } from "react";
import { Loader2, Gift, ShoppingCart, Sparkles, UserPlus, Settings } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useCoins } from "@/hooks/useCoins";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PACKAGES = [
  { coins: 100, label: "100 moedas" },
  { coins: 500, label: "500 moedas" },
  { coins: 1500, label: "1.500 moedas" },
  { coins: 5000, label: "5.000 moedas" },
];

const typeLabels: Record<string, { label: string; icon: typeof Gift }> = {
  signup_bonus: { label: "Bônus de cadastro", icon: Gift },
  referral_bonus: { label: "Indicação", icon: UserPlus },
  purchase_bonus: { label: "Bônus de compra", icon: ShoppingCart },
  coin_purchase: { label: "Compra de moedas", icon: ShoppingCart },
  ai_usage: { label: "Filtro IA", icon: Sparkles },
  admin_adjustment: { label: "Ajuste manual", icon: Settings },
};

const Coins = () => {
  const { profile } = useAuth();
  const { balance, transactions, loading } = useCoins();
  const { toast } = useToast();
  const [buyingPackage, setBuyingPackage] = useState<number | null>(null);

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : null;

  const handleBuyCoins = async (coins: number) => {
    setBuyingPackage(coins);
    try {
      const { data, error } = await supabase.functions.invoke("create-coin-checkout", {
        body: { coinAmount: coins },
      });
      if (error || !data?.url) throw new Error("Erro ao criar sessão de pagamento");
      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBuyingPackage(null);
    }
  };

  const handleCopyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({ title: "Link copiado!" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Moedas" }]} />
      <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
        {/* Balance */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Seu saldo</p>
          <p className="text-5xl font-bold text-foreground">
            🪙 {loading ? "…" : balance}
          </p>
        </div>

        {/* Referral */}
        {referralLink && (
          <div className="border rounded-xl p-4 bg-card space-y-2">
            <h2 className="font-semibold text-sm">Convide amigos e ganhe 50 moedas</h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg truncate">{referralLink}</code>
              <Button size="sm" variant="outline" onClick={handleCopyReferral}>Copiar</Button>
            </div>
          </div>
        )}

        {/* Packages */}
        <div className="space-y-3">
          <h2 className="font-semibold">Comprar moedas</h2>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => (
              <Button
                key={pkg.coins}
                variant="outline"
                className="h-auto py-4 flex-col gap-1"
                onClick={() => handleBuyCoins(pkg.coins)}
                disabled={buyingPackage !== null}
              >
                {buyingPackage === pkg.coins ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">🪙 {pkg.coins}</span>
                    <span className="text-xs text-muted-foreground">{pkg.label}</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="space-y-3">
          <h2 className="font-semibold">Histórico</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const info = typeLabels[tx.type] ?? { label: tx.type, icon: Gift };
                const Icon = info.icon;
                const isExpired = new Date(tx.expires_at) < new Date() && tx.amount > 0;
                return (
                  <div key={tx.id} className={`flex items-center gap-3 border rounded-lg p-3 bg-card ${isExpired ? "opacity-50" : ""}`}>
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || info.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        {isExpired && " · Expirado"}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coins;
