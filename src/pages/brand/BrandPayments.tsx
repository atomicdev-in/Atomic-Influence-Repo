import { useState, useEffect } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { CreditCard, Download, Plus, ArrowUpRight, ArrowDownRight, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, emptyPayments } from "@/components/ui/empty-state";
import { formatCurrency, formatRelativeTime, getStatusColor } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { PaymentsSkeleton } from "@/components/ui/page-skeleton";

interface PaymentStats {
  availableBalance: number;
  pendingPayments: number;
  totalSpent: number;
}

interface Transaction {
  id: string;
  type: 'payment' | 'deposit' | 'refund';
  creatorName?: string;
  campaignName?: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

const BrandPaymentsContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<PaymentStats>({
    availableBalance: 0,
    pendingPayments: 0,
    totalSpent: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name, total_budget, allocated_budget')
          .eq('brand_user_id', user.id);

        if (campaignsError) throw campaignsError;

        const { data: invitations, error: invError } = await supabase
          .from('campaign_invitations')
          .select(`
            id,
            offered_payout,
            status,
            created_at,
            campaign_id,
            campaigns!inner(name, brand_user_id)
          `)
          .eq('campaigns.brand_user_id', user.id)
          .in('status', ['accepted', 'pending']);

        if (invError) throw invError;

        const totalBudget = campaigns?.reduce((sum, c) => sum + c.total_budget, 0) || 0;
        const allocatedBudget = campaigns?.reduce((sum, c) => sum + c.allocated_budget, 0) || 0;
        const pendingPayouts = invitations
          ?.filter(i => i.status === 'accepted')
          ?.reduce((sum, i) => sum + i.offered_payout, 0) || 0;

        setStats({
          availableBalance: totalBudget - allocatedBudget,
          pendingPayments: pendingPayouts,
          totalSpent: allocatedBudget,
        });

        const txns: Transaction[] = (invitations || []).map(inv => ({
          id: inv.id,
          type: 'payment' as const,
          campaignName: (inv.campaigns as any)?.name || 'Campaign',
          amount: inv.offered_payout,
          status: inv.status === 'accepted' ? 'pending' as const : 'pending' as const,
          date: inv.created_at,
          description: `Creator payout - ${inv.status === 'accepted' ? 'Awaiting delivery' : 'Pending acceptance'}`,
        }));

        setTransactions(txns);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load payment data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [user]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return ArrowDownRight;
      case 'refund': return ArrowDownRight;
      default: return ArrowUpRight;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-emerald-500 bg-emerald-500/10';
      case 'refund': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-red-500 bg-red-500/10';
    }
  };

  if (error) {
    throw error;
  }

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payments"
        subtitle="Manage payments and billing"
        icon={CreditCard}
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Funds
          </Button>
        }
      />

      {/* Balance Overview */}
      <SectionErrorBoundary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-sm text-muted-foreground">Available Budget</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500">
              {formatCurrency(stats.availableBalance)}
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-sm text-muted-foreground">Pending Payments</span>
            </div>
            <div className="text-3xl font-bold text-amber-500">
              {formatCurrency(stats.pendingPayments)}
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Allocated</span>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.totalSpent)}
            </div>
          </div>
        </div>
      </SectionErrorBoundary>

      {/* Payments Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        
        <TabsContent value="transactions" className="mt-6">
          <SectionErrorBoundary>
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              {transactions.length === 0 ? (
                <EmptyState {...emptyPayments} />
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => {
                    const Icon = getTransactionIcon(tx.type);
                    const colorClass = getTransactionColor(tx.type);
                    return (
                      <div
                        key={tx.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium capitalize">{tx.type}</h4>
                            {tx.creatorName && (
                              <span className="text-sm text-muted-foreground">to {tx.creatorName}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
                          {tx.campaignName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{tx.campaignName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${tx.type === 'payment' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {tx.type === 'payment' ? '-' : '+'}{formatCurrency(tx.amount)}
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(tx.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionErrorBoundary>
        </TabsContent>
        
        <TabsContent value="methods" className="mt-6">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <EmptyState
              icon={CreditCard}
              title="No payment methods configured"
              description="Add a payment method to process creator payouts."
              action={{
                label: "Add Payment Method",
                onClick: () => {},
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BrandPayments = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandPaymentsContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandPayments;
