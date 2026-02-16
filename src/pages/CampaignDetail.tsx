import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Instagram, 
  Youtube, 
  Sparkles,
  Globe,
  Calendar,
  Users,
  DollarSign,
  Clock,
  FileText
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Campaign data - in a real app this would come from an API
const campaignsData = [
  {
    id: "eco-fashion-collection",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    commission: 15,
    categories: ["Sustainability", "Fashion", "Jewelry"],
    campaignName: "Eco Fashion Collection",
    isNew: true,
    requirementMet: true,
    language: "English",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    socials: ["instagram", "tiktok"],
    description: "Join our sustainable fashion movement! We're looking for creators who are passionate about eco-friendly fashion and can showcase our new collection of sustainable jewelry and accessories.",
    requirements: [
      "Minimum 10K followers on Instagram or TikTok",
      "Engagement rate of at least 3%",
      "Content focused on fashion or lifestyle",
      "Based in the UK or Europe"
    ],
    deliverables: [
      "2 Instagram feed posts",
      "3 Instagram Stories",
      "1 TikTok video (30-60 seconds)"
    ],
    deadline: "March 15, 2024",
    budget: "$500 - $1,500",
    duration: "2 weeks"
  },
  {
    id: "luxury-perfume-launch",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
    commission: 12,
    categories: ["Fragrances", "Fashion", "Lifestyle"],
    campaignName: "Luxury Perfume Launch",
    isNew: true,
    requirementMet: true,
    language: "English",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    socials: ["instagram", "tiktok", "youtube"],
    description: "Be part of our exclusive luxury perfume launch campaign. We're seeking elegant content creators who can capture the essence of sophistication and luxury in their content.",
    requirements: [
      "Minimum 15K followers on any platform",
      "Experience with luxury brand collaborations",
      "High-quality visual content",
      "Professional aesthetic"
    ],
    deliverables: [
      "1 YouTube video review",
      "2 Instagram Reels",
      "5 Instagram Stories"
    ],
    deadline: "April 1, 2024",
    budget: "$800 - $2,000",
    duration: "3 weeks"
  },
  {
    id: "saas-growth-strategy",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    commission: 20,
    categories: ["Business", "Digital Marketing", "Entrepreneur"],
    campaignName: "SaaS Growth Strategy",
    isNew: true,
    requirementMet: false,
    language: "English, German, French",
    country: "Germany",
    countryFlag: "🇩🇪",
    socials: ["instagram", "tiktok", "youtube"],
    description: "Partner with us to promote our cutting-edge SaaS platform. We need business-focused creators who can explain complex tools in an engaging way.",
    requirements: [
      "Minimum 25K followers",
      "Business or tech niche focus",
      "Multi-language content capability",
      "Previous B2B collaboration experience"
    ],
    deliverables: [
      "1 in-depth YouTube tutorial",
      "3 LinkedIn posts",
      "2 TikTok explainer videos"
    ],
    deadline: "March 30, 2024",
    budget: "$1,500 - $4,000",
    duration: "4 weeks"
  },
  {
    id: "premium-headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    commission: 18,
    categories: ["Tech", "Audio", "Lifestyle"],
    campaignName: "Premium Headphones",
    isNew: false,
    requirementMet: true,
    language: "English",
    country: "United States",
    countryFlag: "🇺🇸",
    socials: ["youtube", "tiktok"],
    description: "Review our latest premium headphones and share your authentic experience with your audience. Perfect for tech reviewers and audio enthusiasts.",
    requirements: [
      "Minimum 20K subscribers on YouTube",
      "Tech or audio-focused content",
      "Professional video production quality",
      "Based in North America"
    ],
    deliverables: [
      "1 detailed YouTube review (8-12 minutes)",
      "2 TikTok unboxing videos",
      "Community post engagement"
    ],
    deadline: "February 28, 2024",
    budget: "$1,000 - $2,500",
    duration: "2 weeks"
  },
  {
    id: "camera-accessories",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop",
    commission: 10,
    categories: ["Photography", "Tech", "Creative"],
    campaignName: "Camera Accessories",
    isNew: false,
    requirementMet: true,
    language: "English, Spanish",
    country: "Spain",
    countryFlag: "🇪🇸",
    socials: ["instagram", "youtube"],
    description: "Showcase our camera accessories in your photography workflow. We're looking for photographers and videographers who can demonstrate the practical benefits of our products.",
    requirements: [
      "Professional photographer or videographer",
      "Active on Instagram or YouTube",
      "Portfolio of high-quality visual work",
      "Bilingual (English/Spanish) preferred"
    ],
    deliverables: [
      "1 YouTube behind-the-scenes video",
      "3 Instagram posts featuring products",
      "Photography tips content"
    ],
    deadline: "March 20, 2024",
    budget: "$600 - $1,200",
    duration: "3 weeks"
  },
  {
    id: "athletic-footwear",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop",
    commission: 22,
    categories: ["Sports", "Fashion", "Fitness"],
    campaignName: "Athletic Footwear",
    isNew: true,
    requirementMet: false,
    language: "English",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    socials: ["instagram", "tiktok", "youtube"],
    description: "Be the face of our new athletic footwear line! We need fitness enthusiasts and athletes who can showcase our shoes in action.",
    requirements: [
      "Minimum 30K followers",
      "Fitness or sports-focused content",
      "Active lifestyle documentation",
      "Previous athletic brand collaborations"
    ],
    deliverables: [
      "2 YouTube workout videos featuring shoes",
      "4 Instagram Reels",
      "1 TikTok challenge participation"
    ],
    deadline: "April 15, 2024",
    budget: "$2,000 - $5,000",
    duration: "4 weeks"
  },
];

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const campaign = campaignsData.find(c => c.id === id);
  
  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-foreground mb-4">Campaign Not Found</h1>
          <Button onClick={() => navigate("/apply")} className="gradient-primary">
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getSocialIcon = (social: string) => {
    switch (social.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      case "tiktok":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleApply = () => {
    toast({
      title: "Application submitted",
      description: `Your request to join "${campaign.campaignName}" is under review.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/apply")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        {/* Profile Completion Reminder */}
        <ProfileCompletionBanner variant="card" className="mb-6" />

        {/* Hero Section */}
        <div className="glass rounded-2xl overflow-hidden mb-6 animate-fade-in">
          <div className="relative h-64 md:h-80">
            <img
              src={campaign.imageUrl}
              alt={campaign.campaignName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Overlay Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {campaign.categories.map((category) => (
                  <Badge
                    key={category}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{campaign.campaignName}</h1>
                {campaign.isNew && (
                  <Badge className="bg-purple/80 text-white border-purple/50">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
              
              <Badge className="gradient-primary text-white border-0">
                <CheckCircle className="h-3 w-3 mr-1" /> {campaign.commission}% Commission
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                About This Campaign
              </h2>
              <p className="text-foreground/80 leading-relaxed">{campaign.description}</p>
            </div>

            {/* Requirements */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-pink" />
                Requirements
              </h2>
              <ul className="space-y-3">
                {campaign.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple" />
                Deliverables
              </h2>
              <ul className="space-y-3">
                {campaign.deliverables.map((del, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground/80">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-xs shrink-0">
                      {index + 1}
                    </div>
                    {del}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirement Status */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              {campaign.requirementMet ? (
                <div className="flex items-center gap-3 text-success">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Requirements Met</p>
                    <p className="text-sm text-success/80">You're eligible to apply</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-orange">
                  <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Requirements Not Met</p>
                    <p className="text-sm text-orange/80">Review requirements above</p>
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Details */}
            <div className="glass rounded-2xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-cyan" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold text-foreground">{campaign.budget}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-pink" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold text-foreground">{campaign.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold text-foreground">{campaign.deadline}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-orange" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-semibold text-foreground">{campaign.countryFlag} {campaign.country}</p>
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-3">Required Platforms</p>
              <div className="flex gap-3">
                {campaign.socials.map((social) => (
                  <div
                    key={social}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                  >
                    {getSocialIcon(social)}
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <Button 
              onClick={handleApply}
              className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              disabled={!campaign.requirementMet}
            >
              {campaign.requirementMet ? "Submit for Review" : "Requirements Not Met"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetail;
