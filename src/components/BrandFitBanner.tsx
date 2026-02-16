import { motion } from "framer-motion";
import { Sparkles, Target, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BrandFitBannerProps {
  onComplete?: () => void;
}

const BrandFitBanner = ({ onComplete }: BrandFitBannerProps) => {
  const navigate = useNavigate();

  const handleCompleteBrandFit = () => {
    if (onComplete) {
      onComplete();
    }
    navigate("/brand-fit");
  };

  const benefits = [
    { icon: Target, text: "Better campaign matches" },
    { icon: Heart, text: "Fewer irrelevant invites" },
    { icon: CheckCircle2, text: "Higher-quality collaborations" },
  ];

  return (
    <motion.div
      className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Background gradient accents */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="h-5 w-5 text-purple" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground">
                Improve Your Brand Matches
              </h3>
            </div>

            {/* Body text */}
            <p className="text-muted-foreground mb-4 leading-relaxed max-w-2xl">
              Complete your Brand Fit profile to receive more relevant campaigns and better brand partnerships.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <benefit.icon className="h-4 w-4 text-purple" />
                  <span className="text-sm text-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Helper text */}
            <p className="text-sm text-muted-foreground hidden md:block">
              Creators with a complete Brand Fit profile get better invites.
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleCompleteBrandFit}
                className="w-full md:w-auto gradient-primary text-white font-semibold px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Complete Brand Fit
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground text-center md:text-right mt-2">
              Takes ~3 minutes
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrandFitBanner;
