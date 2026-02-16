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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, 
  Check, 
  X, 
  MessageSquare,
  Send,
  Loader2,
  ArrowUp,
  ArrowDown,
  User,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useNegotiations } from "@/hooks/useNegotiations";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Negotiation {
  id: string;
  invitation_id: string;
  proposed_by: string;
  proposed_payout: number | null;
  proposed_deliverables: any;
  proposed_timeline_start: string | null;
  proposed_timeline_end: string | null;
  message: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
}

interface BrandNegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationId: string | null;
  campaignName: string;
  creatorName: string;
  currentPayout: number;
  onActionComplete?: () => void;
}

export const BrandNegotiationDialog = ({
  open,
  onOpenChange,
  invitationId,
  campaignName,
  creatorName,
  currentPayout,
  onActionComplete,
}: BrandNegotiationDialogProps) => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [counterPayout, setCounterPayout] = useState(currentPayout);
  const [counterMessage, setCounterMessage] = useState("");
  const [showCounterForm, setShowCounterForm] = useState(false);
  
  const { isSubmitting, respondToNegotiation } = useNegotiations();

  useEffect(() => {
    if (invitationId && open) {
      fetchNegotiations();
    }
  }, [invitationId, open]);

  const fetchNegotiations = async () => {
    if (!invitationId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('campaign_negotiations')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNegotiations(data);
    }
    setIsLoading(false);
  };

  const latestPending = negotiations.find(n => n.status === 'pending');
  const payoutDelta = counterPayout - currentPayout;

  const handleAccept = async () => {
    if (!latestPending || !invitationId) return;
    
    const success = await respondToNegotiation(
      latestPending.id,
      invitationId,
      'accepted'
    );
    
    if (success) {
      await fetchNegotiations();
      onActionComplete?.();
    }
  };

  const handleReject = async () => {
    if (!latestPending || !invitationId) return;
    
    const success = await respondToNegotiation(
      latestPending.id,
      invitationId,
      'rejected'
    );
    
    if (success) {
      await fetchNegotiations();
      onActionComplete?.();
    }
  };

  const handleCounter = async () => {
    if (!latestPending || !invitationId || !counterMessage.trim()) return;
    
    const success = await respondToNegotiation(
      latestPending.id,
      invitationId,
      'countered',
      {
        payout: counterPayout,
        message: counterMessage,
      }
    );
    
    if (success) {
      setShowCounterForm(false);
      setCounterMessage("");
      await fetchNegotiations();
      onActionComplete?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Negotiation History</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {creatorName} • {campaignName}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Current Offer</span>
            <span className="font-bold text-primary">{formatCurrency(currentPayout)}</span>
          </div>

          {/* Pending Counter-Offer */}
          {latestPending && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-amber-500/20 text-amber-500">Pending Response</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(latestPending.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              
              {latestPending.proposed_payout && (
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Requested:</span>
                  <span className="font-bold">{formatCurrency(latestPending.proposed_payout)}</span>
                  {latestPending.proposed_payout > currentPayout && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{formatCurrency(latestPending.proposed_payout - currentPayout)}
                    </Badge>
                  )}
                </div>
              )}
              
              {latestPending.message && (
                <div className="p-2 rounded-lg bg-background/50 text-sm">
                  <p className="text-muted-foreground">{latestPending.message}</p>
                </div>
              )}

              {!showCounterForm && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Decline
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCounterForm(true)}
                    className="flex-1 gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Counter
                  </Button>
                  <Button 
                    onClick={handleAccept}
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Accept
                  </Button>
                </div>
              )}

              {showCounterForm && (
                <div className="space-y-3 mt-4 pt-4 border-t">
                  <div>
                    <Label>Your Counter-Offer</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        value={counterPayout}
                        onChange={(e) => setCounterPayout(Number(e.target.value))}
                      />
                      {payoutDelta !== 0 && (
                        <Badge 
                          variant="outline" 
                          className={payoutDelta > 0 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}
                        >
                          {payoutDelta > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                          {payoutDelta > 0 ? '+' : ''}{formatCurrency(payoutDelta)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Explain your counter-offer..."
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCounterForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCounter}
                      disabled={isSubmitting || !counterMessage.trim()}
                      className="flex-1 gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Counter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {negotiations.length > 1 && (
            <>
              <Separator />
              <div>
                <Label className="text-sm">Previous Negotiations</Label>
                <ScrollArea className="h-[200px] mt-2">
                  <div className="space-y-2">
                    {negotiations.filter(n => n.id !== latestPending?.id).map((neg) => (
                      <div key={neg.id} className="p-3 rounded-lg border border-border/50 bg-background/50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className={
                            neg.status === 'accepted' ? 'text-emerald-500' :
                            neg.status === 'rejected' ? 'text-red-500' :
                            'text-muted-foreground'
                          }>
                            {neg.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(neg.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {neg.proposed_payout && (
                          <p className="text-sm">
                            Proposed: {formatCurrency(neg.proposed_payout)}
                          </p>
                        )}
                        {neg.message && (
                          <p className="text-xs text-muted-foreground mt-1">{neg.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && negotiations.length === 0 && !latestPending && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No negotiations yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
