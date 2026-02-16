import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Sparkles, CheckCircle, Target } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { SurveyCard } from "@/components/SurveyCard";
import { SurveyDetailView } from "@/components/SurveyDetailView";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useSurveys, useSurveyDetail } from "@/hooks/useSurveys";
import { useNavigate } from "react-router-dom";

const Surveys = () => {
  const navigate = useNavigate();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const { 
    surveys, 
    isLoading, 
    isSurveyCompleted, 
    getIncompleteSurveys, 
    getCompletedSurveysList,
    refetch 
  } = useSurveys();
  const { survey: surveyDetail, isLoading: isLoadingDetail } = useSurveyDetail(selectedSurveyId);

  const incompleteSurveys = getIncompleteSurveys();
  const completedSurveys = getCompletedSurveysList();
  const completionPercentage = surveys.length > 0 
    ? Math.round((completedSurveys.length / surveys.length) * 100) 
    : 0;

  const handleSurveyClick = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
  };

  const handleSurveyComplete = () => {
    setSelectedSurveyId(null);
    // Refetch to update the completed surveys list
    refetch();
  };

  const handleBack = () => {
    setSelectedSurveyId(null);
  };

  // Show survey detail view
  if (selectedSurveyId) {
    if (isLoadingDetail || !surveyDetail) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <GlassLoading size="lg" variant="primary" text="Loading survey..." />
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <SurveyDetailView
          key={selectedSurveyId}
          survey={surveyDetail}
          onBack={handleBack}
          onComplete={handleSurveyComplete}
        />
      </AnimatePresence>
    );
  }

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
            title="Surveys"
            subtitle="Complete surveys to enhance your brand matching"
            icon={ClipboardList}
          >
            <div className="flex items-center gap-2">
              {completedSurveys.length > 0 && (
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {completedSurveys.length} completed
                </Badge>
              )}
              {incompleteSurveys.length > 0 && (
                <Badge className="gradient-primary text-white border-0">
                  {incompleteSurveys.length} available
                </Badge>
              )}
            </div>
          </PageHeader>

          {/* Progress Banner */}
          <motion.div
            className="glass rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Boost Your Brand Fit</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Completing surveys helps us understand your preferences better, leading to 
                higher-quality campaign matches and more relevant brand invitations.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full gradient-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {completionPercentage}%
                </span>
              </div>

              {completionPercentage === 100 && (
                <div className="mt-4 flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">All surveys completed!</span>
                </div>
              )}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <GlassLoading size="lg" variant="primary" text="Loading surveys..." />
            </div>
          ) : (
            <>
              {/* Incomplete Surveys */}
              {incompleteSurveys.length > 0 && (
                <motion.div className="mb-8" variants={fadeInUp}>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Available Surveys</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incompleteSurveys.map((survey) => (
                      <SurveyCard
                        key={survey.id}
                        id={survey.id}
                        title={survey.title}
                        description={survey.description}
                        category={survey.category}
                        isCompleted={false}
                        onClick={() => handleSurveyClick(survey.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Completed Surveys */}
              {completedSurveys.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <h2 className="text-lg font-semibold text-foreground">Completed</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedSurveys.map((survey) => (
                      <SurveyCard
                        key={survey.id}
                        id={survey.id}
                        title={survey.title}
                        description={survey.description}
                        category={survey.category}
                        isCompleted={true}
                        onClick={() => handleSurveyClick(survey.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {surveys.length === 0 && (
                <motion.div
                  className="glass rounded-2xl p-12 text-center"
                  variants={fadeInUp}
                >
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Surveys Available
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new surveys to complete.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Surveys;
