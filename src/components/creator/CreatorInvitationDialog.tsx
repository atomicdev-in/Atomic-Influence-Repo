import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X, 
  MessageSquare,
  Send,
  AlertTriangle,
  Loader2,
  ArrowUp,
  Building2
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useInvitationActions } from "@/hooks/useInvitationActions";
import { useNegotiations } from "@/hooks/useNegotiations";

interface CreatorInvitation {
  id: string;
  campaign_id: string;
  status: string;
  base_payout: number;
  offered_payout: number;
  negotiated_delta: number | null;
  deliverables: any;
  timeline_start: string | null;
  timeline_end: string | null;
  special_requirements: string | null;
  created_at: string;
  campaign?: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    brand_user_id: string;
    timeline_start: string | null;
    timeline_end: string | null;
    total_budget: number;
  };
  brand_profile?: {
    company_name: string;
    logo_url: string | null;
  };
}

interface CreatorInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: CreatorInvitation | null;
  onActionComplete?: () => void;
}

export const CreatorInvitationDialog = ({
  open,
  onOpenChange,
  invitation,
  onActionComplete,
}: CreatorInvitationDialogProps) => {
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [proposedPayout, setProposedPayout] = useState(0);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  
  const { isProcessing, acceptInvitation, declineInvitation } = useInvitationActions();
  const { isSubmitting, submitCounterOffer } = useNegotiations();

  useEffect(() => {
    if (invitation) {
      setProposedPayout(invitation.offered_payout);
      setShowNegotiation(false);
      setNegotiationMessage("");
    }
  }, [invitation]);

  if (!invitation) return null;

  const campaign = invitation.campaign;
  const brandName = invitation.brand_profile?.company_name || "Brand";
  const deliverables = Array.isArray(invitation.deliverables) ? invitation.deliverables : [];
  const payoutIncrease = proposedPayout - invitation.offered_payout;

  const handleAccept = async () => {
    if (!campaign) return;
    const success = await acceptInvitation(invitation.id, campaign.id);
    if (success) {
      onOpenChange(false);
      onActionComplete?.();
    }
  };

  const handleDecline = async () => {
    const success = await declineInvitation(invitation.id, false);
    if (success) {
      onOpenChange(false);
      onActionComplete?.();
    }
  };

  const handleSubmitCounterOffer = async () => {
    if (!negotiationMessage.trim()) return;
    
    const success = await submitCounterOffer({
      invitationId: invitation.id,
      proposedPayout: proposedPayout !== invitation.offered_payout ? proposedPayout : undefined,
      message: negotiationMessage,
    });

    if (success) {
      setShowNegotiation(false);
      onActionComplete?.();
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-amber-500/20 text-amber-500" },
    accepted: { label: "Accepted", color: "bg-emerald-500/20 text-emerald-500" },
    declined: { label: "Declined", color: "bg-red-500/20 text-red-500" },
    negotiating: { label: "Negotiating", color: "bg-blue-500/20 text-blue-500" },
    withdrawn: { label: "Withdrawn", color: "bg-gray-500/20 text-gray-500" },
  };

  const status = statusConfig[invitation.status] || statusConfig.pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{campaign?.name || "Campaign Invitation"}</DialogTitle>
              <p className="text-sm text-muted-foreground">{brandName}</p>
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Payout Info */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offered Payout</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(invitation.offered_payout)}
                </p>
              </div>
              {invitation.negotiated_delta && invitation.negotiated_delta > 0 && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                  +{formatCurrency(invitation.negotiated_delta)} negotiated
                </Badge>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{campaign?.category}</span>
            </div>
            
            {(campaign?.timeline_start || campaign?.timeline_end) && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Timeline:</span>
                <span className="font-medium">
                  {campaign?.timeline_start} - {campaign?.timeline_end}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {campaign?.description && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{campaign.description}</p>
            </div>
          )}

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Deliverables</Label>
              <div className="mt-2 space-y-2">
                {deliverables.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50 border border-border/50">
                    <span className="font-medium">{d.quantity}×</span>
                    <span>{d.type}</span>
                    {d.description && (
                      <span className="text-muted-foreground">- {d.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Requirements */}
          {invitation.special_requirements && (
            <div>
              <Label className="text-sm font-medium">Special Requirements</Label>
              <p className="text-sm text-muted-foreground mt-1">{invitation.special_requirements}</p>
            </div>
          )}

          <Separator />

          {/* Negotiation Form */}
          {showNegotiation && invitation.status === 'pending' && (
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Counter-Offer</span>
              </div>

              <div>
                <Label htmlFor="proposedPayout">Proposed Payout</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="proposedPayout"
                    type="number"
                    min={0}
                    step={100}
                    value={proposedPayout}
                    onChange={(e) => setProposedPayout(Number(e.target.value))}
                  />
                  {payoutIncrease > 0 && (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 shrink-0">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{formatCurrency(payoutIncrease)}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Explain why you're requesting these changes..."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {payoutIncrease > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-600">
                    Requesting a higher payout may affect your chances. The brand will review your proposal.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNegotiation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitCounterOffer}
                  disabled={isSubmitting || !negotiationMessage.trim()}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {invitation.status === 'pending' && !showNegotiation && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={isProcessing}
                className="flex-1 gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Decline
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowNegotiation(true)}
                className="flex-1 gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Negotiate
              </Button>
              <Button 
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Accept
              </Button>
            </div>
          )}

          {invitation.status === 'negotiating' && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-sm text-blue-600">
                Your counter-offer is pending brand review
              </p>
            </div>
          )}

          {invitation.status === 'accepted' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-sm text-emerald-600">
                You've accepted this invitation. Check your active campaigns for tracking links.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
