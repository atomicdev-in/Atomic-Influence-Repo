import { useState } from "react";
import { Mail, Sparkles, X, CheckCircle, Calendar, DollarSign, Clock, FileText, Users, Instagram, Youtube, Star, Target, Shield, Zap, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullPageGate } from "@/components/ProfileGate";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateBrandFitCompletion, getBrandFitData } from "@/hooks/useCreatorScoring";
import { CreatorInvitationDialog } from "@/components/creator/CreatorInvitationDialog";
import { useCreatorInvitations } from "@/hooks/useCreatorInvitations";

const Invitations = () => {
  const navigate = useNavigate();
  const { isLoading } = useProfileReadiness();
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const brandFitData = getBrandFitData();
  const brandFitCompletion = calculateBrandFitCompletion(brandFitData);

  // Real-time invitations from database
  const { invitations, refetch: refetchInvitations, isLoading: invitationsLoading } = useCreatorInvitations();

  // Filter pending and negotiating invitations
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending' || inv.status === 'negotiating');
  const urgentCount = pendingInvitations.filter(inv => inv.status === 'negotiating').length;

  // Calculate stats
  const totalPotentialEarnings = pendingInvitations.reduce((sum, inv) => sum + (inv.offered_payout || 0), 0);

  // Show loading state
  if (isLoading || invitationsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading invitations..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <FullPageGate
          title="Connect to View Invitations"
          description="Connect at least one social account to see brand invitations."
        >
          <motion.div 
            className="p-6 lg:p-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Header */}
            <PageHeader
              title="Brand Invitations"
              subtitle="Direct invitations from brands reviewing your profile for campaign consideration"
              icon={Mail}
            >
              <div className="flex items-center gap-2">
                {urgentCount > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 animate-pulse">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {urgentCount} Negotiating
                  </Badge>
                )}
                <Badge className="gradient-primary text-white border-0">
                  {pendingInvitations.length} pending review
                </Badge>
              </div>
            </PageHeader>

            {/* Profile Completion Reminder */}
            <ProfileCompletionBanner variant="inline" className="mb-6" />

            {/* Brand Fit Prompt */}
            <AnimatePresence>
              {brandFitCompletion < 50 && (
                <motion.div
                  className="glass rounded-2xl p-5 mb-6 border border-purple/20 relative overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple/10 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5 text-purple" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Improve Your Match Rate</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete your Brand Fit assessment to receive more targeted invitations.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate("/brand-fit")}
                      className="gradient-accent text-white shrink-0"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Complete Assessment
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Bar */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-6"
              variants={fadeInUp}
            >
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{pendingInvitations.length}</p>
                <p className="text-xs text-muted-foreground">Pending Invites</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="glass rounded-xl p-4 text-center cursor-help">
                      <p className="text-2xl font-bold text-success">
                        ${totalPotentialEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Potential Earnings</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background border-white/10">
                    <p className="text-sm">Sum of offered payouts from all pending invites</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple">{urgentCount}</p>
                <p className="text-xs text-muted-foreground">Negotiations Active</p>
              </div>
            </motion.div>

            {/* Invitations Grid */}
            {pendingInvitations.length > 0 ? (
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingInvitations.map((invitation) => (
                    <motion.div
                      key={invitation.id}
                      className="glass rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all border border-transparent"
                      onClick={() => setSelectedInvitation(invitation)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={invitation.status === 'negotiating' ? "bg-blue-500/20 text-blue-500" : "bg-amber-500/20 text-amber-500"}>
                          {invitation.status === 'negotiating' ? 'Negotiating' : 'New Invite'}
                        </Badge>
                        <span className="text-lg font-bold text-primary">
                          ${invitation.offered_payout?.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-semibold truncate text-foreground">{invitation.campaign?.name || 'Campaign'}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {invitation.brand_profile?.company_name || 'Brand'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <Badge variant="secondary" className="text-xs">{invitation.campaign?.category}</Badge>
                        {invitation.timeline_start && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(invitation.timeline_start).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {invitation.status === 'negotiating' && (
                        <div className="mt-3 flex items-center gap-1 text-blue-500 text-sm">
                          <MessageSquare className="h-4 w-4" />
                          <span>Response needed</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div className="glass rounded-2xl p-12 text-center" variants={fadeInUp}>
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Pending Invitations
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  Complete your Brand Fit assessment and connect your social accounts. Brands will review your profile and send invitations for campaigns that match your style.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate("/connect-socials")}>
                    <Users className="h-4 w-4 mr-2" />
                    Connect Accounts
                  </Button>
                  <Button className="gradient-primary text-white" onClick={() => navigate("/brand-fit")}>
                    <Target className="h-4 w-4 mr-2" />
                    Complete Brand Fit
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Invitation Dialog */}
            <CreatorInvitationDialog
              open={!!selectedInvitation}
              onOpenChange={(open) => !open && setSelectedInvitation(null)}
              invitation={selectedInvitation}
              onActionComplete={() => {
                setSelectedInvitation(null);
                refetchInvitations();
              }}
            />
          </motion.div>
        </FullPageGate>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Invitations;
