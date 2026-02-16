import { ReactNode } from "react";
import { UnifiedDashboardLayout } from "@/components/UnifiedDashboardLayout";

interface BrandDashboardLayoutProps {
  children: ReactNode;
}

/**
 * Brand-specific dashboard layout wrapper.
 * Uses the unified dashboard architecture with brand-specific navigation and styling.
 */
export function BrandDashboardLayout({ children }: BrandDashboardLayoutProps) {
  return (
    <UnifiedDashboardLayout variant="brand">
      {children}
    </UnifiedDashboardLayout>
  );
}
