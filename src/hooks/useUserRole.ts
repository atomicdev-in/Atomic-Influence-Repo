import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type UserRole = "creator" | "brand" | "admin" | null;

interface UseUserRoleReturn {
  role: UserRole;
  loading: boolean;
  setRole: (role: "creator" | "brand") => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRoleState] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user?.id) {
      setRoleState(null);
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
        console.error("Error fetching user role:", error);
        setRoleState(null);
      } else {
        setRoleState(data?.role as UserRole || null);
      }
    } catch (err) {
      console.error("Error in fetchRole:", err);
      setRoleState(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchRole();
    }
  }, [authLoading, fetchRole]);

  const setRole = useCallback(async (newRole: "creator" | "brand") => {
    if (!user?.id) {
      return { error: new Error("No user logged in") };
    }

    try {
      // First check if role exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: newRole });

        if (error) throw error;
      }

      setRoleState(newRole);
      return { error: null };
    } catch (err) {
      console.error("Error setting user role:", err);
      return { error: err as Error };
    }
  }, [user?.id]);

  return {
    role,
    loading: authLoading || loading,
    setRole,
    refetch: fetchRole,
  };
};
