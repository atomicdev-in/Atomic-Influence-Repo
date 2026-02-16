import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface BudgetRedistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignData: CampaignBudgetData | null;
  negotiation: NegotiationImpact | null;
  onConfirm?: () => void;
  onReject?: () => void;
}

export interface CampaignBudgetData {
  id: string;
  name: string;
  totalBudget: number;
  originalInfluencerCount: number;
  currentInfluencerCount: number;
  basePayoutPerInfluencer: number;
  allocatedBudget: number;
  remainingBudget: number;
}

export interface NegotiationImpact {
  creatorName: string;
  creatorId: string;
  originalPayout: number;
  requestedPayout: number;
  delta: number;
  newRemainingBudget: number;
  newInfluencerCapacity: number;
  capacityChange: number;
}

export const BudgetRedistributionDialog = ({ 
  open, 
  onOpenChange, 
  campaignData,
  negotiation,
  onConfirm,
  onReject
}: BudgetRedistributionDialogProps) => {
  if (!campaignData || !negotiation) return null;

  const budgetUtilization = ((campaignData.allocatedBudget + negotiation.delta) / campaignData.totalBudget) * 100;
  const isOverBudget = budgetUtilization > 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Budget Impact Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Negotiation Summary */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <p className="text-sm font-medium mb-2">{negotiation.creatorName} requested a higher payout</p>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold">{formatCurrency(negotiation.originalPayout)}</p>
                <p className="text-xs text-muted-foreground">Original</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">{formatCurrency(negotiation.requestedPayout)}</p>
                <p className="text-xs text-muted-foreground">Requested</p>
              </div>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 ml-auto">
                +{formatCurrency(negotiation.delta)}
              </Badge>
            </div>
          </div>

          {/* Budget Impact */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Budget Redistribution</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span className={isOverBudget ? "text-red-500" : "text-emerald-500"}>
                    {budgetUtilization.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(budgetUtilization, 100)} 
                  className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">New Remaining Budget</p>
                  <p className="font-semibold">{formatCurrency(negotiation.newRemainingBudget)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">After This Creator</p>
                  <p className="font-semibold">{formatCurrency(negotiation.newRemainingBudget - negotiation.requestedPayout)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Influencer Capacity Impact */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Influencer Capacity Impact</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold">{campaignData.originalInfluencerCount}</p>
                <p className="text-xs text-muted-foreground">Original Target</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-semibold text-amber-500">{negotiation.newInfluencerCapacity}</p>
                <p className="text-xs text-muted-foreground">New Capacity</p>
              </div>
              {negotiation.capacityChange < 0 && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 ml-auto">
                  {negotiation.capacityChange} influencers
                </Badge>
              )}
            </div>
            
            {negotiation.capacityChange < 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Accepting this negotiation will reduce your capacity to invite {Math.abs(negotiation.capacityChange)} fewer influencer{Math.abs(negotiation.capacityChange) > 1 ? 's' : ''} at the base rate.
              </p>
            )}
          </div>

          {/* Warning */}
          {isOverBudget && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">
                This negotiation would exceed your total campaign budget. 
                Consider rejecting or adjusting your budget.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onReject}>
            Reject Offer
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isOverBudget}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Accept & Redistribute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
