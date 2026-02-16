import { useState } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useAdminCreatorIntelligenceSummaries, type CreatorIntelligenceSummary } from "@/hooks/useAdminCreatorIntelligence";
import { CreatorIntelligenceModal } from "@/components/admin/CreatorIntelligenceModal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Eye, 
  TrendingUp,
  Database,
  Crown,
  Star,
  Sparkles,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Tier styling and icons
const tierConfig: Record<string, { 
  label: string; 
  className: string; 
  icon: typeof Crown;
  bgGradient: string;
}> = {
  premium: { 
    label: "Premium", 
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Crown,
    bgGradient: "from-amber-500/10 to-transparent",
  },
  established: { 
    label: "Established", 
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Star,
    bgGradient: "from-emerald-500/10 to-transparent",
  },
  emerging: { 
    label: "Emerging", 
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Sparkles,
    bgGradient: "from-blue-500/10 to-transparent",
  },
  new: { 
    label: "New", 
    className: "bg-muted text-muted-foreground border-white/10",
    icon: User,
    bgGradient: "from-muted/10 to-transparent",
  },
};

function CreatorsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CreatorIntelligenceCard({ 
  creator, 
  onViewDetails 
}: { 
  creator: CreatorIntelligenceSummary;
  onViewDetails: () => void;
}) {
  const tier = tierConfig[creator.tier];
  const TierIcon = tier.icon;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden",
      "hover:border-white/20 transition-colors group"
    )}>
      {/* Tier gradient accent */}
      <div className={cn("h-1 bg-gradient-to-r", tier.bgGradient)} />
      
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border border-white/10">
            <AvatarImage src={creator.avatarUrl || undefined} />
            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{creator.name}</h3>
              <Badge variant="outline" className={cn("text-xs", tier.className)}>
                <TierIcon className="h-3 w-3 mr-1" />
                {tier.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @{creator.username || "—"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {creator.email}
            </p>
          </div>
        </div>

        {/* Score display */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Creator Score</span>
            </div>
            <span className={cn("font-bold", getScoreColor(creator.overallScore))}>
              {creator.overallScore}%
            </span>
          </div>
          <Progress value={creator.overallScore} className="h-1.5" />
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-lg font-semibold">
              {creator.platformCount}
            </p>
            <p className="text-[10px] text-muted-foreground">Platforms</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-lg font-semibold">
              {creator.totalFollowers >= 1000 
                ? `${(creator.totalFollowers / 1000).toFixed(1)}k` 
                : creator.totalFollowers}
            </p>
            <p className="text-[10px] text-muted-foreground">Followers</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-lg font-semibold">
              {creator.completedCampaigns}
            </p>
            <p className="text-[10px] text-muted-foreground">Campaigns</p>
          </div>
        </div>

        {/* Data completeness indicator */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="h-3 w-3" />
            <span>Data Completeness</span>
          </div>
          <span className={cn(
            creator.dataCompleteness >= 70 ? "text-emerald-400" :
            creator.dataCompleteness >= 40 ? "text-amber-400" : "text-red-400"
          )}>
            {creator.dataCompleteness}%
          </span>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Joined {format(new Date(creator.createdAt), "MMM d, yyyy")}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewDetails}
            className="border-white/10 hover:bg-white/5 group-hover:border-primary/50"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Intel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCreators() {
  const { data: creators, isLoading, refetch } = useAdminCreatorIntelligenceSummaries();
  
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter and sort creators
  const filteredCreators = creators
    ?.filter((creator) => {
      const matchesSearch = 
        creator.name.toLowerCase().includes(search.toLowerCase()) ||
        creator.email.toLowerCase().includes(search.toLowerCase()) ||
        creator.username?.toLowerCase().includes(search.toLowerCase());
      
      const matchesTier = tierFilter === "all" || creator.tier === tierFilter;
      
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.overallScore - a.overallScore;
        case "followers":
          return b.totalFollowers - a.totalFollowers;
        case "campaigns":
          return b.completedCampaigns - a.completedCampaigns;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  // Stats summary
  const stats = creators ? {
    total: creators.length,
    premium: creators.filter(c => c.tier === "premium").length,
    established: creators.filter(c => c.tier === "established").length,
    emerging: creators.filter(c => c.tier === "emerging").length,
    new: creators.filter(c => c.tier === "new").length,
    avgScore: Math.round(creators.reduce((sum, c) => sum + c.overallScore, 0) / creators.length) || 0,
  } : null;

  if (isLoading) {
    return (
      <AdminDashboardLayout title="Creators">
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Creator Intelligence" 
              subtitle="Aggregated creator profiles with scoring and classification"
            />
            <CreatorsGridSkeleton />
          </div>
        </PageTransition>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Creators" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Creator Intelligence" 
              subtitle={`${creators?.length || 0} creators with aggregated insights and scoring`}
            />

            {/* Stats Overview */}
            {stats && stats.total > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold text-amber-400">{stats.premium}</p>
                    <p className="text-xs text-amber-400/70">Premium</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.established}</p>
                    <p className="text-xs text-emerald-400/70">Established</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{stats.emerging}</p>
                    <p className="text-xs text-blue-400/70">Emerging</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50 border-white/10">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold">{stats.new}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
                    <p className="text-xs text-primary/70">Avg Score</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card/50 border-white/10"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-card/50 border-white/10">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="emerging">Emerging</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 bg-card/50 border-white/10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Highest Score</SelectItem>
                  <SelectItem value="followers">Most Followers</SelectItem>
                  <SelectItem value="campaigns">Most Campaigns</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid */}
            {!filteredCreators?.length ? (
              <EmptyState
                icon={Users}
                title="No creators found"
                description={search || tierFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Creators will appear here once they sign up."
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCreators.map((creator) => (
                  <CreatorIntelligenceCard
                    key={creator.id}
                    creator={creator}
                    onViewDetails={() => handleViewDetails(creator.userId)}
                  />
                ))}
              </div>
            )}
          </div>
        </PageTransition>
      </PageErrorBoundary>

      <CreatorIntelligenceModal
        userId={selectedUserId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </AdminDashboardLayout>
  );
}
