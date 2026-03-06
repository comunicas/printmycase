import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  expires_at: string;
  created_at: string;
  description: string | null;
}

const typeLabels: Record<string, string> = {
  signup_bonus: "Cadastro",
  referral_bonus: "Indicação",
  purchase_bonus: "Compra",
  coin_purchase: "Compra moedas",
  ai_usage: "Filtro IA",
  admin_adjustment: "Ajuste manual",
};

const CoinsManager = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  // Manual adjustment
  const [adjUserId, setAdjUserId] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDescription, setAdjDescription] = useState("");
  const [adjSaving, setAdjSaving] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("coin_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (typeFilter !== "all") query = query.eq("type", typeFilter);
    const { data, error } = await query;
    if (error) {
      toast({ title: "Erro ao carregar transações", description: error.message, variant: "destructive" });
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, [typeFilter, toast]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleAdjust = async () => {
    if (!adjUserId.trim() || !adjAmount) return;
    setAdjSaving(true);
    try {
      const amount = parseInt(adjAmount);
      if (isNaN(amount) || amount === 0) throw new Error("Valor inválido");
      const { error } = await (supabase as any)
        .from("coin_transactions")
        .insert({
          user_id: adjUserId.trim(),
          amount,
          type: "admin_adjustment",
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          description: adjDescription || "Ajuste manual pelo admin",
        });
      if (error) throw error;
      toast({ title: "Ajuste realizado!" });
      setAdjUserId(""); setAdjAmount(""); setAdjDescription("");
      fetchTransactions();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setAdjSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moedas</h1>

      {/* Manual adjustment */}
      <div className="border rounded-xl p-4 bg-card space-y-3">
        <h2 className="font-semibold text-sm">Ajuste manual</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Input placeholder="User ID (UUID)" value={adjUserId} onChange={(e) => setAdjUserId(e.target.value)} className="font-mono text-xs" />
          <Input type="number" placeholder="Qtd (ex: 50 ou -10)" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
          <Input placeholder="Descrição (opcional)" value={adjDescription} onChange={(e) => setAdjDescription(e.target.value)} />
          <Button onClick={handleAdjust} disabled={adjSaving || !adjUserId || !adjAmount}>
            {adjSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[{ key: "all", label: "Todos" }, ...Object.entries(typeLabels).map(([key, label]) => ({ key, label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : transactions.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma transação encontrada.</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 border rounded-lg p-3 bg-card">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description || typeLabels[tx.type] || tx.type}</p>
                <p className="text-xs text-muted-foreground font-mono">{tx.user_id.slice(0, 8)}…</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · Expira: "}
                  {new Date(tx.expires_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`font-bold text-sm ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoinsManager;
