export interface Deliverable {
  id: string;
  type: string;
  quantity: number;
  description: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  objective: string;
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

export const CATEGORIES = [
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

export const OBJECTIVES = [
  "Brand Awareness",
  "Product Launch",
  "Drive Sales",
  "Lead Generation",
  "Content Creation",
  "Community Building",
  "Event Promotion",
];

export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn"];

export const NICHES = [
  "Lifestyle", "Beauty", "Fashion", "Fitness", "Tech", "Gaming",
  "Travel", "Food", "Parenting", "Business", "Finance", "Education",
];

export const DELIVERABLE_TYPES = [
  "Instagram Post",
  "Instagram Reel",
  "Instagram Story",
  "TikTok Video",
  "YouTube Video",
  "YouTube Short",
  "Twitter Post",
  "Blog Post",
];

export interface WizardStep {
  id: string;
  name: string;
  description: string;
  validate: (formData: CampaignFormData) => boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "basics",
    name: "Basics",
    description: "Campaign identity",
    validate: (data) => Boolean(data.name.trim() && data.category),
  },
  {
    id: "budget",
    name: "Budget",
    description: "Budget allocation",
    validate: (data) => data.totalBudget > 0 && data.influencerCount > 0,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Campaign duration",
    validate: (data) => Boolean(data.timelineStart && data.timelineEnd),
  },
  {
    id: "deliverables",
    name: "Deliverables",
    description: "Content requirements",
    validate: (data) => data.deliverables.length > 0,
  },
  {
    id: "guidelines",
    name: "Guidelines",
    description: "Content direction",
    validate: () => true, // Optional step
  },
  {
    id: "discovery",
    name: "Discovery",
    description: "Creator targeting",
    validate: (data) => data.requiredPlatforms.length > 0,
  },
  {
    id: "assets",
    name: "Assets",
    description: "Brand materials",
    validate: () => true, // Optional step
  },
  {
    id: "cta-links",
    name: "CTA Links",
    description: "Tracking links",
    validate: () => true, // Optional step
  },
  {
    id: "review",
    name: "Review",
    description: "Final review",
    validate: () => true, // Always allow - validation happens on publish
  },
];
