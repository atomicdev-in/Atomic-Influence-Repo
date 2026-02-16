import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  Upload, 
  Link2,
  AlertCircle 
} from "lucide-react";
import { CampaignFormData } from "./types";
import { formatCurrency } from "@/lib/formatters";
import { UploadedAsset } from "@/components/brand/AssetUploadSection";
import { CTALink } from "@/components/brand/CTALinksSection";

interface StepReviewProps {
  formData: CampaignFormData;
  assets: UploadedAsset[];
  ctaLinks: CTALink[];
}

export const StepReview = ({ formData, assets, ctaLinks }: StepReviewProps) => {
  const sections = [
    {
      icon: FileText,
      title: "Campaign Basics",
      complete: Boolean(formData.name && formData.category),
      items: [
        { label: "Name", value: formData.name || "Not set" },
        { label: "Category", value: formData.category || "Not set" },
        { label: "Objective", value: formData.objective || "Not specified" },
        { label: "Description", value: formData.description || "No description" },
      ],
    },
    {
      icon: DollarSign,
      title: "Budget & Influencers",
      complete: formData.totalBudget > 0 && formData.influencerCount > 0,
      items: [
        { label: "Total Budget", value: formatCurrency(formData.totalBudget) },
        { label: "Target Influencers", value: String(formData.influencerCount) },
        { label: "Base Payout Each", value: formatCurrency(formData.basePayoutPerInfluencer) },
      ],
    },
    {
      icon: Calendar,
      title: "Timeline",
      complete: Boolean(formData.timelineStart && formData.timelineEnd),
      items: [
        { label: "Start Date", value: formData.timelineStart || "Not set" },
        { label: "End Date", value: formData.timelineEnd || "Not set" },
      ],
    },
    {
      icon: Target,
      title: "Deliverables",
      complete: formData.deliverables.length > 0,
      items: formData.deliverables.length > 0
        ? formData.deliverables.map(d => ({
            label: d.type,
            value: `${d.quantity}× ${d.description || ''}`.trim(),
          }))
        : [{ label: "Status", value: "No deliverables added" }],
    },
    {
      icon: FileText,
      title: "Content Guidelines",
      complete: Boolean(formData.contentGuidelines),
      items: [
        { 
          label: "Guidelines", 
          value: formData.contentGuidelines 
            ? (formData.contentGuidelines.length > 100 
                ? formData.contentGuidelines.substring(0, 100) + "..." 
                : formData.contentGuidelines)
            : "No guidelines specified" 
        },
      ],
    },
    {
      icon: Users,
      title: "Discovery Settings",
      complete: formData.requiredPlatforms.length > 0,
      items: [
        { label: "Platforms", value: formData.requiredPlatforms.join(", ") || "None selected" },
        { label: "Min Followers", value: formData.minFollowers.toLocaleString() },
        { label: "Min Engagement", value: `${formData.minEngagement}%` },
        { label: "Target Niches", value: formData.targetNiches.join(", ") || "All niches" },
      ],
    },
    {
      icon: Upload,
      title: "Campaign Assets",
      complete: true,
      items: [
        { label: "Uploaded Files", value: `${assets.length} file${assets.length !== 1 ? 's' : ''}` },
      ],
    },
    {
      icon: Link2,
      title: "CTA Links",
      complete: true,
      items: ctaLinks.length > 0
        ? ctaLinks.map(link => ({
            label: link.label || "Untitled",
            value: link.isPrimary ? "Primary" : "Secondary",
          }))
        : [{ label: "Status", value: "No CTA links added" }],
    },
  ];

  const completedCount = sections.filter(s => s.complete).length;
  const requiredComplete = sections.slice(0, 6).filter(s => s.complete).length;
  const allRequiredComplete = requiredComplete >= 5; // Basics, Budget, Timeline, Deliverables, Discovery

  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Review Campaign</h3>
            <p className="text-sm text-muted-foreground">Verify all details before creating</p>
          </div>
        </div>
        <Badge variant={allRequiredComplete ? "default" : "secondary"}>
          {completedCount}/{sections.length} sections complete
        </Badge>
      </div>

      {!allRequiredComplete && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-600">
            Some required sections are incomplete. Go back and fill in missing information before creating the campaign.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div 
              key={section.title}
              className={`rounded-xl border p-4 ${
                section.complete 
                  ? 'border-border/50 bg-background/50' 
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <IconComponent className={`h-4 w-4 ${section.complete ? 'text-primary' : 'text-amber-500'}`} />
                <span className="font-medium text-sm">{section.title}</span>
                {section.complete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                ) : (
                  <Badge variant="outline" className="ml-auto text-amber-500 border-amber-500/30 text-xs">
                    Incomplete
                  </Badge>
                )}
              </div>
              <div className="grid gap-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium text-right max-w-[60%] truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
