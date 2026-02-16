import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import {
  useMatchingInsights,
  useMatchingExplanation,
  useSurveyMatchingStats,
} from "@/hooks/useAdminMatchingIntelligence";
import {
  Brain,
  Target,
  ClipboardList,
  Sparkles,
  Shield,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  PieChart,
} from "lucide-react";

const weightColors = {
  high: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function AdminMatching() {
  const { data: insights, isLoading: insightsLoading, refetch } = useMatchingInsights();
  const { data: explanation, isLoading: explanationLoading } = useMatchingExplanation();
  const { data: stats, isLoading: statsLoading } = useSurveyMatchingStats();

  const isLoading = insightsLoading || explanationLoading || statsLoading;

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <DashboardSkeleton />
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Matching" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader
              title="AI-Informed Matching Intelligence"
              subtitle="How surveys, preferences, and behavior shape creator-campaign matching"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Creators</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.totalCreators || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.creatorsWithBrandFit || 0} with Brand Fit
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-muted-foreground">Survey Coverage</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.surveyCompletionRate || 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.creatorsWithSurveys || 0} creators
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">Avg Match Score</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{insights?.matchingQuality.avgMatchScore || 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platform average
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Top Matches</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{insights?.matchingQuality.topMatchRate || 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score 70%+ rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Info Banner */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="py-3 flex items-center gap-3">
                <Brain className="h-5 w-5 text-purple-400" />
                <p className="text-sm text-purple-200">
                  This view shows how survey dimensions influence matching at a conceptual level. 
                  Proprietary scoring formulas are not exposed to maintain algorithm integrity.
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="dimensions" className="space-y-4">
              <TabsList className="bg-card/50 border border-white/10">
                <TabsTrigger value="dimensions">Survey Dimensions</TabsTrigger>
                <TabsTrigger value="algorithm">Algorithm Overview</TabsTrigger>
                <TabsTrigger value="categories">Category Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* Survey Dimensions Tab */}
              <TabsContent value="dimensions" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {insights?.surveyDimensions.map((dimension, idx) => (
                    <Card key={idx} className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{dimension.dimension}</CardTitle>
                          <Badge className={weightColors[dimension.weight]}>
                            {dimension.weight} weight
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {dimension.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">Matching Factors:</p>
                          <ul className="space-y-1">
                            {dimension.matchingFactors.map((factor, fidx) => (
                              <li key={fidx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 text-green-400 shrink-0" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Survey Completion Breakdown */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Survey Response Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.surveyBreakdown && stats.surveyBreakdown.length > 0 ? (
                      <div className="space-y-3">
                        {stats.surveyBreakdown.map((survey) => (
                          <div key={survey.surveyId} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{survey.title}</span>
                              <span className="text-muted-foreground">{survey.responses} responses</span>
                            </div>
                            <Progress 
                              value={stats.totalCreators > 0 ? (survey.responses / stats.totalCreators) * 100 : 0} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No survey responses recorded yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Algorithm Overview Tab */}
              <TabsContent value="algorithm" className="space-y-4">
                {explanation && (
                  <>
                    {/* Overview */}
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-400" />
                          Algorithm Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {explanation.overview}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Primary Signals */}
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          Primary Matching Signals
                        </CardTitle>
                        <CardDescription>
                          Conceptual weight distribution (actual formulas are proprietary)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {explanation.primarySignals.map((signal, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{signal.name}</span>
                              <Badge variant="outline">{signal.weight}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{signal.description}</p>
                            {idx < explanation.primarySignals.length - 1 && <Separator />}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Survey Integration */}
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-amber-400" />
                          Survey Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {explanation.surveyIntegration.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                          {explanation.surveyIntegration.examples.map((example, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Info className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Anti-Gaming Measures */}
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-400" />
                          Anti-Gaming Measures
                        </CardTitle>
                        <CardDescription>
                          How the system maintains integrity
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {explanation.antiGaming.map((measure, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                              <span>{measure}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Transparency Levels */}
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="h-5 w-5 text-cyan-400" />
                          Transparency by Role
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium mb-1">Creators</p>
                            <p className="text-xs text-muted-foreground">
                              {explanation.transparency.forCreators}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium mb-1">Brands</p>
                            <p className="text-xs text-muted-foreground">
                              {explanation.transparency.forBrands}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium mb-1">Admins</p>
                            <p className="text-xs text-muted-foreground">
                              {explanation.transparency.forAdmins}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Category Analysis Tab */}
              <TabsContent value="categories" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-400" />
                      Brand Category Distribution
                    </CardTitle>
                    <CardDescription>
                      Creator preferences from Brand Fit data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {stats.categoryBreakdown.map((cat, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{cat.category}</span>
                                <span className="text-muted-foreground">
                                  {cat.count} creators ({cat.percentage}%)
                                </span>
                              </div>
                              <Progress value={cat.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No category data available yet</p>
                        <p className="text-xs mt-1">Categories appear as creators complete Brand Fit</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Category Matching Insights */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Category Matching Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm font-medium text-green-400 mb-2">High Alignment</p>
                        <p className="text-xs text-muted-foreground">
                          When creator's selected categories match campaign categories, 
                          they receive up to 40 matching points (weighted by category count).
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm font-medium text-amber-400 mb-2">Partial Alignment</p>
                        <p className="text-xs text-muted-foreground">
                          Related categories (e.g., "Fitness" ↔ "Health & Wellness") 
                          still contribute to matching with reduced weight.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                      AI-Generated Recommendations
                    </CardTitle>
                    <CardDescription>
                      Suggestions for improving match quality based on current data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {insights?.recommendations && insights.recommendations.length > 0 ? (
                      <ul className="space-y-3">
                        {insights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-amber-400">{idx + 1}</span>
                            </div>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Recommendations will appear after more data is collected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Survey Influence Summary */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Survey Impact Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Survey Completion Bonus</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        +{insights?.matchingQuality.surveyCompletionImpact || 15}% match quality
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creators who complete surveys receive enhanced matching precision. 
                      Each completed survey adds incremental value to their matching profile, 
                      with diminishing returns after the first 3 surveys to prevent gaming.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
