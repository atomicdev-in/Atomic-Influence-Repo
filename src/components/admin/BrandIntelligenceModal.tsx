import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminBrandIntelligenceDetail, type DataSource, type RiskSignal } from "@/hooks/useAdminBrandIntelligence";
import { GlassSpinner } from "@/components/ui/glass-spinner";
import { formatCurrency } from "@/lib/formatters";
import {
  Building2,
  Users,
  Megaphone,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  TrendingUp,
  Shield,
  UserPlus,
  BarChart3,
  AlertCircle,
  Target,
} from "lucide-react";

interface BrandIntelligenceModalProps {
  brandId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const healthColors = {
  healthy: "bg-green-500/20 text-green-400 border-green-500/30",
  attention: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const healthIcons = {
  healthy: CheckCircle,
  attention: AlertTriangle,
  critical: AlertCircle,
};

const confidenceColors = {
  high: "bg-green-500/20 text-green-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-orange-500/20 text-orange-400",
  none: "bg-muted text-muted-foreground",
};

const riskTypeColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function DataSourceIndicator({ source }: { source: DataSource }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${source.available ? "bg-green-500" : "bg-muted"}`} />
        <span className="text-sm">{source.name}</span>
      </div>
      <Badge variant="outline" className={confidenceColors[source.confidence]}>
        {source.confidence}
      </Badge>
    </div>
  );
}

function RiskSignalCard({ signal }: { signal: RiskSignal }) {
  const Icon = signal.type === "critical" ? AlertCircle : signal.type === "warning" ? AlertTriangle : Info;
  
  return (
    <Card className={`${riskTypeColors[signal.type]} border`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{signal.message}</p>
            {signal.details && (
              <p className="text-xs opacity-80 mt-1">{signal.details}</p>
            )}
            <Badge variant="outline" className="mt-2 text-xs">
              {signal.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModalContent({ brandId }: { brandId: string }) {
  const { data: intel, isLoading } = useAdminBrandIntelligenceDetail(brandId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <GlassSpinner size="lg" />
      </div>
    );
  }

  if (!intel) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Brand data not found
      </div>
    );
  }

  const HealthIcon = healthIcons[intel.compliance.overallHealth];

  return (
    <ScrollArea className="h-[70vh] md:h-[75vh] pr-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={intel.logoUrl || undefined} />
            <AvatarFallback className="text-lg">
              {intel.companyName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{intel.companyName}</h2>
              <Badge 
                variant="outline" 
                className={intel.structure.type === "agency" 
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                }
              >
                {intel.structure.type === "agency" ? "Agency" : "Single Brand"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{intel.email}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {intel.industry && <span>{intel.industry}</span>}
              {intel.companySize && <span>• {intel.companySize}</span>}
            </div>
          </div>
          <Badge className={healthColors[intel.compliance.overallHealth]}>
            <HealthIcon className="h-3 w-3 mr-1" />
            {intel.compliance.overallHealth}
          </Badge>
        </div>

        <Separator />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Team Size</span>
              </div>
              <p className="text-xl font-bold mt-1">{intel.structure.teamSize}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Campaigns</span>
              </div>
              <p className="text-xl font-bold mt-1">{intel.campaigns.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Total Budget</span>
              </div>
              <p className="text-xl font-bold mt-1">{formatCurrency(intel.financials.totalBudgetAllocated)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">Creators</span>
              </div>
              <p className="text-xl font-bold mt-1">{intel.creatorEngagement.uniqueCreatorsEngaged}</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Structure */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              Team Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{intel.structure.rolesBreakdown.agency_admin}</p>
                <p className="text-xs text-muted-foreground">Agency Admins</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{intel.structure.rolesBreakdown.campaign_manager}</p>
                <p className="text-xs text-muted-foreground">Managers</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{intel.structure.rolesBreakdown.finance}</p>
                <p className="text-xs text-muted-foreground">Finance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Metrics */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-400" />
              Campaign Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-green-400">{intel.campaigns.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{intel.campaigns.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">{intel.campaigns.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{intel.campaigns.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
              <div>
                <p className="text-lg font-bold">{intel.campaigns.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Avg. Duration</p>
                <p className="font-medium">{intel.campaigns.avgDuration} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Influencers</p>
                <p className="font-medium">{intel.campaigns.avgInfluencerCount} per campaign</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Metrics */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-400" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget Utilization</span>
                <span className="font-medium">{intel.financials.budgetUtilizationRate}%</span>
              </div>
              <Progress value={intel.financials.budgetUtilizationRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Allocated</p>
                <p className="font-medium text-lg">{formatCurrency(intel.financials.totalBudgetAllocated)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Spent</p>
                <p className="font-medium text-lg">{formatCurrency(intel.financials.totalSpent)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Campaign Budget</p>
                <p className="font-medium">{formatCurrency(intel.financials.avgCampaignBudget)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Payout/Creator</p>
                <p className="font-medium">{formatCurrency(intel.financials.avgPayoutPerCreator)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Engagement */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-400" />
              Creator Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acceptance Rate</span>
                <span className="font-medium">{intel.creatorEngagement.acceptanceRate}%</span>
              </div>
              <Progress 
                value={intel.creatorEngagement.acceptanceRate} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{intel.creatorEngagement.totalInvitationsSent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <p className="text-lg font-bold text-green-400">{intel.creatorEngagement.acceptedInvitations}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <p className="text-lg font-bold text-red-400">{intel.creatorEngagement.declinedInvitations}</p>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <p className="text-lg font-bold text-amber-400">{intel.creatorEngagement.pendingInvitations}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Unique Creators</p>
                <p className="font-medium">{intel.creatorEngagement.uniqueCreatorsEngaged}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Negotiation Rounds</p>
                <p className="font-medium">{intel.creatorEngagement.avgNegotiationRounds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Risk */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              Compliance & Risk Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{intel.compliance.riskScore}/100</p>
              </div>
              <Badge className={healthColors[intel.compliance.overallHealth]}>
                <HealthIcon className="h-3 w-3 mr-1" />
                {intel.compliance.overallHealth}
              </Badge>
            </div>
            <Progress 
              value={intel.compliance.riskScore} 
              className="h-2"
            />
            
            {intel.compliance.signals.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Active Signals</p>
                {intel.compliance.signals.map((signal, idx) => (
                  <RiskSignalCard key={idx} signal={signal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No risk signals detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={intel.activity.isActive ? "default" : "secondary"}>
                {intel.activity.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Last Campaign</p>
                <p className="font-medium">
                  {intel.activity.lastCampaignCreated 
                    ? new Date(intel.activity.lastCampaignCreated).toLocaleDateString()
                    : "Never"
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Campaigns/Month</p>
                <p className="font-medium">{intel.activity.avgCampaignsPerMonth}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{new Date(intel.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Data Sources & Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-white/5">
              {intel.dataSources.map((source, idx) => (
                <DataSourceIndicator key={idx} source={source} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

export function BrandIntelligenceModal({ brandId, open, onOpenChange }: BrandIntelligenceModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Brand Intelligence
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {brandId && <ModalContent brandId={brandId} />}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Brand Intelligence
          </DialogTitle>
        </DialogHeader>
        {brandId && <ModalContent brandId={brandId} />}
      </DialogContent>
    </Dialog>
  );
}
