import { useEffect, useState } from "react";
import { adminService } from "@/services/admin/adminService";
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

    adminService
      .checkIsAdmin(user.id)
      .then(({ data, error: checkError }) => {
        if (cancelled) return;

        if (checkError) {
          setIsAdmin(false);
          setStatus("error");
          setError(checkError.message);
          return;
        }

        setIsAdmin(Boolean(data));
        setStatus("ready");
      })
      .catch((unexpectedError) => {
        if (cancelled) return;

        setIsAdmin(false);
        setStatus("error");
        setError(unexpectedError instanceof Error ? unexpectedError.message : "Erro inesperado ao validar permissões.");
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
