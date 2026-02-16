import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserWithStatus {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  status: "active" | "disabled";
  banned_until: string | null;
  status_reason?: string;
  status_changed_at?: string;
}

interface UserStatusResponse {
  users: UserWithStatus[];
}

export function useUsersWithStatus() {
  return useQuery({
    queryKey: ["users-with-status"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<UserStatusResponse>(
        "user-management",
        {
          body: { action: "list" },
        }
      );

      if (error) throw error;
      return data?.users || [];
    },
  });
}

export function useDisableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke("user-management", {
        body: { action: "disable", userId, reason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-status"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Disabled",
        description: "The user has been disabled and their sessions invalidated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useEnableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke("user-management", {
        body: { action: "enable", userId, reason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-status"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User Enabled",
        description: "The user has been re-enabled and can now log in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
