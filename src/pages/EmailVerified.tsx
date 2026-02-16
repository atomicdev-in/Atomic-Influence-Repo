import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import authBackground from "@/assets/auth-background.png";

const EmailVerified = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  // Check if user came from brand signup
  const isBrand = searchParams.get("type") === "brand";

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Route directly to dashboard based on type
          navigate(isBrand ? "/brand/dashboard" : "/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isBrand]);

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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 sm:p-6 lg:p-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Atomic Influence
            </span>
          </Link>
        </div>

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Glass Card */}
            <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="relative mx-auto mb-6"
              >
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                {/* Celebration sparkles */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </motion.div>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-sm sm:text-base text-white/60 mb-6">
                  {isBrand 
                    ? "Your brand account is now active. You're ready to discover and connect with creators."
                    : "Your account is now active. You're ready to start discovering campaigns and connecting with brands."
                  }
                </p>
              </motion.div>

              {/* What's Next Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left"
              >
                <h3 className="text-sm font-medium text-white mb-3">What's next?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-medium">1</span>
                    </div>
                    <span>{isBrand ? "Set up your brand profile" : "Connect your social accounts"}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-medium">2</span>
                    </div>
                    <span>{isBrand ? "Create your first campaign" : "Complete your Brand Fit profile"}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-medium">3</span>
                    </div>
                    <span>{isBrand ? "Browse and invite top creators" : "Get matched with perfect campaigns"}</span>
                  </li>
                </ul>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => navigate(isBrand ? "/brand/dashboard" : "/dashboard")}
                  className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-semibold gradient-primary hover:opacity-90 text-white glow-primary border-0 group"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                
                {/* Auto-redirect notice */}
                <p className="text-xs text-white/40 mt-4">
                  Redirecting automatically in {countdown}s...
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
