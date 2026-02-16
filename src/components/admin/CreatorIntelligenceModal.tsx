import { useAdminCreatorIntelligenceDetail, type CreatorIntelligence, type DataSource } from "@/hooks/useAdminCreatorIntelligence";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  User, 
  TrendingUp, 
  Shield, 
  Clock, 
  Activity,
  MapPin,
  Globe,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  DollarSign,
  BarChart3,
  FileQuestion,
  Database,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreatorIntelligenceModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Tier badge styling
const tierStyles: Record<string, { label: string; className: string }> = {
  premium: { label: "Premium", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  established: { label: "Established", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  emerging: { label: "Emerging", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  new: { label: "New", className: "bg-muted text-muted-foreground border-white/10" },
};

// Confidence indicator styling
const confidenceStyles: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  high: { icon: CheckCircle2, color: "text-emerald-400", label: "High confidence" },
  medium: { icon: AlertCircle, color: "text-amber-400", label: "Medium confidence" },
  low: { icon: HelpCircle, color: "text-orange-400", label: "Low confidence" },
  none: { icon: XCircle, color: "text-muted-foreground", label: "No data" },
};

// Platform icons - using Activity as generic icon since branded icons are deprecated
const platformIcons: Record<string, LucideIcon> = {
  instagram: Activity,
  youtube: Activity,
  twitter: Activity,
  linkedin: Activity,
  tiktok: Activity,
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ScoreCard({ label, value, icon: Icon, description }: { 
  label: string; 
  value: number; 
  icon: typeof TrendingUp;
  description?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <span className={cn("text-lg font-bold", getScoreColor(value))}>
          {value}%
        </span>
      </div>
      <Progress value={value} className="h-2" />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function DataSourceIndicator({ source }: { source: DataSource }) {
  const style = confidenceStyles[source.confidence];
  const Icon = style.icon;
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{source.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {source.available && source.lastUpdated && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(source.lastUpdated), "MMM d, yyyy")}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Icon className={cn("h-4 w-4", style.color)} />
          <span className={cn("text-xs", style.color)}>{style.label}</span>
        </div>
      </div>
    </div>
  );
}

function IntelligenceContent({ data }: { data: CreatorIntelligence }) {
  const tierStyle = tierStyles[data.classification.tier];
  
  return (
    <ScrollArea className="h-[70vh] md:h-[80vh]">
      <div className="space-y-6 p-1 pr-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/10">
            <AvatarImage src={data.avatarUrl || undefined} />
            <AvatarFallback className="text-lg">
              {data.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold truncate">{data.name}</h2>
              <Badge variant="outline" className={tierStyle.className}>
                {tierStyle.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">@{data.username}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{data.email}</span>
              </div>
              {data.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{data.location}</span>
                </div>
              )}
              {data.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{data.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Creator Score</p>
                <p className="text-4xl font-bold">{data.scores.overall}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">How brands see this creator</p>
                <Badge variant="outline" className={tierStyle.className}>
                  {tierStyle.label} Creator
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-card/50">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data">Data Sources</TabsTrigger>
          </TabsList>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-4 mt-4">
            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreCard 
                  label="Profile Completion" 
                  value={data.scores.profile} 
                  icon={User}
                  description="Bio, location, pricing, avatar"
                />
                <ScoreCard 
                  label="Brand Fit" 
                  value={data.scores.brandFit} 
                  icon={TrendingUp}
                  description="Preferences and survey responses"
                />
                <ScoreCard 
                  label="Social Reach" 
                  value={data.scores.socialReach} 
                  icon={Activity}
                  description="Connected platforms and verification"
                />
                <ScoreCard 
                  label="Engagement" 
                  value={data.scores.engagement} 
                  icon={BarChart3}
                  description="Average engagement rate"
                />
                <ScoreCard 
                  label="Reliability" 
                  value={data.scores.reliability} 
                  icon={Shield}
                  description="Campaign completion and quality"
                />
                <ScoreCard 
                  label="Responsiveness" 
                  value={data.scores.responsiveness} 
                  icon={Clock}
                  description="Average response time to brands"
                />
              </CardContent>
            </Card>

            {/* Classification */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.classification.categories.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Brand Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {data.classification.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.classification.contentStyles.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Content Styles</p>
                    <div className="flex flex-wrap gap-1">
                      {data.classification.contentStyles.map((style) => (
                        <Badge key={style} variant="outline" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.classification.audienceType && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Audience Type</p>
                    <Badge variant="outline">{data.classification.audienceType}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4 mt-4">
            {data.platforms.length === 0 ? (
              <Card className="bg-card/50 border-white/10">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No connected platforms</p>
                </CardContent>
              </Card>
            ) : (
              data.platforms.map((platform) => {
                const Icon = platformIcons[platform.platform.toLowerCase()] || Activity;
                return (
                  <Card key={platform.platform} className="bg-card/50 border-white/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{platform.platform}</p>
                            {platform.username && (
                              <p className="text-sm text-muted-foreground">@{platform.username}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {platform.followers.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">followers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{platform.engagement.toFixed(1)}% engagement</span>
                        </div>
                        {platform.verified && (
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!platform.connected && (
                          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold">{data.performance.completedCampaigns}</p>
                  <p className="text-xs text-muted-foreground">Completed Campaigns</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold">{data.performance.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold">{data.performance.onTimeRate}%</p>
                  <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold">{data.performance.avgResponseTime}h</p>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Earnings & Invitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                  <span className="font-medium">
                    ${data.performance.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accepted Invitations</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400">
                    {data.performance.acceptedInvitations}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Declined Invitations</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400">
                    {data.performance.declinedInvitations}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Invitations</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400">
                    {data.performance.pendingInvitations}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Survey Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Surveys Completed</span>
                  <span className="font-medium">
                    {data.surveyEngagement.totalCompleted} / {data.surveyEngagement.totalAvailable}
                  </span>
                </div>
                <Progress value={data.surveyEngagement.completionRate} className="h-2" />
                {data.surveyEngagement.lastCompletedAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Last completed: {format(new Date(data.surveyEngagement.lastCompletedAt), "MMM d, yyyy")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Sources & Confidence</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Shows where creator data comes from and how recent it is
                </p>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-white/10">
                  {data.dataSources.map((source) => (
                    <DataSourceIndicator key={source.name} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Privacy Notice</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This view shows aggregated intelligence derived from creator-provided data. 
                      Personal information is displayed for platform oversight only. 
                      All scoring is algorithmic and transparent to creators.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences (if available) */}
            {(data.preferences.brandCategories.length > 0 || data.preferences.collaborationType) && (
              <Card className="bg-card/50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Creator Preferences</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Self-declared preferences from Brand Fit survey
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.preferences.collaborationType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Collaboration Style</span>
                      <Badge variant="outline">{data.preferences.collaborationType}</Badge>
                    </div>
                  )}
                  {data.preferences.creativeControl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Creative Control</span>
                      <Badge variant="outline">{data.preferences.creativeControl}</Badge>
                    </div>
                  )}
                  {data.preferences.alcoholOpenness && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Alcohol Brands</span>
                      <Badge variant="outline">{data.preferences.alcoholOpenness}</Badge>
                    </div>
                  )}
                  {data.preferences.avoidedTopics && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avoided Topics</p>
                      <p className="text-sm bg-white/5 p-2 rounded">
                        {data.preferences.avoidedTopics}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

export function CreatorIntelligenceModal({ userId, open, onOpenChange }: CreatorIntelligenceModalProps) {
  const isMobile = useIsMobile();
  const { data, isLoading } = useAdminCreatorIntelligenceDetail(userId);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-white/10">
            <DrawerTitle>Creator Intelligence</DrawerTitle>
          </DrawerHeader>
          {isLoading ? <LoadingSkeleton /> : data ? <IntelligenceContent data={data} /> : null}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Creator Intelligence</DialogTitle>
        </DialogHeader>
        {isLoading ? <LoadingSkeleton /> : data ? <IntelligenceContent data={data} /> : null}
      </DialogContent>
    </Dialog>
  );
}
