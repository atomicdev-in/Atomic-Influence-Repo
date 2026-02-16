import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  name: string;
  description: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
}

export const WizardProgress = ({ steps, currentStep, completedSteps }: WizardProgressProps) => {
  const progressPercent = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{steps[currentStep]?.name}</span>
        </div>
        <span className="text-sm font-medium text-primary">{progressPercent}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="flex flex-col items-center gap-1"
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                index === currentStep 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background" 
                  : completedSteps.has(index)
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {completedSteps.has(index) ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              "text-[10px] hidden sm:block max-w-[60px] text-center leading-tight",
              index === currentStep ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
