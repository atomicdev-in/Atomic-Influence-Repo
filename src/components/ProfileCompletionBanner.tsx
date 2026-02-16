import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link2, Sparkles, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";
import { useState } from "react";

interface ProfileCompletionBannerProps {
  variant?: "inline" | "card";
  className?: string;
}

/**
 * Subtle, non-intrusive banner encouraging profile completion.
 * Only shows when profile is not fully complete (missing accounts or Brand Fit).
 * Dismissible per session.
 */
export function ProfileCompletionBanner({ 
  variant = "inline",
  className = ""
}: ProfileCompletionBannerProps) {
  const navigate = useNavigate();
  const { 
    isProfileComplete, 
    hasMultipleAccounts, 
    hasBrandFit, 
    linkedAccountsCount,
    brandFitCompletion 
  } = useProfileReadiness();
  
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if profile is complete or banner is dismissed
  if (isProfileComplete || isDismissed) {
    return null;
  }

  const needsMoreAccounts = !hasMultipleAccounts;
  const needsBrandFit = !hasBrandFit;

  // Determine the primary message based on what's missing
  const getMessage = () => {
    if (needsMoreAccounts && needsBrandFit) {
      return {
        title: "Boost your campaign matches",
        description: "Connect more accounts and complete Brand Fit to unlock better opportunities and higher approval rates.",
      };
    }
    if (needsMoreAccounts) {
      return {
        title: "Connect more accounts for better matches",
        description: `You have ${linkedAccountsCount} account connected. Adding more platforms increases your visibility to brands.`,
      };
    }
    return {
      title: "Complete your Brand Fit profile",
      description: `${brandFitCompletion}% complete. Finishing your Brand Fit helps us match you with the right campaigns.`,
    };
  };

  const { title, description } = getMessage();

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`glass rounded-2xl p-3 sm:p-4 border border-primary/20 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-foreground text-xs sm:text-sm leading-tight truncate">{title}</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
              </div>
              <button 
                onClick={() => setIsDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
              {needsMoreAccounts && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/connect-socials")}
                  className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 sm:gap-1.5 border-primary/30 hover:bg-primary/10 px-2 sm:px-3"
                >
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">Connect</span>
                </Button>
              )}
              {needsBrandFit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/brand-fit")}
                  className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 sm:gap-1.5 border-purple/30 hover:bg-purple/10 px-2 sm:px-3"
                >
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">Brand Fit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline variant - more compact
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-primary/5 border border-primary/10 ${className}`}
    >
      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
      <p className="text-xs sm:text-sm text-muted-foreground flex-1 min-w-0">
        <span className="text-foreground font-medium truncate">{title}</span>
        <span className="hidden sm:inline">: {description}</span>
      </p>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {needsMoreAccounts && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/connect-socials")}
            className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 px-2"
          >
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="hidden xs:inline">Connect</span>
          </Button>
        )}
        {needsBrandFit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/brand-fit")}
            className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 text-purple hover:text-purple hover:bg-purple/10 px-2"
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            <span className="hidden xs:inline">Brand Fit</span>
          </Button>
        )}
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 sm:p-1"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
