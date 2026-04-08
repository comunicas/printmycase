import { useEffect, useState } from "react";
import { adminService } from "@/services/admin/adminService";
import { useAuth } from "@/hooks/useAuth";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    adminService.checkIsAdmin(user.id).then(({ data }) => {
      if (!cancelled) {
        setIsAdmin(Boolean(data));
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: loading || authLoading };
}
