import { useState, useEffect, useCallback } from "react";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, Save } from "lucide-react";
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

interface CoinSetting {
  key: string;
  value: number;
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

const settingLabels: Record<string, string> = {
  signup_bonus_amount: "Bônus cadastro (moedas)",
  signup_bonus_days: "Validade bônus cadastro (dias)",
  referral_bonus_amount: "Bônus indicação (moedas)",
  referral_bonus_days: "Validade bônus indicação (dias)",
  purchase_bonus_amount: "Bônus compra (moedas)",
  purchase_bonus_days: "Validade bônus compra (dias)",
  ai_filter_cost: "Custo filtro IA (moedas)",
  ai_upscale_cost: "Custo upscale IA (moedas)",
  
};

const CoinsManager = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  // Settings
  const [settings, setSettings] = useState<CoinSetting[]>([]);
  const [editedSettings, setEditedSettings] = useState<Record<string, number>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Manual adjustment
  const [adjUserId, setAdjUserId] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDescription, setAdjDescription] = useState("");
  const [adjSaving, setAdjSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    const { data } = await supabase.from("coin_settings").select("*").order("key");
    const items = (data ?? []) as CoinSetting[];
    setSettings(items);
    const edited: Record<string, number> = {};
    items.forEach((s) => { edited[s.key] = s.value; });
    setEditedSettings(edited);
    setSettingsLoading(false);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("coin_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (typeFilter !== "all") query = query.eq("type", typeFilter as Database["public"]["Enums"]["coin_transaction_type"]);
    const { data, error } = await query;
    if (error) {
      toast({ title: "Erro ao carregar transações", description: error.message, variant: "destructive" });
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, [typeFilter, toast]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updates = settings
        .filter((s) => editedSettings[s.key] !== s.value)
        .map((s) => supabase.from("coin_settings").update({ value: editedSettings[s.key] }).eq("key", s.key));
      if (updates.length === 0) {
        toast({ title: "Nenhuma alteração" });
        setSavingSettings(false);
        return;
      }
      await Promise.all(updates);
      toast({ title: "Configurações salvas!" });
      fetchSettings();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjUserId.trim() || !adjAmount) return;
    setAdjSaving(true);
    try {
      const amount = parseInt(adjAmount);
      if (isNaN(amount) || amount === 0) throw new Error("Valor inválido");
      const { error } = await supabase
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

  const hasSettingChanges = settings.some((s) => editedSettings[s.key] !== s.value);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Moedas</h2>

      {/* Settings */}
      <div className="border rounded-xl p-4 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Configurações de valores</h2>
          <Button size="sm" onClick={handleSaveSettings} disabled={savingSettings || !hasSettingChanges}>
            {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Salvar
          </Button>
        </div>
        {settingsLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            {/* Bônus */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bônus</p>
              <div className="space-y-2">
                {[
                  { amount: "purchase_bonus_amount", days: "purchase_bonus_days", label: "Compra" },
                  { amount: "referral_bonus_amount", days: "referral_bonus_days", label: "Indicação" },
                  { amount: "signup_bonus_amount", days: "signup_bonus_days", label: "Cadastro" },
                ].map(({ amount, days, label }) => (
                  <div key={amount} className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Bônus {label} (moedas)</label>
                      <Input
                        type="number"
                        value={editedSettings[amount] ?? ""}
                        onChange={(e) => setEditedSettings((prev) => ({ ...prev, [amount]: parseInt(e.target.value) || 0 }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Validade (dias)</label>
                      <Input
                        type="number"
                        value={editedSettings[days] ?? ""}
                        onChange={(e) => setEditedSettings((prev) => ({ ...prev, [days]: parseInt(e.target.value) || 0 }))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Custos IA */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custos IA</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {settings.filter((s) => s.key.includes("cost")).map((s) => (
                  <div key={s.key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{settingLabels[s.key] || s.key}</label>
                    <Input
                      type="number"
                      value={editedSettings[s.key] ?? s.value}
                      onChange={(e) => setEditedSettings((prev) => ({ ...prev, [s.key]: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
