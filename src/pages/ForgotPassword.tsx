import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import authBackground from "@/assets/auth-background.png";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse({ email });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    
    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      setIsLoading(false);
      setError(resetError.message);
      toast({
        title: "Error",
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(false);
    setIsEmailSent(true);
    toast({
      title: "Email sent",
      description: "Check your inbox for the password reset link.",
    });
  };

  // Success State
  if (isEmailSent) {
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Atomic Influence
              </span>
            </div>
          </div>

          {/* Success Content */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Check your email
                </h1>
                <p className="text-sm sm:text-base text-white/60 mb-6">
                  We've sent a password reset link to{" "}
                  <span className="text-white font-medium">{email}</span>
                </p>
                
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 text-left">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-sm text-white/60">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button 
                        onClick={() => setIsEmailSent(false)}
                        className="text-primary hover:underline"
                      >
                        try another email
                      </button>
                    </p>
                  </div>
                </div>

                <Link to="/login">
                  <Button className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white border-0">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Atomic Influence
            </span>
          </div>
          
          {/* Login link */}
          <Link
            to="/login"
            className="text-sm font-medium text-white hover:text-white/80 transition-colors backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2"
          >
            Back to login
          </Link>
        </div>

        {/* Centered Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Glass Form Card */}
            <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Heading */}
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Reset your password
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
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
                  {error && (
                    <p className="text-red-400 text-sm mt-1">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white glow-primary transition-all duration-300 disabled:opacity-60 border-0"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              {/* Help text */}
              <p className="text-xs text-white/40 text-center mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-white/60 hover:text-white/80">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
