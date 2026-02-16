import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper that ensures only admin users can access.
 * Redirects non-admin users to their appropriate dashboard based on role.
 */
export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const location = useLocation();

  // Show loading while checking auth status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          <p className="text-muted-foreground text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not an admin - redirect to appropriate dashboard
  if (!isAdmin) {
    // We could check their actual role here, but for security, just send to login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
