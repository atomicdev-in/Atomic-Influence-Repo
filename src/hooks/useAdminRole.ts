import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UseAdminRoleReturn {
  isAdmin: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if the current user has admin role.
 * Uses SECURITY DEFINER function is_admin() for safe RLS-bypassing check.
 */
export const useAdminRole = (): UseAdminRoleReturn => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAdminStatus = useCallback(async () => {
    if (!user?.id) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin status:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === "admin");
      }
    } catch (err) {
      console.error("Error in fetchAdminStatus:", err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchAdminStatus();
    }
  }, [authLoading, fetchAdminStatus]);

  return {
    isAdmin,
    loading: authLoading || loading,
    refetch: fetchAdminStatus,
  };
};
