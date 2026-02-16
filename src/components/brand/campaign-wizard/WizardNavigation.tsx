import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Sparkles, Loader2 } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSaving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  canSaveDraft: boolean;
  canPublish: boolean;
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  canProceed,
  isSaving,
  onBack,
  onNext,
  onSaveDraft,
  onPublish,
  canSaveDraft,
  canPublish,
}: WizardNavigationProps) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={onBack}
              disabled={isSaving}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={onSaveDraft}
            disabled={isSaving || !canSaveDraft}
            className="gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {!isLastStep ? (
            <Button 
              onClick={onNext}
              disabled={!canProceed || isSaving}
              className="gap-2"
            >
              Proceed
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={onPublish}
              disabled={isSaving || !canPublish}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Publish Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
