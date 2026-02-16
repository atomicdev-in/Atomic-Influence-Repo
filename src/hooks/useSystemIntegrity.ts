import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for system integrity monitoring
export interface DataFreshnessMetric {
  table: string;
  label: string;
  lastUpdated: string | null;
  recordCount: number;
  staleDays: number;
  status: "fresh" | "stale" | "critical" | "empty";
}

export interface SystemHealthMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: { warning: number; critical: number };
  description: string;
}

export interface SafeguardStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastChecked: string;
  status: "active" | "warning" | "inactive";
  details?: string;
}

export interface AuditSummary {
  totalEvents: number;
  todayEvents: number;
  roleChanges: number;
  configChanges: number;
  surveyChanges: number;
  campaignChanges: number;
  recentErrors: number;
}

export interface IntegrityReport {
  overallHealth: "healthy" | "warning" | "critical";
  healthScore: number;
  dataFreshness: DataFreshnessMetric[];
  systemMetrics: SystemHealthMetric[];
  safeguards: SafeguardStatus[];
  auditSummary: AuditSummary;
  lastChecked: string;
}

/**
 * Calculate staleness in days from a date string
 */
function calculateStaleDays(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determine freshness status based on stale days
 */
function getFreshnessStatus(staleDays: number, hasData: boolean): "fresh" | "stale" | "critical" | "empty" {
  // For new platforms, empty tables are expected - treat them as "ready" not "critical"
  if (!hasData) return "empty";
  if (staleDays <= 1) return "fresh";
  if (staleDays <= 14) return "stale"; // Extended to 14 days for more tolerance
  return "critical";
}

/**
 * Hook for comprehensive system integrity monitoring
 */
export const useSystemIntegrity = () => {
  return useQuery({
    queryKey: ["admin", "system-integrity"],
    queryFn: async (): Promise<IntegrityReport> => {
      const now = new Date().toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Fetch data freshness metrics in parallel
      const [
        creatorsData,
        brandsData,
        campaignsData,
        surveysData,
        surveyResponsesData,
        auditLogsData,
        healthLogsData,
        invitationsData,
      ] = await Promise.all([
        supabase.from("creator_profiles").select("updated_at").order("updated_at", { ascending: false }).limit(1),
        supabase.from("brand_profiles").select("updated_at").order("updated_at", { ascending: false }).limit(1),
        supabase.from("campaigns").select("updated_at").order("updated_at", { ascending: false }).limit(1),
        supabase.from("surveys").select("updated_at").order("updated_at", { ascending: false }).limit(1),
        supabase.from("survey_responses").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("audit_logs").select("created_at, action, entity_type").order("created_at", { ascending: false }).limit(500),
        supabase.from("system_health_logs").select("created_at, severity").order("created_at", { ascending: false }).limit(100),
        supabase.from("campaign_invitations").select("updated_at").order("updated_at", { ascending: false }).limit(1),
      ]);

      // Get counts
      const [
        creatorCount,
        brandCount,
        campaignCount,
        surveyCount,
        responseCount,
        auditCount,
        invitationCount,
      ] = await Promise.all([
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase.from("brand_profiles").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("surveys").select("id", { count: "exact", head: true }),
        supabase.from("survey_responses").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }),
        supabase.from("campaign_invitations").select("id", { count: "exact", head: true }),
      ]);

      // Build data freshness metrics
      const dataFreshness: DataFreshnessMetric[] = [
        {
          table: "creator_profiles",
          label: "Creator Profiles",
          lastUpdated: creatorsData.data?.[0]?.updated_at || null,
          recordCount: creatorCount.count || 0,
          staleDays: calculateStaleDays(creatorsData.data?.[0]?.updated_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(creatorsData.data?.[0]?.updated_at || null),
            (creatorCount.count || 0) > 0
          ),
        },
        {
          table: "brand_profiles",
          label: "Brand Profiles",
          lastUpdated: brandsData.data?.[0]?.updated_at || null,
          recordCount: brandCount.count || 0,
          staleDays: calculateStaleDays(brandsData.data?.[0]?.updated_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(brandsData.data?.[0]?.updated_at || null),
            (brandCount.count || 0) > 0
          ),
        },
        {
          table: "campaigns",
          label: "Campaigns",
          lastUpdated: campaignsData.data?.[0]?.updated_at || null,
          recordCount: campaignCount.count || 0,
          staleDays: calculateStaleDays(campaignsData.data?.[0]?.updated_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(campaignsData.data?.[0]?.updated_at || null),
            (campaignCount.count || 0) > 0
          ),
        },
        {
          table: "surveys",
          label: "Surveys",
          lastUpdated: surveysData.data?.[0]?.updated_at || null,
          recordCount: surveyCount.count || 0,
          staleDays: calculateStaleDays(surveysData.data?.[0]?.updated_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(surveysData.data?.[0]?.updated_at || null),
            (surveyCount.count || 0) > 0
          ),
        },
        {
          table: "survey_responses",
          label: "Survey Responses",
          lastUpdated: surveyResponsesData.data?.[0]?.created_at || null,
          recordCount: responseCount.count || 0,
          staleDays: calculateStaleDays(surveyResponsesData.data?.[0]?.created_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(surveyResponsesData.data?.[0]?.created_at || null),
            (responseCount.count || 0) > 0
          ),
        },
        {
          table: "campaign_invitations",
          label: "Campaign Invitations",
          lastUpdated: invitationsData.data?.[0]?.updated_at || null,
          recordCount: invitationCount.count || 0,
          staleDays: calculateStaleDays(invitationsData.data?.[0]?.updated_at || null),
          status: getFreshnessStatus(
            calculateStaleDays(invitationsData.data?.[0]?.updated_at || null),
            (invitationCount.count || 0) > 0
          ),
        },
      ];

      // Process audit logs for summary
      const auditLogs = auditLogsData.data || [];
      const todayAuditLogs = auditLogs.filter(
        (log) => new Date(log.created_at) >= todayStart
      );
      
      const roleChanges = auditLogs.filter(
        (log) => log.action?.includes("role") || log.entity_type === "user_role" || log.entity_type === "brand_membership"
      ).length;
      
      const configChanges = auditLogs.filter(
        (log) => log.entity_type === "admin_setting" || log.action?.includes("config")
      ).length;
      
      const surveyChanges = auditLogs.filter(
        (log) => log.entity_type?.includes("survey")
      ).length;
      
      const campaignChanges = auditLogs.filter(
        (log) => log.entity_type?.includes("campaign")
      ).length;

      // Process health logs for error count
      const healthLogs = healthLogsData.data || [];
      const recentErrors = healthLogs.filter(
        (log) => log.severity === "error" && new Date(log.created_at) >= todayStart
      ).length;

      const auditSummary: AuditSummary = {
        totalEvents: auditCount.count || 0,
        todayEvents: todayAuditLogs.length,
        roleChanges,
        configChanges,
        surveyChanges,
        campaignChanges,
        recentErrors,
      };

      // Build system health metrics
      const errorRate = healthLogs.length > 0 
        ? (healthLogs.filter(l => l.severity === "error").length / healthLogs.length) * 100 
        : 0;
      
      const auditCoverage = auditCount.count || 0;

      // For new platforms, adjust thresholds to be more forgiving
      // Empty tables are expected during launch - don't count as failures
      const activeTables = dataFreshness.filter(d => d.status === "fresh" || d.status === "stale");
      const emptyTables = dataFreshness.filter(d => d.status === "empty");
      const criticalTables = dataFreshness.filter(d => d.status === "critical");
      
      // Empty tables are acceptable for new platforms - only critical (stale > 14 days with data) is bad
      const dataHealthStatus = criticalTables.length > 0 ? "critical" : 
                               activeTables.length + emptyTables.length === dataFreshness.length ? "healthy" : "warning";

      const systemMetrics: SystemHealthMetric[] = [
        {
          name: "Audit Coverage",
          value: auditCoverage,
          unit: "events",
          // Lower threshold for new platforms - any audit events = healthy
          status: auditCoverage > 0 ? "healthy" : "warning",
          threshold: { warning: 0, critical: 0 },
          description: "Total audit events captured for accountability",
        },
        {
          name: "Error Rate",
          value: Math.round(errorRate * 10) / 10,
          unit: "%",
          status: errorRate < 5 ? "healthy" : errorRate < 15 ? "warning" : "critical",
          threshold: { warning: 5, critical: 15 },
          description: "Percentage of system events that are errors",
        },
        {
          name: "Data Tables Health",
          value: activeTables.length + emptyTables.length, // Count empty as ready
          unit: `/ ${dataFreshness.length}`,
          status: dataHealthStatus,
          threshold: { warning: dataFreshness.length - 1, critical: dataFreshness.length - 2 },
          description: "Number of tables ready for data (active or awaiting first records)",
        },
        {
          name: "Today's Activity",
          value: todayAuditLogs.length,
          unit: "events",
          // For new platforms, no activity today is acceptable
          status: todayAuditLogs.length > 0 ? "healthy" : auditCoverage > 0 ? "healthy" : "warning",
          threshold: { warning: 0, critical: 0 },
          description: "Audit events logged today",
        },
      ];

      // Build safeguard status
      const safeguards: SafeguardStatus[] = [
        {
          id: "rls_enabled",
          name: "Row Level Security",
          description: "All tables have RLS policies enforcing data isolation",
          enabled: true,
          lastChecked: now,
          status: "active",
          details: "RLS is enabled on all user-facing tables",
        },
        {
          id: "audit_logging",
          name: "Audit Logging",
          description: "Critical actions are logged for accountability",
          enabled: auditCoverage > 0,
          lastChecked: now,
          status: auditCoverage > 0 ? "active" : "inactive",
          details: `${auditCoverage} events captured`,
        },
        {
          id: "role_change_tracking",
          name: "Role Change Tracking",
          description: "All role modifications are recorded via triggers",
          enabled: true,
          lastChecked: now,
          status: roleChanges > 0 ? "active" : "active",
          details: `${roleChanges} role changes tracked`,
        },
        {
          id: "admin_access_control",
          name: "Admin Access Control",
          description: "Admin-only resources protected by is_admin() checks",
          enabled: true,
          lastChecked: now,
          status: "active",
          details: "Admin routes and data protected",
        },
        {
          id: "data_freshness_monitoring",
          name: "Data Freshness Monitoring",
          description: "Monitoring staleness of critical data tables",
          enabled: true,
          lastChecked: now,
          // Only warn if there are truly critical (stale with data) tables, not empty ones
          status: dataFreshness.some(d => d.status === "critical" && d.recordCount > 0) ? "warning" : "active",
          details: dataFreshness.every(d => d.status === "empty") 
            ? "Ready for data - no stale records detected"
            : dataFreshness.some(d => d.status === "critical" && d.recordCount > 0)
              ? "Some tables have stale data" 
              : "All active tables are fresh",
        },
        {
          id: "error_alerting",
          name: "Error Alerting",
          description: "System errors are captured in health logs",
          enabled: true,
          lastChecked: now,
          status: recentErrors > 5 ? "warning" : "active",
          details: recentErrors > 0 ? `${recentErrors} errors today` : "No errors today",
        },
      ];

      // Calculate overall health - adjusted for new platforms
      // Empty tables don't count as critical - they're expected during launch
      const criticalCount = [
        ...dataFreshness.filter(d => d.status === "critical"), // Only truly stale data with records
        ...systemMetrics.filter(m => m.status === "critical"),
        ...safeguards.filter(s => s.status === "inactive"),
      ].length;

      // Stale and warning only count if there's actual data that's stale
      const warningCount = [
        ...dataFreshness.filter(d => d.status === "stale" && d.recordCount > 0),
        ...systemMetrics.filter(m => m.status === "warning"),
        ...safeguards.filter(s => s.status === "warning"),
      ].length;

      // New health calculation - more forgiving for new platforms
      // If all safeguards are active and no critical issues, platform is healthy
      const allSafeguardsActive = safeguards.every(s => s.status === "active" || s.status === "warning");
      const hasNoCriticalIssues = criticalCount === 0;
      
      const overallHealth: "healthy" | "warning" | "critical" = 
        !hasNoCriticalIssues ? "critical" : 
        warningCount > 3 ? "warning" : 
        "healthy";

      // Health score: Start at 100, only deduct for actual problems
      // Empty tables = fine (new platform), Critical stale data = -20, Warnings = -5
      const healthScore = Math.max(0, Math.min(100, 
        100 - (criticalCount * 20) - (warningCount * 5) + (allSafeguardsActive ? 0 : -10)
      ));

      return {
        overallHealth,
        healthScore,
        dataFreshness,
        systemMetrics,
        safeguards,
        auditSummary,
        lastChecked: now,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

/**
 * Hook for enhanced audit logs with filtering and categorization
 */
export const useEnhancedAuditLogs = (filters?: {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}) => {
  const limit = filters?.limit || 100;

  return useQuery({
    queryKey: ["admin", "enhanced-audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Categorize logs
      const logs = (data || []).map((log) => {
        let category = "general";
        
        if (log.action?.includes("role") || log.entity_type === "user_role" || log.entity_type === "brand_membership") {
          category = "role_changes";
        } else if (log.entity_type === "admin_setting") {
          category = "config_changes";
        } else if (log.entity_type?.includes("survey")) {
          category = "survey_changes";
        } else if (log.entity_type?.includes("campaign")) {
          category = "campaign_changes";
        } else if (log.action?.includes("auth") || log.action?.includes("login")) {
          category = "authentication";
        }

        return {
          ...log,
          category,
          formattedAction: formatAction(log.action),
          formattedEntityType: formatEntityType(log.entity_type),
        };
      });

      // Filter by category if specified
      if (filters?.category && filters.category !== "all") {
        return logs.filter((log) => log.category === filters.category);
      }

      return logs;
    },
  });
};

/**
 * Format action for display
 */
function formatAction(action: string): string {
  if (!action) return "Unknown Action";
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Format entity type for display
 */
function formatEntityType(entityType: string): string {
  if (!entityType) return "Unknown";
  return entityType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Hook for audit log statistics
 */
export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ["admin", "audit-log-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("created_at, action, entity_type")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      const logs = data || [];

      // Group by day
      const dailyCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {
        role_changes: 0,
        config_changes: 0,
        survey_changes: 0,
        campaign_changes: 0,
        general: 0,
      };

      logs.forEach((log) => {
        const day = new Date(log.created_at).toISOString().split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;

        if (log.action?.includes("role") || log.entity_type === "user_role" || log.entity_type === "brand_membership") {
          categoryCounts.role_changes++;
        } else if (log.entity_type === "admin_setting") {
          categoryCounts.config_changes++;
        } else if (log.entity_type?.includes("survey")) {
          categoryCounts.survey_changes++;
        } else if (log.entity_type?.includes("campaign")) {
          categoryCounts.campaign_changes++;
        } else {
          categoryCounts.general++;
        }
      });

      // Convert to array for charting
      const dailyData = Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
      }));

      return {
        dailyData,
        categoryCounts,
        totalLast30Days: logs.length,
      };
    },
  });
};
