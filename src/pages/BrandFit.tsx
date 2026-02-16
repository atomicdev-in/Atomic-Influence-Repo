import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useBrandFitData } from "@/hooks/useCreatorData";
import { 
  Sparkles, 
  Check, 
  Car, 
  Home, 
  Dumbbell, 
  Briefcase, 
  Plane, 
  Camera,
  Loader2,
  Info,
  Shield,
  Target,
  Heart,
  Users,
  Handshake,
  Palette,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface BrandFitData {
  brandCategories: string[];
  alcoholOpenness: string;
  personalAssets: string[];
  drivingComfort: string;
  contentStyles: string[];
  cameraComfort: string;
  avoidedTopics: string;
  audienceType: string;
  collaborationType: string;
  creativeControl: string;
}

const defaultBrandFitData: BrandFitData = {
  brandCategories: [],
  alcoholOpenness: "",
  personalAssets: [],
  drivingComfort: "",
  contentStyles: [],
  cameraComfort: "",
  avoidedTopics: "",
  audienceType: "",
  collaborationType: "",
  creativeControl: "",
};

const brandCategoryOptions = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Tech & Gadgets",
  "Health & Wellness",
  "Food & Beverage",
  "Travel & Hospitality",
  "Fitness & Sports",
  "Home & Lifestyle",
  "Finance & Banking",
  "Automotive",
  "Gaming & Entertainment",
  "Education & Learning",
  "Sustainable & Eco-friendly",
  "Luxury & Premium",
  "Family & Parenting",
];

const personalAssetOptions = [
  { id: "car", label: "Car / Vehicle", icon: Car },
  { id: "gym", label: "Gym / Fitness Setup", icon: Dumbbell },
  { id: "home", label: "Aesthetic Home Setup", icon: Home },
  { id: "studio", label: "Home Studio", icon: Camera },
  { id: "travel", label: "Regular Travel Access", icon: Plane },
  { id: "office", label: "Professional Office", icon: Briefcase },
];

const contentStyleOptions = [
  "Educational",
  "Entertaining",
  "Storytelling",
  "Reviews",
  "Lifestyle",
  "Comedy",
  "Tutorials",
  "Trends",
  "Behind-the-scenes",
  "Day-in-the-life",
];

const audienceTypeOptions = [
  "Gen Z (18-24)",
  "Young Adults (25-34)",
  "Millennials (30-40)",
  "Parents & Families",
  "Professionals",
  "Students",
  "General Audience",
];

const BrandFit = () => {
  const { isLoading: isLoadingData } = useBrandFitData();
  const [formData, setFormData] = useState<BrandFitData>(() => {
    const saved = localStorage.getItem("brandFitData");
    return saved ? JSON.parse(saved) : defaultBrandFitData;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save with debounce
  const saveData = useCallback(async (data: BrandFitData) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem("brandFitData", JSON.stringify(data));
    setLastSaved(new Date());
    setIsSaving(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveData(formData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, saveData]);

  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const completionPercentage = (() => {
    let completed = 0;
    const total = 10;
    if (formData.brandCategories.length > 0) completed++;
    if (formData.alcoholOpenness) completed++;
    if (formData.personalAssets.length > 0) completed++;
    if (formData.drivingComfort) completed++;
    if (formData.contentStyles.length > 0) completed++;
    if (formData.cameraComfort) completed++;
    if (formData.avoidedTopics.trim()) completed++;
    if (formData.audienceType) completed++;
    if (formData.collaborationType) completed++;
    if (formData.creativeControl) completed++;
    return Math.round((completed / total) * 100);
  })();

  const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  // Show loading state
  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading your Brand Fit..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div 
          className="p-6 lg:p-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page Header */}
          <PageHeader
            title="Brand Fit"
            subtitle="Tell us what brands and campaigns are right for you"
            icon={Sparkles}
          >
            <div className="flex items-center gap-2">
              {completionPercentage === 100 && (
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
              {isSaving ? (
                <Badge className="bg-white/10 text-muted-foreground border-white/10">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              ) : lastSaved ? (
                <Badge className="bg-success/20 text-success border-success/30">
                  <Check className="h-3 w-3 mr-1" />
                  Auto-saved
                </Badge>
              ) : null}
            </div>
          </PageHeader>

          {/* Progress Banner - matching Surveys style */}
          <motion.div
            className="glass rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Why Brand Fit Matters</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Your Brand Fit profile powers our AI matching engine. The more complete your profile, 
                the better we can connect you with campaigns that truly align with your values, audience, and content style.
              </p>

              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Target className="h-5 w-5 text-cyan shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Better Matches</p>
                    <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Heart className="h-5 w-5 text-pink shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Quality Invites</p>
                    <p className="text-xs text-muted-foreground">Fewer irrelevant invites</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="h-5 w-5 text-purple shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Brand Safety</p>
                    <p className="text-xs text-muted-foreground">Only aligned brands</p>
                  </div>
                </div>
              </div>

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
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Brand Fit profile complete!</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Survey Sections */}
          <div className="grid gap-6">
            {/* Brand Categories */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SectionHeader 
                  icon={Target}
                  title="Brand Categories"
                  description="Select all categories you're open to working with"
                />
                <div className="flex flex-wrap gap-2">
                  {brandCategoryOptions.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        brandCategories: toggleArrayItem(prev.brandCategories, category)
                      }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.brandCategories.includes(category)
                          ? "gradient-primary text-white"
                          : "bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10 hover:text-foreground"
                      }`}
                    >
                      {formData.brandCategories.includes(category) && (
                        <Check className="h-3 w-3 inline mr-1" />
                      )}
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Alcohol/Regulated Brands */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <SectionHeader 
                  icon={Shield}
                  title="Regulated Brands"
                  description="Are you open to working with alcohol or other regulated brands?"
                />
                <RadioGroup 
                  value={formData.alcoholOpenness}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, alcoholOpenness: value }))}
                  className="grid gap-3"
                >
                  {[
                    { value: "yes", label: "Yes, I'm open to regulated brand partnerships" },
                    { value: "yes_guidelines", label: "Yes, but only with clear content guidelines" },
                    { value: "no", label: "No, I prefer to avoid regulated brands" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.alcoholOpenness === option.value
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="border-white/20" />
                      <span className="text-foreground/80">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Personal Assets */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader 
                  icon={Home}
                  title="Personal Assets & Lifestyle Access"
                  description="Select assets you can feature in content creation"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {personalAssetOptions.map((asset) => {
                    const isSelected = formData.personalAssets.includes(asset.id);
                    return (
                      <button
                        key={asset.id}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          personalAssets: toggleArrayItem(prev.personalAssets, asset.id)
                        }))}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-primary/30" : "bg-white/5"
                        }`}>
                          <asset.icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className={isSelected ? "text-foreground font-medium" : "text-foreground/70"}>
                          {asset.label}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Driving Comfort */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <SectionHeader 
                  icon={Car}
                  title="Driving & Vehicle Content"
                  description="How comfortable are you creating content involving driving or vehicles?"
                />
                <RadioGroup 
                  value={formData.drivingComfort}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, drivingComfort: value }))}
                  className="grid gap-3"
                >
                  {[
                    { value: "very_comfortable", label: "Very comfortable - I can film driving content safely" },
                    { value: "somewhat_comfortable", label: "Somewhat comfortable - With proper setup and safety measures" },
                    { value: "passenger_only", label: "Passenger only - I prefer not to be the driver on camera" },
                    { value: "not_comfortable", label: "Not comfortable - I prefer to avoid vehicle-related content" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.drivingComfort === option.value
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="border-white/20" />
                      <span className="text-foreground/80">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Content Styles */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SectionHeader 
                  icon={Palette}
                  title="Preferred Content Styles"
                  description="Select the content styles that best represent your work"
                />
                <div className="flex flex-wrap gap-2">
                  {contentStyleOptions.map((style) => (
                    <button
                      key={style}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        contentStyles: toggleArrayItem(prev.contentStyles, style)
                      }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.contentStyles.includes(style)
                          ? "gradient-accent text-white"
                          : "bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10 hover:text-foreground"
                      }`}
                    >
                      {formData.contentStyles.includes(style) && (
                        <Check className="h-3 w-3 inline mr-1" />
                      )}
                      {style}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Camera Comfort */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <SectionHeader 
                  icon={Camera}
                  title="On-Camera Comfort"
                  description="What's your preferred on-camera presence?"
                />
                <RadioGroup 
                  value={formData.cameraComfort}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cameraComfort: value }))}
                  className="grid sm:grid-cols-3 gap-3"
                >
                  {[
                    { value: "on_camera", label: "On-Camera", desc: "Face on camera" },
                    { value: "voiceover", label: "Voiceover", desc: "Voice only" },
                    { value: "off_camera", label: "Off-Camera", desc: "No personal presence" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer text-center transition-all duration-200 ${
                        formData.cameraComfort === option.value
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="border-white/20" />
                      <span className="font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Avoided Topics */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SectionHeader 
                  icon={Shield}
                  title="Topics & Values to Avoid"
                  description="List any brand values or topics you prefer not to associate with"
                />
                <Textarea
                  value={formData.avoidedTopics}
                  onChange={(e) => setFormData(prev => ({ ...prev, avoidedTopics: e.target.value }))}
                  placeholder="E.g., fast fashion, gambling, political messaging, certain dietary claims..."
                  className="bg-white/5 border-white/10 rounded-xl min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  This helps us filter out campaigns that don't align with your values
                </p>
              </motion.div>

              {/* Target Audience */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <SectionHeader 
                  icon={Users}
                  title="Primary Audience"
                  description="Who is your main target audience?"
                />
                <RadioGroup 
                  value={formData.audienceType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, audienceType: value }))}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {audienceTypeOptions.map((option) => (
                    <Label
                      key={option}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.audienceType === option
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option} className="border-white/20" />
                      <span className="text-foreground/80">{option}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Collaboration Preference */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SectionHeader 
                  icon={Handshake}
                  title="Collaboration Preference"
                  description="What type of brand relationships do you prefer?"
                />
                <RadioGroup 
                  value={formData.collaborationType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, collaborationType: value }))}
                  className="grid gap-3"
                >
                  {[
                    { value: "one_off", label: "One-off campaigns - I prefer variety and new brand experiences" },
                    { value: "ambassador", label: "Long-term ambassadorships - I prefer building lasting brand relationships" },
                    { value: "both", label: "Both - I'm open to any type of collaboration" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.collaborationType === option.value
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="border-white/20" />
                      <span className="text-foreground/80">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Creative Control */}
              <motion.div 
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <SectionHeader 
                  icon={Palette}
                  title="Creative Control"
                  description="How much creative freedom do you prefer in brand collaborations?"
                />
                <RadioGroup 
                  value={formData.creativeControl}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, creativeControl: value }))}
                  className="grid gap-3"
                >
                  {[
                    { value: "full_freedom", label: "Full creative freedom - I work best with minimal brand direction" },
                    { value: "guided", label: "Guided creativity - I like some direction with room for my style" },
                    { value: "scripted", label: "Scripted content - I'm comfortable with detailed brand briefs" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.creativeControl === option.value
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="border-white/20" />
                      <span className="text-foreground/80">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Completion Message */}
              {completionPercentage === 100 && (
                <motion.div 
                  className="glass rounded-2xl p-6 border border-success/30 bg-success/10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Brand Fit Profile Complete</h3>
                      <p className="text-sm text-muted-foreground">
                        Your profile is now powering AI-matched campaign recommendations. 
                        You can update your preferences anytime.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
          </div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default BrandFit;
