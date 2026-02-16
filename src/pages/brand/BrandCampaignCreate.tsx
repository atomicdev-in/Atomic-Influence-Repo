import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowLeft } from "lucide-react";
import { UploadedAsset } from "@/components/brand/AssetUploadSection";
import { CTALink } from "@/components/brand/CTALinksSection";
import { useCampaignCreation } from "@/hooks/useCampaignCreation";
import {
  WizardProgress,
  WizardNavigation,
  StepBasics,
  StepBudget,
  StepTimeline,
  StepDeliverables,
  StepGuidelines,
  StepDiscovery,
  StepAssets,
  StepCTALinks,
  StepReview,
  CampaignFormData,
  Deliverable,
  WIZARD_STEPS,
  DELIVERABLE_TYPES,
} from "@/components/brand/campaign-wizard";

const BrandCampaignCreate = () => {
  const navigate = useNavigate();
  const { isSaving, saveDraft, publishCampaign } = useCampaignCreation();
  const [currentStep, setCurrentStep] = useState(0);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [ctaLinks, setCtaLinks] = useState<CTALink[]>([]);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    objective: "",
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

  // Calculate completed steps
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    WIZARD_STEPS.forEach((step, index) => {
      if (step.validate(formData)) {
        completed.add(index);
      }
    });
    return completed;
  }, [formData]);

  // Update form data
  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Budget allocation helper
  const updateBudgetAllocation = (totalBudget: number, influencerCount: number) => {
    const basePayoutPerInfluencer = influencerCount > 0 ? totalBudget / influencerCount : 0;
    setFormData(prev => ({
      ...prev,
      totalBudget,
      influencerCount,
      basePayoutPerInfluencer,
    }));
  };

  // Deliverable helpers
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

  // Toggle helpers
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

  // Validation
  const canProceed = WIZARD_STEPS[currentStep]?.validate(formData) ?? false;
  
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.category &&
      formData.totalBudget > 0 &&
      formData.influencerCount > 0 &&
      formData.deliverables.length > 0 &&
      formData.timelineStart &&
      formData.timelineEnd &&
      formData.requiredPlatforms.length > 0
    );
  };

  // Navigation
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1 && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Actions
  const handleSaveDraft = async () => {
    await saveDraft(formData, assets, ctaLinks);
  };

  const handlePublish = async () => {
    if (!isFormValid()) return;
    await publishCampaign(formData, assets, ctaLinks);
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBasics formData={formData} onUpdate={updateFormData} />;
      case 1:
        return <StepBudget formData={formData} onUpdateBudget={updateBudgetAllocation} />;
      case 2:
        return <StepTimeline formData={formData} onUpdate={updateFormData} />;
      case 3:
        return (
          <StepDeliverables
            formData={formData}
            onAddDeliverable={addDeliverable}
            onUpdateDeliverable={updateDeliverable}
            onRemoveDeliverable={removeDeliverable}
          />
        );
      case 4:
        return <StepGuidelines formData={formData} onUpdate={updateFormData} />;
      case 5:
        return (
          <StepDiscovery
            formData={formData}
            onUpdate={updateFormData}
            onTogglePlatform={togglePlatform}
            onToggleNiche={toggleNiche}
          />
        );
      case 6:
        return <StepAssets assets={assets} onAssetsChange={setAssets} />;
      case 7:
        return <StepCTALinks links={ctaLinks} onLinksChange={setCtaLinks} />;
      case 8:
        return <StepReview formData={formData} assets={assets} ctaLinks={ctaLinks} />;
      default:
        return null;
    }
  };

  return (
    <BrandDashboardLayout>
      <PageTransition>
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/brand/campaigns")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PageHeader
              title="Create Campaign"
              subtitle="Set up your influencer marketing campaign"
              icon={Megaphone}
            />
          </div>

          {/* Progress Indicator */}
          <WizardProgress 
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Current Step Content */}
          <div key={currentStep}>
            {renderStep()}
          </div>

          {/* Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={WIZARD_STEPS.length}
            canProceed={canProceed}
            isSaving={isSaving}
            onBack={goBack}
            onNext={goNext}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            canSaveDraft={Boolean(formData.name.trim())}
            canPublish={isFormValid()}
          />
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandCampaignCreate;
