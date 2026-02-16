import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link2, Sparkles, Lock, ArrowRight, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";

interface ProfileGateOverlayProps {
  variant?: "blur" | "empty";
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Premium overlay that encourages profile completion.
 * Use variant="blur" for blurred content backgrounds.
 * Use variant="empty" for empty state displays.
 */
export function ProfileGateOverlay({
  variant = "blur",
  title,
  description,
  className,
}: ProfileGateOverlayProps) {
  const navigate = useNavigate();
  const { hasLinkedAccounts, hasBrandFit, linkedAccountsCount, brandFitCompletion } = useProfileReadiness();

  const defaultTitle = variant === "empty" 
    ? "Profile Verification Required"
    : "Access Restricted";
  
  const defaultDescription = variant === "empty"
    ? "Connect your verified social accounts and complete your Brand Fit assessment to be eligible for campaign assignments."
    : "Complete your profile requirements to access campaign opportunities, earnings, and brand collaborations.";

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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center"
        >
          <Zap className="h-8 w-8 text-primary" />
        </motion.div>

        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          {title || defaultTitle}
        </h3>
        <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Progress Indicators */}
        <div className="space-y-3 mb-8">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            hasLinkedAccounts 
              ? "bg-success/10 border border-success/20" 
              : "bg-white/5 border border-white/10"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              hasLinkedAccounts ? "bg-success/20" : "bg-cyan/20"
            )}>
              <Link2 className={cn("h-4 w-4", hasLinkedAccounts ? "text-success" : "text-cyan")} />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "text-sm font-medium",
                hasLinkedAccounts ? "text-success" : "text-foreground"
              )}>
              {hasLinkedAccounts ? `${linkedAccountsCount} account${linkedAccountsCount > 1 ? 's' : ''} verified` : "Link Social Accounts"}
              </p>
              {!hasLinkedAccounts && (
                <p className="text-xs text-muted-foreground">Verification required for access</p>
              )}
            </div>
            {hasLinkedAccounts && (
              <div className="text-success">✓</div>
            )}
          </div>

          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            hasBrandFit 
              ? "bg-success/10 border border-success/20" 
              : "bg-white/5 border border-white/10"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              hasBrandFit ? "bg-success/20" : "bg-purple/20"
            )}>
              <Sparkles className={cn("h-4 w-4", hasBrandFit ? "text-success" : "text-purple")} />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "text-sm font-medium",
                hasBrandFit ? "text-success" : "text-foreground"
              )}>
                {hasBrandFit ? "Brand Fit Verified" : "Complete Brand Fit Assessment"}
              </p>
              {!hasBrandFit && (
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={brandFitCompletion} className="h-1.5 w-20" />
                  <span className="text-xs text-muted-foreground">{brandFitCompletion}%</span>
                </div>
              )}
            </div>
            {hasBrandFit && (
              <div className="text-success">✓</div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!hasLinkedAccounts && (
            <Button
              onClick={() => navigate("/connect-socials")}
              className="gradient-primary text-white gap-2"
            >
              <Link2 className="h-4 w-4" />
              Link Accounts
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {!hasBrandFit && (
            <Button
              onClick={() => navigate("/brand-fit")}
              className={hasLinkedAccounts ? "gradient-accent text-white gap-2" : ""}
              variant={hasLinkedAccounts ? "default" : "outline"}
            >
              <Target className="h-4 w-4" />
              Complete Assessment
              {hasLinkedAccounts && <ArrowRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface BlurredContentProps {
  children: React.ReactNode;
  isGated: boolean;
  className?: string;
}

/**
 * Wrapper that blurs content when gated.
 */
export function BlurredContent({ children, isGated, className }: BlurredContentProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "transition-all duration-500",
        isGated && "blur-sm pointer-events-none select-none"
      )}>
        {children}
      </div>
      {isGated && <ProfileGateOverlay variant="blur" />}
    </div>
  );
}

interface GatedSectionProps {
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

/**
 * Section that shows blurred content with overlay when profile is incomplete.
 */
export function GatedSection({ children, className, showOverlay = true }: GatedSectionProps) {
  const { isReady } = useProfileReadiness();

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="blur-[6px] pointer-events-none select-none opacity-60">
        {children}
      </div>
      {showOverlay && <ProfileGateOverlay variant="blur" />}
    </div>
  );
}

/**
 * Empty state for pages with no content until profile is ready.
 */
export function EmptyStateGate({ 
  title, 
  description,
  className 
}: { 
  title?: string; 
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl min-h-[400px] flex items-center justify-center", className)}>
      <ProfileGateOverlay variant="empty" title={title} description={description} />
    </div>
  );
}

interface FullPageGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Full page blur gate with centered premium overlay - matches Apply page style
 */
export function FullPageGate({ children, title, description, icon }: FullPageGateProps) {
  const navigate = useNavigate();
  const { isReady, hasLinkedAccounts, hasBrandFit, linkedAccountsCount, brandFitCompletion } = useProfileReadiness();

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[50vh]">
      {/* Content Preview - heavily blurred, barely visible */}
      <div className="blur-[16px] opacity-30 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Localized Backdrop Blur Zone - fixed behind the sticky reminder */}
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
      
      {/* Sticky Top-Middle CTA Overlay - fixed position, stays visible while scrolling */}
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
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-cyan/20 to-purple/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple/20 flex items-center justify-center shrink-0">
                {icon || <Zap className="h-6 w-6 md:h-7 md:w-7 text-primary" />}
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  {title || "Access Restricted"}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {description || "Account verification required. Link at least one social account."}
                </p>
              </div>
            </div>
            
            {/* Compact Progress + CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm flex-1 w-full sm:w-auto">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-cyan/20">
                  <Link2 className="h-3 w-3 text-cyan" />
                </div>
                <span className="text-foreground text-xs md:text-sm">Link 1 verified account</span>
              </div>
              
              <Button 
                onClick={() => navigate("/connect-socials")} 
                className="gradient-primary text-white gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Link2 className="h-4 w-4" />
                Proceed
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
