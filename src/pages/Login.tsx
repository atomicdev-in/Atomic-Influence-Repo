import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { BrandWordmark } from "@/components/BrandWordmark";
import { HelpCircle } from "lucide-react";
import authBackground from "@/assets/auth-background.png";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isAuthenticated, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (!loading && !roleLoading && isAuthenticated) {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "brand") {
        navigate("/brand/dashboard");
      } else if (role === "creator") {
        navigate("/dashboard");
      } else {
        navigate("/auth/role-select");
      }
    }
  }, [isAuthenticated, loading, roleLoading, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setIsLoading(false);
      if (error.message.includes("Invalid login credentials")) {
        setErrors({ general: "Invalid email or password. Please try again." });
      } else if (error.message.includes("Email not confirmed")) {
        setErrors({ general: "Please verify your email before logging in." });
      } else {
        setErrors({ general: error.message });
      }
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(false);
    toast({
      title: "Session Authenticated",
      description: "Access granted. Redirecting to your dashboard.",
    });
    // Role check will redirect via useEffect
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
        {/* Frosted overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        
        {/* Frost effect blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-[100px]" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8">
          {/* Logo - Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <BrandWordmark variant="collapsed" size="md" color="white" />
            </div>
            <BrandWordmark variant="full" size="md" color="white" withShimmer className="hidden sm:block" />
          </div>
          
          {/* Right side - Help + Signup */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Help link */}
            <button className="flex items-center gap-1.5 text-xs sm:text-sm text-white/50 hover:text-white/70 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Need help?</span>
            </button>
            
            {/* Divider */}
            <div className="h-5 w-px bg-white/20" />
            
            {/* Signup Link */}
            <Link
              to="/signup"
              className="text-sm font-medium text-white hover:text-white/80 transition-colors backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Centered Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Glass Form Card */}
            <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Heading */}
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Sign In
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  Access your account to manage campaigns and collaborations.
                </p>
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                  <p className="text-red-300 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Google Sign In - Primary */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold bg-white text-black hover:bg-white/90 transition-all flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/50 text-xs sm:text-sm">or</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 font-medium text-sm">
                    Email address
                  </Label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-12 sm:h-14 w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white ring-offset-background placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/30 transition-all duration-200"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/80 font-medium text-sm">
                      Password
                    </Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 sm:h-14 rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white glow-primary transition-all duration-300 disabled:opacity-60 border-0 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>

              {/* Sign up link */}
              <p className="text-sm text-white/60 text-center mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-white hover:text-primary transition-colors font-medium">
                  Sign up
                </Link>
              </p>

              {/* Terms */}
              <p className="text-xs text-white/40 text-center mt-4">
                By signing in, you agree to our{" "}
                <Link to="/terms" className="text-white/60 hover:text-white/80">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-white/60 hover:text-white/80">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;