import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  order_index: number;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
}

export interface CompletedSurvey {
  survey_id: string;
  completed_at: string;
}

export const useSurveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [completedSurveys, setCompletedSurveys] = useState<CompletedSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSurveys();
      fetchCompletedSurveys();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedSurveys = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("survey_id, completed_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setCompletedSurveys(data || []);
    } catch (error) {
      console.error("Error fetching completed surveys:", error);
    }
  };

  const isSurveyCompleted = (surveyId: string) => {
    return completedSurveys.some(s => s.survey_id === surveyId);
  };

  const getIncompleteSurveys = () => {
    return surveys.filter(s => !isSurveyCompleted(s.id));
  };

  const getCompletedSurveysList = () => {
    return surveys.filter(s => isSurveyCompleted(s.id));
  };

  return {
    surveys,
    completedSurveys,
    isLoading,
    isSurveyCompleted,
    getIncompleteSurveys,
    getCompletedSurveysList,
    refetch: () => {
      fetchSurveys();
      fetchCompletedSurveys();
    },
  };
};

export const useSurveyDetail = (surveyId: string | null) => {
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurveyDetail();
    } else {
      setSurvey(null);
    }
  }, [surveyId]);

  const fetchSurveyDetail = async () => {
    if (!surveyId) return;
    
    setIsLoading(true);

    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (surveyError) throw surveyError;

      const { data: questionsData, error: questionsError } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyId)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;

      const questions = (questionsData || []).map(q => ({
        ...q,
        options: q.options ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string)) : null,
      }));

      setSurvey({
        ...surveyData,
        questions,
      });
    } catch (error) {
      console.error("Error fetching survey detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { survey, isLoading };
};

export const useSubmitSurvey = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSurvey = async (
    surveyId: string,
    answers: Record<string, string | string[]>
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const { data: responseData, error: responseError } = await supabase
        .from("survey_responses")
        .insert({
          user_id: user.id,
          survey_id: surveyId,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      const questionResponses = Object.entries(answers).map(([questionId, answer]) => ({
        survey_response_id: responseData.id,
        question_id: questionId,
        answer: JSON.stringify(answer),
      }));

      const { error: answersError } = await supabase
        .from("question_responses")
        .insert(questionResponses);

      if (answersError) throw answersError;

      return true;
    } catch (error) {
      console.error("Error submitting survey:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitSurvey, isSubmitting };
};
