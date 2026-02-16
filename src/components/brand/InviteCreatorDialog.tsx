import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Send, 
  DollarSign, 
  Users,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBrandInvitations } from "@/hooks/useBrandInvitations";
import { formatCurrency } from "@/lib/formatters";

interface Campaign {
  id: string;
  name: string;
  base_payout_per_influencer: number | null;
  timeline_start: string | null;
  timeline_end: string | null;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  brandFitScore: number;
}

interface InviteCreatorDialogProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCampaignId?: string;
  onSuccess?: () => void;
}

export const InviteCreatorDialog = ({
  creator,
  open,
  onOpenChange,
  preselectedCampaignId,
  onSuccess,
}: InviteCreatorDialogProps) => {
  const { isInviting, inviteCreator } = useBrandInvitations();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(preselectedCampaignId || "");
  const [offeredPayout, setOfferedPayout] = useState<number>(0);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  useEffect(() => {
    if (open) {
      fetchActiveCampaigns();
    }
  }, [open]);

  useEffect(() => {
    if (preselectedCampaignId) {
      setSelectedCampaignId(preselectedCampaignId);
    }
  }, [preselectedCampaignId]);

  useEffect(() => {
    // Update offered payout when campaign changes
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (campaign?.base_payout_per_influencer) {
      setOfferedPayout(campaign.base_payout_per_influencer);
    }
  }, [selectedCampaignId, campaigns]);

  const fetchActiveCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, base_payout_per_influencer, timeline_start, timeline_end')
        .eq('brand_user_id', user.id)
        .in('status', ['draft', 'discovery', 'active']);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const handleInvite = async () => {
    if (!creator || !selectedCampaignId || !selectedCampaign) return;

    // Note: In a real app, creator.id would be the user_id
    // For mock data, we'll use a placeholder UUID
    const creatorUserId = creator.id.length === 36 ? creator.id : crypto.randomUUID();

    const invitation = await inviteCreator({
      campaignId: selectedCampaignId,
      creatorUserId,
      basePayout: selectedCampaign.base_payout_per_influencer || 0,
      offeredPayout,
      timelineStart: selectedCampaign.timeline_start || undefined,
      timelineEnd: selectedCampaign.timeline_end || undefined,
      specialRequirements: specialRequirements || undefined,
    });

    if (invitation) {
      onOpenChange(false);
      setSpecialRequirements("");
      onSuccess?.();
    }
  };

  if (!creator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Invite Creator
          </DialogTitle>
          <DialogDescription>
            Send a campaign invitation to this creator
          </DialogDescription>
        </DialogHeader>

        {/* Creator Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50">
          <Avatar className="h-12 w-12">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback>{creator.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{creator.name}</p>
            <p className="text-sm text-muted-foreground">{creator.username}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {creator.brandFitScore}% fit
          </Badge>
        </div>

        {/* Campaign Selection */}
        <div className="space-y-2">
          <Label>Select Campaign *</Label>
          {isLoadingCampaigns ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                No active campaigns
              </div>
              <p className="text-muted-foreground mt-1">
                Create a campaign first to invite creators.
              </p>
            </div>
          ) : (
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    <div className="flex items-center gap-2">
                      <span>{campaign.name}</span>
                      {campaign.base_payout_per_influencer && (
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(campaign.base_payout_per_influencer)})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Payout */}
        {selectedCampaign && (
          <>
            <div className="space-y-2">
              <Label htmlFor="payout">Offered Payout ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payout"
                  type="number"
                  min={0}
                  value={offeredPayout}
                  onChange={(e) => setOfferedPayout(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
              {selectedCampaign.base_payout_per_influencer && offeredPayout !== selectedCampaign.base_payout_per_influencer && (
                <p className="text-xs text-muted-foreground">
                  Base payout: {formatCurrency(selectedCampaign.base_payout_per_influencer)}
                  {offeredPayout > selectedCampaign.base_payout_per_influencer && (
                    <span className="text-amber-500 ml-1">
                      (+{formatCurrency(offeredPayout - selectedCampaign.base_payout_per_influencer)} premium)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Timeline */}
            {(selectedCampaign.timeline_start || selectedCampaign.timeline_end) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {selectedCampaign.timeline_start && new Date(selectedCampaign.timeline_start).toLocaleDateString()}
                  {selectedCampaign.timeline_start && selectedCampaign.timeline_end && ' - '}
                  {selectedCampaign.timeline_end && new Date(selectedCampaign.timeline_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Special Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Special Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements for this creator..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleInvite}
            disabled={isInviting || !selectedCampaignId || campaigns.length === 0}
          >
            {isInviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
