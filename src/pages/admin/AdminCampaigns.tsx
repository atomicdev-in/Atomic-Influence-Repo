import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useAdminCampaigns } from "@/hooks/useAdminData";
import { CampaignListSkeleton } from "@/components/ui/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  discovery: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  reviewing: "bg-amber-500/20 text-amber-400",
  completed: "bg-purple-500/20 text-purple-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminCampaigns() {
  const { data: campaigns, isLoading, refetch } = useAdminCampaigns();

  if (isLoading) {
    return <AdminDashboardLayout><CampaignListSkeleton /></AdminDashboardLayout>;
  }

  return (
    <AdminDashboardLayout title="Campaigns" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Campaigns (Read-Only)" 
              subtitle="Platform-wide campaign oversight — no execution actions available"
            />

            {/* Read-only notice */}
            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="py-3 flex items-center gap-3">
                <Eye className="h-5 w-5 text-orange-400" />
                <p className="text-sm text-orange-200">
                  This view is read-only for governance purposes. Campaign management is handled by brand owners.
                </p>
              </CardContent>
            </Card>

            {!campaigns?.length ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="Campaigns will appear here once brands create them."
              />
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{campaign.category}</p>
                        </div>
                        <Badge className={statusColors[campaign.status] || "bg-gray-500/20"}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-medium">{formatCurrency(campaign.total_budget)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Influencers</p>
                          <p className="font-medium">{campaign.influencer_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Timeline</p>
                          <p className="font-medium">
                            {campaign.timeline_start ? new Date(campaign.timeline_start).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">{new Date(campaign.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
