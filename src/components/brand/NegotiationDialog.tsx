import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Send,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface NegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: InvitationData | null;
  onSubmit?: (negotiation: NegotiationProposal) => void;
  mode: 'creator' | 'brand';
}

export interface InvitationData {
  id: string;
  campaignName: string;
  basePayout: number;
  offeredPayout: number;
  negotiatedDelta: number;
  deliverables: { type: string; quantity: number; description?: string }[];
  timelineStart: string;
  timelineEnd: string;
  specialRequirements?: string;
}

export interface NegotiationProposal {
  invitationId: string;
  proposedPayout?: number;
  proposedDeliverables?: { type: string; quantity: number; description?: string }[];
  proposedTimelineStart?: string;
  proposedTimelineEnd?: string;
  message: string;
}

export const NegotiationDialog = ({ 
  open, 
  onOpenChange, 
  invitation, 
  onSubmit,
  mode 
}: NegotiationDialogProps) => {
  const [proposedPayout, setProposedPayout] = useState<number>(0);
  const [proposedTimelineStart, setProposedTimelineStart] = useState("");
  const [proposedTimelineEnd, setProposedTimelineEnd] = useState("");
  const [message, setMessage] = useState("");

  // Initialize form when invitation changes
  useState(() => {
    if (invitation) {
      setProposedPayout(invitation.offeredPayout);
      setProposedTimelineStart(invitation.timelineStart);
      setProposedTimelineEnd(invitation.timelineEnd);
    }
  });

  if (!invitation) return null;

  const payoutDelta = proposedPayout - invitation.offeredPayout;
  const isIncreasing = payoutDelta > 0;

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    onSubmit?.({
      invitationId: invitation.id,
      proposedPayout: proposedPayout !== invitation.offeredPayout ? proposedPayout : undefined,
      proposedTimelineStart: proposedTimelineStart !== invitation.timelineStart ? proposedTimelineStart : undefined,
      proposedTimelineEnd: proposedTimelineEnd !== invitation.timelineEnd ? proposedTimelineEnd : undefined,
      message,
    });
    
    onOpenChange(false);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'creator' ? 'Propose Counter-Offer' : 'Adjust Offer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Offer Summary */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <p className="text-sm font-medium mb-2">Current Offer for: {invitation.campaignName}</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Base Payout:</span>
                <span className="ml-1 font-semibold">{formatCurrency(invitation.basePayout)}</span>
              </div>
              {invitation.negotiatedDelta > 0 && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                  +{formatCurrency(invitation.negotiatedDelta)} negotiated
                </Badge>
              )}
            </div>
          </div>

          {/* Payout Adjustment */}
          <div>
            <Label htmlFor="proposedPayout" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Proposed Payout
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="proposedPayout"
                type="number"
                min={0}
                step={100}
                value={proposedPayout}
                onChange={(e) => setProposedPayout(Number(e.target.value))}
              />
              {payoutDelta !== 0 && (
                <Badge 
                  variant="outline" 
                  className={isIncreasing ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                >
                  {isIncreasing ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {isIncreasing ? '+' : ''}{formatCurrency(payoutDelta)}
                </Badge>
              )}
            </div>
          </div>

          {/* Timeline Adjustment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proposedStart" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="proposedStart"
                type="date"
                value={proposedTimelineStart}
                onChange={(e) => setProposedTimelineStart(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proposedEnd">End Date</Label>
              <Input
                id="proposedEnd"
                type="date"
                value={proposedTimelineEnd}
                onChange={(e) => setProposedTimelineEnd(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Deliverables Note */}
          <div className="rounded-xl border border-border/50 bg-background/50 p-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Current Deliverables</p>
                <ul className="text-muted-foreground mt-1 space-y-0.5">
                  {invitation.deliverables.map((d, i) => (
                    <li key={i}>{d.quantity}× {d.type}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder={mode === 'creator' 
                ? "Explain your counter-offer and why you're requesting these changes..."
                : "Explain your adjusted offer..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Warning for creators */}
          {mode === 'creator' && isIncreasing && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600">
                Requesting a higher payout may affect your chances of being selected. 
                The brand will review your proposal.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!message.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {mode === 'creator' ? 'Submit Counter-Offer' : 'Send Adjusted Offer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
