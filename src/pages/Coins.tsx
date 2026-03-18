import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, Gift, ShoppingCart, Sparkles, UserPlus, Settings, Copy, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCoins } from "@/hooks/useCoins";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoinPackage {
  id: string;
  coins: number;
  price_cents: number;
  badge: string | null;
  sort_order: number;
  active: boolean;
}

const typeLabels: Record<string, { label: string; icon: typeof Gift }> = {
  signup_bonus: { label: "Bônus de cadastro", icon: Gift },
  referral_bonus: { label: "Indicação", icon: UserPlus },
  purchase_bonus: { label: "Bônus de compra", icon: ShoppingCart },
  coin_purchase: { label: "Compra de moedas", icon: ShoppingCart },
  ai_usage: { label: "Filtro IA", icon: Sparkles },
  admin_adjustment: { label: "Ajuste manual", icon: Settings },
};

const HISTORY_PAGE_SIZE = 10;

const Coins = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    supabase.from("coin_packages").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      setPackages((data as CoinPackage[]) ?? []);
      setPackagesLoading(false);
    });
  }, []);

  const basePricePerCoin = packages.length > 0 ? packages[0].price_cents / packages[0].coins : 1;

  const { profile } = useAuth();
  const { balance, transactions, loading, refresh } = useCoins();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [buyingPackage, setBuyingPackage] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Feedback de compra bem-sucedida
  useEffect(() => {
    const purchased = searchParams.get("purchased");
    if (purchased) {
      toast({ title: "Compra realizada! 🎉", description: `${purchased} moedas adicionadas ao seu saldo.` });
      searchParams.delete("purchased");
      setSearchParams(searchParams, { replace: true });
      refresh();
    }
  }, []);

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

  const gains = transactions.filter((t) => t.amount > 0);
  const expenses = transactions.filter((t) => t.amount < 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader breadcrumbs={[{ label: "Moedas" }]} />
      <main className="max-w-2xl mx-auto px-5 py-10 space-y-10">

        {/* ── Saldo ── */}
        <div className="text-center space-y-1.5">
          <p className="text-sm text-muted-foreground">Seu saldo</p>
          <p className="text-5xl font-bold text-foreground">
            🪙 {loading ? "…" : balance}
          </p>
          <p className="text-sm text-muted-foreground">
            Use para aplicar filtros IA nas suas capas.{" "}
            <Link to="/catalog" className="text-primary hover:underline inline-flex items-center gap-0.5">
              Ver catálogo <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>

        {/* ── Pacotes ── */}
        <div className="space-y-3">
          <h2 className="font-semibold">Comprar moedas</h2>
          {packagesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg) => {
              const perCoin = pkg.price_cents / pkg.coins;
              const discount = Math.round((1 - perCoin / basePricePerCoin) * 100);
              const isPopular = pkg.badge === "Mais popular";
              const label = pkg.coins >= 1000 ? `${(pkg.coins / 1000).toFixed(pkg.coins % 1000 === 0 ? 0 : 1).replace(".", ",")}k` : String(pkg.coins);
              const priceFormatted = `R$ ${(pkg.price_cents / 100).toFixed(2).replace(".", ",")}`;

              return (
                <button
                  key={pkg.id}
                  onClick={() => handleBuyCoins(pkg.coins)}
                  disabled={buyingPackage !== null}
                  className={`relative rounded-xl border p-4 text-left transition-all hover:shadow-md disabled:opacity-60 ${
                    isPopular
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {pkg.badge && (
                    <span className={`absolute -top-2.5 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isPopular ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    }`}>
                      {pkg.badge}
                    </span>
                  )}

                  {buyingPackage === pkg.coins ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold">🪙 {label}</p>
                      <p className="text-base font-semibold text-foreground mt-1">{priceFormatted}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        R$ {(perCoin / 100).toFixed(2).replace(".", ",")}/moeda
                        {discount > 0 && (
                          <span className="ml-1.5 text-green-600 font-semibold">-{discount}%</span>
                        )}
                      </p>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* ── Referral ── */}
        {referralLink && (
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/30 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2.5 flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Convide e ganhe!</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Você ganha <strong className="text-foreground">50 moedas</strong> e seu amigo também ganha <strong className="text-foreground">50 moedas</strong> ao se cadastrar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background/80 border px-3 py-2 rounded-lg truncate">{referralLink}</code>
              <Button size="sm" onClick={handleCopyReferral} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
          </div>
        )}

        {/* ── Histórico ── */}
        <div className="space-y-3">
          <h2 className="font-semibold">Histórico</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação ainda.</p>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setHistoryPage(1); }}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                <TabsTrigger value="gains" className="flex-1">Ganhos</TabsTrigger>
                <TabsTrigger value="expenses" className="flex-1">Gastos</TabsTrigger>
              </TabsList>

              {(["all", "gains", "expenses"] as const).map((tab) => {
                const list = tab === "gains" ? gains : tab === "expenses" ? expenses : transactions;
                const totalPages = Math.max(1, Math.ceil(list.length / HISTORY_PAGE_SIZE));
                const safePage = Math.min(historyPage, totalPages);
                const paginated = list.slice((safePage - 1) * HISTORY_PAGE_SIZE, safePage * HISTORY_PAGE_SIZE);

                return (
                  <TabsContent key={tab} value={tab} className="space-y-2 mt-3">
                    {list.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação nesta categoria.</p>
                    ) : (
                      <>
                        {paginated.map((tx) => {
                          const info = typeLabels[tx.type] ?? { label: tx.type, icon: Gift };
                          const Icon = info.icon;
                          const isExpired = tx.expires_at && tx.amount > 0 && new Date(tx.expires_at) < new Date();
                          return (
                            <div key={tx.id} className={`flex items-center gap-3 border rounded-lg p-3 bg-card ${isExpired ? "opacity-50" : ""}`}>
                              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{tx.description || info.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(tx.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                  {isExpired && (
                                    <span className="ml-1.5 inline-flex items-center rounded-full bg-destructive/10 text-destructive text-[10px] font-medium px-1.5 py-0.5">
                                      Expirado
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className={`font-bold text-sm tabular-nums ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                                {tx.amount > 0 ? "+" : ""}{tx.amount}
                              </span>
                            </div>
                          );
                        })}

                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-3 pt-3">
                            <Button size="icon" variant="outline" disabled={safePage === 1} onClick={() => setHistoryPage(safePage - 1)}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">{safePage} / {totalPages}</span>
                            <Button size="icon" variant="outline" disabled={safePage === totalPages} onClick={() => setHistoryPage(safePage + 1)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coins;
