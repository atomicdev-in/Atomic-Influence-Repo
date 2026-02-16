import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { CampaignFormData, PLATFORMS, NICHES } from "./types";

interface StepDiscoveryProps {
  formData: CampaignFormData;
  onUpdate: (updates: Partial<CampaignFormData>) => void;
  onTogglePlatform: (platform: string) => void;
  onToggleNiche: (niche: string) => void;
}

export const StepDiscovery = ({ 
  formData, 
  onUpdate, 
  onTogglePlatform, 
  onToggleNiche 
}: StepDiscoveryProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Discovery Settings</h3>
          <p className="text-sm text-muted-foreground">Set creator targeting criteria</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <Label className="mb-2 block">Required Platforms *</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <Badge
                key={platform}
                variant={formData.requiredPlatforms.includes(platform) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => onTogglePlatform(platform)}
              >
                {platform}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formData.requiredPlatforms.length === 0 
              ? "Select at least one platform"
              : `${formData.requiredPlatforms.length} platform${formData.requiredPlatforms.length > 1 ? 's' : ''} selected`
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minFollowers">Minimum Followers</Label>
            <Input
              id="minFollowers"
              type="number"
              min={0}
              step={1000}
              value={formData.minFollowers}
              onChange={(e) => onUpdate({ minFollowers: Number(e.target.value) })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.minFollowers.toLocaleString()} followers minimum
            </p>
          </div>
          <div>
            <Label htmlFor="minEngagement">Minimum Engagement Rate (%)</Label>
            <Input
              id="minEngagement"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={formData.minEngagement}
              onChange={(e) => onUpdate({ minEngagement: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Target Niches</Label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map(niche => (
              <Badge
                key={niche}
                variant={formData.targetNiches.includes(niche) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => onToggleNiche(niche)}
              >
                {niche}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formData.targetNiches.length === 0 
              ? "No specific niches selected - campaign will be open to all creators"
              : `${formData.targetNiches.length} niche${formData.targetNiches.length > 1 ? 's' : ''} selected`
            }
          </p>
        </div>
      </div>
    </section>
  );
};
