import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { CampaignFormData } from "./types";

interface StepTimelineProps {
  formData: CampaignFormData;
  onUpdate: (updates: Partial<CampaignFormData>) => void;
}

export const StepTimeline = ({ formData, onUpdate }: StepTimelineProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Timeline</h3>
          <p className="text-sm text-muted-foreground">Set your campaign duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timelineStart">Start Date *</Label>
          <Input
            id="timelineStart"
            type="date"
            value={formData.timelineStart}
            onChange={(e) => onUpdate({ timelineStart: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="timelineEnd">End Date *</Label>
          <Input
            id="timelineEnd"
            type="date"
            value={formData.timelineEnd}
            onChange={(e) => onUpdate({ timelineEnd: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      
      {formData.timelineStart && formData.timelineEnd && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          Campaign duration: {(() => {
            const start = new Date(formData.timelineStart);
            const end = new Date(formData.timelineEnd);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} days`;
          })()}
        </div>
      )}
    </section>
  );
};
