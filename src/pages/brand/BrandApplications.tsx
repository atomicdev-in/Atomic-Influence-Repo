import { useState, useEffect } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { Mail, CheckCircle, Clock, XCircle, Send, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, emptyApplications, emptyInvitations } from "@/components/ui/empty-state";
import { formatRelativeTime, formatDate, getStatusColor, formatNumber } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface InvitationWithCreator {
  id: string;
  status: string;
  offered_payout: number;
  created_at: string;
  campaign_name: string;
  creator_name: string;
  creator_username: string;
  creator_avatar: string | null;
  total_followers: number;
  engagement: number;
}

const BrandApplications = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<InvitationWithCreator[]>([]);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get all campaigns owned by this brand
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('brand_user_id', user.id);

        if (!campaigns || campaigns.length === 0) {
          setInvitations([]);
          setIsLoading(false);
          return;
        }

        const campaignIds = campaigns.map(c => c.id);
        const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c.name]));

        // Get all invitations for these campaigns
        const { data: invitationsData } = await supabase
          .from('campaign_invitations')
          .select('id, status, offered_payout, created_at, campaign_id, creator_user_id')
          .in('campaign_id', campaignIds)
          .order('created_at', { ascending: false });

        if (!invitationsData || invitationsData.length === 0) {
          setInvitations([]);
          setIsLoading(false);
          return;
        }

        // Get creator profiles
        const creatorIds = [...new Set(invitationsData.map(i => i.creator_user_id))];
        const { data: profiles } = await supabase
          .from('creator_profiles')
          .select('user_id, name, username, avatar_url, email')
          .in('user_id', creatorIds);

        // Get linked accounts for follower counts
        const { data: accounts } = await supabase
          .from('linked_accounts')
          .select('user_id, followers, engagement')
          .in('user_id', creatorIds)
          .eq('connected', true);

        const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
        const accountsMap: Record<string, { followers: number; engagement: number }> = {};
        
        accounts?.forEach(a => {
          if (!accountsMap[a.user_id]) {
            accountsMap[a.user_id] = { followers: 0, engagement: 0 };
          }
          accountsMap[a.user_id].followers += a.followers || 0;
          accountsMap[a.user_id].engagement = a.engagement || 0;
        });

        const formattedInvitations: InvitationWithCreator[] = invitationsData.map(inv => {
          const profile = profileMap[inv.creator_user_id];
          const stats = accountsMap[inv.creator_user_id] || { followers: 0, engagement: 0 };
          
          return {
            id: inv.id,
            status: inv.status,
            offered_payout: inv.offered_payout,
            created_at: inv.created_at,
            campaign_name: campaignMap[inv.campaign_id] || 'Campaign',
            creator_name: profile?.name || profile?.email?.split('@')[0] || 'Creator',
            creator_username: profile?.username || `@${profile?.email?.split('@')[0] || 'creator'}`,
            creator_avatar: profile?.avatar_url || null,
            total_followers: stats.followers,
            engagement: stats.engagement,
          };
        });

        setInvitations(formattedInvitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const handleWithdraw = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaign_invitations')
        .update({ status: 'withdrawn' })
        .eq('id', id);

      if (error) throw error;

      setInvitations(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'withdrawn' } : inv
      ));
      
      toast.success("Invitation withdrawn");
    } catch (error) {
      console.error('Error withdrawing invitation:', error);
      toast.error("Operation failed");
    }
  };

  const stats = {
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    declined: invitations.filter(i => i.status === 'declined').length,
    negotiating: invitations.filter(i => i.status === 'negotiating').length,
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const activeInvitations = invitations.filter(i => ['accepted', 'negotiating'].includes(i.status));
  const closedInvitations = invitations.filter(i => ['declined', 'withdrawn'].includes(i.status));

  if (isLoading) {
    return (
      <BrandDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading invitations..." />
        </div>
      </BrandDashboardLayout>
    );
  }

  return (
    <BrandDashboardLayout>
      <PageTransition>
        <div className="space-y-6 max-w-7xl mx-auto">
          <PageHeader
            title="Invitations"
            subtitle="Track creator invitations and responses"
            icon={Mail}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Pending", count: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
              { title: "Accepted", count: stats.accepted, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { title: "Declined", count: stats.declined, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
              { title: "Negotiating", count: stats.negotiating, icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <span className="text-sm text-muted-foreground">{stat.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Invitations Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="pending">Pending ({pendingInvitations.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeInvitations.length})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({closedInvitations.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                {pendingInvitations.length === 0 ? (
                  <EmptyState {...emptyInvitations} />
                ) : (
                  <div className="space-y-4">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={inv.creator_avatar || ''} alt={inv.creator_name} />
                          <AvatarFallback>{inv.creator_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{inv.creator_name}</h4>
                            <span className="text-sm text-muted-foreground">{inv.creator_username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Invited to: <span className="text-foreground">{inv.campaign_name}</span>
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatNumber(inv.total_followers)} followers</span>
                            <span>{inv.engagement}% engagement</span>
                            <span>Sent {formatRelativeTime(inv.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleWithdraw(inv.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Withdraw
                          </Button>
                          <Badge variant="outline" className={`capitalize ${getStatusColor(inv.status)}`}>
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                {activeInvitations.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No active invitations"
                    description="Accepted and negotiating invitations will appear here."
                  />
                ) : (
                  <div className="space-y-4">
                    {activeInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={inv.creator_avatar || ''} alt={inv.creator_name} />
                          <AvatarFallback>{inv.creator_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{inv.creator_name}</h4>
                            <span className="text-sm text-muted-foreground">{inv.creator_username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Campaign: <span className="text-foreground">{inv.campaign_name}</span>
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Payout: ${inv.offered_payout}</span>
                            <span>{formatRelativeTime(inv.created_at)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="closed" className="mt-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                {closedInvitations.length === 0 ? (
                  <EmptyState
                    icon={XCircle}
                    title="No closed invitations"
                    description="Declined and withdrawn invitations will appear here."
                  />
                ) : (
                  <div className="space-y-4">
                    {closedInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50 opacity-60"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={inv.creator_avatar || ''} alt={inv.creator_name} />
                          <AvatarFallback>{inv.creator_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{inv.creator_name}</h4>
                            <span className="text-sm text-muted-foreground">{inv.creator_username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Campaign: <span className="text-foreground">{inv.campaign_name}</span>
                          </p>
                        </div>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandApplications;