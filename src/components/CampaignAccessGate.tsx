import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useCachedCampaignAccess } from "@/hooks/useRoleCache";

interface CampaignAccessGateProps {
  campaignId?: string;
  children: ReactNode;
}

/**
 * Gate component that enforces campaign-level access control.
 * Campaign Managers can only access campaigns they are assigned to.
 * Owners and Admins have full access.
 */
export function CampaignAccessGate({ campaignId, children }: CampaignAccessGateProps) {
  const navigate = useNavigate();
  const { canAccess, loading, isCampaignManager } = useCachedCampaignAccess(campaignId);

  // Show loading while checking access
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassLoading size="lg" variant="primary" text="Checking access..." />
      </div>
    );
  }

  // If user has access, render children
  if (canAccess) {
    return <>{children}</>;
  }

  // Access denied view
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 glass rounded-2xl p-8 border border-red-500/20">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center"
          >
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </motion.div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Access Restricted
          </h3>
          
          <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed">
            {isCampaignManager 
              ? "You don't have access to this campaign. Contact your admin to be assigned."
              : "You don't have permission to view this campaign."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/brand/campaigns")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </div>

          {isCampaignManager && (
            <p className="text-xs text-muted-foreground mt-6">
              <Lock className="h-3 w-3 inline mr-1" />
              Campaign Managers can only access campaigns they are assigned to.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * HOC to wrap a campaign page with access control
 */
export function withCampaignAccess<P extends { id?: string }>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithCampaignAccessWrapper(props: P) {
    return (
      <CampaignAccessGate campaignId={props.id}>
        <WrappedComponent {...props} />
      </CampaignAccessGate>
    );
  };
}
