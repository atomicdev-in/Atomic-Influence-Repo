import { useState } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useSystemIntegrity, useEnhancedAuditLogs, useAuditLogStats } from "@/hooks/useSystemIntegrity";
import { CardListSkeleton } from "@/components/ui/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database,
  Clock,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Megaphone,
  RefreshCw,
  Eye,
  Lock,
  Server,
  Gauge
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSystemHealth() {
  const [auditCategory, setAuditCategory] = useState<string>("all");
  const { data: integrity, isLoading: integrityLoading, refetch: refetchIntegrity } = useSystemIntegrity();
  const { data: auditLogs, isLoading: auditLoading } = useEnhancedAuditLogs({ 
    category: auditCategory,
    limit: 100 
  });
  const { data: auditStats, isLoading: statsLoading } = useAuditLogStats();

  const isLoading = integrityLoading;

  if (isLoading) {
    return <AdminDashboardLayout><CardListSkeleton count={4} /></AdminDashboardLayout>;
  }

  const getHealthIcon = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-6 w-6 text-green-400" />;
      case "warning": return <AlertTriangle className="h-6 w-6 text-amber-400" />;
      case "critical": return <XCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const getHealthColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy": return "bg-green-500/10 border-green-500/30 text-green-400";
      case "warning": return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "critical": return "bg-red-500/10 border-red-500/30 text-red-400";
    }
  };

  const getFreshnessColor = (status: "fresh" | "stale" | "critical" | "empty") => {
    switch (status) {
      case "fresh": return "bg-green-500/20 text-green-400";
      case "stale": return "bg-amber-500/20 text-amber-400";
      case "critical": return "bg-red-500/20 text-red-400";
      case "empty": return "bg-muted text-muted-foreground";
    }
  };

  const getSafeguardIcon = (id: string) => {
    switch (id) {
      case "rls_enabled": return <Lock className="h-4 w-4" />;
      case "audit_logging": return <FileText className="h-4 w-4" />;
      case "role_change_tracking": return <Users className="h-4 w-4" />;
      case "admin_access_control": return <Shield className="h-4 w-4" />;
      case "data_freshness_monitoring": return <Database className="h-4 w-4" />;
      case "error_alerting": return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "role_changes": return <Users className="h-4 w-4 text-purple-400" />;
      case "config_changes": return <Settings className="h-4 w-4 text-blue-400" />;
      case "survey_changes": return <FileText className="h-4 w-4 text-cyan-400" />;
      case "campaign_changes": return <Megaphone className="h-4 w-4 text-green-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AdminDashboardLayout title="System Health" onRefresh={async () => { await refetchIntegrity(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="System Integrity & Auditing" 
              subtitle="Platform health, accountability, and safeguards"
            />

            {/* Overall Health Banner */}
            <Card className={`${getHealthColor(integrity?.overallHealth || "healthy")} border`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getHealthIcon(integrity?.overallHealth || "healthy")}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {integrity?.overallHealth === "healthy" && "All Systems Operational"}
                        {integrity?.overallHealth === "warning" && "Some Attention Needed"}
                        {integrity?.overallHealth === "critical" && "Critical Issues Detected"}
                      </h3>
                      <p className="text-sm opacity-80">
                        Health Score: {integrity?.healthScore || 0}/100 • 
                        Last checked: {integrity?.lastChecked ? formatDistanceToNow(new Date(integrity.lastChecked), { addSuffix: true }) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchIntegrity()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Interface */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-background/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Audit Trail</span>
                </TabsTrigger>
                <TabsTrigger value="freshness" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Data Freshness</span>
                </TabsTrigger>
                <TabsTrigger value="safeguards" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Safeguards</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Audit Events</p>
                          <p className="text-2xl font-bold">{integrity?.auditSummary.totalEvents.toLocaleString()}</p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Today's Events</p>
                          <p className="text-2xl font-bold">{integrity?.auditSummary.todayEvents || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Role Changes</p>
                          <p className="text-2xl font-bold">{integrity?.auditSummary.roleChanges || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Errors Today</p>
                          <p className="text-2xl font-bold text-red-400">{integrity?.auditSummary.recentErrors || 0}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Metrics */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Metrics
                    </CardTitle>
                    <CardDescription>Key performance and health indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {integrity?.systemMetrics.map((metric) => (
                        <div 
                          key={metric.name}
                          className="p-4 rounded-lg bg-background/50 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <Badge variant={
                              metric.status === "healthy" ? "outline" : 
                              metric.status === "warning" ? "secondary" : "destructive"
                            }>
                              {metric.status}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-bold">{metric.value}</span>
                            <span className="text-sm text-muted-foreground">{metric.unit}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Category Breakdown */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Activity Breakdown (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(auditStats?.categoryCounts || {}).map(([category, count]) => {
                          const total = auditStats?.totalLast30Days || 1;
                          const percentage = Math.round((count / total) * 100);
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(category)}
                                  <span className="capitalize">{category.replace(/_/g, " ")}</span>
                                </div>
                                <span className="text-muted-foreground">{count} ({percentage}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audit Trail Tab */}
              <TabsContent value="audit" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Audit Trail
                        </CardTitle>
                        <CardDescription>Complete log of system changes and critical actions</CardDescription>
                      </div>
                      <Select value={auditCategory} onValueChange={setAuditCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="role_changes">Role Changes</SelectItem>
                          <SelectItem value="config_changes">Config Changes</SelectItem>
                          <SelectItem value="survey_changes">Survey Changes</SelectItem>
                          <SelectItem value="campaign_changes">Campaign Changes</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {auditLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
                    ) : !auditLogs?.length ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No audit events found</p>
                        <p className="text-sm">Events will appear here as users take actions</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {auditLogs.map((log) => (
                            <div 
                              key={log.id}
                              className="p-3 rounded-lg bg-background/50 border border-white/5 hover:border-white/10 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  {getCategoryIcon(log.category)}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {log.formattedAction}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {log.formattedEntityType}
                                      {log.entity_id && ` • ${log.entity_id.slice(0, 8)}...`}
                                    </p>
                                    {(log.old_value || log.new_value) && (
                                      <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted/50 rounded p-2">
                                        {log.old_value && (
                                          <div className="text-red-400/70">
                                            - {JSON.stringify(log.old_value)}
                                          </div>
                                        )}
                                        {log.new_value && (
                                          <div className="text-green-400/70">
                                            + {JSON.stringify(log.new_value)}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <Badge variant="outline" className="text-xs mb-1">
                                    {log.category.replace(/_/g, " ")}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Freshness Tab */}
              <TabsContent value="freshness" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Data Freshness Monitor
                    </CardTitle>
                    <CardDescription>Track when critical data tables were last updated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {integrity?.dataFreshness.map((metric) => (
                        <div 
                          key={metric.table}
                          className="p-4 rounded-lg bg-background/50 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Database className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{metric.label}</p>
                                <p className="text-xs text-muted-foreground font-mono">{metric.table}</p>
                              </div>
                            </div>
                            <Badge className={getFreshnessColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Records</p>
                              <p className="font-medium">{metric.recordCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Last Updated</p>
                              <p className="font-medium">
                                {metric.lastUpdated 
                                  ? formatDistanceToNow(new Date(metric.lastUpdated), { addSuffix: true })
                                  : "Never"
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Days Stale</p>
                              <p className="font-medium">
                                {metric.staleDays === Infinity ? "N/A" : metric.staleDays}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Safeguards Tab */}
              <TabsContent value="safeguards" className="space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Platform Safeguards
                    </CardTitle>
                    <CardDescription>Security measures and integrity checks protecting the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {integrity?.safeguards.map((safeguard) => (
                        <div 
                          key={safeguard.id}
                          className={`p-4 rounded-lg border ${
                            safeguard.status === "active" 
                              ? "bg-green-500/5 border-green-500/20" 
                              : safeguard.status === "warning"
                                ? "bg-amber-500/5 border-amber-500/20"
                                : "bg-red-500/5 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                safeguard.status === "active" 
                                  ? "bg-green-500/20 text-green-400" 
                                  : safeguard.status === "warning"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}>
                                {getSafeguardIcon(safeguard.id)}
                              </div>
                              <div>
                                <p className="font-medium">{safeguard.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {safeguard.description}
                                </p>
                                {safeguard.details && (
                                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                                    {safeguard.details}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {safeguard.status === "active" && (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              )}
                              {safeguard.status === "warning" && (
                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                              )}
                              {safeguard.status === "inactive" && (
                                <XCircle className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Governance Summary */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle>Governance Summary</CardTitle>
                    <CardDescription>How the platform maintains standards and accountability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Data Protection
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Row Level Security on all user tables
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Admin-only access to sensitive data
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            User data isolation enforced at DB level
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Accountability
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Automatic audit logging via triggers
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Role change tracking with history
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Campaign assignment audit trail
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Monitoring
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Real-time data freshness tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Error rate monitoring
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            System health logging
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          Platform Standards
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Survey-informed creator matching
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Anti-gaming measures in scoring
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Transparent intelligence layers
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
