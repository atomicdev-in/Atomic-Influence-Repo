import { DollarSign, TrendingUp, CheckCircle, ArrowUpRight, Wallet, Sparkles, Target, Heart, Link2, Zap, BarChart3, ArrowRight, Shield, Eye, Users, User, Info, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { useProfileReadiness } from "@/hooks/useProfileReadiness";
import { FullPageGate } from "@/components/ProfileGate";
import { ConfettiCelebration, useFirstUnlockCelebration } from "@/components/ConfettiCelebration";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreatorHealthScore,
  useEarningsForecast,
  useProfileCompletion,
  useSmartRecommendations,
  useEarningsSnapshot,
  getCampaignHistoryData,
  calculateResponseScore,
  calculatePerformanceScore,
} from "@/hooks/useCreatorScoring";
import { useSurveyScoring } from "@/hooks/useSurveyScoring";
import { useTheme } from "@/contexts/ThemeContext";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// Icon mapping for recommendations
const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Link2,
  Target,
  User,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isReady: isProfileReady, isLoading } = useProfileReadiness();
  
  // Celebration when dashboard unlocks
  const { shouldCelebrate, clearCelebration } = useFirstUnlockCelebration(isProfileReady, isLoading);

  // Use dynamic scoring hooks
  const creatorHealth = useCreatorHealthScore();
  const forecast = useEarningsForecast();
  const profileCompletion = useProfileCompletion();
  const recommendations = useSmartRecommendations();
  const earningsSnapshot = useEarningsSnapshot();
  const surveyScore = useSurveyScoring();
  
  // Get campaign history for account health metrics
  const campaignHistory = getCampaignHistoryData();
  const responseScore = calculateResponseScore(campaignHistory.avgResponseTime);
  const onTimeRate = campaignHistory.totalCompleted > 0 
    ? Math.round((campaignHistory.onTimeDeliveries / campaignHistory.totalCompleted) * 100)
    : 0;
  const brandRating = Math.min(5, 4 + (onTimeRate / 100) * 0.5 + (responseScore / 100) * 0.5);

  // Theme-aware circle background
  const circleTrackColor = theme === "dark" ? "text-white/10" : "text-slate-200";
  // Earnings icon mapping
  const earningsIconMap: Record<string, React.ElementType> = {
    DollarSign,
    TrendingUp,
    CheckCircle,
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Overview">
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Overview" onRefresh={handleRefresh}>
      {/* Confetti celebration when dashboard unlocks */}
      <ConfettiCelebration isActive={shouldCelebrate} onComplete={clearCelebration} />
      
      <PageTransition>
        <PageErrorBoundary>
        <FullPageGate
          title="Connect to Access Your Dashboard"
          description="Connect at least one social account to unlock your personalized health score, earnings, and recommendations."
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
        >
            <motion.div 
              className="lg:p-4"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Page Header */}
              <PageHeader
                title="Creator Status"
                subtitle="Performance metrics, earnings forecast, and priority actions."
                icon={BarChart3}
                className="hidden md:block"
              />

            <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Creator Health Score */}
              <motion.div 
                className="glass rounded-2xl p-6 relative overflow-hidden"
                variants={itemVariants}
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-5 w-5 text-pink" />
                        <h2 className="text-lg font-semibold text-foreground">Creator Health Score</h2>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-background border-white/10">
                              <p className="text-sm">Your health score is calculated from profile completion, Brand Fit, engagement rates, and response times. A higher score means better visibility to brands.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground">How brands and our AI see your profile</p>
                    </div>
                    <div className="text-right">
                      <motion.div 
                        className="text-4xl font-bold text-foreground"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        {creatorHealth.overall}
                      </motion.div>
                      <div className="flex items-center gap-1 text-success text-sm">
                        <ArrowUpRight className="h-3 w-3" />
                        {creatorHealth.trend} this week
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {creatorHealth.factors.map((factor, index) => (
                      <TooltipProvider key={factor.label}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div 
                              className="text-center cursor-help"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <div className="relative w-12 h-12 mx-auto mb-2">
                                <svg className="w-12 h-12 -rotate-90">
                                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className={circleTrackColor} />
                                  <circle 
                                    cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" 
                                    className={factor.color}
                                    strokeDasharray={`${factor.value * 1.25} 125`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                                  {factor.value}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{factor.label}</p>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white border-slate-200 shadow-lg">
                            <p className="text-sm text-slate-700">{factor.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Weight: {Math.round(factor.weight * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Earnings Snapshot */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                variants={containerVariants}
              >
                {earningsSnapshot.map((stat, index) => {
                  const IconComponent = earningsIconMap[stat.icon] || DollarSign;
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div 
                            className="glass rounded-2xl p-5 cursor-pointer"
                            variants={itemVariants}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/commissions")}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                <IconComponent className={`h-5 w-5 ${stat.color}`} />
                              </div>
                              <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-success' : 'text-pink'}`}>
                                <ArrowUpRight className="h-4 w-4" />
                                <span>{stat.change}</span>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border-white/10">
                          <p className="text-sm">{stat.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </motion.div>

              {/* Light Earnings Forecast */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="glass rounded-2xl p-5 border border-cyan/20 cursor-help"
                      variants={itemVariants}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan/20 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-cyan" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Projected Next Month</p>
                            <p className="text-2xl font-bold text-cyan">{forecast.nextMonth}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${forecast.trend === 'up' ? 'bg-cyan/20 text-cyan border-cyan/30' : 'bg-muted text-muted-foreground border-white/10'} mb-1`}>
                            {forecast.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {forecast.trend === 'up' ? 'Trending Up' : 'Stable'}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{forecast.confidence}</p>
                        </div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-background border-white/10">
                    <p className="text-sm">Forecast based on your historical earnings, engagement rates, and active campaign pipeline. Updates as you complete more campaigns.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Smart Recommendations */}
              {recommendations.length > 0 && (
                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple" />
                    <h2 className="text-lg font-semibold text-foreground">Smart Recommendations</h2>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => {
                      const IconComponent = iconMap[rec.icon] || Sparkles;
                      return (
                        <motion.div
                          key={rec.id}
                          className={`glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-all duration-200 ${
                            rec.priority === "high" ? "border border-purple/30" : ""
                          }`}
                          onClick={() => navigate(rec.action)}
                          whileHover={{ x: 4 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className={`w-10 h-10 rounded-xl ${rec.iconBg} flex items-center justify-center shrink-0`}>
                            <IconComponent className={`h-5 w-5 ${rec.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{rec.title}</p>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                          {rec.priority === "high" && (
                            <Badge className="bg-purple/20 text-purple border-purple/30 shrink-0">
                              Priority
                            </Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Completion Meters */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <motion.div 
                className="glass rounded-2xl p-6"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Profile Completion</h3>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion.overall}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground">{profileCompletion.overall}%</span>
                </div>
                
                <div className="space-y-3">
                  {profileCompletion.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-orange" />
                        )}
                        <span className={`text-sm ${item.done ? "text-muted-foreground" : "text-foreground"}`}>
                          {item.label}
                        </span>
                      </div>
                      {!item.done && item.action && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-primary text-xs h-6 px-2"
                          onClick={() => navigate(item.action)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Brand Fit Completion */}
              <motion.div 
                className="glass rounded-2xl p-6 border border-purple/20 relative overflow-hidden cursor-pointer"
                variants={itemVariants}
                onClick={() => navigate("/brand-fit")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-purple/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-purple" />
                    <h3 className="font-semibold text-foreground">Brand Fit</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
                        <circle 
                          cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" 
                          className="text-purple"
                          strokeDasharray={`${profileCompletion.brandFitCompletion * 1.75} 175`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                        {profileCompletion.brandFitCompletion}%
                      </span>
                    </div>
                    <div className="flex-1">
                      {profileCompletion.brandFitCompletion < 50 ? (
                        <>
                          <p className="text-sm font-medium text-foreground">Unlock better matches</p>
                          <p className="text-xs text-muted-foreground">Complete your Brand Fit survey</p>
                        </>
                      ) : profileCompletion.brandFitCompletion < 100 ? (
                        <>
                          <p className="text-sm font-medium text-foreground">Almost there!</p>
                          <p className="text-xs text-muted-foreground">Finish for best results</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-success">Fully optimized</p>
                          <p className="text-xs text-muted-foreground">You're getting top matches</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Powers AI matching & brand safety</span>
                  </div>
                </div>
              </motion.div>

              {/* Survey Completion Card */}
              <motion.div 
                className="glass rounded-2xl p-6 border border-cyan/20 relative overflow-hidden cursor-pointer"
                variants={itemVariants}
                onClick={() => navigate("/brand-profile")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-5 w-5 text-cyan" />
                    <h3 className="font-semibold text-foreground">Surveys</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" />
                        <circle 
                          cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" 
                          className="text-cyan"
                          strokeDasharray={`${(surveyScore.totalSurveysCompleted / surveyScore.totalSurveys) * 175} 175`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                        {surveyScore.totalSurveysCompleted}/{surveyScore.totalSurveys}
                      </span>
                    </div>
                    <div className="flex-1">
                      {surveyScore.totalSurveysCompleted === 0 ? (
                        <>
                          <p className="text-sm font-medium text-foreground">Boost your matches</p>
                          <p className="text-xs text-muted-foreground">Complete surveys for +15%</p>
                        </>
                      ) : surveyScore.totalSurveysCompleted < surveyScore.totalSurveys ? (
                        <>
                          <p className="text-sm font-medium text-foreground">Keep going!</p>
                          <p className="text-xs text-muted-foreground">+{surveyScore.surveyCompletionBonus}% match boost</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-success">All complete!</p>
                          <p className="text-xs text-muted-foreground">+{surveyScore.surveyCompletionBonus}% match boost</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>Enhances campaign matching accuracy</span>
                  </div>
                </div>
              </motion.div>

              {/* Next Payout */}
              <motion.div 
                className="glass rounded-2xl p-6"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-orange" />
                  <h3 className="font-semibold text-foreground">Next Payout</h3>
                </div>
                
                <div className="mb-4">
                  <p className="text-3xl font-bold text-cyan">${Math.round(campaignHistory.totalEarnings * 0.25).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">January 15, 2026</p>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 mb-4">
                  <Badge className="bg-orange/20 text-orange border-orange/30 text-xs">
                    {campaignHistory.totalStarted - campaignHistory.totalCompleted} pending
                  </Badge>
                  <span className="text-xs text-muted-foreground">campaigns in review</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-primary hover:bg-primary/10"
                  onClick={() => navigate("/commissions")}
                >
                  View All Earnings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="glass rounded-2xl p-6"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-cyan" />
                  <h3 className="font-semibold text-foreground">Account Health</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-background border-white/10">
                        <p className="text-sm">These metrics are calculated from your campaign history and directly impact your visibility to brands.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Response Rate</span>
                      <span className="font-medium text-success">{responseScore}%</span>
                    </div>
                    <Progress value={responseScore} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">On-time Delivery</span>
                      <span className="font-medium text-cyan">{onTimeRate}%</span>
                    </div>
                    <Progress value={onTimeRate} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Brand Rating</span>
                      <span className="font-medium text-purple">{brandRating.toFixed(1)}/5</span>
                    </div>
                    <Progress value={(brandRating / 5) * 100} className="h-1.5" />
                  </div>
                </div>
              </motion.div>
            </div>
            </div>
          </motion.div>
        </FullPageGate>
        </PageErrorBoundary>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Dashboard;
