import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  CheckCircle, 
  Target, 
  Sparkles, 
  ArrowRight, 
  TrendingUp,
  UtensilsCrossed,
  Leaf,
  Wine,
  Heart,
  Shield,
  Zap,
  Link2,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSurveyScoring, getSurveyScoreData } from "@/hooks/useSurveyScoring";
import { useSurveys } from "@/hooks/useSurveys";

// Category card images
const categoryImages = {
  diet: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&q=80",
  sustainability: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&q=80",
  alcohol: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=200&fit=crop&q=80",
};

const BrandProfile = () => {
  const navigate = useNavigate();
  const surveyScore = useSurveyScoring();
  const { surveys, getCompletedSurveysList, getIncompleteSurveys } = useSurveys();
  
  const completedSurveys = getCompletedSurveysList();
  const incompleteSurveys = getIncompleteSurveys();
  
  // Get Brand Fit data from localStorage
  const getBrandFitData = () => {
    try {
      const stored = localStorage.getItem("brandFitData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  
  const brandFitData = getBrandFitData();
  
  // Calculate overall profile strength
  const brandFitComplete = brandFitData ? 
    Object.values(brandFitData).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length : 0;
  const brandFitTotal = 10;
  const brandFitPercentage = Math.round((brandFitComplete / brandFitTotal) * 100);
  
  const surveyPercentage = Math.round((surveyScore.totalSurveysCompleted / surveyScore.totalSurveys) * 100);
  const overallProfileStrength = Math.round((brandFitPercentage * 0.5) + (surveyPercentage * 0.5));

  // Format preference display
  const formatPreference = (value: string | null): string => {
    if (!value) return "Not specified";
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
  };

  // Get match impact description
  const getMatchImpact = (value: string | null, category: string): string => {
    if (!value) return "Complete survey to unlock";
    switch (category) {
      case "diet":
        if (value === "vegan" || value === "vegetarian") return "Matched with plant-based brands";
        if (value === "keto") return "Matched with low-carb & fitness brands";
        return "Matched with general food & lifestyle brands";
      case "sustainability":
        if (value === "strict") return "Only eco-certified brands shown";
        if (value === "preferred") return "Eco-brands prioritized in matching";
        return "All brands considered";
      case "alcohol":
        if (value === "yes") return "Eligible for alcohol campaigns";
        if (value === "limited") return "Restricted alcohol campaigns only";
        return "Excluded from alcohol campaigns";
      default:
        return "Influences campaign matching";
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div
          className="p-6 lg:p-8 max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <PageHeader
            title="Your Brand Profile"
            subtitle="See how your preferences influence campaign matching"
            icon={User}
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 w-fit">
              <Sparkles className="h-3 w-3 mr-1" />
              {overallProfileStrength}% Profile Strength
            </Badge>
          </PageHeader>

          {/* Profile Strength Banner */}
          <motion.div
            className="glass rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Profile Impact Summary</h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-purple/20 flex items-center justify-center shrink-0">
                    <Heart className="h-5 w-5 text-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{brandFitPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Brand Fit Complete</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-cyan/20 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{surveyScore.totalSurveysCompleted}/{surveyScore.totalSurveys}</p>
                    <p className="text-xs text-muted-foreground">Surveys Complete</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">+{surveyScore.surveyCompletionBonus}%</p>
                    <p className="text-xs text-muted-foreground">Match Rate Boost</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => navigate("/brand-fit")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Edit Brand Fit
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => navigate("/surveys")}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Complete Surveys
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => navigate("/connect-socials")}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Link Accounts
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Survey Responses Section */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Survey Responses & Matching Impact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Diet & Lifestyle Card */}
              <motion.div
                className="glass rounded-2xl overflow-hidden"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={categoryImages.diet}
                    alt="Diet & Lifestyle"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-orange to-pink flex items-center justify-center text-white">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={surveyScore.dietaryPreference ? "bg-success/80 text-white border-success/50" : "bg-white/20 text-white border-white/20"}>
                      {surveyScore.dietaryPreference ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : "Not Started"}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">Diet & Lifestyle</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Your Preference</p>
                      <p className="text-sm font-medium text-foreground">{formatPreference(surveyScore.dietaryPreference)}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-cyan shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {getMatchImpact(surveyScore.dietaryPreference, "diet")}
                      </p>
                    </div>
                    {surveyScore.contentAffinities.foodContent && (
                      <Badge className="bg-orange/20 text-orange border-orange/30 text-xs">
                        Food Content Creator
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Climate & Sustainability Card */}
              <motion.div
                className="glass rounded-2xl overflow-hidden"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={categoryImages.sustainability}
                    alt="Climate & Sustainability"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-cyan flex items-center justify-center text-white">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={surveyScore.sustainabilityStance ? "bg-success/80 text-white border-success/50" : "bg-white/20 text-white border-white/20"}>
                      {surveyScore.sustainabilityStance ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : "Not Started"}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">Climate & Sustainability</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Your Stance</p>
                      <p className="text-sm font-medium text-foreground">{formatPreference(surveyScore.sustainabilityStance)}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-cyan shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {getMatchImpact(surveyScore.sustainabilityStance, "sustainability")}
                      </p>
                    </div>
                    {surveyScore.contentAffinities.sustainabilityContent && (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                        Eco Content Creator
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Alcohol & Regulated Card */}
              <motion.div
                className="glass rounded-2xl overflow-hidden"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={categoryImages.alcohol}
                    alt="Alcohol & Regulated Brands"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center text-white">
                    <Wine className="h-5 w-5" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={surveyScore.alcoholComfort ? "bg-success/80 text-white border-success/50" : "bg-white/20 text-white border-white/20"}>
                      {surveyScore.alcoholComfort ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : "Not Started"}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">Alcohol & Regulated Brands</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Your Comfort Level</p>
                      <p className="text-sm font-medium text-foreground">{formatPreference(surveyScore.alcoholComfort)}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-purple shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {getMatchImpact(surveyScore.alcoholComfort, "alcohol")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {!surveyScore.regulatedBrandPreferences.tobacco && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">No Tobacco</Badge>
                      )}
                      {!surveyScore.regulatedBrandPreferences.gambling && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">No Gambling</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Brand Fit Summary */}
          {brandFitData && (
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-purple" />
                <h2 className="text-lg font-semibold text-foreground">Brand Fit Preferences</h2>
              </div>
              
              <div className="glass rounded-2xl p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Brand Categories */}
                  {brandFitData.brandCategories?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Preferred Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {brandFitData.brandCategories.slice(0, 4).map((cat: string) => (
                          <Badge key={cat} className="bg-primary/20 text-primary border-primary/30 text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {brandFitData.brandCategories.length > 4 && (
                          <Badge className="bg-white/10 text-muted-foreground border-white/10 text-xs">
                            +{brandFitData.brandCategories.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Styles */}
                  {brandFitData.contentStyles?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Content Styles</p>
                      <div className="flex flex-wrap gap-1">
                        {brandFitData.contentStyles.slice(0, 4).map((style: string) => (
                          <Badge key={style} className="bg-cyan/20 text-cyan border-cyan/30 text-xs">
                            {style}
                          </Badge>
                        ))}
                        {brandFitData.contentStyles.length > 4 && (
                          <Badge className="bg-white/10 text-muted-foreground border-white/10 text-xs">
                            +{brandFitData.contentStyles.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Audience Type */}
                  {brandFitData.audienceType && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Target Audience</p>
                      <p className="text-sm font-medium text-foreground">{brandFitData.audienceType}</p>
                    </div>
                  )}

                  {/* Creative Control */}
                  {brandFitData.creativeControl && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Creative Control</p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {brandFitData.creativeControl.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}

                  {/* Collaboration Type */}
                  {brandFitData.collaborationType && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Collaboration Style</p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {brandFitData.collaborationType.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}

                  {/* Personal Assets */}
                  {brandFitData.personalAssets?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2">Personal Assets</p>
                      <div className="flex flex-wrap gap-1">
                        {brandFitData.personalAssets.map((asset: string) => (
                          <Badge key={asset} className="bg-purple/20 text-purple border-purple/30 text-xs capitalize">
                            {asset}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {brandFitPercentage}% of Brand Fit completed
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-primary"
                    onClick={() => navigate("/brand-fit")}
                  >
                    Edit Preferences
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!brandFitData && surveyScore.totalSurveysCompleted === 0 && (
            <motion.div
              className="glass rounded-2xl p-12 text-center"
              variants={fadeInUp}
            >
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Building Your Brand Profile
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete surveys and Brand Fit preferences to unlock better campaign matches tailored to your values and audience.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate("/surveys")}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Start Surveys
                </Button>
                <Button variant="outline" onClick={() => navigate("/brand-fit")}>
                  <Heart className="h-4 w-4 mr-2" />
                  Set Brand Fit
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default BrandProfile;
