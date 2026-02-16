import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Plus, X, FileText } from "lucide-react";
import { CampaignFormData, Deliverable, DELIVERABLE_TYPES } from "./types";

interface StepDeliverablesProps {
  formData: CampaignFormData;
  onAddDeliverable: () => void;
  onUpdateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  onRemoveDeliverable: (id: string) => void;
}

export const StepDeliverables = ({ 
  formData, 
  onAddDeliverable, 
  onUpdateDeliverable, 
  onRemoveDeliverable 
}: StepDeliverablesProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Deliverables</h3>
            <p className="text-sm text-muted-foreground">Define what creators need to deliver</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onAddDeliverable} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Deliverable
        </Button>
      </div>

      {formData.deliverables.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium mb-1">No deliverables added</p>
          <p className="text-sm text-muted-foreground mb-3">Add the content types you need from creators</p>
          <Button variant="outline" onClick={onAddDeliverable} className="gap-1">
            <Plus className="h-4 w-4" />
            Add First Deliverable
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.deliverables.map((deliverable, index) => (
            <div 
              key={deliverable.id} 
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/50"
            >
              <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
              
              <Select
                value={deliverable.type}
                onValueChange={(value) => onUpdateDeliverable(deliverable.id, { type: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERABLE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-muted-foreground">×</span>
              
              <Input
                type="number"
                min={1}
                value={deliverable.quantity}
                onChange={(e) => onUpdateDeliverable(deliverable.id, { quantity: Number(e.target.value) })}
                className="w-20"
              />
              
              <Input
                placeholder="Notes (optional)"
                value={deliverable.description}
                onChange={(e) => onUpdateDeliverable(deliverable.id, { description: e.target.value })}
                className="flex-1"
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveDeliverable(deliverable.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
