import { useEffect, useMemo, useState } from "react";
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

const AUTH_LOADING_TIMEOUT_MS = 5000;

export function useGuardDecision({ guard, redirectPath }: UseGuardDecisionParams): GuardDecision {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, status: adminStatus, error: adminError } = useAdmin({ enabled: guard === "admin" });
  const [authLoadingTimedOut, setAuthLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setAuthLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthLoadingTimedOut(true);
    }, AUTH_LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authLoading]);

  return useMemo(() => {
    if (authLoading && !authLoadingTimedOut) {
      return {
        status: "loading",
        allow: false,
        redirectTo: null,
        loadingMessage: "Recuperando sua sessão...",
        errorMessage: null,
      };
    }

    if (authLoading && authLoadingTimedOut) {
      return {
        status: "error",
        allow: false,
        redirectTo: guard === "auth" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/",
        loadingMessage: null,
        errorMessage: "Não foi possível recuperar sua sessão. Tente entrar novamente.",
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
  }, [adminError, adminStatus, authLoading, authLoadingTimedOut, guard, isAdmin, redirectPath, user]);
}
