import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBrandWallet = () => {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('payments', {
        body: { action: 'get-wallet-balance', brandUserId: user.id },
      });
      if (error) throw error;
      return data as { success: boolean; balance: number; currency: string };
    },
    staleTime: 30000,
  });

  const depositFunds = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: walletData } = await supabase.from('brand_wallets').select('id').eq('brand_user_id', user.id).single();
      if (!walletData) throw new Error('Wallet not found');

      const { data, error } = await supabase.functions.invoke('payments', {
        body: { action: 'deposit-funds', walletId: walletData.id, amount },
      });
      if (error) throw error;
      
      // Auto-confirm for stub
      if (data?.transaction?.id) {
        await supabase.functions.invoke('payments', {
          body: { action: 'confirm-deposit', transactionId: data.transaction.id },
        });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      toast.success("Funds added (stubbed)");
    },
    onError: (error: Error) => {
      toast.error("Deposit failed", { description: error.message });
    },
  });

  return {
    balance: wallet?.balance || 0,
    currency: wallet?.currency || 'USD',
    isLoading,
    depositFunds: depositFunds.mutate,
    isDepositing: depositFunds.isPending,
  };
};

export const useCreatorEarnings = () => {
  return useQuery({
    queryKey: ['creator-earnings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('creator_earnings')
        .select(`*, campaign:campaigns(id, name)`)
        .eq('creator_user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};