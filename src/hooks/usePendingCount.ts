import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePendingCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const fetch = async () => {
      const { count: c } = await (supabase as any)
        .from("pending_checkouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCount(c ?? 0);
    };

    fetch();
  }, [user?.id]);

  return count;
}
