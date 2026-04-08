import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGuardDecision } from "@/hooks/useGuardDecision";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const decision = useGuardDecision({
    guard: "admin",
    redirectPath: "/",
  });

  if (decision.status === "idle" || decision.status === "loading") {
    return <LoadingSpinner variant="fullPage" message={decision.loadingMessage ?? undefined} />;
  }

  if (!decision.allow && decision.redirectTo) {
    return <Navigate to={decision.redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
