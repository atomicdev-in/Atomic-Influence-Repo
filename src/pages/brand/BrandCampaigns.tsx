import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { CampaignListSkeleton } from "@/components/ui/page-skeleton";
import { Megaphone, Plus, Search, Filter, Users, Calendar, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoleBasedCampaigns } from "@/hooks/useRoleBasedCampaigns";
import { useBrandRoles } from "@/hooks/useBrandRoles";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/formatters";
import { EmptyState, emptyCampaigns } from "@/components/ui/empty-state";
import { toast } from "sonner";

const BrandCampaignsContent = () => {
  const navigate = useNavigate();
  const { campaigns, isLoading, deleteCampaign } = useRoleBasedCampaigns();
  const { currentUserRole, isOwner, isAdmin } = useBrandRoles();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // Map real campaigns to display format
  const allCampaigns = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status as 'draft' | 'discovery' | 'active' | 'reviewing' | 'completed',
    budget: c.total_budget,
    spent: c.allocated_budget,
    creatorCount: c.influencer_count,
    startDate: c.timeline_start || '',
    endDate: c.timeline_end || '',
    thumbnail: c.thumbnail_url || '',
    category: c.category,
  }));

  const filteredCampaigns = allCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          campaign.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const campaignStats = {
    active: allCampaigns.filter(c => ['active', 'discovery'].includes(c.status)).length,
    draft: allCampaigns.filter(c => c.status === 'draft').length,
    completed: allCampaigns.filter(c => c.status === 'completed').length,
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    
    const success = await deleteCampaign(campaignToDelete);
    if (success) {
      toast.success("Campaign deleted");
    } else {
      toast.error("Deletion failed");
    }
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  const handleViewDetails = (campaignId: string) => {
    navigate(`/brand/campaigns/${campaignId}`);
  };

  if (isLoading) {
    return <CampaignListSkeleton />;
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader
          title="Campaigns"
          subtitle={currentUserRole === 'campaign_manager' 
            ? "View and manage your assigned campaigns" 
            : "Create and manage your influencer campaigns"
          }
          icon={Megaphone}
          action={
            (isOwner || isAdmin) && (
              <Button className="gap-2" asChild>
                <Link to="/brand/campaigns/create">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            )
          }
        />

        {/* Campaign Stats */}
        <SectionErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Active", count: campaignStats.active, color: "text-emerald-500" },
              { label: "Draft", count: campaignStats.draft, color: "text-muted-foreground" },
              { label: "Completed", count: campaignStats.completed, color: "text-primary" },
            ].map((status) => (
              <div
                key={status.label}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-center"
              >
                <div className={`text-3xl font-bold mb-1 ${status.color}`}>{status.count}</div>
                <span className="text-sm font-medium text-muted-foreground">{status.label} Campaigns</span>
              </div>
            ))}
          </div>
        </SectionErrorBoundary>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name or category..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns List */}
        <SectionErrorBoundary>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Campaigns ({filteredCampaigns.length})</h3>
            </div>
            
            {filteredCampaigns.length === 0 ? (
              allCampaigns.length === 0 ? (
                <EmptyState
                  {...emptyCampaigns}
                  action={
                    (isOwner || isAdmin) ? {
                      label: "Create Campaign",
                      onClick: () => navigate("/brand/campaigns/create"),
                    } : undefined
                  }
                />
              ) : (
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns match filters"
                  description="Adjust your search or filter criteria to see results."
                  action={{
                    label: "Clear Filters",
                    onClick: () => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    },
                  }}
                />
              )
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => {
                  const progress = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
                  return (
                    <div
                      key={campaign.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/30 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(campaign.id)}
                    >
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <Megaphone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {campaign.creatorCount} creators
                          </span>
                          {campaign.startDate && campaign.endDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                            </span>
                          )}
                          <span>{campaign.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="min-w-[140px]">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(campaign.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCampaignToDelete(campaign.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All associated invitations and tracking links will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const BrandCampaigns = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandCampaignsContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandCampaigns;
