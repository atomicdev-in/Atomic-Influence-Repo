import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { SurveyWithQuestions, useSubmitSurvey } from "@/hooks/useSurveys";

interface SurveyDetailViewProps {
  survey: SurveyWithQuestions;
  onBack: () => void;
  onComplete: () => void;
}

// Cover images for surveys
const surveyCoverImages: Record<string, string> = {
  lifestyle: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=300&fit=crop&q=80",
  values: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=300&fit=crop&q=80",
  preferences: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=300&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=300&fit=crop&q=80",
};

export const SurveyDetailView = ({
  survey,
  onBack,
  onComplete,
}: SurveyDetailViewProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { submitSurvey, isSubmitting } = useSubmitSurvey();

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const hasAnswer = currentQuestion && answers[currentQuestion.id];
  const coverImage = surveyCoverImages[survey.category] || surveyCoverImages.default;

  const handleAnswerSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Submit survey
      const success = await submitSurvey(survey.id, answers);
      if (success) {
        toast({
          title: "Survey completed",
          description: "Your responses have been recorded and will improve campaign matching.",
          variant: "success",
        });
        onComplete();
      } else {
        toast({
          title: "Submission failed",
          description: "Unable to save survey responses. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  if (!currentQuestion) return null;

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Header with Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img 
          src={coverImage} 
          alt={survey.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={handlePrevious}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-md text-foreground hover:bg-background/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentQuestionIndex === 0 ? "Exit" : "Previous"}
          </span>
        </button>

        {/* Progress Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-md">
          <span className="text-sm text-foreground font-medium">
            {currentQuestionIndex + 1} / {survey.questions.length}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Survey Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary font-medium uppercase tracking-wider">Survey</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{survey.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8 leading-relaxed">
              {currentQuestion.question_text}
            </h2>

            {/* Options */}
            {currentQuestion.question_type === "single_choice" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Label
                      htmlFor={`option-${index}`}
                      className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                        answers[currentQuestion.id] === option
                          ? "glass border-primary/40 bg-primary/10 shadow-lg shadow-primary/10"
                          : "glass hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${index}`}
                        className="mt-0.5 border-white/30 text-primary"
                      />
                      <span className="text-foreground/90 leading-relaxed">{option}</span>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          className="mt-10 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleNext}
            disabled={!hasAnswer || isSubmitting}
            size="lg"
            className="gradient-primary text-white px-8 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isLastQuestion ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Survey
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
