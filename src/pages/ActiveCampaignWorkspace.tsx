import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { useContentDetection, buildDetectionRules, DetectedContent } from "@/hooks/useContentDetection";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Play,
  Upload,
  AlertCircle,
  AlertTriangle,
  Instagram,
  Youtube,
  MessageSquare,
  Send,
  Download,
  Link2,
  Image,
  Video,
  ExternalLink,
  Eye,
  Lock,
  Sparkles,
  TrendingUp,
  Users,
  Hash,
  AtSign,
  QrCode,
  FileCheck,
  Info,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type CampaignStatus =
  | "brief_received"
  | "in_progress"
  | "submitted"
  | "revision_requested"
  | "approved"
  | "payment_processing"
  | "completed";

type DeliverableStatus = "detected" | "missing" | "approved" | "pending";

interface Deliverable {
  id: string;
  type: "instagram_post" | "instagram_reel" | "instagram_story" | "tiktok_video" | "youtube_video";
  title: string;
  status: DeliverableStatus;
  detectedUrl?: string;
  detectedAt?: string;
  approvedAt?: string;
  submittedUrl?: string;
  submittedAt?: string;
  feedback?: string;
  paymentAmount?: number;
  paymentStatus?: "pending" | "processing" | "paid";
}

interface Message {
  id: string;
  sender: "brand" | "creator" | "admin";
  senderName: string;
  content: string;
  timestamp: string;
  type: "message" | "note" | "update";
}

interface CampaignBrief {
  description: string;
  keyMessages: string[];
  hashtags: string[];
  mentions: string[];
  requiredLinks: string[];
  dos: string[];
  donts: string[];
  usageRights: string;
  postingWindow: { start: string; end: string };
  assets: { name: string; type: string; url: string }[];
}

interface ActiveCampaignData {
  id: string;
  campaignName: string;
  brandName: string;
  brandLogo: string;
  imageUrl: string;
  status: CampaignStatus;
  commission: number;
  paymentStatus: "pending" | "processing" | "paid";
  deadline: string;
  startDate: string;
  categories: string[];
  socials: string[];
  deliverables: Deliverable[];
  messages: Message[];
  brief: CampaignBrief;
  performance?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

// Status configuration
const statusConfig: Record<CampaignStatus, { label: string; color: string; icon: React.ElementType }> = {
  brief_received: { label: "Brief Received", color: "bg-cyan/20 text-cyan border-cyan/30", icon: FileText },
  in_progress: { label: "In Progress", color: "bg-purple/20 text-purple border-purple/30", icon: Play },
  submitted: { label: "Submitted", color: "bg-orange/20 text-orange border-orange/30", icon: Upload },
  revision_requested: { label: "Revision Requested", color: "bg-pink/20 text-pink border-pink/30", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-success/20 text-success border-success/30", icon: CheckCircle2 },
  payment_processing: { label: "Payment Processing", color: "bg-orange/20 text-orange border-orange/30", icon: DollarSign },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

// Mock data for campaigns
const mockCampaignData: Record<string, ActiveCampaignData> = {
  "summer-skincare": {
    id: "summer-skincare",
    campaignName: "Summer Skincare Collection",
    brandName: "GlowSkin Co.",
    brandLogo: "🌸",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop",
    status: "revision_requested",
    commission: 450,
    paymentStatus: "pending",
    deadline: "2026-01-25",
    startDate: "2026-01-10",
    categories: ["Beauty", "Skincare", "Lifestyle"],
    socials: ["instagram", "tiktok"],
    deliverables: [
      { id: "d1", type: "instagram_post", title: "Instagram Feed Post", status: "approved", approvedAt: "2026-01-18", paymentAmount: 200, paymentStatus: "processing" },
      { id: "d2", type: "instagram_reel", title: "Instagram Reel", status: "missing", feedback: "Please add the required hashtag #GlowSkinSummer" },
    ],
    messages: [
      { id: "m1", sender: "brand", senderName: "GlowSkin Team", content: "Welcome to the campaign! Please review the brief and let us know if you have any questions.", timestamp: "2026-01-10T10:00:00Z", type: "message" },
      { id: "m2", sender: "creator", senderName: "You", content: "Thanks! I'm excited to work on this. I'll review the brief today.", timestamp: "2026-01-10T11:30:00Z", type: "message" },
      { id: "m3", sender: "admin", senderName: "Campaign Manager", content: "Revision requested for the Reel - please include the required hashtag.", timestamp: "2026-01-20T14:00:00Z", type: "update" },
    ],
    brief: {
      description: "Create authentic content showcasing our new Summer Skincare Collection. Focus on the refreshing, lightweight formula perfect for hot weather. Share your genuine experience using the products in your daily routine.",
      keyMessages: ["Lightweight formula", "Perfect for summer", "Natural ingredients", "SPF protection"],
      hashtags: ["#GlowSkinSummer", "#SummerSkincare", "#GlowWithUs", "#ad"],
      mentions: ["@glowskinco"],
      requiredLinks: ["glowskin.co/summer"],
      dos: ["Show product in natural lighting", "Mention key benefits", "Include discount code GLOW20", "Post during peak hours (6-9pm)"],
      donts: ["Don't compare to competitors", "Don't make medical claims", "Don't use filters that alter product color"],
      usageRights: "Brand may repost and use content for 12 months across social media and website with credit.",
      postingWindow: { start: "2026-01-15", end: "2026-01-25" },
      assets: [
        { name: "Brand Logo Pack", type: "zip", url: "#" },
        { name: "Product Photos", type: "folder", url: "#" },
        { name: "Brand Guidelines", type: "pdf", url: "#" },
        { name: "Campaign Video B-Roll", type: "video", url: "#" },
      ],
    },
    performance: { views: 12500, likes: 890, comments: 45, shares: 23, engagementRate: 7.6 },
  },
  "tech-gadgets": {
    id: "tech-gadgets",
    campaignName: "Smart Home Launch",
    brandName: "TechNova",
    brandLogo: "🔌",
    imageUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=600&fit=crop",
    status: "in_progress",
    commission: 680,
    paymentStatus: "pending",
    deadline: "2026-01-28",
    startDate: "2026-01-15",
    categories: ["Tech", "Smart Home", "Lifestyle"],
    socials: ["youtube", "instagram"],
    deliverables: [
      { id: "d1", type: "youtube_video", title: "YouTube Review Video", status: "pending" },
      { id: "d2", type: "instagram_post", title: "Instagram Carousel", status: "detected", detectedUrl: "https://instagram.com/p/abc123", detectedAt: "2026-01-22T15:30:00Z" },
      { id: "d3", type: "instagram_reel", title: "Instagram Reel", status: "missing" },
    ],
    messages: [
      { id: "m1", sender: "brand", senderName: "TechNova Team", content: "Looking forward to seeing your creative take on our smart home products!", timestamp: "2026-01-15T09:00:00Z", type: "message" },
    ],
    brief: {
      description: "Showcase how TechNova smart home products seamlessly integrate into daily life. Focus on convenience, automation, and the modern aesthetic of our devices.",
      keyMessages: ["Easy setup", "Works with all voice assistants", "Energy efficient", "Modern design"],
      hashtags: ["#TechNovaHome", "#SmartLiving", "#ad"],
      mentions: ["@technova"],
      requiredLinks: ["technova.com/smart"],
      dos: ["Show real usage scenarios", "Highlight voice control features", "Mention the app experience"],
      donts: ["Don't show competitor products", "Don't make false automation claims"],
      usageRights: "Brand may use content for 6 months with attribution.",
      postingWindow: { start: "2026-01-20", end: "2026-01-28" },
      assets: [
        { name: "Product Specs Sheet", type: "pdf", url: "#" },
        { name: "App Screenshots", type: "folder", url: "#" },
      ],
    },
  },
  "fitness-apparel": {
    id: "fitness-apparel",
    campaignName: "Activewear Spring Drop",
    brandName: "FitFlow",
    brandLogo: "💪",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    status: "brief_received",
    commission: 320,
    paymentStatus: "pending",
    deadline: "2026-02-05",
    startDate: "2026-01-18",
    categories: ["Fitness", "Fashion", "Sports"],
    socials: ["instagram", "tiktok", "youtube"],
    deliverables: [
      { id: "d1", type: "instagram_post", title: "Instagram Post #1", status: "missing" },
      { id: "d2", type: "instagram_post", title: "Instagram Post #2", status: "missing" },
      { id: "d3", type: "instagram_reel", title: "Workout Reel", status: "missing" },
      { id: "d4", type: "tiktok_video", title: "TikTok Video", status: "missing" },
    ],
    messages: [
      { id: "m1", sender: "brand", senderName: "FitFlow", content: "Hey! We're thrilled to have you on board. The brief is ready - take your time to review it!", timestamp: "2026-01-18T10:00:00Z", type: "message" },
    ],
    brief: {
      description: "Showcase our Spring 2026 Activewear Collection during your workout routines. Highlight the comfort, flexibility, and style of our pieces.",
      keyMessages: ["Moisture-wicking fabric", "Sustainable materials", "Perfect fit", "Versatile styling"],
      hashtags: ["#FitFlowSpring", "#ActivewearStyle", "#ad"],
      mentions: ["@fitflow_official"],
      requiredLinks: ["fitflow.com/spring26"],
      dos: ["Show products in action", "Mention comfort features", "Tag location if at gym"],
      donts: ["Don't alter colors in editing", "Don't crop out logos"],
      usageRights: "Brand may use for social media for 12 months.",
      postingWindow: { start: "2026-01-25", end: "2026-02-05" },
      assets: [
        { name: "Lookbook", type: "pdf", url: "#" },
        { name: "Product Photos", type: "folder", url: "#" },
      ],
    },
  },
  "coffee-subscription": {
    id: "coffee-subscription",
    campaignName: "Premium Coffee Launch",
    brandName: "BeanCraft",
    brandLogo: "☕",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    status: "submitted",
    commission: 280,
    paymentStatus: "pending",
    deadline: "2026-01-22",
    startDate: "2026-01-05",
    categories: ["Food & Beverage", "Lifestyle"],
    socials: ["instagram"],
    deliverables: [
      { id: "d1", type: "instagram_post", title: "Morning Coffee Post", status: "approved", approvedAt: "2026-01-20", paymentAmount: 140, paymentStatus: "paid" },
      { id: "d2", type: "instagram_reel", title: "Brewing Reel", status: "pending", submittedUrl: "https://instagram.com/reel/xyz789", submittedAt: "2026-01-21T09:00:00Z" },
    ],
    messages: [],
    brief: {
      description: "Share your morning coffee ritual featuring BeanCraft's premium blends.",
      keyMessages: ["Single-origin beans", "Artisan roasted", "Fresh delivery"],
      hashtags: ["#BeanCraftMornings", "#CoffeeLovers", "#ad"],
      mentions: ["@beancraft"],
      requiredLinks: ["beancraft.co/morning"],
      dos: ["Show brewing process", "Capture steam/aroma moments"],
      donts: ["Don't show competitor coffee"],
      usageRights: "Brand may repost indefinitely.",
      postingWindow: { start: "2026-01-15", end: "2026-01-22" },
      assets: [],
    },
  },
  "winter-collection": {
    id: "winter-collection",
    campaignName: "Winter Fashion Edit",
    brandName: "StyleHouse",
    brandLogo: "❄️",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
    status: "completed",
    commission: 520,
    paymentStatus: "paid",
    deadline: "2026-01-10",
    startDate: "2025-12-20",
    categories: ["Fashion", "Lifestyle"],
    socials: ["instagram", "tiktok"],
    deliverables: [
      { id: "d1", type: "instagram_post", title: "Outfit Post #1", status: "approved", approvedAt: "2026-01-05", paymentAmount: 175, paymentStatus: "paid" },
      { id: "d2", type: "instagram_post", title: "Outfit Post #2", status: "approved", approvedAt: "2026-01-07", paymentAmount: 175, paymentStatus: "paid" },
      { id: "d3", type: "tiktok_video", title: "GRWM TikTok", status: "approved", approvedAt: "2026-01-09", paymentAmount: 170, paymentStatus: "paid" },
    ],
    messages: [],
    brief: {
      description: "Feature our Winter Collection in your styling content.",
      keyMessages: ["Cozy materials", "Timeless design"],
      hashtags: ["#StyleHouseWinter", "#ad"],
      mentions: ["@stylehouse"],
      requiredLinks: [],
      dos: ["Style multiple pieces together"],
      donts: [],
      usageRights: "Standard usage rights apply.",
      postingWindow: { start: "2025-12-25", end: "2026-01-10" },
      assets: [],
    },
    performance: { views: 45000, likes: 3200, comments: 156, shares: 89, engagementRate: 8.2 },
  },
  "wellness-app": {
    id: "wellness-app",
    campaignName: "Wellness App Promo",
    brandName: "MindfulMe",
    brandLogo: "🧘",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    status: "approved",
    commission: 400,
    paymentStatus: "processing",
    deadline: "2026-01-20",
    startDate: "2026-01-08",
    categories: ["Health", "Wellness", "Tech"],
    socials: ["instagram", "youtube"],
    deliverables: [
      { id: "d1", type: "instagram_reel", title: "App Walkthrough Reel", status: "approved", approvedAt: "2026-01-18", paymentAmount: 200, paymentStatus: "processing" },
      { id: "d2", type: "youtube_video", title: "Morning Routine Video", status: "approved", approvedAt: "2026-01-19", paymentAmount: 200, paymentStatus: "processing" },
    ],
    messages: [
      { id: "m1", sender: "brand", senderName: "MindfulMe", content: "All content approved! Payment is being processed.", timestamp: "2026-01-19T16:00:00Z", type: "update" },
    ],
    brief: {
      description: "Share how MindfulMe app fits into your wellness routine.",
      keyMessages: ["Guided meditations", "Sleep tracking", "Mood journaling"],
      hashtags: ["#MindfulMeApp", "#WellnessJourney", "#ad"],
      mentions: ["@mindfulme_app"],
      requiredLinks: ["mindfulme.app/download"],
      dos: ["Show app interface", "Share personal experience"],
      donts: ["Don't guarantee health outcomes"],
      usageRights: "12 months usage rights.",
      postingWindow: { start: "2026-01-12", end: "2026-01-20" },
      assets: [{ name: "App Screenshots", type: "folder", url: "#" }],
    },
    performance: { views: 28000, likes: 1850, comments: 92, shares: 67, engagementRate: 7.2 },
  },
};

// Helper functions
const getDeliverableIcon = (type: Deliverable["type"]) => {
  switch (type) {
    case "instagram_post": return Instagram;
    case "instagram_reel": return Video;
    case "instagram_story": return Image;
    case "tiktok_video": return Video;
    case "youtube_video": return Youtube;
    default: return FileText;
  }
};

const getDeliverableStatusConfig = (status: DeliverableStatus) => {
  switch (status) {
    case "detected": return { label: "Detected", color: "bg-cyan/20 text-cyan border-cyan/30", icon: Eye };
    case "missing": return { label: "Missing", color: "bg-orange/20 text-orange border-orange/30", icon: AlertTriangle };
    case "approved": return { label: "Approved", color: "bg-success/20 text-success border-success/30", icon: CheckCircle2 };
    case "pending": return { label: "Pending Review", color: "bg-purple/20 text-purple border-purple/30", icon: Clock };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const ActiveCampaignWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("deliverables");
  const [newMessage, setNewMessage] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);

  const campaign = id ? mockCampaignData[id] : null;
  
  // Content detection hook
  const {
    detectedContent,
    linkedAccounts,
    isScanning,
    lastScanTime,
    scanForContent,
    confirmDetectedContent,
    getMatchConfidence,
    hasLinkedAccount,
  } = useContentDetection();

  // Build detection rules from campaign brief and scan on mount
  useEffect(() => {
    if (campaign) {
      const rules = buildDetectionRules({
        hashtags: campaign.brief.hashtags,
        mentions: campaign.brief.mentions,
        requiredLinks: campaign.brief.requiredLinks,
        postingWindow: campaign.brief.postingWindow,
        platforms: campaign.socials,
      });
      scanForContent(rules);
    }
  }, [campaign?.id]);

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-foreground mb-4">Campaign Not Found</h1>
          <Button onClick={() => navigate("/active-campaigns")} className="gradient-primary text-white">
            Back to Active Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusConfig[campaign.status];
  const StatusIcon = statusInfo.icon;
  const completedDeliverables = campaign.deliverables.filter((d) => d.status === "approved").length;
  const deliveryProgress = Math.round((completedDeliverables / campaign.deliverables.length) * 100);
  const totalEarned = campaign.deliverables.filter((d) => d.paymentStatus === "paid").reduce((sum, d) => sum + (d.paymentAmount || 0), 0);
  const totalPending = campaign.deliverables.filter((d) => d.paymentStatus !== "paid").reduce((sum, d) => sum + (d.paymentAmount || 0), 0);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    toast({ title: "Message Sent", description: "Your message has been sent to the brand." });
    setNewMessage("");
  };

  const handleConfirmDetected = (deliverableId: string, content?: DetectedContent) => {
    if (content) {
      confirmDetectedContent(content.id);
    }
    toast({ title: "Content Confirmed", description: "The detected content has been submitted for review." });
  };

  const handleSubmitManual = (deliverableId: string) => {
    if (!submissionUrl.trim()) {
      toast({ title: "Error", description: "Please enter a valid URL.", variant: "destructive" });
      return;
    }
    toast({ title: "Submitted", description: "Your content has been submitted for review." });
    setSubmissionUrl("");
    setSelectedDeliverable(null);
  };

  const handleRescan = () => {
    const rules = buildDetectionRules({
      hashtags: campaign.brief.hashtags,
      mentions: campaign.brief.mentions,
      requiredLinks: campaign.brief.requiredLinks,
      postingWindow: campaign.brief.postingWindow,
      platforms: campaign.socials,
    });
    scanForContent(rules);
    toast({ title: "Scanning", description: "Looking for new content on your linked accounts..." });
  };

  // Match detected content to deliverables
  const getDetectedForDeliverable = (deliverable: Deliverable): DetectedContent | undefined => {
    const platformMap: Record<string, string> = {
      instagram_post: "instagram",
      instagram_reel: "instagram",
      instagram_story: "instagram",
      tiktok_video: "tiktok",
      youtube_video: "youtube",
    };
    const typeMap: Record<string, string> = {
      instagram_post: "post",
      instagram_reel: "reel",
      instagram_story: "story",
      tiktok_video: "video",
      youtube_video: "video",
    };
    
    return detectedContent.find(
      (c) => c.platform === platformMap[deliverable.type] && c.type === typeMap[deliverable.type]
    );
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/active-campaigns")} className="mb-4 text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Active Campaigns
            </Button>

            <div className="glass rounded-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl shrink-0">
                  {campaign.brandLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{campaign.campaignName}</h1>
                    <Badge className={cn("shrink-0", statusInfo.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{campaign.brandName}</p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm"><span className="text-muted-foreground">Due:</span> <span className="font-medium text-foreground">{formatDate(campaign.deadline)}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-success" />
                      <span className="text-sm"><span className="text-muted-foreground">Earned:</span> <span className="font-medium text-success">${totalEarned}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange" />
                      <span className="text-sm"><span className="text-muted-foreground">Pending:</span> <span className="font-medium text-orange">${totalPending}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm"><span className="text-muted-foreground">Progress:</span> <span className="font-medium text-foreground">{completedDeliverables}/{campaign.deliverables.length}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Delivery Progress</span>
                  <span className="font-medium text-foreground">{deliveryProgress}%</span>
                </div>
                <Progress value={deliveryProgress} className="h-2" />
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass w-full md:w-auto grid grid-cols-4 md:flex gap-1 p-1">
              <TabsTrigger value="deliverables" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                <FileCheck className="h-4 w-4 mr-2 hidden sm:inline" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="brief" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                Brief
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:gradient-primary data-[state=active]:text-white relative">
                <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline" />
                Messages
                {campaign.messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink text-white text-xs rounded-full flex items-center justify-center">
                    {campaign.messages.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:gradient-primary data-[state=active]:text-white" disabled={!campaign.performance}>
                <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Deliverables Tab */}
            <TabsContent value="deliverables" className="space-y-4">
              {/* Scan Controls */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isScanning ? "bg-cyan/20 animate-pulse" : "bg-gradient-to-br from-cyan/20 to-purple/20"
                  )}>
                    {isScanning ? (
                      <Loader2 className="h-5 w-5 text-cyan animate-spin" />
                    ) : (
                      <Eye className="h-5 w-5 text-cyan" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Content Detection</h3>
                    <p className="text-xs text-muted-foreground">
                      {isScanning ? "Scanning your linked accounts..." : 
                       lastScanTime ? `Last scanned ${new Date(lastScanTime).toLocaleTimeString()}` :
                       "Scan to find matching posts"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {detectedContent.length > 0 && (
                    <Badge className="bg-cyan/20 text-cyan border-cyan/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {detectedContent.length} detected
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRescan}
                    disabled={isScanning}
                    className="text-xs"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isScanning && "animate-spin")} />
                    {isScanning ? "Scanning..." : "Rescan"}
                  </Button>
                </div>
              </motion.div>

              {/* Detected Content Section */}
              {detectedContent.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4 border border-cyan/30"
                >
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan" />
                    Auto-Detected Content
                    <Badge className="bg-cyan/20 text-cyan text-xs">{detectedContent.length}</Badge>
                  </h3>
                  <div className="grid gap-3">
                    {detectedContent.map((content) => (
                      <div 
                        key={content.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-cyan/5 border border-cyan/20"
                      >
                        <img 
                          src={content.thumbnailUrl} 
                          alt="Content thumbnail" 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="text-xs bg-cyan/20 text-cyan capitalize">
                              {content.platform} {content.type}
                            </Badge>
                            <Badge className={cn(
                              "text-xs",
                              content.confidence >= 70 ? "bg-success/20 text-success" : "bg-orange/20 text-orange"
                            )}>
                              {getMatchConfidence(content)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {content.caption || content.url}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {content.matchedRules.hashtags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-xs text-cyan">{tag}</span>
                            ))}
                            {content.matchedRules.mentions.slice(0, 1).map((mention, i) => (
                              <span key={i} className="text-xs text-purple">{mention}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => window.open(content.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="gradient-primary text-white text-xs"
                            onClick={() => {
                              confirmDetectedContent(content.id);
                              toast({ 
                                title: "Content Confirmed", 
                                description: "Submitted for review." 
                              });
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Deliverables List */}
              {campaign.deliverables.map((deliverable, index) => {
                const delStatusConfig = getDeliverableStatusConfig(deliverable.status);
                const DelIcon = getDeliverableIcon(deliverable.type);
                const StatusBadgeIcon = delStatusConfig.icon;
                const detectedForThis = getDetectedForDeliverable(deliverable);

                return (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "glass rounded-2xl p-4 md:p-5 border-l-4",
                      deliverable.status === "approved" ? "border-l-success" :
                      deliverable.status === "detected" ? "border-l-cyan" :
                      deliverable.status === "pending" ? "border-l-purple" :
                      "border-l-orange"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", delStatusConfig.color.split(" ")[0])}>
                          <DelIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{deliverable.title}</h3>
                            <Badge className={cn("text-xs", delStatusConfig.color)}>
                              <StatusBadgeIcon className="h-3 w-3 mr-1" />
                              {delStatusConfig.label}
                            </Badge>
                          </div>
                          {deliverable.status === "approved" && deliverable.approvedAt && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Lock className="h-3 w-3" />
                              Approved on {formatDate(deliverable.approvedAt)}
                              {deliverable.paymentStatus && (
                                <Badge className={cn("text-xs ml-2", deliverable.paymentStatus === "paid" ? "bg-success/20 text-success" : "bg-orange/20 text-orange")}>
                                  ${deliverable.paymentAmount} - {deliverable.paymentStatus === "paid" ? "Paid" : "Processing"}
                                </Badge>
                              )}
                            </p>
                          )}
                          {deliverable.status === "detected" && deliverable.detectedUrl && (
                            <p className="text-sm text-cyan flex items-center gap-2 mt-1">
                              <Sparkles className="h-3 w-3" />
                              Auto-detected on {formatDate(deliverable.detectedAt!)}
                            </p>
                          )}
                          {deliverable.status === "pending" && deliverable.submittedAt && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Submitted on {formatDate(deliverable.submittedAt)} - awaiting review
                            </p>
                          )}
                          {deliverable.feedback && (
                            <p className="text-sm text-pink mt-2 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              {deliverable.feedback}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {deliverable.status === "detected" && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open(deliverable.detectedUrl, "_blank")}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="gradient-primary text-white text-xs" onClick={() => handleConfirmDetected(deliverable.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Confirm
                            </Button>
                          </>
                        )}
                        {deliverable.status === "missing" && (
                          <Button size="sm" className="gradient-accent text-white text-xs" onClick={() => setSelectedDeliverable(deliverable.id)}>
                            <Upload className="h-3 w-3 mr-1" />
                            Submit
                          </Button>
                        )}
                        {deliverable.status === "approved" && (
                          <div className="flex items-center gap-1 text-success text-sm">
                            <Lock className="h-4 w-4" />
                            Locked
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submission Form */}
                    <AnimatePresence>
                      {selectedDeliverable === deliverable.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                              placeholder="Paste your content URL (e.g., Instagram post link)"
                              value={submissionUrl}
                              onChange={(e) => setSubmissionUrl(e.target.value)}
                              className="flex-1"
                            />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedDeliverable(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" className="gradient-primary text-white" onClick={() => handleSubmitManual(deliverable.id)}>
                                <Send className="h-4 w-4 mr-1" />
                                Submit
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </TabsContent>

            {/* Brief Tab */}
            <TabsContent value="brief" className="space-y-6">
              {/* Description */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Campaign Overview
                </h3>
                <p className="text-foreground/80 leading-relaxed">{campaign.brief.description}</p>
              </div>

              {/* Key Messages */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple" />
                  Key Messages
                </h3>
                <ul className="space-y-2">
                  {campaign.brief.keyMessages.map((msg, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detection Rules */}
              <div className="glass rounded-2xl p-5 border border-cyan/30">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan" />
                  Detection Rules
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">We'll auto-detect your content if it includes these elements during the posting window.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Hash className="h-4 w-4" /> Required Hashtags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.brief.hashtags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-cyan border-cyan/30">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <AtSign className="h-4 w-4" /> Required Mentions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.brief.mentions.map((mention, i) => (
                        <Badge key={i} variant="outline" className="text-purple border-purple/30">{mention}</Badge>
                      ))}
                    </div>
                  </div>
                  {campaign.brief.requiredLinks.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Link2 className="h-4 w-4" /> Required Links
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.brief.requiredLinks.map((link, i) => (
                          <Badge key={i} variant="outline" className="text-orange border-orange/30">{link}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Posting Window
                    </p>
                    <p className="text-foreground font-medium">
                      {formatDate(campaign.brief.postingWindow.start)} - {formatDate(campaign.brief.postingWindow.end)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dos and Don'ts */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Do's
                  </h3>
                  <ul className="space-y-2">
                    {campaign.brief.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-pink mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Don'ts
                  </h3>
                  <ul className="space-y-2">
                    {campaign.brief.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                        <AlertCircle className="h-4 w-4 text-pink shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Usage Rights */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange" />
                  Usage Rights
                </h3>
                <p className="text-foreground/80 text-sm">{campaign.brief.usageRights}</p>
              </div>

              {/* Assets */}
              {campaign.brief.assets.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Download className="h-5 w-5 text-cyan" />
                    Downloadable Assets
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {campaign.brief.assets.map((asset, i) => (
                      <Button key={i} variant="outline" className="justify-start h-auto py-3">
                        {asset.type === "pdf" ? <FileText className="h-4 w-4 mr-2 text-pink" /> :
                         asset.type === "video" ? <Video className="h-4 w-4 mr-2 text-purple" /> :
                         asset.type === "zip" ? <Download className="h-4 w-4 mr-2 text-cyan" /> :
                         <Image className="h-4 w-4 mr-2 text-orange" />}
                        <span className="truncate">{asset.name}</span>
                        <Download className="h-4 w-4 ml-auto text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Campaign Messages
                </h3>

                {/* Message List */}
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {campaign.messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                  ) : (
                    campaign.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-xl",
                          msg.sender === "creator" ? "bg-primary/10 ml-8" :
                          msg.sender === "admin" ? "bg-orange/10 border border-orange/20" :
                          "bg-muted mr-8"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{msg.senderName}</span>
                          {msg.type === "update" && <Badge className="text-xs bg-orange/20 text-orange">Update</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-foreground/80 text-sm">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button className="gradient-primary text-white shrink-0" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              {campaign.performance ? (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Performance Snapshot
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">{campaign.performance.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">{campaign.performance.likes.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">{campaign.performance.comments.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold text-foreground">{campaign.performance.shares.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Shares</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-success/10">
                      <p className="text-2xl font-bold text-success">{campaign.performance.engagementRate}%</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Performance Data Yet</h3>
                  <p className="text-muted-foreground text-sm">Performance stats will appear once your content goes live.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default ActiveCampaignWorkspace;