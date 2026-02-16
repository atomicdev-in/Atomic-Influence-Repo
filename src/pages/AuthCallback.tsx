import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * OAuth Callback Handler
 * Handles the redirect after OAuth sign-in and routes users appropriately:
 * - New users (no role) -> role selection page
 * - Existing creators -> creator dashboard
 * - Existing brands -> brand dashboard
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Wait for auth and role to load
    if (authLoading || roleLoading) return;

    if (!isAuthenticated) {
      // Not authenticated, go to login
      navigate("/login", { replace: true });
      return;
    }

    // If user has a role (including auto-assigned from tenant rules), route them directly
    if (role) {
      // Clear any stored signup intent since role is already assigned
      localStorage.removeItem("signup_role");
      localStorage.removeItem("signup_email");
      
      if (role === "admin") {
        // Admin user (may be auto-assigned via tenant rules like bluecloudai)
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "brand") {
        navigate("/brand/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      return;
    }

    // No role assigned yet - check if there's a stored role intent from brand signup
    const storedRole = localStorage.getItem("signup_role");
    
    if (storedRole) {
      // Has signup intent, go to role select to process it
      navigate("/auth/role-select", { replace: true });
      return;
    }

    // New user with no auto-assigned role, needs to select role manually
    navigate("/auth/role-select", { replace: true });
  }, [isAuthenticated, authLoading, role, roleLoading, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
