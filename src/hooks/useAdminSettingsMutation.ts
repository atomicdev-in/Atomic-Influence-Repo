import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateSettingParams {
  key: string;
  value: any;
}

interface RpcResult {
  success: boolean;
  error?: string;
}

export const useAdminSettingsMutation = () => {
  const queryClient = useQueryClient();

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: UpdateSettingParams) => {
      const { data, error } = await supabase.rpc('update_platform_setting', {
        _key: key,
        _value: value,
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as unknown as RpcResult;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update setting');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success("Setting updated", {
        description: `${variables.key} has been saved.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Update failed", {
        description: error.message,
      });
    },
  });

  return {
    updateSetting: updateSetting.mutate,
    updateSettingAsync: updateSetting.mutateAsync,
    isUpdating: updateSetting.isPending,
  };
};
