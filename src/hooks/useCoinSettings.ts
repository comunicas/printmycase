import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CoinSetting {
  key: string;
  value: number;
  description: string | null;
}

export function useCoinSettings() {
  const [settings, setSettings] = useState<CoinSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("coin_settings")
      .select("*")
      .order("key");
    setSettings(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const getSetting = useCallback(
    (key: string, fallback = 0) => settings.find((s) => s.key === key)?.value ?? fallback,
    [settings]
  );

  return { settings, loading, refresh: fetch, getSetting };
}
