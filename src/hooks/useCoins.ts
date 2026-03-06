import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  expires_at: string;
  created_at: string;
  description: string | null;
}

export function useCoins() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); return; }
    const { data, error } = await supabase.rpc("get_coin_balance", { _user_id: user.id });
    if (!error && data != null) setBalance(data as number);
  }, [user?.id]);

  const fetchTransactions = useCallback(async () => {
    if (!user) { setTransactions([]); return; }
    const { data } = await (supabase as any)
      .from("coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setTransactions(data);
  }, [user?.id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setLoading(false);
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    if (user) refresh();
    else { setBalance(0); setTransactions([]); setLoading(false); }
  }, [user?.id, refresh]);

  return { balance, transactions, loading, refresh };
}
