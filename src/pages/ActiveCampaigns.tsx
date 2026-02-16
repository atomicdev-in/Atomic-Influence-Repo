import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FullPageGate } from "@/components/ProfileGate";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";
import { useCreatorActiveCampaigns, CreatorActiveCampaign } from "@/hooks/useCreatorActiveCampaigns";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
  X,
  Play,
  AlertTriangle,
  Instagram,
  Youtube,
  MessageSquare,
  TrendingUp,
  Mail,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Campaign status config
const statusConfig: Record<string, { label: string; actionLabel: string; color: string; icon: any; urgency: number }> = {
  active: { 
    label: "Active", 
    actionLabel: "Review Brief",
    color: "bg-primary/20 text-primary border-primary/30", 
    icon: Play,
    urgency: 3
  },
  in_progress: { 
    label: "In Progress", 
    actionLabel: "Continue Work",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    icon: Clock,
    urgency: 4
  },
  pending_review: { 
    label: "Pending Review", 
    actionLabel: "Awaiting Review",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30", 
    icon: Clock,
    urgency: 5
  },
  revision_requested: { 
    label: "Revision Requested", 
    actionLabel: "Action Required",
    color: "bg-pink/20 text-pink border-pink/30", 
    icon: AlertTriangle,
    urgency: 1
  },
  completed: { 
    label: "Completed", 
    actionLabel: "View Summary",
    color: "bg-muted text-muted-foreground border-white/10", 
    icon: CheckCircle2,
    urgency: 10
  },
};

// Loading skeleton
const ActiveCampaignsSkeleton = () => (
  <div className="p-6 lg:p-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-72" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden">
          <Skeleton className="h-44 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActiveCampaigns = () => {
  const navigate = useNavigate();
  const { isLoading: profileLoading } = useProfileReadiness();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCreatorActiveCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const isLoading = profileLoading || campaignsLoading;

  // Get unique platforms
  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    campaigns.forEach(c => c.socials.forEach(s => platforms.add(s)));
    return Array.from(platforms).sort();
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    const sorted = [...campaigns].sort((a, b) => {
      const aStatus = statusConfig[a.status] || statusConfig['active'];
      const bStatus = statusConfig[b.status] || statusConfig['active'];
      const urgencyDiff = aStatus.urgency - bStatus.urgency;
      if (urgencyDiff !== 0) return urgencyDiff;
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

    return sorted.filter(campaign => {
      const matchesSearch = searchQuery === "" || 
        campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.brandName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;

      const matchesPlatform = platformFilter === "all" || 
        campaign.socials.includes(platformFilter);

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [campaigns, searchQuery, statusFilter, platformFilter]);

  const hasActiveFilters = statusFilter !== "all" || platformFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlatformFilter("all");
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadge = (campaign: CreatorActiveCampaign) => {
    if (campaign.status === "revision_requested") {
      return { text: "Action required", color: "bg-pink/20 text-pink border-pink/30", icon: AlertTriangle };
    }
    if (campaign.status === "completed") return null;
    
    const daysLeft = getDaysUntilDeadline(campaign.deadline);
    if (daysLeft === null) return null;
    if (daysLeft < 0) {
      return { text: "Overdue", color: "bg-pink/20 text-pink border-pink/30", icon: AlertTriangle };
    }
    if (daysLeft <= 2) {
      return { text: `Due in ${daysLeft}d`, color: "bg-orange/20 text-orange border-orange/30", icon: Clock };
    }
    if (daysLeft <= 5) {
      return { text: `${daysLeft} days left`, color: "bg-muted text-muted-foreground border-white/10", icon: Calendar };
    }
    return null;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "tiktok":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Calculate stats
  const activeCampaignsCount = campaigns.filter(c => c.status !== "completed").length;
  const totalEarnings = campaigns.filter(c => c.paymentStatus === "paid").reduce((sum, c) => sum + c.commission, 0);
  const pendingEarnings = campaigns.filter(c => c.paymentStatus !== "paid").reduce((sum, c) => sum + c.commission, 0);
  const totalDeliverables = campaigns.reduce((sum, c) => sum + c.deliverablesTotal, 0);
  const completedDeliverables = campaigns.reduce((sum, c) => sum + c.deliverablesDone, 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <ActiveCampaignsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageErrorBoundary>
        <PageTransition>
          <FullPageGate
            title="Connect to Access Campaigns"
            description="Connect at least one social account to start collaborating with brands."
            icon={<Briefcase className="h-8 w-8 text-primary" />}
          >
            <motion.div 
              className="p-6 lg:p-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {/* Header */}
              <PageHeader
                title="Active Campaigns"
                subtitle="Manage your campaign deliverables and track progress"
                icon={Briefcase}
              >
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search campaigns..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                  />
                </div>
              </PageHeader>

              <ProfileCompletionBanner variant="card" className="mb-6" />

              {/* Stats Banner */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" variants={fadeInUp}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="glass rounded-2xl p-4 flex items-center gap-4 cursor-help">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{activeCampaignsCount}</p>
                          <p className="text-sm text-muted-foreground">Active Campaigns</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-white/10">
                      <p className="text-sm">Campaigns in progress</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="glass rounded-2xl p-4 flex items-center gap-4 cursor-help">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-success">${totalEarnings.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Earned</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-white/10">
                      <p className="text-sm">Total from paid campaigns</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="glass rounded-2xl p-4 flex items-center gap-4 cursor-help">
                        <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-orange" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange">${pendingEarnings.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-white/10">
                      <p className="text-sm">Awaiting payment</p>
                      <p className="text-xs text-muted-foreground mt-1">{completedDeliverables}/{totalDeliverables} deliverables done</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Filters */}
              {campaigns.length > 0 && (
                <div className="glass rounded-2xl p-4 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Filters</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 flex-1">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-white/10">
                          <SelectItem value="all">All Statuses</SelectItem>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={platformFilter} onValueChange={setPlatformFilter}>
                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10 rounded-xl">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-white/10">
                          <SelectItem value="all">All Platforms</SelectItem>
                          {allPlatforms.map(platform => (
                            <SelectItem key={platform} value={platform}>
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(platform)}
                                <span className="capitalize">{platform}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Results Count */}
              {campaigns.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="text-foreground font-medium">{filteredCampaigns.length}</span> of {campaigns.length} campaigns
                  </p>
                </div>
              )}

              {/* Campaign Grid */}
              {filteredCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => {
                    const config = statusConfig[campaign.status] || statusConfig['active'];
                    const StatusIcon = config.icon;
                    const urgencyBadge = getUrgencyBadge(campaign);
                    
                    return (
                      <motion.div 
                        key={campaign.id}
                        onClick={() => navigate(`/campaign/${campaign.id}`)}
                        className="glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Image Section */}
                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                          {campaign.imageUrl ? (
                            <img
                              src={campaign.imageUrl}
                              alt={campaign.campaignName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Briefcase className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                            <Badge className="gradient-primary text-white border-0 backdrop-blur-sm">
                              <DollarSign className="h-3 w-3 mr-1" /> ${campaign.commission.toLocaleString()}
                            </Badge>
                            {urgencyBadge && (
                              <Badge className={cn("backdrop-blur-sm text-xs", urgencyBadge.color)}>
                                <urgencyBadge.icon className="h-3 w-3 mr-1" />
                                {urgencyBadge.text}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            {campaign.brandLogo ? (
                              <img src={campaign.brandLogo} alt={campaign.brandName} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl border-2 border-white/30">
                                {campaign.brandName.charAt(0)}
                              </div>
                            )}
                            <span className="text-white font-medium text-sm">{campaign.brandName}</span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={cn("text-xs", config.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.actionLabel}
                            </Badge>
                            {campaign.hasUnreadMessages && (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                New
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-foreground mb-3">{campaign.campaignName}</h3>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {campaign.categories.slice(0, 3).map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs font-normal bg-white/5 border-white/10 text-foreground/70">
                                {category}
                              </Badge>
                            ))}
                          </div>

                          <div className="border-t border-white/10 pt-3">
                            {campaign.deliverablesTotal > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                  <span className="text-muted-foreground">Deliverables</span>
                                  <span className="text-foreground font-medium">{campaign.deliverablesDone}/{campaign.deliverablesTotal}</span>
                                </div>
                                <Progress value={campaign.progress} className="h-2" />
                              </div>
                            )}

                            <div className="space-y-2.5 text-sm">
                              {campaign.deadline && (
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground w-16">Deadline</span>
                                  <span className="text-foreground/80">{new Date(campaign.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                                </div>
                              )}
                              {campaign.socials.length > 0 && (
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground w-16">Socials</span>
                                  <div className="flex gap-2">
                                    {campaign.socials.map((social) => (
                                      <div key={social} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                                        {getPlatformIcon(social)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {campaign.paymentStatus === "paid" && (
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground w-16">Payment</span>
                                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Paid
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : campaigns.length === 0 ? (
                <motion.div className="glass rounded-2xl p-12 text-center" variants={fadeInUp}>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Active Campaigns</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Accept campaign invitations from brands to start collaborating. Your active campaigns will appear here.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate("/invitations")}>
                      <Mail className="h-4 w-4 mr-2" />
                      View Invitations
                    </Button>
                    <Button className="gradient-primary text-white" onClick={() => navigate("/brand-fit")}>
                      <Target className="h-4 w-4 mr-2" />
                      Complete Brand Fit
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div className="glass rounded-2xl p-12 text-center" variants={fadeInUp}>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button onClick={clearFilters} variant="outline" className="border-white/10">
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </FullPageGate>
        </PageTransition>
      </PageErrorBoundary>
    </DashboardLayout>
  );
};

export default ActiveCampaigns;
