import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

export type GuardStatus = "idle" | "loading" | "ready" | "error";

type GuardType = "auth" | "admin";

interface UseGuardDecisionParams {
  guard: GuardType;
  redirectPath: string;
}

interface GuardDecision {
  status: GuardStatus;
  allow: boolean;
  redirectTo: string | null;
  loadingMessage: string | null;
  errorMessage: string | null;
}

export function useGuardDecision({ guard, redirectPath }: UseGuardDecisionParams): GuardDecision {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, status: adminStatus, error: adminError } = useAdmin({ enabled: guard === "admin" });

  return useMemo(() => {
    if (authLoading) {
      return {
        status: "loading",
        allow: false,
        redirectTo: null,
        loadingMessage: "Recuperando sua sessão...",
        errorMessage: null,
      };
    }

    if (!user) {
      return {
        status: "ready",
        allow: false,
        redirectTo: guard === "auth" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/",
        loadingMessage: null,
        errorMessage: null,
      };
    }

    if (guard === "auth") {
      return {
        status: "ready",
        allow: true,
        redirectTo: null,
        loadingMessage: null,
        errorMessage: null,
      };
    }

    if (adminStatus === "idle" || adminStatus === "loading") {
      return {
        status: "loading",
        allow: false,
        redirectTo: null,
        loadingMessage: "Validando permissões de administrador...",
        errorMessage: null,
      };
    }

    if (adminStatus === "error") {
      return {
        status: "error",
        allow: false,
        redirectTo: "/",
        loadingMessage: null,
        errorMessage: adminError ?? "Não foi possível validar suas permissões.",
      };
    }

    return {
      status: "ready",
      allow: isAdmin,
      redirectTo: isAdmin ? null : "/",
      loadingMessage: null,
      errorMessage: null,
    };
  }, [adminError, adminStatus, authLoading, guard, isAdmin, redirectPath, user]);
}
