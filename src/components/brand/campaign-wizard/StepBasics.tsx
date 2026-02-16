import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { CampaignFormData, CATEGORIES, OBJECTIVES } from "./types";

interface StepBasicsProps {
  formData: CampaignFormData;
  onUpdate: (updates: Partial<CampaignFormData>) => void;
}

export const StepBasics = ({ formData, onUpdate }: StepBasicsProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Campaign Basics</h3>
          <p className="text-sm text-muted-foreground">Define your campaign identity and goals</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Summer Product Launch 2024"
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onUpdate({ category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="objective">Objective</Label>
            <Select
              value={formData.objective}
              onValueChange={(value) => onUpdate({ objective: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select objective" />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map(obj => (
                  <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your campaign goals, target audience, and what you're looking for in creators..."
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="mt-1 min-h-[100px]"
          />
        </div>
      </div>
    </section>
  );
};
