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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  Users, 
  Target, 
  FileText, 
  CheckCircle2,
  Plus,
  X,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (campaign: CampaignFormData) => void;
}

export interface CampaignFormData {
  name: string;
  description: string;
  category: string;
  totalBudget: number;
  influencerCount: number;
  basePayoutPerInfluencer: number;
  deliverables: Deliverable[];
  contentGuidelines: string;
  timelineStart: string;
  timelineEnd: string;
  requiredPlatforms: string[];
  minFollowers: number;
  minEngagement: number;
  targetNiches: string[];
}

interface Deliverable {
  id: string;
  type: string;
  quantity: number;
  description: string;
}

const STEPS = [
  { id: 1, title: "Basics", icon: FileText },
  { id: 2, title: "Budget", icon: DollarSign },
  { id: 3, title: "Requirements", icon: Target },
  { id: 4, title: "Targeting", icon: Users },
  { id: 5, title: "Review", icon: CheckCircle2 },
];

const CATEGORIES = [
  "Beauty & Wellness",
  "Fashion & Apparel",
  "Technology",
  "Food & Beverage",
  "Health & Fitness",
  "Travel & Lifestyle",
  "Gaming",
  "Finance",
  "Education",
  "Entertainment",
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn"];

const NICHES = [
  "Lifestyle",
  "Beauty",
  "Fashion",
  "Fitness",
  "Tech",
  "Gaming",
  "Travel",
  "Food",
  "Parenting",
  "Business",
  "Finance",
  "Education",
];

const DELIVERABLE_TYPES = [
  "Instagram Post",
  "Instagram Reel",
  "Instagram Story",
  "TikTok Video",
  "YouTube Video",
  "YouTube Short",
  "Twitter Post",
  "Blog Post",
];

export const CampaignCreationWizard = ({ open, onOpenChange, onComplete }: CampaignWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    category: "",
    totalBudget: 10000,
    influencerCount: 5,
    basePayoutPerInfluencer: 2000,
    deliverables: [],
    contentGuidelines: "",
    timelineStart: "",
    timelineEnd: "",
    requiredPlatforms: [],
    minFollowers: 10000,
    minEngagement: 3,
    targetNiches: [],
  });

  // Recalculate base payout when budget or count changes
  const updateBudgetAllocation = (totalBudget: number, influencerCount: number) => {
    const basePayoutPerInfluencer = influencerCount > 0 ? totalBudget / influencerCount : 0;
    setFormData(prev => ({
      ...prev,
      totalBudget,
      influencerCount,
      basePayoutPerInfluencer,
    }));
  };

  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: crypto.randomUUID(),
      type: DELIVERABLE_TYPES[0],
      quantity: 1,
      description: "",
    };
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable],
    }));
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d => 
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  };

  const removeDeliverable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d.id !== id),
    }));
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      requiredPlatforms: prev.requiredPlatforms.includes(platform)
        ? prev.requiredPlatforms.filter(p => p !== platform)
        : [...prev.requiredPlatforms, platform],
    }));
  };

  const toggleNiche = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      targetNiches: prev.targetNiches.includes(niche)
        ? prev.targetNiches.filter(n => n !== niche)
        : [...prev.targetNiches, niche],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.category;
      case 2:
        return formData.totalBudget > 0 && formData.influencerCount > 0;
      case 3:
        return formData.deliverables.length > 0 && formData.timelineStart && formData.timelineEnd;
      case 4:
        return formData.requiredPlatforms.length > 0;
      default:
        return true;
    }
  };

  const handleComplete = () => {
    onComplete?.(formData);
    onOpenChange(false);
    // Reset form
    setCurrentStep(1);
    setFormData({
      name: "",
      description: "",
      category: "",
      totalBudget: 10000,
      influencerCount: 5,
      basePayoutPerInfluencer: 2000,
      deliverables: [],
      contentGuidelines: "",
      timelineStart: "",
      timelineEnd: "",
      requiredPlatforms: [],
      minFollowers: 10000,
      minEngagement: 3,
      targetNiches: [],
    });
  };

  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Campaign</DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-3">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  step.id === currentStep 
                    ? "text-primary" 
                    : step.id < currentStep 
                      ? "text-emerald-500" 
                      : "text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.id === currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : step.id < currentStep 
                      ? "bg-emerald-500 text-white" 
                      : "bg-muted"
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] py-4">
          {currentStep === 1 && (
            <StepBasics formData={formData} setFormData={setFormData} categories={CATEGORIES} />
          )}
          {currentStep === 2 && (
            <StepBudget 
              formData={formData} 
              updateBudgetAllocation={updateBudgetAllocation} 
            />
          )}
          {currentStep === 3 && (
            <StepRequirements 
              formData={formData}
              setFormData={setFormData}
              addDeliverable={addDeliverable}
              updateDeliverable={updateDeliverable}
              removeDeliverable={removeDeliverable}
              deliverableTypes={DELIVERABLE_TYPES}
            />
          )}
          {currentStep === 4 && (
            <StepTargeting
              formData={formData}
              setFormData={setFormData}
              platforms={PLATFORMS}
              niches={NICHES}
              togglePlatform={togglePlatform}
              toggleNiche={toggleNiche}
            />
          )}
          {currentStep === 5 && (
            <StepReview formData={formData} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Step 1: Basics
interface StepBasicsProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  categories: string[];
}

const StepBasics = ({ formData, setFormData, categories }: StepBasicsProps) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Campaign Name *</Label>
      <Input
        id="name"
        placeholder="e.g., Summer Product Launch"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="mt-1"
      />
    </div>
    
    <div>
      <Label htmlFor="category">Category *</Label>
      <Select
        value={formData.category}
        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="Describe your campaign goals and what you're looking for..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="mt-1 min-h-[100px]"
      />
    </div>
  </div>
);

// Step 2: Budget
interface StepBudgetProps {
  formData: CampaignFormData;
  updateBudgetAllocation: (totalBudget: number, influencerCount: number) => void;
}

const StepBudget = ({ formData, updateBudgetAllocation }: StepBudgetProps) => (
  <div className="space-y-6">
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Budget Allocation</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalBudget">Total Campaign Budget ($)</Label>
          <Input
            id="totalBudget"
            type="number"
            min={0}
            step={100}
            value={formData.totalBudget}
            onChange={(e) => updateBudgetAllocation(Number(e.target.value), formData.influencerCount)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="influencerCount">Number of Influencers</Label>
          <Input
            id="influencerCount"
            type="number"
            min={1}
            value={formData.influencerCount}
            onChange={(e) => updateBudgetAllocation(formData.totalBudget, Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
    </div>

    {/* Budget Preview */}
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
);

// Step 3: Requirements
interface StepRequirementsProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  addDeliverable: () => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  removeDeliverable: (id: string) => void;
  deliverableTypes: string[];
}

const StepRequirements = ({ 
  formData, 
  setFormData, 
  addDeliverable, 
  updateDeliverable, 
  removeDeliverable,
  deliverableTypes 
}: StepRequirementsProps) => (
  <div className="space-y-4">
    {/* Deliverables */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Deliverables *</Label>
        <Button variant="outline" size="sm" onClick={addDeliverable} className="gap-1">
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
      
      {formData.deliverables.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No deliverables added yet</p>
          <Button variant="outline" size="sm" onClick={addDeliverable} className="mt-2">
            Add Deliverable
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {formData.deliverables.map((deliverable) => (
            <div key={deliverable.id} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
              <Select
                value={deliverable.type}
                onValueChange={(value) => updateDeliverable(deliverable.id, { type: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliverableTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-muted-foreground">×</span>
              
              <Input
                type="number"
                min={1}
                value={deliverable.quantity}
                onChange={(e) => updateDeliverable(deliverable.id, { quantity: Number(e.target.value) })}
                className="w-16"
              />
              
              <Input
                placeholder="Notes (optional)"
                value={deliverable.description}
                onChange={(e) => updateDeliverable(deliverable.id, { description: e.target.value })}
                className="flex-1"
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDeliverable(deliverable.id)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Timeline */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="timelineStart">Start Date *</Label>
        <Input
          id="timelineStart"
          type="date"
          value={formData.timelineStart}
          onChange={(e) => setFormData(prev => ({ ...prev, timelineStart: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="timelineEnd">End Date *</Label>
        <Input
          id="timelineEnd"
          type="date"
          value={formData.timelineEnd}
          onChange={(e) => setFormData(prev => ({ ...prev, timelineEnd: e.target.value }))}
          className="mt-1"
        />
      </div>
    </div>

    {/* Content Guidelines */}
    <div>
      <Label htmlFor="guidelines">Content Guidelines</Label>
      <Textarea
        id="guidelines"
        placeholder="Any specific requirements, do's and don'ts, brand voice guidelines..."
        value={formData.contentGuidelines}
        onChange={(e) => setFormData(prev => ({ ...prev, contentGuidelines: e.target.value }))}
        className="mt-1 min-h-[80px]"
      />
    </div>
  </div>
);

// Step 4: Targeting
interface StepTargetingProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  platforms: string[];
  niches: string[];
  togglePlatform: (platform: string) => void;
  toggleNiche: (niche: string) => void;
}

const StepTargeting = ({ 
  formData, 
  setFormData, 
  platforms, 
  niches, 
  togglePlatform, 
  toggleNiche 
}: StepTargetingProps) => (
  <div className="space-y-6">
    {/* Platforms */}
    <div>
      <Label className="mb-2 block">Required Platforms *</Label>
      <div className="flex flex-wrap gap-2">
        {platforms.map(platform => (
          <Badge
            key={platform}
            variant={formData.requiredPlatforms.includes(platform) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => togglePlatform(platform)}
          >
            {platform}
          </Badge>
        ))}
      </div>
    </div>

    {/* Minimum Requirements */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="minFollowers">Minimum Followers</Label>
        <Input
          id="minFollowers"
          type="number"
          min={0}
          step={1000}
          value={formData.minFollowers}
          onChange={(e) => setFormData(prev => ({ ...prev, minFollowers: Number(e.target.value) }))}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="minEngagement">Minimum Engagement (%)</Label>
        <Input
          id="minEngagement"
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={formData.minEngagement}
          onChange={(e) => setFormData(prev => ({ ...prev, minEngagement: Number(e.target.value) }))}
          className="mt-1"
        />
      </div>
    </div>

    {/* Target Niches */}
    <div>
      <Label className="mb-2 block">Target Niches</Label>
      <div className="flex flex-wrap gap-2">
        {niches.map(niche => (
          <Badge
            key={niche}
            variant={formData.targetNiches.includes(niche) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleNiche(niche)}
          >
            {niche}
          </Badge>
        ))}
      </div>
    </div>
  </div>
);

// Step 5: Review
const StepReview = ({ formData }: { formData: CampaignFormData }) => (
  <div className="space-y-4">
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <h4 className="font-semibold mb-3">Campaign Summary</h4>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{formData.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Category</span>
          <span className="font-medium">{formData.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timeline</span>
          <span className="font-medium">{formData.timelineStart} → {formData.timelineEnd}</span>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Budget Breakdown
      </h4>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xl font-bold">{formatCurrency(formData.totalBudget)}</p>
          <p className="text-xs text-muted-foreground">Total Budget</p>
        </div>
        <div>
          <p className="text-xl font-bold">{formData.influencerCount}</p>
          <p className="text-xs text-muted-foreground">Target Influencers</p>
        </div>
        <div>
          <p className="text-xl font-bold text-primary">{formatCurrency(formData.basePayoutPerInfluencer)}</p>
          <p className="text-xs text-muted-foreground">Base Payout</p>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <h4 className="font-semibold mb-3">Deliverables</h4>
      <div className="space-y-1">
        {formData.deliverables.map(d => (
          <div key={d.id} className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {d.quantity}× {d.type}
            {d.description && <span className="text-muted-foreground">({d.description})</span>}
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <h4 className="font-semibold mb-3">Targeting</h4>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {formData.requiredPlatforms.map(p => (
            <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Min {formData.minFollowers.toLocaleString()} followers · {formData.minEngagement}% engagement
        </p>
        {formData.targetNiches.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.targetNiches.map(n => (
              <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
