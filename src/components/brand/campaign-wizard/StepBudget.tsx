import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, AlertCircle } from "lucide-react";
import { CampaignFormData } from "./types";
import { formatCurrency } from "@/lib/formatters";

interface StepBudgetProps {
  formData: CampaignFormData;
  onUpdateBudget: (totalBudget: number, influencerCount: number) => void;
}

export const StepBudget = ({ formData, onUpdateBudget }: StepBudgetProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Budget & Influencers</h3>
          <p className="text-sm text-muted-foreground">Set your campaign budget and target influencer count</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalBudget">Total Campaign Budget ($) *</Label>
            <Input
              id="totalBudget"
              type="number"
              min={0}
              step={100}
              value={formData.totalBudget}
              onChange={(e) => onUpdateBudget(Number(e.target.value), formData.influencerCount)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="influencerCount">Target Influencers *</Label>
            <Input
              id="influencerCount"
              type="number"
              min={1}
              value={formData.influencerCount}
              onChange={(e) => onUpdateBudget(formData.totalBudget, Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        {/* Real-time Budget Calculation */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Budget Distribution Preview</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(formData.totalBudget)}</p>
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold">÷ {formData.influencerCount}</p>
              <p className="text-xs text-muted-foreground">Influencers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(formData.basePayoutPerInfluencer)}</p>
              <p className="text-xs text-muted-foreground">Base Payout Each</p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            This base payout will be shown to creators during discovery. Individual payouts can be adjusted during negotiation.
          </p>
        </div>
      </div>
    </section>
  );
};
