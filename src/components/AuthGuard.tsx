import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGuardDecision } from "@/hooks/useGuardDecision";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const decision = useGuardDecision({
    guard: "auth",
    redirectPath: location.pathname,
  });

  if (decision.status === "idle" || decision.status === "loading") {
    return <LoadingSpinner variant="fullPage" message={decision.loadingMessage ?? undefined} />;
  }

  if (!decision.allow && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
