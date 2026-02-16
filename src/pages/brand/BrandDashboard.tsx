import { useState } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import { LayoutGrid, TrendingUp, Users, Megaphone, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Eye, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandDashboardData } from "@/hooks/useBrandDashboardData";
import { CampaignPerformanceModal, CampaignPerformanceData } from "@/components/brand/CampaignPerformanceModal";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'live':
      return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    case 'reviewing':
      return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    case 'draft':
      return 'text-slate-500 border-slate-500/30 bg-slate-500/10';
    case 'completed':
      return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    case 'discovery':
      return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
    default:
      return 'text-muted-foreground';
  }
};

const BrandDashboardContent = () => {
  const navigate = useNavigate();
  const { stats, activeCampaigns, topPerformingCampaigns, isLoading } = useBrandDashboardData();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignPerformanceData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCampaignClick = (campaign: CampaignPerformanceData) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const statCards = [
    { 
      title: "Active Campaigns", 
      value: stats.activeCampaigns,
      icon: Megaphone,
      trend: stats.activeCampaigns > 0 ? `${stats.activeCampaigns} running` : "No active campaigns",
      trendUp: stats.activeCampaigns > 0
    },
    { 
      title: "Total Creators", 
      value: stats.totalCreators,
      icon: Users,
      trend: stats.totalCreators > 0 ? `${stats.totalCreators} accepted` : "Invite creators",
      trendUp: stats.totalCreators > 0
    },
    { 
      title: "Campaign Spend", 
      value: formatCurrency(stats.totalSpend),
      icon: DollarSign,
      trend: stats.thisMonthSpend > 0 ? `${formatCurrency(stats.thisMonthSpend)} this month` : "No spend yet",
      trendUp: null
    },
    { 
      title: "Avg. Engagement", 
      value: `${stats.engagementRate}%`,
      icon: TrendingUp,
      trend: stats.engagementRate > 0 ? "Based on clicks" : "Track with links",
      trendUp: stats.engagementRate > 0
    },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Brand Operations"
        subtitle="Campaign performance, creator activity, and pending actions"
        icon={LayoutGrid}
      />

      {/* Stats Grid */}
      <SectionErrorBoundary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trendUp !== null && (
                  stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )
                )}
                <span>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionErrorBoundary>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium">{stats.pendingApprovals} pending approval{stats.pendingApprovals > 1 ? 's' : ''} require attention</p>
              <p className="text-sm text-muted-foreground">Review creator submissions and negotiation requests</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/brand/applications')}>
            Review Now
          </Button>
        </div>
      )}

      {/* Active Campaigns Overview */}
      <SectionErrorBoundary>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/brand/campaigns')}>
              View All
            </Button>
          </div>
          {activeCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">No Active Campaigns</h4>
              <p className="text-sm text-muted-foreground mb-4">Launch your first campaign to begin creator outreach</p>
              <Button onClick={() => navigate('/brand/campaigns/create')}>
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCampaigns.slice(0, 5).map((campaign) => {
                const progress = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/brand/campaigns/${campaign.id}`)}
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{campaign.name}</h4>
                        <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.creatorCount} creator{campaign.creatorCount !== 1 ? 's' : ''}
                        </span>
                        <span>{campaign.category}</span>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <div className="text-sm font-medium mb-1">
                        {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionErrorBoundary>

      {/* Top Performing Campaigns */}
      <SectionErrorBoundary>
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performing Campaigns</h3>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <a href="/brand/campaigns">View All</a>
            </Button>
          </div>
          {topPerformingCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No completed campaigns yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topPerformingCampaigns.map((campaign, index) => (
                <div 
                  key={campaign.id} 
                  className="flex items-center gap-4 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -mx-2 transition-colors"
                  onClick={() => handleCampaignClick({
                    id: campaign.id,
                    name: campaign.name,
                    category: campaign.category,
                    reach: campaign.creatorCount * 10000,
                    engagement: stats.engagementRate,
                    activeCreators: campaign.creatorCount,
                  })}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {campaign.creatorCount}
                      </span>
                      <span>•</span>
                      <span>{formatCurrency(campaign.spent)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionErrorBoundary>

      <CampaignPerformanceModal 
        campaign={selectedCampaign}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

const BrandDashboard = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandDashboardContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandDashboard;
