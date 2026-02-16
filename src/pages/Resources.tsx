import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Video,
  FileText,
  Users,
  Search,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  DollarSign,
  Link2,
  Camera,
  TrendingUp,
} from "lucide-react";

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "content", label: "Content Creation", icon: Camera },
    { id: "earnings", label: "Earnings & Payments", icon: DollarSign },
    { id: "growth", label: "Growth Tips", icon: TrendingUp },
  ];

  const videoTutorials = [
    {
      id: "1",
      title: "Getting Started with Atomic Influence",
      description: "Learn how to set up your profile and connect your social accounts",
      duration: "5:30",
      category: "getting-started",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
    },
    {
      id: "2",
      title: "How to Apply for Campaigns",
      description: "Step-by-step guide to finding and applying for brand campaigns",
      duration: "7:15",
      category: "getting-started",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    },
    {
      id: "3",
      title: "Creating Content That Converts",
      description: "Best practices for creating engaging sponsored content",
      duration: "12:45",
      category: "content",
      thumbnail: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=225&fit=crop",
    },
    {
      id: "4",
      title: "Understanding Your Earnings Dashboard",
      description: "Navigate commissions, payouts, and payment methods",
      duration: "6:20",
      category: "earnings",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop",
    },
    {
      id: "5",
      title: "Growing Your Influence Score",
      description: "Tips to improve your profile and get more brand invitations",
      duration: "9:10",
      category: "growth",
      thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop",
    },
    {
      id: "6",
      title: "Negotiating Better Rates",
      description: "How to use counter-offers and negotiate with brands",
      duration: "8:30",
      category: "earnings",
      thumbnail: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=225&fit=crop",
    },
  ];

  const guides = [
    {
      id: "profile-optimization",
      title: "Profile Optimization Guide",
      description: "Maximize your visibility to brands with a complete, compelling profile",
      readTime: "8 min read",
      icon: Users,
    },
    {
      id: "content-guidelines",
      title: "Content Guidelines & Best Practices",
      description: "FTC compliance, disclosure requirements, and brand-safe content tips",
      readTime: "12 min read",
      icon: FileText,
    },
    {
      id: "platform-integration",
      title: "Connecting Your Platforms",
      description: "How to link Instagram, TikTok, YouTube, and other social accounts",
      readTime: "5 min read",
      icon: Link2,
    },
  ];

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div
          className="p-6 lg:p-8 max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <PageHeader
            title="Resources"
            subtitle="Video tutorials, guides, and tips to help you succeed"
            icon={Book}
          />

          {/* Search & Filters */}
          <motion.div className="glass rounded-2xl p-6 mb-8" variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search tutorials and guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? "bg-primary text-white"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Video Tutorials Section */}
          <motion.div className="mb-10" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Video Tutorials</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {filteredVideos.length} videos
              </Badge>
            </div>

            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No videos found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </motion.div>

          {/* Guides Section */}
          <motion.div className="mb-10" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-purple" />
              <h2 className="text-xl font-semibold text-foreground">Written Guides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guides.map((guide, index) => {
                const IconComponent = guide.icon;
                return (
                  <motion.div
                    key={guide.id}
                    className="glass rounded-2xl p-6 group cursor-pointer hover:border-primary/30 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/help/articles/${guide.id}`)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center text-white mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Read
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Community CTA */}
          <motion.div
            className="glass rounded-2xl p-8 text-center border border-primary/20 relative overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Creator Network</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A dedicated space for verified creators to exchange insights, collaborate, and access platform updates.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple text-white font-medium hover:opacity-90 transition-opacity">
                <Sparkles className="h-4 w-4" />
                In Development
              </button>
            </div>
          </motion.div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Resources;
