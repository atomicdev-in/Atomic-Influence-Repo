import { motion } from "framer-motion";
import { 
  Radio, 
  TrendingUp, 
  MessageCircle, 
  BarChart3, 
  Sparkles,
  Globe,
  Bell,
  Users,
  Hash,
  Zap
} from "lucide-react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const upcomingFeatures = [
  {
    icon: Globe,
    title: "Brand Mentions Tracking",
    description: "Monitor mentions of your brand across social platforms in real-time, capturing organic conversations and creator content.",
  },
  {
    icon: TrendingUp,
    title: "Sentiment Analysis",
    description: "AI-powered sentiment detection to understand how audiences feel about your brand, products, and campaigns.",
  },
  {
    icon: Users,
    title: "Creator Amplification Monitoring",
    description: "Track how your partnered creators amplify your message and measure the ripple effect of their content.",
  },
  {
    icon: BarChart3,
    title: "Campaign Buzz Insights",
    description: "Visualize the buzz around your campaigns with trending topics, hashtag performance, and engagement spikes.",
  },
  {
    icon: Hash,
    title: "Hashtag & Keyword Tracking",
    description: "Follow specific hashtags and keywords to stay ahead of trends and competitor movements.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Get instant notifications for significant mentions, viral content, or sentiment shifts requiring attention.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function BrandSocialListening() {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto">
          <PageHeader 
            title="Social Listening & Media Monitoring"
            subtitle="Track brand mentions, sentiment, and campaign buzz across platforms"
            icon={Radio}
          >
            <Badge 
              variant="outline" 
              className="bg-primary/10 text-primary border-primary/30 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              In Development
            </Badge>
          </PageHeader>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "glass-card rounded-2xl p-8 mb-8 text-center",
              "border border-white/20 dark:border-white/10"
            )}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Radio className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Comprehensive Brand Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The Social Listening module will provide real-time monitoring of brand mentions, 
              sentiment analysis, and creator impact measurement across all major platforms. 
              This capability enables data-driven campaign optimization and narrative management.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">
                Scheduled deployment: Q2 2026
              </span>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {upcomingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className={cn(
                    "glass-card rounded-xl p-6",
                    "border border-white/20 dark:border-white/10",
                    "hover:border-primary/30 transition-colors duration-300"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              "glass-card rounded-2xl p-6 mt-8 text-center",
              "border border-white/20 dark:border-white/10",
              "bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
            )}
          >
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">
              Request Priority Access
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This feature is under active development. Contact our team to join the priority access 
              program and provide input on functionality requirements.
            </p>
          </motion.div>
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
}
