import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import LoadingSpinner from "@/components/ui/loading-spinner";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAdmin();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return <LoadingSpinner variant="fullPage" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
