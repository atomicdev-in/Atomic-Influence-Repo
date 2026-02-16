import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import brandTeamStrategy from "@/assets/brand-auth-team-strategy.jpg";
import brandDashboard from "@/assets/brand-auth-dashboard.jpg";
import brandReview from "@/assets/brand-auth-review.jpg";

const images = [brandTeamStrategy, brandDashboard, brandReview];

// Ken Burns animation patterns - smooth, cinematic movement
const kenBurnsVariants = [
  { scale: [1, 1.08], x: ["0%", "2%"], y: ["0%", "1%"] },
  { scale: [1.05, 1], x: ["1%", "-1%"], y: ["-1%", "1%"] },
  { scale: [1, 1.06], x: ["-1%", "1%"], y: ["1%", "-1%"] },
];

const BrandImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Auto-rotate images
  const rotateImage = useCallback(() => {
    if (!prefersReducedMotion) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(rotateImage, 8000);
    return () => clearInterval(interval);
  }, [rotateImage, prefersReducedMotion]);

  const currentKenBurns = kenBurnsVariants[currentIndex];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Cinematic overlay effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        {/* Top gradient fade */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Subtle film grain overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Image carousel with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 1.5, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <motion.img
            src={images[currentIndex]}
            alt="Brand marketing"
            initial={{ 
              scale: currentKenBurns.scale[0], 
              x: currentKenBurns.x[0], 
              y: currentKenBurns.y[0] 
            }}
            animate={{ 
              scale: prefersReducedMotion ? 1 : currentKenBurns.scale[1], 
              x: prefersReducedMotion ? "0%" : currentKenBurns.x[1], 
              y: prefersReducedMotion ? "0%" : currentKenBurns.y[1] 
            }}
            transition={{ 
              duration: 8,
              ease: "linear"
            }}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress indicators */}
      {!prefersReducedMotion && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? "w-8 h-1 bg-white" 
                  : "w-2 h-1 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandImageCarousel;
