import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingWizard from "@/components/OnboardingWizard";

const Onboarding = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(true);

  useEffect(() => {
    // Check if onboarding was already completed
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    if (onboardingComplete === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleComplete = () => {
    setShowWizard(false);
  };

  if (!showWizard) {
    return null;
  }

  return <OnboardingWizard onComplete={handleComplete} />;
};

export default Onboarding;
