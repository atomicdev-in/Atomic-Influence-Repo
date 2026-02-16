import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Restrict to specific role. If not set, any authenticated user can access */
  requiredRole?: "creator" | "brand";
}

/**
 * Returns the appropriate dashboard route for a given role
 */
const getDashboardForRole = (role: string | null): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "brand":
      return "/brand/dashboard";
    case "creator":
    default:
      return "/dashboard";
  }
};

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  // Show loading while checking auth status
  if (authLoading || (isAuthenticated && roleLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no role yet - redirect to role selection
  if (!role) {
    return <Navigate to="/auth/role-select" replace />;
  }

  // Admin users can access anything, redirect them to admin dashboard if hitting wrong routes
  if (role === "admin") {
    // If admin tries to access creator/brand specific routes, redirect to admin
    if (requiredRole) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Otherwise allow access (generic protected routes)
    return <>{children}</>;
  }

  // Role-specific access check for non-admin users
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={getDashboardForRole(role)} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If authenticated, check role and redirect appropriately
    if (roleLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    // No role yet - go to role selection
    if (!role) {
      return <Navigate to="/auth/role-select" replace />;
    }

    // Redirect based on role (including admin)
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from || getDashboardForRole(role)} replace />;
  }

  return <>{children}</>;
};