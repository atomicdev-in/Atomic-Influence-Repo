import { useState, useEffect } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { GridCardsSkeleton } from "@/components/ui/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { BrandIntelligenceModal } from "@/components/admin/BrandIntelligenceModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  useAdminBrandIntelligenceSummaries, 
  useAdminBrandStats 
} from "@/hooks/useAdminBrandIntelligence";
import { useTransferBrandOwnership, usePotentialBrandOwners } from "@/hooks/useBrandOwnership";
import { formatCurrency } from "@/lib/formatters";
import { 
  Building2, 
  Search, 
  Eye, 
  Users, 
  Megaphone, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpDown,
  Crown,
  UserCog,
  Loader2,
} from "lucide-react";

const healthColors = {
  healthy: "bg-green-500/20 text-green-400 border-green-500/30",
  attention: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const healthIcons = {
  healthy: CheckCircle,
  attention: AlertTriangle,
  critical: AlertCircle,
};

type SortOption = "newest" | "campaigns" | "budget" | "risk";
type FilterOption = "all" | "agency" | "single_brand" | "healthy" | "attention" | "critical";

interface PotentialOwner {
  user_id: string;
  email: string;
  name: string;
}

export default function AdminBrands() {
  const { data: summaries, isLoading, refetch } = useAdminBrandIntelligenceSummaries();
  const { data: stats } = useAdminBrandStats();
  const transferOwnership = useTransferBrandOwnership();
  const { fetchPotentialOwners } = usePotentialBrandOwners();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Ownership transfer state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferBrandId, setTransferBrandId] = useState<string | null>(null);
  const [transferBrandName, setTransferBrandName] = useState<string>("");
  const [transferCurrentOwnerId, setTransferCurrentOwnerId] = useState<string | null>(null);
  const [potentialOwners, setPotentialOwners] = useState<PotentialOwner[]>([]);
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>("");
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Load potential owners when transfer dialog opens
  useEffect(() => {
    if (transferDialogOpen && transferCurrentOwnerId) {
      setLoadingOwners(true);
      fetchPotentialOwners(transferCurrentOwnerId)
        .then((owners) => setPotentialOwners(owners))
        .catch(console.error)
        .finally(() => setLoadingOwners(false));
    }
  }, [transferDialogOpen, transferCurrentOwnerId, fetchPotentialOwners]);

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <GridCardsSkeleton count={6} cols={3} />
      </AdminDashboardLayout>
    );
  }

  // Filter and sort brands
  const filteredBrands = (summaries || [])
    .filter((brand) => {
      // Search filter
      const matchesSearch = 
        brand.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.industry?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Category filter
      if (filterBy === "agency" && brand.structureType !== "agency") return false;
      if (filterBy === "single_brand" && brand.structureType !== "single_brand") return false;
      if (filterBy === "healthy" && brand.healthStatus !== "healthy") return false;
      if (filterBy === "attention" && brand.healthStatus !== "attention") return false;
      if (filterBy === "critical" && brand.healthStatus !== "critical") return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "campaigns":
          return b.totalCampaigns - a.totalCampaigns;
        case "budget":
          return b.totalBudget - a.totalBudget;
        case "risk":
          return b.riskScore - a.riskScore;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleViewIntel = (brandId: string) => {
    setSelectedBrandId(brandId);
    setModalOpen(true);
  };

  const handleTransferOwnership = (brandId: string, brandName: string, currentOwnerId: string) => {
    setTransferBrandId(brandId);
    setTransferBrandName(brandName);
    setTransferCurrentOwnerId(currentOwnerId);
    setSelectedNewOwner("");
    setTransferDialogOpen(true);
  };

  const confirmTransfer = async () => {
    if (!transferBrandId || !selectedNewOwner) return;
    
    await transferOwnership.mutateAsync({
      brandId: transferBrandId,
      newOwnerUserId: selectedNewOwner,
    });
    
    setTransferDialogOpen(false);
    setTransferBrandId(null);
    setSelectedNewOwner("");
  };

  return (
    <AdminDashboardLayout title="Brands" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Brand & Agency Governance" 
              subtitle="System-level oversight of brand structures, spend patterns, and compliance signals"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-muted-foreground">Total Brands</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.totalBrands || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.agencyCount || 0} agencies, {stats?.singleBrandCount || 0} single
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Total Campaigns</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.totalCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.activeCampaigns || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">Total Budget</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalBudget || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.utilizationRate || 0}% utilized
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Agencies</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.agencyCount || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Multi-brand operations
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats?.completedCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Campaigns finished
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Read-only notice */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="py-3 flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-400" />
                <p className="text-sm text-blue-200">
                  This view is observational for governance purposes. Brand operations are managed by brand owners.
                </p>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands by name, email, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="agency">Agencies Only</SelectItem>
                  <SelectItem value="single_brand">Single Brands</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="attention">Needs Attention</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="campaigns">Most Campaigns</SelectItem>
                  <SelectItem value="budget">Highest Budget</SelectItem>
                  <SelectItem value="risk">Highest Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredBrands.length} of {summaries?.length || 0} brands
            </p>

            {/* Brands Grid */}
            {!filteredBrands.length ? (
              <EmptyState
                icon={Building2}
                title="No brands found"
                description={searchQuery || filterBy !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Brands will appear here once they sign up."
                }
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBrands.map((brand) => {
                  const HealthIcon = healthIcons[brand.healthStatus];
                  
                  return (
                    <Card 
                      key={brand.id} 
                      className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={brand.logoUrl || undefined} />
                            <AvatarFallback>
                              {brand.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {brand.companyName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground truncate">
                              {brand.email}
                            </p>
                          </div>
                          <Badge className={healthColors[brand.healthStatus]}>
                            <HealthIcon className="h-3 w-3" />
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Type and Industry */}
                        <div className="flex gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={brand.structureType === "agency" 
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {brand.structureType === "agency" ? "Agency" : "Single Brand"}
                          </Badge>
                          {brand.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {brand.industry}
                            </Badge>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded bg-muted/50">
                            <p className="text-sm font-bold">{brand.teamSize}</p>
                            <p className="text-xs text-muted-foreground">Team</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50">
                            <p className="text-sm font-bold">{brand.totalCampaigns}</p>
                            <p className="text-xs text-muted-foreground">Campaigns</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50">
                            <p className="text-sm font-bold">{brand.activeCampaigns}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Budget</span>
                          <span className="font-medium">{formatCurrency(brand.totalBudget)}</span>
                        </div>

                        {/* Risk Score */}
                        {brand.riskScore > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Risk Score</span>
                            <span className={`font-medium ${
                              brand.riskScore > 50 ? "text-red-400" : 
                              brand.riskScore > 25 ? "text-amber-400" : "text-green-400"
                            }`}>
                              {brand.riskScore}/100
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewIntel(brand.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Intel
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="px-2"
                            onClick={() => handleTransferOwnership(brand.id, brand.companyName, brand.userId)}
                            title="Transfer Ownership"
                          >
                            <Crown className="h-4 w-4 text-amber-400" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </PageTransition>
      </PageErrorBoundary>

      {/* Intelligence Modal */}
      <BrandIntelligenceModal
        brandId={selectedBrandId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Transfer Ownership Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              Transfer Brand Ownership
            </DialogTitle>
            <DialogDescription>
              Transfer ownership of <span className="font-semibold">{transferBrandName}</span> to a new Brand Admin.
              This action can only be performed by Super Admins.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Warning */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="py-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium">Important</p>
                  <p className="text-amber-200/80 mt-1">
                    The new owner will have full control over this brand, including team management, 
                    campaigns, and settings. This action is logged for audit purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Select new owner */}
            <div className="space-y-2">
              <Label>New Brand Owner</Label>
              {loadingOwners ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : potentialOwners.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No eligible users found. Users must have a "brand" role to become owners.
                </p>
              ) : (
                <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialOwners.map((owner) => (
                      <SelectItem key={owner.user_id} value={owner.user_id}>
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          <span>{owner.email}</span>
                          {owner.name && (
                            <span className="text-muted-foreground">({owner.name})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
              disabled={transferOwnership.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmTransfer}
              disabled={!selectedNewOwner || transferOwnership.isPending}
              className="gap-2"
            >
              {transferOwnership.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}
