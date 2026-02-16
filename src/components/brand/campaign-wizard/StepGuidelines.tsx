import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { CampaignFormData } from "./types";

interface StepGuidelinesProps {
  formData: CampaignFormData;
  onUpdate: (updates: Partial<CampaignFormData>) => void;
}

export const StepGuidelines = ({ formData, onUpdate }: StepGuidelinesProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Content Guidelines</h3>
          <p className="text-sm text-muted-foreground">Provide direction for creator content</p>
        </div>
      </div>

      <div>
        <Label htmlFor="guidelines">Guidelines & Requirements</Label>
        <Textarea
          id="guidelines"
          placeholder="Include any specific requirements, do's and don'ts, brand voice guidelines, hashtags to use, key messages to convey, visual style preferences..."
          value={formData.contentGuidelines}
          onChange={(e) => onUpdate({ contentGuidelines: e.target.value })}
          className="mt-1 min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Be as detailed as possible to help creators understand your expectations and brand standards.
        </p>
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Include hashtags, @mentions, disclosure requirements (e.g., #ad, #sponsored), 
          and any phrases or topics to avoid.
        </p>
      </div>
    </section>
  );
};
