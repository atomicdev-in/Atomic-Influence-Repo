import { useState, useEffect } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { BarChart3, Download, Calendar, Eye, Heart, Users, DollarSign, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, emptyReports } from "@/components/ui/empty-state";
import { formatNumber, formatCurrency, getStatusColor } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { ReportsSkeleton } from "@/components/ui/page-skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportStats {
  totalClicks: number;
  totalCreators: number;
  totalSpend: number;
  avgEngagement: number;
}

interface CampaignReport {
  id: string;
  name: string;
  status: string;
  creatorCount: number;
  clicks: number;
  spent: number;
}

const BrandReportsContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<ReportStats>({
    totalClicks: 0,
    totalCreators: 0,
    totalSpend: 0,
    avgEngagement: 0,
  });
  const [campaigns, setCampaigns] = useState<CampaignReport[]>([]);
  const [platformData, setPlatformData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name, status, influencer_count, allocated_budget')
          .eq('brand_user_id', user.id);

        if (campaignsError) throw campaignsError;

        if (!campaignsData || campaignsData.length === 0) {
          setIsLoading(false);
          return;
        }

        const campaignIds = campaignsData.map(c => c.id);

        const { data: trackingLinks } = await supabase
          .from('creator_tracking_links')
          .select('campaign_id, click_count')
          .in('campaign_id', campaignIds);

        const { data: invitations } = await supabase
          .from('campaign_invitations')
          .select('campaign_id, status')
          .in('campaign_id', campaignIds)
          .eq('status', 'accepted');

        const clicksByCampaign: Record<string, number> = {};
        const creatorsByCampaign: Record<string, number> = {};
        
        trackingLinks?.forEach(link => {
          clicksByCampaign[link.campaign_id] = (clicksByCampaign[link.campaign_id] || 0) + (link.click_count || 0);
        });

        invitations?.forEach(inv => {
          creatorsByCampaign[inv.campaign_id] = (creatorsByCampaign[inv.campaign_id] || 0) + 1;
        });

        const totalClicks = Object.values(clicksByCampaign).reduce((sum, c) => sum + c, 0);
        const totalCreators = Object.values(creatorsByCampaign).reduce((sum, c) => sum + c, 0);
        const totalSpend = campaignsData.reduce((sum, c) => sum + c.allocated_budget, 0);

        setStats({
          totalClicks,
          totalCreators,
          totalSpend,
          avgEngagement: totalClicks > 0 && totalCreators > 0 ? Math.round((totalClicks / totalCreators / 100) * 10) / 10 : 0,
        });

        const campaignReports = campaignsData.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          creatorCount: creatorsByCampaign[c.id] || 0,
          clicks: clicksByCampaign[c.id] || 0,
          spent: c.allocated_budget,
        }));

        setCampaigns(campaignReports);

        const { data: accounts } = await supabase
          .from('linked_accounts')
          .select('platform')
          .eq('connected', true);

        if (accounts && accounts.length > 0) {
          const platformCounts: Record<string, number> = {};
          accounts.forEach(a => {
            platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1;
          });
          
          const total = Object.values(platformCounts).reduce((sum, c) => sum + c, 0);
          const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
          
          const platforms = Object.entries(platformCounts).map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[index % colors.length],
          }));
          
          setPlatformData(platforms);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load reports'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  const statCards = [
    { title: "Total Clicks", value: formatNumber(stats.totalClicks), icon: Eye },
    { title: "Active Creators", value: stats.totalCreators.toString(), icon: Users },
    { title: "Engagement Rate", value: `${stats.avgEngagement}%`, icon: Heart },
    { title: "Total Spend", value: formatCurrency(stats.totalSpend), icon: DollarSign },
  ];

  if (error) {
    throw error;
  }

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  const hasData = campaigns.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Analytics and performance insights"
        icon={BarChart3}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" className="gap-2" disabled={!hasData}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {!hasData ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <EmptyState {...emptyReports} />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </SectionErrorBoundary>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionErrorBoundary>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Campaign Performance</h3>
                {campaigns.filter(c => c.clicks > 0).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={campaigns.filter(c => c.clicks > 0).slice(0, 6)}>
                        <defs>
                          <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#clicksGradient)" 
                          name="Clicks"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No click data available"
                    description="Click tracking will populate once tracking links are active."
                    compact
                  />
                )}
              </div>
            </SectionErrorBoundary>

            <SectionErrorBoundary>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Creator Platforms</h3>
                {platformData.length > 0 ? (
                  <div className="h-64 flex items-center">
                    <div className="w-1/2">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => `${value}%`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-3">
                      {platformData.map((platform) => (
                        <div key={platform.name} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="text-sm flex-1">{platform.name}</span>
                          <span className="text-sm font-medium">{platform.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No platform data"
                    description="Platform distribution will appear when creators connect accounts."
                    compact
                  />
                )}
              </div>
            </SectionErrorBoundary>
          </div>

          {/* Campaign Breakdown */}
          <SectionErrorBoundary>
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Campaign Breakdown</h3>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{campaign.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.creatorCount} creators</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 md:gap-8">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{formatNumber(campaign.clicks)}</div>
                        <span className="text-xs text-muted-foreground">Clicks</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">{campaign.creatorCount}</div>
                        <span className="text-xs text-muted-foreground">Creators</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">{formatCurrency(campaign.spent)}</div>
                        <span className="text-xs text-muted-foreground">Spend</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionErrorBoundary>
        </>
      )}
    </div>
  );
};

const BrandReports = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandReportsContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandReports;
