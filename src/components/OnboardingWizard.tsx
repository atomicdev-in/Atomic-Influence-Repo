import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Youtube,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Link2,
  Target,
  Rocket,
} from "lucide-react";
import AuthImageCarousel from "@/components/AuthImageCarousel";
import Logo from "@/components/Logo";

interface OnboardingWizardProps {
  onComplete: () => void;
}

// Social platforms data
const recommendedSocials = [
  {
    name: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    name: "TikTok",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    icon: <Youtube className="h-5 w-5" />,
  },
];

const additionalSocials = [
  {
    name: "X",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Twitch",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
];

// Brand categories for quick selection
const topBrandCategories = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Tech & Gadgets",
  "Health & Wellness",
  "Food & Beverage",
  "Travel & Hospitality",
  "Fitness & Sports",
  "Home & Lifestyle",
];

const contentStyles = [
  "Educational",
  "Entertaining",
  "Storytelling",
  "Reviews",
  "Lifestyle",
  "Tutorials",
];

const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [addedHandles, setAddedHandles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const steps = [
    { id: "welcome", title: "Introduction", icon: Rocket },
    { id: "socials", title: "Link Accounts", icon: Link2 },
    { id: "brand-fit", title: "Brand Fit", icon: Target },
    { id: "complete", title: "Ready", icon: Sparkles },
  ];

  const toggleConnect = (name: string) => {
    setConnectedAccounts((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleHandle = (name: string) => {
    setAddedHandles((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save brand fit data to localStorage
    const existingData = localStorage.getItem("brandFitData");
    const brandFitData = existingData ? JSON.parse(existingData) : {};
    
    localStorage.setItem("brandFitData", JSON.stringify({
      ...brandFitData,
      brandCategories: selectedCategories,
      contentStyles: selectedStyles,
    }));
    
    // Mark onboarding as complete
    localStorage.setItem("onboardingComplete", "true");
    
    onComplete();
    navigate("/dashboard");
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingComplete", "true");
    onComplete();
    navigate("/dashboard");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return true; // Optional step
      case 2:
        return true; // Optional step
      case 3:
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Atomic Influence
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Configure your creator profile to be evaluated for brand partnerships and campaign assignments.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-xs text-muted-foreground">Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">500+</div>
                <div className="text-xs text-muted-foreground">Brands</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">$2M+</div>
                <div className="text-xs text-muted-foreground">Paid Out</div>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Link Your Accounts
              </h2>
              <p className="text-muted-foreground text-sm">
                Verify your reach by linking social accounts. This is required for campaign eligibility.
              </p>
            </div>

            {/* Recommended Socials */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">
                  Recommended
                </span>
                <Badge className="gradient-primary text-white border-0 text-xs">
                  Recommended
                </Badge>
              </div>
              <div className="space-y-2">
                {recommendedSocials.map((social) => (
                  <button
                    key={social.name}
                    onClick={() => toggleConnect(social.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      connectedAccounts.includes(social.name)
                        ? "border-primary/40 bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-foreground">{social.icon}</div>
                      <span className="font-medium text-foreground">
                        {social.name}
                      </span>
                    </div>
                    {connectedAccounts.includes(social.name) ? (
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Link
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Socials */}
            <div>
              <span className="text-sm font-medium text-foreground mb-3 block">
                Add Handle
              </span>
              <div className="flex flex-wrap gap-2">
                {additionalSocials.map((social) => (
                  <button
                    key={social.name}
                    onClick={() => toggleHandle(social.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                      addedHandles.includes(social.name)
                        ? "border-primary/40 bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-foreground">{social.icon}</div>
                    <span className="text-sm text-foreground">{social.name}</span>
                    {addedHandles.includes(social.name) && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Brand Fit Assessment
              </h2>
              <p className="text-muted-foreground text-sm">
                Define your preferences to be matched with appropriate campaigns
              </p>
            </div>

            {/* Brand Categories */}
            <div>
              <span className="text-sm font-medium text-foreground mb-3 block">
                Select preferred brand categories
              </span>
              <div className="flex flex-wrap gap-2">
                {topBrandCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? "gradient-primary text-white"
                        : "bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10"
                    }`}
                  >
                    {selectedCategories.includes(category) && (
                      <Check className="h-3 w-3 inline mr-1" />
                    )}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Styles */}
            <div>
              <span className="text-sm font-medium text-foreground mb-3 block">
                Define your content style
              </span>
              <div className="flex flex-wrap gap-2">
                {contentStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedStyles.includes(style)
                        ? "gradient-accent text-white"
                        : "bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10"
                    }`}
                  >
                    {selectedStyles.includes(style) && (
                      <Check className="h-3 w-3 inline mr-1" />
                    )}
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              These preferences can be modified in your Brand Fit profile at any time
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Profile Configured
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your creator profile is ready for review. You may now access campaign opportunities and brand invitations.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {connectedAccounts.length > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {connectedAccounts.length} account{connectedAccounts.length > 1 ? "s" : ""} linked
                </Badge>
              )}
              {selectedCategories.length > 0 && (
                <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                  {selectedCategories.length} categor{selectedCategories.length > 1 ? "ies" : "y"} selected
                </Badge>
              )}
              {selectedStyles.length > 0 && (
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  {selectedStyles.length} style{selectedStyles.length > 1 ? "s" : ""} chosen
                </Badge>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background */}
      <AuthImageCarousel mode="background" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          {/* Glass Card */}
          <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border-gradient">
            {/* Logo */}
            <div className="mb-6">
              <Logo />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index < currentStep
                        ? "gradient-primary text-white"
                        : index === currentStep
                        ? "bg-primary/20 border-2 border-primary text-primary"
                        : "bg-white/5 border border-white/20 text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                        index < currentStep ? "bg-primary" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[320px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {currentStep > 0 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gradient-primary hover:opacity-90 text-white border-0 glow-primary"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="gradient-accent hover:opacity-90 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
