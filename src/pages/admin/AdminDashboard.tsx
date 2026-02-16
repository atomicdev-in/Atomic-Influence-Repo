import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdminDashboardStats, useAdminAuditLogs } from "@/hooks/useAdminData";
import { useSystemIntegrity } from "@/hooks/useSystemIntegrity";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Megaphone, 
  ClipboardList, 
  TrendingUp, 
  Activity,
  Shield,
  Brain,
  Settings,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getHealthIcon = (status: string) => {
  switch (status) {
    case "healthy": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "critical": return <AlertCircle className="h-5 w-5 text-red-500" />;
    default: return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
};

const getHealthBadge = (status: string) => {
  switch (status) {
    case "healthy": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Healthy</Badge>;
    case "warning": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Warning</Badge>;
    case "critical": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Critical</Badge>;
    default: return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminDashboardStats();
  const { data: auditLogs, isLoading: auditLoading } = useAdminAuditLogs(5);
  const { data: integrity, isLoading: integrityLoading } = useSystemIntegrity();

  const isLoading = statsLoading || integrityLoading;

  if (isLoading) {
    return <AdminDashboardLayout><DashboardSkeleton /></AdminDashboardLayout>;
  }

  const statCards = [
    { title: "Total Creators", value: stats?.totalCreators || 0, icon: Users, color: "text-blue-400", href: "/admin/creators" },
    { title: "Total Brands", value: stats?.totalBrands || 0, icon: Building2, color: "text-purple-400", href: "/admin/brands" },
    { title: "Total Campaigns", value: stats?.totalCampaigns || 0, icon: Megaphone, color: "text-green-400", href: "/admin/campaigns" },
    { title: "Active Campaigns", value: stats?.activeCampaigns || 0, icon: TrendingUp, color: "text-amber-400", href: "/admin/campaigns" },
    { title: "Total Surveys", value: stats?.totalSurveys || 0, icon: ClipboardList, color: "text-cyan-400", href: "/admin/surveys" },
    { title: "Survey Responses", value: stats?.totalSurveyResponses || 0, icon: Activity, color: "text-rose-400", href: "/admin/surveys" },
  ];

  const quickLinks = [
    { title: "User Management", description: "Manage roles and permissions", icon: Users, href: "/admin/users", color: "bg-blue-500/10 text-blue-400" },
    { title: "Creator Intelligence", description: "View creator insights and scores", icon: Users, href: "/admin/creators", color: "bg-green-500/10 text-green-400" },
    { title: "Brand Intelligence", description: "Monitor brand health and risks", icon: Building2, href: "/admin/brands", color: "bg-purple-500/10 text-purple-400" },
    { title: "Matching Algorithm", description: "AI matching insights", icon: Brain, href: "/admin/matching", color: "bg-amber-500/10 text-amber-400" },
    { title: "System Health", description: "Audit logs and safeguards", icon: Shield, href: "/admin/system-health", color: "bg-cyan-500/10 text-cyan-400" },
    { title: "Platform Settings", description: "Configure platform behavior", icon: Settings, href: "/admin/settings", color: "bg-slate-500/10 text-slate-400" },
  ];

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <AdminDashboardLayout title="Overview" onRefresh={async () => { await refetchStats(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Admin Dashboard" 
              subtitle="Platform governance and oversight control center"
            />

            {/* System Health Banner */}
            <Card className={`border ${
              integrity?.overallHealth === "healthy" ? "border-green-500/30 bg-green-500/5" :
              integrity?.overallHealth === "warning" ? "border-amber-500/30 bg-amber-500/5" :
              "border-red-500/30 bg-red-500/5"
            }`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getHealthIcon(integrity?.overallHealth || "unknown")}
                    <div>
                      <p className="font-medium">System Status</p>
                      <p className="text-sm text-muted-foreground">
                        Health Score: {integrity?.healthScore || 0}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getHealthBadge(integrity?.overallHealth || "unknown")}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/admin/system-health")}
                    >
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat) => (
                <Card 
                  key={stat.title} 
                  className="bg-card/50 backdrop-blur-sm border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                  onClick={() => navigate(stat.href)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Access Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link) => (
                  <Card 
                    key={link.title}
                    className="bg-card/50 backdrop-blur-sm border-white/10 cursor-pointer hover:border-white/20 transition-all hover:scale-[1.02] group"
                    onClick={() => navigate(link.href)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${link.color}`}>
                          <link.icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="font-medium mt-3">{link.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/admin/system-health")}
                    >
                      View All
                    </Button>
                  </div>
                  <CardDescription>Latest audit trail entries</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : !auditLogs?.length ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-primary/10">
                              <Activity className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{formatAction(log.action)}</p>
                              <p className="text-xs text-muted-foreground">{log.entity_type}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Platform Health</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/admin/system-health")}
                    >
                      Details
                    </Button>
                  </div>
                  <CardDescription>Data freshness and safeguards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Data Freshness Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Freshness</span>
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          {integrity?.dataFreshness?.filter(d => d.status === "fresh").length || 0} / {integrity?.dataFreshness?.length || 0} Fresh
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ 
                            width: `${((integrity?.dataFreshness?.filter(d => d.status === "fresh").length || 0) / (integrity?.dataFreshness?.length || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Safeguards Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Security Safeguards</span>
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          {integrity?.safeguards?.filter(s => s.status === "active").length || 0} / {integrity?.safeguards?.length || 0} Active
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ 
                            width: `${((integrity?.safeguards?.filter(s => s.status === "active").length || 0) / (integrity?.safeguards?.length || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Last Check */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-sm text-muted-foreground">Last checked</span>
                      <span className="text-sm">
                        {integrity?.lastChecked 
                          ? formatDistanceToNow(new Date(integrity.lastChecked), { addSuffix: true })
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Need Help?</p>
                      <p className="text-sm text-muted-foreground">
                        Access documentation and support resources
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/admin/help")}
                  >
                    View Help Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
