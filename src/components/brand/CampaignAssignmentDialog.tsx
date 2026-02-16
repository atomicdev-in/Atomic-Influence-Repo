import { useState } from "react";
import { Check, X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCampaignAssignments, CampaignWithAssignments } from "@/hooks/useCampaignAssignments";
import { BrandUserRole } from "@/hooks/useBrandRoles";
import { toast } from "@/hooks/use-toast";

interface CampaignAssignmentDialogProps {
  member: BrandUserRole;
  campaigns: CampaignWithAssignments[];
  onClose: () => void;
}

export const CampaignAssignmentDialog = ({
  member,
  campaigns,
  onClose,
}: CampaignAssignmentDialogProps) => {
  const { assignCampaign, unassignCampaign } = useCampaignAssignments();
  const [loadingCampaigns, setLoadingCampaigns] = useState<Set<string>>(new Set());

  const isAssigned = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.assignments.some(a => a.user_id === member.user_id) ?? false;
  };

  const handleToggle = async (campaignId: string) => {
    setLoadingCampaigns(prev => new Set(prev).add(campaignId));

    try {
      if (isAssigned(campaignId)) {
        const { error } = await unassignCampaign(member.user_id, campaignId);
        if (error) throw error;
        toast({
          title: "Campaign unassigned",
          description: "Access to this campaign has been removed",
        });
      } else {
        const { error } = await assignCampaign(member.user_id, campaignId);
        if (error) throw error;
        toast({
          title: "Campaign assigned",
          description: "Access to this campaign has been granted",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingCampaigns(prev => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "draft":
        return "bg-muted text-muted-foreground border-border";
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Manage Campaign Access
          </DialogTitle>
          <DialogDescription>
            Select which campaigns this Campaign Manager can view and manage
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] py-4">
          <div className="space-y-2">
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No campaigns available</p>
                <p className="text-sm">Create campaigns to assign them to team members</p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const assigned = isAssigned(campaign.id);
                const isLoading = loadingCampaigns.has(campaign.id);

                return (
                  <button
                    key={campaign.id}
                    onClick={() => handleToggle(campaign.id)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                      assigned
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {campaign.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs capitalize ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : assigned ? (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
