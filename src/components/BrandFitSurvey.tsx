import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
  Palette
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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

export const BrandFitSurvey = () => {
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
    
    // Calculate completion and show success toast when profile is complete
    const completedFields = [
      data.brandCategories.length > 0,
      data.alcoholOpenness,
      data.personalAssets.length > 0,
      data.drivingComfort,
      data.contentStyles.length > 0,
      data.cameraComfort,
      data.avoidedTopics.trim(),
      data.audienceType,
      data.collaborationType,
      data.creativeControl,
    ].filter(Boolean).length;
    
    if (completedFields === 10) {
      toast({
        title: "Brand fit profile complete",
        description: "Your profile is now optimized for AI-powered campaign matching.",
        variant: "success",
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div 
        className="glass rounded-2xl p-6 border-gradient relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-purple/20 rounded-full blur-3xl" />
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan/15 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI-Powered Brand Matching</h2>
              <p className="text-sm text-muted-foreground">Help us find your perfect brand partnerships</p>
            </div>
          </div>
          
          <p className="text-foreground/80 text-sm mb-4">
            Complete your Brand Fit profile to unlock personalized campaign recommendations, 
            improve invite quality, and connect with brands that truly align with your values and style.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">{completionPercentage}%</span>
            </div>
            
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

        {/* Audience Type */}
        <motion.div 
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <SectionHeader 
            icon={Users}
            title="Primary Audience Type"
            description="Who primarily follows and engages with your content?"
          />
          <RadioGroup 
            value={formData.audienceType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, audienceType: value }))}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {audienceTypeOptions.map((audience) => (
              <Label
                key={audience}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.audienceType === audience
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <RadioGroupItem value={audience} className="border-white/20" />
                <span className="text-foreground/80">{audience}</span>
              </Label>
            ))}
          </RadioGroup>
        </motion.div>

        {/* Collaboration Type */}
        <motion.div 
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader 
            icon={Handshake}
            title="Preferred Collaboration Type"
            description="What type of brand partnerships do you prefer?"
          />
          <RadioGroup 
            value={formData.collaborationType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, collaborationType: value }))}
            className="grid gap-3"
          >
            {[
              { value: "one_off", label: "One-off campaigns", desc: "Single project collaborations" },
              { value: "short_term", label: "Short-term partnerships", desc: "2-3 month campaigns" },
              { value: "long_term", label: "Long-term ambassadorships", desc: "6+ month brand relationships" },
              { value: "any", label: "Open to all types", desc: "Flexible based on opportunity" },
            ].map((option) => (
              <Label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.collaborationType === option.value
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <RadioGroupItem value={option.value} className="border-white/20 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">{option.label}</span>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
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
            icon={Heart}
            title="Preferred Creative Control"
            description="How much creative freedom do you prefer in campaigns?"
          />
          <RadioGroup 
            value={formData.creativeControl}
            onValueChange={(value) => setFormData(prev => ({ ...prev, creativeControl: value }))}
            className="grid gap-3"
          >
            {[
              { value: "full", label: "Full creative control", desc: "I create content my way with minimal brand input" },
              { value: "collaborative", label: "Collaborative", desc: "I work with brands to find a balance" },
              { value: "brand_led", label: "Brand-led", desc: "I'm comfortable following detailed brand guidelines" },
            ].map((option) => (
              <Label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.creativeControl === option.value
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <RadioGroupItem value={option.value} className="border-white/20 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">{option.label}</span>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </motion.div>
      </div>

      {/* Completion CTA */}
      {completionPercentage < 100 && (
        <motion.div 
          className="glass rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-muted-foreground mb-2">
            Complete your Brand Fit profile to unlock better campaign matches
          </p>
          <p className="text-sm text-foreground/60">
            {100 - completionPercentage}% remaining • All fields are editable anytime
          </p>
        </motion.div>
      )}

      {completionPercentage === 100 && (
        <motion.div 
          className="glass rounded-2xl p-6 text-center border border-success/30 bg-success/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Check className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-semibold text-foreground">Brand Fit Assessment Complete</p>
          <p className="text-sm text-muted-foreground">
            Your profile is now eligible for campaign matching
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BrandFitSurvey;