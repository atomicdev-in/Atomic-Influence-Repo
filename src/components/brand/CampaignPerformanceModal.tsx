import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassLoading } from "@/components/ui/glass-spinner";
import {
  MousePointer,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  ArrowUpRight,
  Link2,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

// Keep legacy interface for backwards compatibility
export interface CampaignPerformanceData {
  id: string;
  name: string;
  category: string;
  reach: number;
  engagement: number;
  activeCreators: number;
}

interface CampaignPerformanceModalProps {
  campaign?: CampaignPerformanceData | null;
  campaignId?: string;
  campaignName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignPerformanceModal = ({
  campaign,
  campaignId,
  campaignName,
  open,
  onOpenChange,
}: CampaignPerformanceModalProps) => {
  // Use real analytics if campaignId is provided, otherwise use legacy mock data
  const id = campaignId || campaign?.id;
  const name = campaignName || campaign?.name || 'Campaign';
  const { analytics, isLoading } = useCampaignAnalytics(open ? id : undefined);

  if (!id) return null;

  if (isLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <GlassLoading size="lg" variant="primary" text="Loading analytics..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {name} - Performance Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={MousePointer}
              label="Total Clicks"
              value={formatNumber(analytics.totalClicks)}
              trend={analytics.totalClicks > 0 ? 'active' : undefined}
            />
            <MetricCard
              icon={Target}
              label="Conversion Rate"
              value={`${analytics.conversionRate.toFixed(1)}%`}
              subtitle={`${analytics.estimatedConversions} est. conversions`}
            />
            <MetricCard
              icon={DollarSign}
              label="Avg. Cost/Click"
              value={analytics.averageCostPerClick > 0 ? formatCurrency(analytics.averageCostPerClick) : '$0.00'}
              subtitle="CPC"
            />
            <MetricCard
              icon={Users}
              label="Active Creators"
              value={analytics.activeCreators.toString()}
              subtitle={`${analytics.averageClicksPerCreator} avg clicks`}
            />
          </div>

          {/* Top Performer */}
          {analytics.topPerformer && analytics.topPerformer.totalClicks > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Top Performer</span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={analytics.topPerformer.creatorAvatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {analytics.topPerformer.creatorName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{analytics.topPerformer.creatorName}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatNumber(analytics.topPerformer.totalClicks)} clicks</span>
                    <span>•</span>
                    <span>ROI: {(analytics.topPerformer.roi * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>CPC: {formatCurrency(analytics.topPerformer.costPerClick)}</span>
                  </div>
                </div>
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Best
                </Badge>
              </div>
            </div>
          )}

          {/* Creator ROI Comparison */}
          {analytics.creatorPerformance.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Creator ROI Comparison
              </h4>
              
              <div className="space-y-3">
                {analytics.creatorPerformance.map((creator, index) => {
                  const maxClicks = Math.max(...analytics.creatorPerformance.map(c => c.totalClicks), 1);
                  const percentage = (creator.totalClicks / maxClicks) * 100;
                  
                  return (
                    <div key={creator.creatorUserId} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium w-5 text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={creator.creatorAvatar || undefined} />
                          <AvatarFallback>{creator.creatorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{creator.creatorName}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="font-medium">{formatNumber(creator.totalClicks)}</p>
                            <p className="text-xs text-muted-foreground">clicks</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {creator.costPerClick > 0 ? formatCurrency(creator.costPerClick) : '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">CPC</p>
                          </div>
                          <div className="text-right w-16">
                            <p className={`font-medium ${creator.roi >= 1 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {(creator.roi * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">ROI</p>
                          </div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Click Performance by Link */}
          {analytics.clicksByLink.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Click Performance by CTA Link
              </h4>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.clicksByLink} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => formatNumber(v)} />
                    <YAxis 
                      type="category" 
                      dataKey="label" 
                      width={100}
                      tickFormatter={(v) => v.length > 12 ? `${v.slice(0, 12)}...` : v}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatNumber(value), 'Clicks']}
                    />
                    <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                      {analytics.clicksByLink.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Primary CTA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted-foreground" />
                  <span>Secondary CTAs</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {analytics.totalClicks === 0 && analytics.activeCreators === 0 && (
            <div className="text-center py-8">
              <MousePointer className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No performance data yet</h3>
              <p className="text-sm text-muted-foreground">
                Analytics will appear once creators start using their tracking links.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
}

const MetricCard = ({ icon: Icon, label, value, subtitle, trend }: MetricCardProps) => (
  <div className="rounded-xl border border-border/50 bg-card/50 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold">{value}</span>
      {trend && (
        <span className="text-xs text-emerald-500 flex items-center">
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </span>
      )}
    </div>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

export default CampaignPerformanceModal;
