import { useState, useMemo, useEffect } from "react";
import { Send, Search, Filter, X, Instagram, Youtube, Sparkles, Target, AlertCircle, Info, Link2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CampaignCard from "@/components/CampaignCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useCampaignMatching, type Campaign } from "@/hooks/useCampaignMatching";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";
import { FullPageGate } from "@/components/ProfileGate";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
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

const Apply = () => {
  const navigate = useNavigate();
  const { isReady: isProfileReady, isProfileComplete, isLoading } = useProfileReadiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [commissionFilter, setCommissionFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);

  // Campaign data with additional metadata for matching
  const campaigns: Campaign[] = [
    {
      id: "eco-fashion-collection",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
      commission: 15,
      categories: ["Sustainability", "Fashion", "Jewelry"],
      campaignName: "Eco Fashion Collection",
      isNew: true,
      requirementMet: true,
      language: "English",
      country: "United Kingdom",
      countryFlag: "🇬🇧",
      socials: ["instagram", "tiktok"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["lifestyle", "storytelling"],
    },
    {
      id: "luxury-perfume-launch",
      imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
      commission: 12,
      categories: ["Fragrances", "Fashion", "Lifestyle"],
      campaignName: "Luxury Perfume Launch",
      isNew: true,
      requirementMet: true,
      language: "English",
      country: "United Kingdom",
      countryFlag: "🇬🇧",
      socials: ["instagram", "tiktok", "youtube"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["lifestyle", "reviews"],
    },
    {
      id: "saas-growth-strategy",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      commission: 20,
      categories: ["Business", "Digital Marketing", "Entrepreneur"],
      campaignName: "SaaS Growth Strategy",
      isNew: true,
      requirementMet: false,
      language: "English, German, French",
      country: "Germany",
      countryFlag: "🇩🇪",
      socials: ["instagram", "tiktok", "youtube"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["educational", "tutorial"],
    },
    {
      id: "premium-headphones",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      commission: 18,
      categories: ["Tech", "Audio", "Lifestyle"],
      campaignName: "Premium Headphones",
      isNew: false,
      requirementMet: true,
      language: "English",
      country: "United States",
      countryFlag: "🇺🇸",
      socials: ["youtube", "tiktok"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["reviews", "unboxing"],
    },
    {
      id: "camera-accessories",
      imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop",
      commission: 10,
      categories: ["Photography", "Tech", "Creative"],
      campaignName: "Camera Accessories",
      isNew: false,
      requirementMet: true,
      language: "English, Spanish",
      country: "Spain",
      countryFlag: "🇪🇸",
      socials: ["instagram", "youtube"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["tutorial", "reviews"],
    },
    {
      id: "athletic-footwear",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop",
      commission: 22,
      categories: ["Sports", "Fashion", "Fitness"],
      campaignName: "Athletic Footwear",
      isNew: true,
      requirementMet: false,
      language: "English",
      country: "United Kingdom",
      countryFlag: "🇬🇧",
      socials: ["instagram", "tiktok", "youtube"],
      isRegulated: false,
      requiresVehicle: false,
      contentType: ["lifestyle", "fitness"],
    },
    {
      id: "craft-beer-promo",
      imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop",
      commission: 25,
      categories: ["Food & Beverage", "Lifestyle"],
      campaignName: "Craft Beer Promo",
      isNew: false,
      requirementMet: true,
      language: "English",
      country: "United States",
      countryFlag: "🇺🇸",
      socials: ["instagram", "tiktok"],
      isRegulated: true,
      requiresVehicle: false,
      contentType: ["lifestyle", "entertaining"],
    },
    {
      id: "electric-car-review",
      imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
      commission: 30,
      categories: ["Automotive", "Tech", "Lifestyle"],
      campaignName: "Electric Car Review",
      isNew: true,
      requirementMet: true,
      language: "English",
      country: "United Kingdom",
      countryFlag: "🇬🇧",
      socials: ["youtube", "instagram"],
      isRegulated: false,
      requiresVehicle: true,
      contentType: ["reviews", "educational"],
    },
  ];

  // Use the campaign matching hook
  const { 
    matchedCampaigns, 
    allCampaigns,
    hasBrandFitData, 
    brandFitCompletion,
    topMatchCount 
  } = useCampaignMatching(campaigns);

  // Get campaigns to display based on toggle
  const campaignsToFilter = showAllCampaigns ? allCampaigns : matchedCampaigns;

  // Get unique categories from all campaigns
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    campaigns.forEach(c => c.categories.forEach(cat => categories.add(cat)));
    return Array.from(categories).sort();
  }, []);

  // Get unique platforms from all campaigns
  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    campaigns.forEach(c => c.socials.forEach(s => platforms.add(s)));
    return Array.from(platforms).sort();
  }, []);

  // Filter campaigns based on all criteria
  const filteredCampaigns = useMemo(() => {
    return campaignsToFilter.filter(campaign => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        campaign.categories.includes(categoryFilter);

      // Commission filter
      let matchesCommission = true;
      if (commissionFilter === "10-15") {
        matchesCommission = campaign.commission >= 10 && campaign.commission <= 15;
      } else if (commissionFilter === "15-20") {
        matchesCommission = campaign.commission > 15 && campaign.commission <= 20;
      } else if (commissionFilter === "20+") {
        matchesCommission = campaign.commission > 20;
      }

      // Platform filter
      const matchesPlatform = platformFilter === "all" || 
        campaign.socials.includes(platformFilter);

      return matchesSearch && matchesCategory && matchesCommission && matchesPlatform;
    });
  }, [campaignsToFilter, searchQuery, categoryFilter, commissionFilter, platformFilter]);

  const hasActiveFilters = categoryFilter !== "all" || commissionFilter !== "all" || platformFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setCommissionFilter("all");
    setPlatformFilter("all");
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

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading campaigns..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <FullPageGate
          title="Verification Required"
          description="Link at least one social account to access campaign opportunities."
        >
          <motion.div 
            className="p-6 lg:p-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
          {/* Header */}
          <PageHeader
            title="Campaign Opportunities"
            subtitle={hasBrandFitData 
              ? "Matched campaigns based on your verified profile" 
              : "Review available campaigns and submit for consideration."}
            icon={Send}
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

          {/* AI Matching Banner */}
          <AnimatePresence>
            {!hasBrandFitData && (
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
                      <Sparkles className="h-5 w-5 text-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Enable Profile Matching</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete your Brand Fit assessment to receive personalized campaign recommendations.
                      </p>
                      {brandFitCompletion > 0 && brandFitCompletion < 30 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={brandFitCompletion} className="w-24 h-1.5" />
                          <span className="text-xs text-muted-foreground">{brandFitCompletion}% complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/brand-fit")}
                    className="gradient-accent text-white shrink-0"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Complete Assessment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Matching Stats Banner (when Brand Fit is complete) */}
          <AnimatePresence>
            {hasBrandFitData && (
              <motion.div
                className="glass rounded-2xl p-4 mb-6 border border-success/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-success" />
                            </div>
                            <span className="text-sm text-foreground">
                              <span className="font-semibold text-success">{topMatchCount}</span> top matches
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border-white/10">
                          <p className="text-sm">Campaigns with 70%+ match score</p>
                          <p className="text-xs text-muted-foreground mt-1">Based on your Brand Fit preferences</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              Showing <span className="text-foreground font-medium">{matchedCampaigns.length}</span> matched campaigns
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border-white/10">
                          <p className="text-sm">Campaigns with 40%+ match score are shown</p>
                          <p className="text-xs text-muted-foreground mt-1">Low-match campaigns are filtered out</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllCampaigns(!showAllCampaigns)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showAllCampaigns ? "Show Matched Only" : `Show All (${allCampaigns.length})`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10">
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Commission Filter */}
                <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Commission" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10">
                    <SelectItem value="all">All Commissions</SelectItem>
                    <SelectItem value="10-15">10% - 15%</SelectItem>
                    <SelectItem value="15-20">15% - 20%</SelectItem>
                    <SelectItem value="20+">20%+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Platform Filter */}
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                {searchQuery && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Search: "{searchQuery}"
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge className="bg-pink/20 text-pink border-pink/30">
                    {categoryFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setCategoryFilter("all")}
                    />
                  </Badge>
                )}
                {commissionFilter !== "all" && (
                  <Badge className="bg-cyan/20 text-cyan border-cyan/30">
                    Commission: {commissionFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setCommissionFilter("all")}
                    />
                  </Badge>
                )}
                {platformFilter !== "all" && (
                  <Badge className="bg-purple/20 text-purple border-purple/30 flex items-center gap-1">
                    {getPlatformIcon(platformFilter)}
                    <span className="capitalize">{platformFilter}</span>
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setPlatformFilter("all")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredCampaigns.length}</span> of {campaignsToFilter.length} campaigns
            </p>
          </div>

          {/* Profile Completion Reminder - only on campaign pages */}
          {isProfileReady && !isProfileComplete && (
            <ProfileCompletionBanner variant="inline" className="mb-6" />
          )}

          {/* Campaign Grid */}
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign, index) => (
                <CampaignCard 
                  key={campaign.id} 
                  {...campaign}
                  matchScore={campaign.matchScore}
                  matchReasons={campaign.matchReasons}
                  isTopMatch={campaign.isTopMatch}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                {hasBrandFitData ? (
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Search className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasBrandFitData ? "No matching campaigns found" : "No campaigns found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasBrandFitData 
                  ? "Try adjusting your filters or view all campaigns"
                  : "Try adjusting your filters or search query"}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={clearFilters} variant="outline" className="border-white/10">
                  Clear All Filters
                </Button>
                {hasBrandFitData && !showAllCampaigns && (
                  <Button onClick={() => setShowAllCampaigns(true)} className="gradient-primary">
                    View All Campaigns
                  </Button>
                )}
              </div>
            </div>
          )}
          </motion.div>
        </FullPageGate>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Apply;
