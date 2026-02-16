import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Upload, Mail, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useBrandProfileReadiness } from "@/hooks/useBrandProfileReadiness";

interface BrandProfileGateOverlayProps {
  variant?: "blur" | "empty";
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Premium overlay that encourages brand profile completion.
 */
export function BrandProfileGateOverlay({
  variant = "blur",
  title,
  description,
  className,
}: BrandProfileGateOverlayProps) {
  const navigate = useNavigate();
  const { hasLogo, hasCompanyName, hasBillingContact, completionPercentage, missingFields } = useBrandProfileReadiness();

  const defaultTitle = "Complete Your Brand Profile";
  const defaultDescription = "Complete your profile to unlock full platform capabilities and start inviting creators.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative z-20 flex flex-col items-center justify-center text-center px-6 py-12",
        variant === "blur" && "absolute inset-0 bg-background/60 backdrop-blur-sm rounded-2xl",
        className
      )}
    >
      {/* Decorative glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple/20 flex items-center justify-center"
        >
          <Building2 className="h-8 w-8 text-primary" />
        </motion.div>

        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          {title || defaultTitle}
        </h3>
        <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Progress Indicators */}
        <div className="space-y-3 mb-8">
          <ProfileCheckItem
            icon={Upload}
            label="Company Logo"
            completed={hasLogo}
            hint="Upload your brand logo"
          />
          <ProfileCheckItem
            icon={Building2}
            label="Company Name"
            completed={hasCompanyName}
            hint="Set your official company name"
          />
          <ProfileCheckItem
            icon={Mail}
            label="Billing Contact"
            completed={hasBillingContact}
            hint="Add a billing email address"
          />
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/brand/profile")}
          className="gradient-primary text-white gap-2 w-full sm:w-auto"
          size="lg"
        >
          <Building2 className="h-4 w-4" />
          Complete Profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

interface ProfileCheckItemProps {
  icon: React.ElementType;
  label: string;
  completed: boolean;
  hint: string;
}

function ProfileCheckItem({ icon: Icon, label, completed, hint }: ProfileCheckItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all",
      completed 
        ? "bg-success/10 border border-success/20" 
        : "bg-white/5 border border-white/10"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        completed ? "bg-success/20" : "bg-primary/20"
      )}>
        <Icon className={cn("h-4 w-4", completed ? "text-success" : "text-primary")} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn(
          "text-sm font-medium",
          completed ? "text-success" : "text-foreground"
        )}>
          {completed ? label : hint}
        </p>
      </div>
      {completed && (
        <CheckCircle2 className="h-5 w-5 text-success" />
      )}
    </div>
  );
}

interface BrandGatedSectionProps {
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

/**
 * Section that shows blurred content with overlay when brand profile is incomplete.
 */
export function BrandGatedSection({ children, className, showOverlay = true }: BrandGatedSectionProps) {
  const { isReady, isLoading } = useBrandProfileReadiness();

  if (isLoading) {
    return <>{children}</>;
  }

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="blur-[6px] pointer-events-none select-none opacity-60">
        {children}
      </div>
      {showOverlay && <BrandProfileGateOverlay variant="blur" />}
    </div>
  );
}

/**
 * Full page blur gate for brands - shows sticky reminder at top
 */
export function BrandFullPageGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isReady, isLoading, missingFields, completionPercentage } = useBrandProfileReadiness();

  if (isLoading || isReady) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[50vh]">
      {/* Content Preview - heavily blurred */}
      <div className="blur-[16px] opacity-30 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Backdrop blur zone */}
      <div 
        className="fixed inset-x-0 top-12 md:top-16 flex justify-center px-4 z-30 pointer-events-none"
        aria-hidden="true"
      >
        <div 
          className="max-w-lg w-full h-[220px] md:h-[180px] rounded-3xl backdrop-blur-md bg-white/5"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        />
      </div>
      
      {/* Sticky CTA Overlay */}
      <div className="fixed inset-x-0 top-16 md:top-20 flex justify-center px-4 z-40 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass rounded-2xl md:rounded-3xl p-5 md:p-6 max-w-lg w-full text-center border border-white/20 shadow-2xl pointer-events-auto"
          style={{
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-primary/20 to-purple/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 md:h-7 md:w-7 text-amber-500" />
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Complete Your Profile
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {missingFields.length} required field{missingFields.length > 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>
            
            {/* Progress + CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm flex-1 w-full sm:w-auto">
                <Progress value={completionPercentage} className="h-2 w-16" />
                <span className="text-foreground text-xs md:text-sm">{completionPercentage}% complete</span>
              </div>
              
              <Button 
                onClick={() => navigate("/brand/profile")} 
                className="gradient-primary text-white gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Building2 className="h-4 w-4" />
                Complete Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
