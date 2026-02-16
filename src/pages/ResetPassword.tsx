import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import PasswordRequirements from "@/components/PasswordRequirements";
import { CheckCircle, KeyRound } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import authBackground from "@/assets/auth-background.png";

// Reusable background component for this page
const AuthBackground = () => (
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
);

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            setIsValidSession(true);
          } else if (!session) {
            setIsValidSession(false);
          }
        });

        setTimeout(() => {
          if (isValidSession === null) {
            setIsValidSession(false);
          }
        }, 2000);

        return () => subscription.unsubscribe();
      }
    };

    checkSession();
  }, [isValidSession]);

  const isPasswordValid =
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    password.length >= 8;

  const isFormValid = isPasswordValid && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = passwordSchema.safeParse({ password });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setIsLoading(false);
      setError(updateError.message);
      toast({
        title: "Error",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    toast({
      title: "Password updated",
      description: "Your password has been successfully reset.",
    });
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Invalid session
  if (isValidSession === false) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AuthBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Atomic Influence
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl backdrop-blur-sm bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="h-8 w-8 text-red-400" />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Link expired
                </h1>
                <p className="text-sm sm:text-base text-white/60 mb-6">
                  This password reset link has expired or is invalid.
                </p>

                <div className="space-y-3">
                  <Link to="/forgot-password">
                    <Button className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white border-0">
                      Request new link
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-medium bg-white/5 border-white/10 text-white hover:bg-white/10">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AuthBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Atomic Influence
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Password updated
                </h1>
                <p className="text-sm sm:text-base text-white/60 mb-6">
                  You can now sign in with your new password.
                </p>

                <Link to="/login">
                  <Button className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white border-0">
                    Continue to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Atomic Influence
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Set new password
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  Create a strong password you haven't used before.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80 font-medium text-sm">
                    New password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 sm:h-14 rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40"
                  />
                  <PasswordRequirements password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/80 font-medium text-sm">
                    Confirm password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 sm:h-14 rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white glow-primary transition-all duration-300 disabled:opacity-40 border-0"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>

              <p className="text-xs text-white/40 text-center mt-6">
                Use a unique password you don't use on other websites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
