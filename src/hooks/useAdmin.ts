import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AdminStatus = "idle" | "loading" | "ready" | "error";

interface UseAdminOptions {
  enabled?: boolean;
}

export function useAdmin(options: UseAdminOptions = {}) {
  const { enabled = true } = options;
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<AdminStatus>(enabled ? "idle" : "ready");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsAdmin(false);
      setStatus("ready");
      setError(null);
      return;
    }

    if (authLoading) {
      setStatus("loading");
      setError(null);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setStatus("ready");
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) return;

        if (queryError) {
          setIsAdmin(false);
          setStatus("error");
          setError(queryError.message);
          return;
        }

        setIsAdmin(!!data);
        setStatus("ready");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, user?.id, authLoading]);

  return {
    isAdmin,
    loading: enabled && (status === "idle" || status === "loading"),
    status,
    error,
  };
}
