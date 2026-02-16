import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CreatorTrackingLinks } from "./CreatorTrackingLinks";
import { GlassLoading } from "@/components/ui/glass-spinner";
import {
  FileText,
  Download,
  Link2,
  Calendar,
  DollarSign,
  Target,
  FileImage,
  FileVideo,
  Folder,
  ExternalLink,
  CheckCircle2,
  Clock,
  Hash,
  AtSign,
} from "lucide-react";

interface CampaignAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: string;
  description?: string;
}

interface TrackingLink {
  id: string;
  label: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeUrl: string;
  clickCount: number;
  isPrimary: boolean;
}

interface CampaignBriefData {
  id: string;
  name: string;
  description: string;
  category: string;
  contentGuidelines: string;
  deliverables: Array<{ type: string; quantity: number; description?: string }>;
  timelineStart: string;
  timelineEnd: string;
  offeredPayout: number;
  status: string;
}

interface CreatorCampaignBriefProps {
  campaignId: string;
  invitationId: string;
}

export const CreatorCampaignBrief = ({ campaignId, invitationId }: CreatorCampaignBriefProps) => {
  const [activeTab, setActiveTab] = useState("brief");
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignBriefData | null>(null);
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [trackingLinks, setTrackingLinks] = useState<TrackingLink[]>([]);

  useEffect(() => {
    loadCampaignData();
  }, [campaignId, invitationId]);

  const loadCampaignData = async () => {
    setIsLoading(true);
    try {
      // Load campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Load invitation details for payout
      const { data: invitationData, error: invitationError } = await supabase
        .from('campaign_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invitationError) throw invitationError;

      // Load campaign assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('campaign_assets')
        .select('*')
        .eq('campaign_id', campaignId);

      if (!assetsError && assetsData) {
        setAssets(assetsData.map(a => ({
          id: a.id,
          fileName: a.file_name,
          fileType: a.file_type,
          fileSize: a.file_size,
          fileUrl: a.file_url,
          category: a.asset_category,
          description: a.description || undefined,
        })));
      }

      // Load tracking links with CTA link info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: linksData, error: linksError } = await supabase
          .from('creator_tracking_links')
          .select(`
            *,
            campaign_cta_links (
              label,
              is_primary
            )
          `)
          .eq('campaign_id', campaignId)
          .eq('creator_user_id', user.id);

        if (!linksError && linksData) {
          setTrackingLinks(linksData.map(l => ({
            id: l.id,
            label: l.campaign_cta_links?.label || 'Link',
            shortUrl: l.short_url,
            originalUrl: l.original_url,
            qrCodeUrl: l.qr_code_url || '',
            clickCount: l.click_count || 0,
            isPrimary: l.campaign_cta_links?.is_primary || false,
          })));
        }
      }

      // Parse deliverables safely
      let deliverables: Array<{ type: string; quantity: number; description?: string }> = [];
      if (campaignData.deliverables) {
        if (Array.isArray(campaignData.deliverables)) {
          deliverables = campaignData.deliverables as Array<{ type: string; quantity: number; description?: string }>;
        }
      }

      setCampaign({
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description || '',
        category: campaignData.category,
        contentGuidelines: campaignData.content_guidelines || '',
        deliverables,
        timelineStart: campaignData.timeline_start || '',
        timelineEnd: campaignData.timeline_end || '',
        offeredPayout: invitationData.offered_payout,
        status: invitationData.status,
      });

    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'image': return FileImage;
      case 'video': return FileVideo;
      case 'brand_kit': return Folder;
      default: return FileText;
    }
  };

  const downloadAsset = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <GlassLoading size="lg" variant="primary" text="Loading campaign brief..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Campaign not found or you don't have access.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{campaign.name}</h2>
            <p className="text-sm text-muted-foreground">{campaign.category}</p>
          </div>
          <Badge className="bg-success/20 text-success border-success/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {campaign.status === 'accepted' ? 'Active' : campaign.status}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-background/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-success">
              <DollarSign className="h-4 w-4" />
              {campaign.offeredPayout.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Your Payout</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              <Target className="h-4 w-4 text-primary" />
              {campaign.deliverables.reduce((sum, d) => sum + d.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Deliverables</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              <Clock className="h-4 w-4 text-orange-500" />
              {campaign.timelineEnd ? new Date(campaign.timelineEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
            </div>
            <p className="text-xs text-muted-foreground">Due Date</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="brief" className="gap-2">
            <FileText className="h-4 w-4" />
            Brief
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Download className="h-4 w-4" />
            Assets
            {assets.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{assets.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Links
            {trackingLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{trackingLinks.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Brief Tab */}
        <TabsContent value="brief" className="mt-6 space-y-6">
          {/* Description */}
          {campaign.description && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Campaign Overview
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {campaign.description}
              </p>
            </div>
          )}

          {/* Deliverables */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-5">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Required Deliverables
            </h4>
            <div className="space-y-2">
              {campaign.deliverables.map((deliverable, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                >
                  <span className="text-sm">{deliverable.type}</span>
                  <Badge variant="outline">×{deliverable.quantity}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Content Guidelines */}
          {campaign.contentGuidelines && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Content Guidelines
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {campaign.contentGuidelines}
              </p>
            </div>
          )}

          {/* Timeline */}
          {(campaign.timelineStart || campaign.timelineEnd) && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Timeline
              </h4>
              <div className="flex items-center gap-4 text-sm">
                {campaign.timelineStart && (
                  <div>
                    <span className="text-muted-foreground">Start: </span>
                    <span className="font-medium">
                      {new Date(campaign.timelineStart).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                {campaign.timelineEnd && (
                  <div>
                    <span className="text-muted-foreground">End: </span>
                    <span className="font-medium">
                      {new Date(campaign.timelineEnd).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="mt-6">
          {assets.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
              <Download className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="font-medium mb-1">No assets uploaded</p>
              <p className="text-sm text-muted-foreground">
                The brand hasn't uploaded any assets for this campaign yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => {
                const AssetIcon = getAssetIcon(asset.category);
                return (
                  <div 
                    key={asset.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <AssetIcon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{asset.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(asset.fileSize)}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {asset.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      {asset.description && (
                        <p className="text-xs text-muted-foreground mt-1">{asset.description}</p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsset(asset.fileUrl, asset.fileName)}
                      className="gap-2 shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="mt-6">
          <CreatorTrackingLinks 
            campaignName={campaign.name}
            links={trackingLinks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
