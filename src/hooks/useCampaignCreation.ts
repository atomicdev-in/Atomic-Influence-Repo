import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UploadedAsset } from "@/components/brand/AssetUploadSection";
import { CTALink } from "@/components/brand/CTALinksSection";
import type { Json } from "@/integrations/supabase/types";

interface Deliverable {
  id: string;
  type: string;
  quantity: number;
  description: string;
}

interface CampaignFormData {
  name: string;
  description: string;
  objective: string;
  category: string;
  totalBudget: number;
  influencerCount: number;
  basePayoutPerInfluencer: number;
  deliverables: Deliverable[];
  contentGuidelines: string;
  timelineStart: string;
  timelineEnd: string;
  requiredPlatforms: string[];
  minFollowers: number;
  minEngagement: number;
  targetNiches: string[];
}

export const useCampaignCreation = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const saveCampaignAsDraft = async (
    formData: CampaignFormData,
    assets: UploadedAsset[],
    ctaLinks: CTALink[]
  ) => {
    setIsSaving(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Authentication required", { description: "You must be signed in to create a campaign." });
        return null;
      }

      // Convert deliverables to JSON-safe format
      const deliverablesJson: Json = formData.deliverables.map(d => ({
        id: d.id,
        type: d.type,
        quantity: d.quantity,
        description: d.description,
      }));

      // Create the campaign as draft
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          total_budget: formData.totalBudget,
          influencer_count: formData.influencerCount,
          base_payout_per_influencer: formData.basePayoutPerInfluencer,
          deliverables: deliverablesJson,
          content_guidelines: formData.contentGuidelines,
          timeline_start: formData.timelineStart || null,
          timeline_end: formData.timelineEnd || null,
          required_platforms: formData.requiredPlatforms,
          min_followers: formData.minFollowers,
          min_engagement: formData.minEngagement,
          target_niches: formData.targetNiches,
          targeting_criteria: { objective: formData.objective },
          status: 'draft',
          brand_user_id: user.id,
          allocated_budget: 0,
          remaining_budget: formData.totalBudget,
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Campaign creation error:', campaignError);
        toast.error("Campaign creation failed", { description: "Unable to save campaign. Please review and try again." });
        return null;
      }

      // Save CTA links
      if (ctaLinks.length > 0) {
        const ctaLinksToInsert = ctaLinks
          .filter(link => link.url.trim())
          .map(link => ({
            campaign_id: campaign.id,
            label: link.label || 'Website',
            original_url: link.url,
            is_primary: link.isPrimary,
          }));

        if (ctaLinksToInsert.length > 0) {
          const { error: ctaError } = await supabase
            .from('campaign_cta_links')
            .insert(ctaLinksToInsert);

          if (ctaError) {
            console.error('CTA links error:', ctaError);
            toast.error("Link save failed", { description: "Campaign created but CTA links could not be saved." });
          }
        }
      }

      // Save asset metadata (files already uploaded to storage)
      if (assets.length > 0) {
        const assetsToInsert = assets
          .filter(asset => asset.fileUrl)
          .map(asset => ({
            campaign_id: campaign.id,
            file_name: asset.fileName,
            file_type: asset.fileType,
            file_size: asset.fileSize,
            file_url: asset.fileUrl,
            asset_category: asset.category,
            description: asset.description || null,
          }));

        if (assetsToInsert.length > 0) {
          const { error: assetsError } = await supabase
            .from('campaign_assets')
            .insert(assetsToInsert);

          if (assetsError) {
            console.error('Assets error:', assetsError);
            toast.error("Asset save failed", { description: "Campaign created but asset metadata could not be saved." });
          }
        }
      }

      return campaign;

    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error("Operation failed", { description: "An error occurred while saving the campaign." });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async (
    formData: CampaignFormData,
    assets: UploadedAsset[],
    ctaLinks: CTALink[]
  ) => {
    const campaign = await saveCampaignAsDraft(formData, assets, ctaLinks);
    if (campaign) {
      toast.success("Draft preserved", { description: "Campaign draft has been saved for later." });
    }
    return campaign;
  };

  const publishCampaign = async (
    formData: CampaignFormData,
    assets: UploadedAsset[],
    ctaLinks: CTALink[]
  ) => {
    // First save as draft
    const campaign = await saveCampaignAsDraft(formData, assets, ctaLinks);
    if (!campaign) return null;

    // Then publish via RPC (server-side validation + snapshot creation)
    try {
      const { data, error } = await supabase.rpc('publish_campaign', {
        _campaign_id: campaign.id
      });

      if (error) {
        console.error('Publish RPC error:', error);
        toast.error("Publication failed", { description: error.message });
        return null;
      }

      const result = data as { success: boolean; error?: string; snapshot_id?: string };
      
      if (!result.success) {
        toast.error("Publication failed", { description: result.error || "Unable to publish campaign." });
        return null;
      }

      toast.success("Campaign published", {
        description: `"${formData.name}" is now live and visible to creators.`,
      });
      navigate("/brand/campaigns");
      return campaign;

    } catch (error) {
      console.error('Error publishing campaign:', error);
      toast.error("Publication failed", { description: "An unexpected error occurred." });
      return null;
    }
  };

  return {
    isSaving,
    saveDraft,
    publishCampaign,
  };
};
