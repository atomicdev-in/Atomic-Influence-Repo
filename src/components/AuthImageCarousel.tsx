import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import creatorFilming from "@/assets/auth-creator-filming.jpg";
import agencyTeam from "@/assets/auth-agency-team.jpg";
import creatorPhone from "@/assets/auth-creator-phone.jpg";

const images = [creatorFilming, agencyTeam, creatorPhone];

// Ken Burns animation patterns - smooth, cinematic movement
const kenBurnsVariants = [
  { scale: [1, 1.08], x: ["0%", "2%"], y: ["0%", "1%"] },
  { scale: [1.05, 1], x: ["1%", "-1%"], y: ["-1%", "1%"] },
  { scale: [1, 1.06], x: ["-1%", "1%"], y: ["1%", "-1%"] },
];

interface AuthImageCarouselProps {
  mode?: "sidebar" | "header" | "background";
}

const AuthImageCarousel = ({ mode = "sidebar" }: AuthImageCarouselProps) => {
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

  // Auto-rotate images (only if reduced motion is not preferred)
  const rotateImage = useCallback(() => {
    if (!prefersReducedMotion) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    // 8 seconds for background mode for smoother, more cinematic feel
    const interval = setInterval(rotateImage, mode === "background" ? 8000 : 6000);
    return () => clearInterval(interval);
  }, [rotateImage, prefersReducedMotion, mode]);

  const isHeader = mode === "header";
  const isBackground = mode === "background";
  const currentKenBurns = kenBurnsVariants[currentIndex];

  return (
    <div className={`relative w-full overflow-hidden bg-black ${
      isBackground ? "fixed inset-0 -z-10" : 
      isHeader ? "h-48 sm:h-56" : "h-full"
    }`}>
      {/* Cinematic overlay effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Dark overlay for background mode to ensure text readability */}
        {isBackground && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        {/* Vignette */}
        <div className={`absolute inset-0 ${
          isBackground 
            ? "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"
        }`} />
        {/* Top gradient fade */}
        <div className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent ${
          isBackground ? "h-48" : isHeader ? "h-16" : "h-32"
        }`} />
        {/* Bottom gradient fade */}
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent ${
          isBackground ? "h-48" : isHeader ? "h-20" : "h-32"
        }`} />
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
            duration: isBackground ? 1.5 : 0.8, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <motion.img
            src={images[currentIndex]}
            alt="Creator content"
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
              duration: isBackground ? 8 : 6,
              ease: "linear"
            }}
            className={`w-full h-full ${isHeader ? "object-cover object-top" : "object-cover"}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Logo overlay - only for sidebar and header modes */}
      {!isBackground && (
        <div className={`absolute z-20 ${isHeader ? "top-4 left-4" : "top-8 left-8"}`}>
          <div className="flex items-center gap-2">
            <div className={`rounded-lg gradient-primary flex items-center justify-center ${isHeader ? "w-6 h-6" : "w-8 h-8"}`}>
              <span className={`text-white font-bold ${isHeader ? "text-sm" : "text-lg"}`}>A</span>
            </div>
            <span className={`text-white font-semibold tracking-tight ${isHeader ? "text-sm" : "text-lg"}`}>
              Atomic Influence
            </span>
          </div>
        </div>
      )}

      {/* Progress indicators - subtle for background mode */}
      {!prefersReducedMotion && (
        <div className={`absolute z-20 flex gap-2 ${
          isBackground ? "bottom-6 left-1/2 -translate-x-1/2" :
          isHeader ? "bottom-4 left-4" : "bottom-8 left-8"
        }`}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? `bg-white ${isBackground ? "w-8 h-1" : isHeader ? "w-6 h-1" : "w-8 h-1"}` 
                  : `bg-white/40 hover:bg-white/60 ${isBackground ? "w-2 h-1" : isHeader ? "w-1.5 h-1" : "w-2 h-1"}`
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Attribution text - only on sidebar mode */}
      {mode === "sidebar" && (
        <div className="absolute bottom-8 right-8 z-20">
          <p className="text-white/40 text-xs">
            Built for creators, by creators
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthImageCarousel;
