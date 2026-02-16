import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Building2, ArrowRight, Loader2 } from "lucide-react";
import { BrandWordmark } from "@/components/BrandWordmark";
import { supabase } from "@/integrations/supabase/client";
import authBackground from "@/assets/auth-background.png";

/**
 * Role Selection Page
 * Shown to all new users after signup (email/password or OAuth)
 * who don't have a role assigned yet.
 */
const OAuthRoleSelect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, setRole } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<"creator" | "brand" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user already has a role (including auto-assigned admin)
  useEffect(() => {
    if (!authLoading && !roleLoading && role) {
      // Clear any stored signup intent
      localStorage.removeItem("signup_role");
      localStorage.removeItem("signup_email");
      
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "brand") {
        navigate("/brand/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [role, authLoading, roleLoading, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleRoleSelection = async (selectedRoleChoice: "creator" | "brand") => {
    if (!user?.id || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedRole(selectedRoleChoice);

    try {
      // Set the user role
      const { error: roleError } = await setRole(selectedRoleChoice);
      if (roleError) throw roleError;

      // Get stored email from signup (for email/password signups)
      const storedEmail = localStorage.getItem("signup_email");
      const userEmail = storedEmail || user.email || "";
      localStorage.removeItem("signup_email");

      if (selectedRoleChoice === "brand") {
        // Create brand profile
        const { error: profileError } = await supabase
          .from("brand_profiles")
          .insert({
            user_id: user.id,
            company_name: user.user_metadata?.full_name || "Unnamed Brand",
            email: userEmail,
          });

        if (profileError && !profileError.message.includes("duplicate")) {
          console.error("Error creating brand profile:", profileError);
        }

        toast({
          title: "Brand Account Activated",
          description: "Access granted to the Brand Dashboard.",
        });
        navigate("/brand/dashboard", { replace: true });
      } else {
        // Create creator profile
        const { error: profileError } = await supabase
          .from("creator_profiles")
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || "",
            email: userEmail,
            username: userEmail.split("@")[0] || "",
          });

        if (profileError && !profileError.message.includes("duplicate")) {
          console.error("Error creating creator profile:", profileError);
        }

        toast({
          title: "Account configured",
          description: "Your creator dashboard is ready.",
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error setting role:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  // Show loading while checking auth/role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-white/60 text-sm">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Static atmospheric background */}
      <div className="fixed inset-0 -z-10">
        <img
          src={authBackground}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <BrandWordmark variant="collapsed" size="md" color="white" />
            </div>
            <BrandWordmark variant="full" size="lg" color="white" withShimmer />
          </div>
        </div>

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glass Card */}
            <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Heading */}
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  How will you use Atomic Influence?
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  Choose your account type to get started. This helps us personalize your experience.
                </p>
              </div>

              {/* Role Selection Cards */}
              <div className="space-y-4">
                {/* Creator Card */}
                <motion.button
                  onClick={() => handleRoleSelection("creator")}
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full group text-left backdrop-blur-xl border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                    selectedRole === "creator"
                      ? "bg-primary/20 border-primary/50"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/40"
                  } ${isSubmitting && selectedRole !== "creator" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                      selectedRole === "creator"
                        ? "bg-primary/30 border-primary/50"
                        : "bg-gradient-to-br from-primary/30 to-secondary/30 border-white/10 group-hover:border-primary/30"
                    }`}>
                      {isSubmitting && selectedRole === "creator" ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                          I'm a Creator
                        </h3>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-sm text-white/50">
                        Join brand campaigns, create content, and grow your influence. Perfect for influencers, content creators, and social media personalities.
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Brand Card */}
                <motion.button
                  onClick={() => handleRoleSelection("brand")}
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full group text-left backdrop-blur-xl border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                    selectedRole === "brand"
                      ? "bg-accent/20 border-accent/50"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-accent/40"
                  } ${isSubmitting && selectedRole !== "brand" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                      selectedRole === "brand"
                        ? "bg-accent/30 border-accent/50"
                        : "bg-gradient-to-br from-accent/30 to-secondary/30 border-white/10 group-hover:border-accent/30"
                    }`}>
                      {isSubmitting && selectedRole === "brand" ? (
                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                      ) : (
                        <Building2 className="w-6 h-6 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
                          I'm a Brand
                        </h3>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-sm text-white/50">
                        Launch campaigns, discover creators, and grow your brand. Ideal for companies, agencies, and marketing teams.
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Note */}
              <p className="text-xs text-white/40 text-center mt-6">
                You can always access both experiences later from your settings.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OAuthRoleSelect;