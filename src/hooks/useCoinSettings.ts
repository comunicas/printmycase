import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type CoinSetting = Tables<"coin_settings">;

export function useCoinSettings() {
  const [settings, setSettings] = useState<CoinSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
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
