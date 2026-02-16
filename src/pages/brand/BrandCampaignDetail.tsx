import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useCampaignDetail } from "@/hooks/useCampaigns";
import { useRealtimeInvitations, useRealtimeTrackingLinks } from "@/hooks/useRealtimeInvitations";
import { CampaignPerformanceModal } from "@/components/brand/CampaignPerformanceModal";
import { BrandNegotiationDialog } from "@/components/brand/BrandNegotiationDialog";
import { CampaignAccessGate } from "@/components/CampaignAccessGate";
import { formatCurrency, formatDate, getStatusColor, formatNumber } from "@/lib/formatters";
import {
  ArrowLeft,
  Megaphone,
  Users,
  DollarSign,
  Calendar,
  Target,
  Link2,
  MousePointer,
  Download,
  FileText,
  FileImage,
  FileVideo,
  Folder,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BrandCampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaign, invitations, ctaLinks, trackingLinks, assets, isLoading, refetch } = useCampaignDetail(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [negotiationDialog, setNegotiationDialog] = useState<{
    open: boolean;
    invitationId: string | null;
    creatorName: string;
    currentPayout: number;
  }>({ open: false, invitationId: null, creatorName: "", currentPayout: 0 });

  // Real-time updates
  const handleInvitationChange = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTrackingUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useRealtimeInvitations({ 
    campaignId: id, 
    onInvitationChange: handleInvitationChange 
  });

  useRealtimeTrackingLinks({ 
    campaignId: id, 
    onLinkUpdate: handleTrackingUpdate 
  });

  if (isLoading) {
    return (
      <BrandDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading campaign..." />
        </div>
      </BrandDashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <BrandDashboardLayout>
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <p className="text-muted-foreground mb-4">This campaign may have been deleted or you don't have access.</p>
          <Button asChild>
            <Link to="/brand/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </BrandDashboardLayout>
    );
  }

  const budgetProgress = campaign.total_budget > 0 
    ? Math.round((campaign.allocated_budget / campaign.total_budget) * 100) 
    : 0;

  const acceptedInvitations = invitations.filter(i => i.status === 'accepted');
  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const totalClicks = trackingLinks.reduce((sum, link) => sum + (link.click_count || 0), 0);

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'image': return FileImage;
      case 'video': return FileVideo;
      case 'brand_kit': return Folder;
      default: return FileText;
    }
  };

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <BrandDashboardLayout>
      <CampaignAccessGate campaignId={id}>
      <PageTransition>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/brand/campaigns")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PageHeader
              title={campaign.name}
              subtitle={campaign.category}
              icon={Megaphone}
              action={
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAnalytics(true)}
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </Badge>
                </div>
              }
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Budget"
              value={formatCurrency(campaign.total_budget)}
              subtext={`${budgetProgress}% allocated`}
            />
            <StatCard
              icon={Users}
              label="Creators"
              value={`${acceptedInvitations.length}/${campaign.influencer_count}`}
              subtext={`${pendingInvitations.length} pending`}
            />
            <StatCard
              icon={MousePointer}
              label="Total Clicks"
              value={formatNumber(totalClicks)}
              subtext={`${trackingLinks.length} tracking links`}
            />
            <StatCard
              icon={Calendar}
              label="Timeline"
              value={campaign.timeline_start ? formatDate(campaign.timeline_start) : 'Not set'}
              subtext={campaign.timeline_end ? `to ${formatDate(campaign.timeline_end)}` : ''}
            />
          </div>

          {/* Budget Progress */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Budget Allocation</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(campaign.allocated_budget)} / {formatCurrency(campaign.total_budget)}
              </span>
            </div>
            <Progress value={budgetProgress} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Remaining: {formatCurrency(campaign.remaining_budget || 0)}</span>
              <span>Base payout: {formatCurrency(campaign.base_payout_per_influencer || 0)}/creator</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="creators" className="gap-1">
                Creators
                {invitations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{invitations.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-1">
                Tracking
                {trackingLinks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{trackingLinks.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="assets" className="gap-1">
                Assets
                {assets.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{assets.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Description */}
              {campaign.description && (
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>
              )}

              {/* Targeting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Targeting Criteria
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Followers</span>
                      <span>{formatNumber(campaign.min_followers || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Engagement</span>
                      <span>{campaign.min_engagement || 0}%</span>
                    </div>
                  </div>
                  {campaign.target_niches && campaign.target_niches.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-muted-foreground">Target Niches</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.target_niches.map(niche => (
                          <Badge key={niche} variant="outline" className="text-xs">{niche}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    CTA Links ({ctaLinks.length})
                  </h4>
                  {ctaLinks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No CTA links configured</p>
                  ) : (
                    <div className="space-y-2">
                      {ctaLinks.map(link => (
                        <div key={link.id} className="flex items-center gap-2 text-sm">
                          <Badge variant={link.is_primary ? "default" : "outline"} className="text-xs">
                            {link.label}
                          </Badge>
                          <span className="text-muted-foreground truncate flex-1">{link.original_url}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Required Platforms */}
              {campaign.required_platforms && campaign.required_platforms.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card/50 p-5">
                  <h4 className="font-semibold mb-3">Required Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.required_platforms.map(platform => (
                      <Badge key={platform} variant="secondary">{platform}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Creators Tab */}
            <TabsContent value="creators" className="mt-6">
              {invitations.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No creators invited yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite creators from the Creators page to start building your campaign team.
                  </p>
                  <Button asChild>
                    <Link to="/brand/creators">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Creators
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map(invitation => (
                    <div 
                      key={invitation.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={invitation.creator_profiles?.avatar_url} />
                        <AvatarFallback>
                          {invitation.creator_profiles?.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {invitation.creator_profiles?.name || 'Unknown Creator'}
                          </span>
                          {getInvitationStatusIcon(invitation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invitation.creator_profiles?.username || invitation.creator_profiles?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-success">
                          {formatCurrency(invitation.offered_payout)}
                        </div>
                        {invitation.negotiated_delta > 0 && (
                          <span className="text-xs text-amber-500">
                            +{formatCurrency(invitation.negotiated_delta)} negotiated
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          {invitation.status === 'negotiating' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setNegotiationDialog({
                                  open: true,
                                  invitationId: invitation.id,
                                  creatorName: invitation.creator_profiles?.name || 'Creator',
                                  currentPayout: invitation.offered_payout,
                                })}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Review Negotiation
                              </DropdownMenuItem>
                            </>
                          )}
                          {invitation.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                Withdraw Invitation
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="mt-6">
              {trackingLinks.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No tracking links yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Tracking links are automatically generated when creators accept invitations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{trackingLinks.length}</div>
                      <div className="text-xs text-muted-foreground">Active Links</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{formatNumber(totalClicks)}</div>
                      <div className="text-xs text-muted-foreground">Total Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {trackingLinks.length > 0 
                          ? formatNumber(Math.round(totalClicks / trackingLinks.length))
                          : 0
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Avg per Link</div>
                    </div>
                  </div>

                  {/* Links List */}
                  {trackingLinks.map(link => (
                    <div 
                      key={link.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {link.campaign_cta_links?.label || 'Link'}
                          </Badge>
                          {link.campaign_cta_links?.is_primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {link.short_url}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-medium">
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            {formatNumber(link.click_count || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">clicks</div>
                        </div>
                        {link.qr_code_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={link.qr_code_url} target="_blank" rel="noopener noreferrer">
                              <QrCode className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="mt-6">
              {assets.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
                  <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No assets uploaded</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload campaign assets when editing this campaign.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.map(asset => {
                    const AssetIcon = getAssetIcon(asset.asset_category);
                    return (
                      <div 
                        key={asset.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <AssetIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{asset.file_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(asset.file_size)}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {asset.asset_category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={asset.file_url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Analytics Modal */}
        <CampaignPerformanceModal
          campaignId={id}
          campaignName={campaign.name}
          open={showAnalytics}
          onOpenChange={setShowAnalytics}
        />

        {/* Negotiation Dialog */}
        <BrandNegotiationDialog
          open={negotiationDialog.open}
          onOpenChange={(open) => setNegotiationDialog(prev => ({ ...prev, open }))}
          invitationId={negotiationDialog.invitationId}
          campaignName={campaign.name}
          creatorName={negotiationDialog.creatorName}
          currentPayout={negotiationDialog.currentPayout}
          onActionComplete={refetch}
        />
      </PageTransition>
      </CampaignAccessGate>
    </BrandDashboardLayout>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
}

const StatCard = ({ icon: Icon, label, value, subtext }: StatCardProps) => (
  <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
    <Icon className="h-5 w-5 text-muted-foreground mb-2" />
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
    {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
  </div>
);

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default BrandCampaignDetail;
