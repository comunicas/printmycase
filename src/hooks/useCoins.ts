import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

const COINS_UPDATED_EVENT = "coins-updated";

export type CoinTransaction = Tables<"coin_transactions">;

export function useCoins() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    const { data, error } = await supabase.rpc("get_coin_balance", { _user_id: user.id });
    if (error) {
      console.error("Erro ao carregar saldo de coins", error);
      return;
    }

    if (typeof data === "number") {
      setBalance(data);
    }
  }, [user?.id]);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const { data, error } = await supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Erro ao carregar transações de coins", error);
      return;
    }

    setTransactions(data ?? []);
  }, [user?.id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setLoading(false);
    window.dispatchEvent(new Event(COINS_UPDATED_EVENT));
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    if (!user) return;

    const handler = async () => {
      const { data, error } = await supabase.rpc("get_coin_balance", { _user_id: user.id });
      if (error) {
        console.error("Erro ao atualizar saldo de coins", error);
        return;
      }

      if (typeof data === "number") {
        setBalance(data);
      }
    };

    window.addEventListener(COINS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(COINS_UPDATED_EVENT, handler);
  }, [user?.id]);

  useEffect(() => {
    if (user) refresh();
    else {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
    }
  }, [user?.id, refresh]);

  return { balance, transactions, loading, refresh };
}
