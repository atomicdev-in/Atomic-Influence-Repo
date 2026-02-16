import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Video,
  FileText,
  Briefcase,
  Search,
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
  Users,
  BarChart3,
  Megaphone,
} from "lucide-react";

const BrandResources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "getting-started", label: "Getting Started", icon: Rocket },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "creators", label: "Finding Creators", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const videoTutorials = [
    {
      id: "1",
      title: "Creating Your First Campaign",
      description: "Step-by-step walkthrough of the campaign creation wizard",
      duration: "8:45",
      category: "getting-started",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    },
    {
      id: "2",
      title: "Finding the Right Creators",
      description: "How to use filters and match scores to find perfect creators",
      duration: "6:30",
      category: "creators",
      thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop",
    },
    {
      id: "3",
      title: "Campaign Brief Best Practices",
      description: "Write briefs that attract quality applications",
      duration: "10:15",
      category: "campaigns",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop",
    },
    {
      id: "4",
      title: "Understanding Campaign Analytics",
      description: "Reading reports and measuring ROI",
      duration: "12:00",
      category: "analytics",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    },
    {
      id: "5",
      title: "Managing Creator Relationships",
      description: "Communication, feedback, and building long-term partnerships",
      duration: "7:20",
      category: "creators",
      thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=225&fit=crop",
    },
    {
      id: "6",
      title: "Budget Optimization Strategies",
      description: "Get the most out of your influencer marketing budget",
      duration: "9:40",
      category: "campaigns",
      thumbnail: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=225&fit=crop",
    },
  ];

  const caseStudies = [
    {
      id: "beauty-launch",
      title: "GlowSkin's Summer Launch",
      description: "How a beauty brand achieved 340% ROI with micro-influencers",
      industry: "Beauty",
      metric: "340% ROI",
      thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=225&fit=crop",
    },
    {
      id: "tech-review",
      title: "TechNova Smart Home Campaign",
      description: "Generating 2M+ impressions through authentic product reviews",
      industry: "Technology",
      metric: "2M+ Impressions",
      thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=225&fit=crop",
    },
    {
      id: "fitness-challenge",
      title: "FitLife 30-Day Challenge",
      description: "Building community engagement through creator-led challenges",
      industry: "Fitness",
      metric: "50K Participants",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
    },
  ];

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <BrandDashboardLayout>
      <PageTransition>
        <motion.div
          className="p-6 lg:p-8 max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <PageHeader
            title="Resources"
            subtitle="Guides, tutorials, and case studies to maximize your campaigns"
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

          {/* Case Studies Section */}
          <motion.div className="mb-10" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-5 w-5 text-purple" />
              <h2 className="text-xl font-semibold text-foreground">Case Studies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={study.thumbnail}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md">
                        {study.industry}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white font-bold text-lg">{study.metric}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{study.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{study.description}</p>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Read case study
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* API Docs CTA */}
          <motion.div
            className="glass rounded-2xl p-8 border border-primary/20 relative overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white shrink-0">
                <FileText className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-foreground mb-2">API Documentation</h3>
                <p className="text-muted-foreground">
                  Integrate Atomic Influence with your existing tools and workflows. Our REST API provides programmatic access to campaigns, creators, and analytics.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple text-white font-medium hover:opacity-90 transition-opacity shrink-0">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </button>
            </div>
          </motion.div>
        </motion.div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandResources;
