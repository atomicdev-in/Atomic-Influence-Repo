import { ReactNode } from "react";
import { UnifiedDashboardLayout } from "@/components/UnifiedDashboardLayout";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  onRefresh?: () => Promise<void>;
}

/**
 * Creator-specific dashboard layout wrapper.
 * Uses the unified dashboard architecture with creator-specific navigation and styling.
 */
export function DashboardLayout({ children, title, onRefresh }: DashboardLayoutProps) {
  return (
    <UnifiedDashboardLayout variant="creator" title={title} onRefresh={onRefresh}>
      {children}
    </UnifiedDashboardLayout>
  );
}
