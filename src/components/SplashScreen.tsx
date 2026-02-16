import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import creatorFilming from "@/assets/auth-creator-filming.jpg";
import agencyTeam from "@/assets/auth-agency-team.jpg";
import creatorPhone from "@/assets/auth-creator-phone.jpg";

const images = [creatorFilming, agencyTeam, creatorPhone];

// Taglines that rotate with each image - expanded with stats and variety
const taglines = [
  {
    headline: "Create with Purpose",
    subline: "Connect with brands that align with your authentic voice",
  },
  {
    headline: "Join 10,000+ Creators",
    subline: "Building meaningful partnerships with top brands worldwide",
  },
  {
    headline: "Maximize Your Reach",
    subline: "Smart AI matching finds your perfect brand collaborations",
  },
  {
    headline: "500+ Brand Partners",
    subline: "From startups to Fortune 500 companies seeking authentic voices",
  },
  {
    headline: "Grow Your Influence",
    subline: "Turn your creativity into sustainable income streams",
  },
  {
    headline: "$2M+ Paid to Creators",
    subline: "Fair compensation for authentic content that connects",
  },
];

// Ken Burns animation patterns
const kenBurnsVariants = [
  { scale: [1, 1.08], x: ["0%", "2%"], y: ["0%", "1%"] },
  { scale: [1.05, 1], x: ["1%", "-1%"], y: ["-1%", "1%"] },
  { scale: [1, 1.06], x: ["-1%", "1%"], y: ["1%", "-1%"] },
];

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const SplashScreen = ({ onComplete, minDuration = 2500 }: SplashScreenProps) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
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

  // Handle minimum display duration and exit
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  // Auto-rotate images (slower)
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Auto-rotate taglines (faster for variety)
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const currentKenBurns = kenBurnsVariants[imageIndex % kenBurnsVariants.length];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background images with Ken Burns */}
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.img
                src={images[imageIndex]}
                alt="Creator content"
                initial={{
                  scale: currentKenBurns.scale[0],
                  x: currentKenBurns.x[0],
                  y: currentKenBurns.y[0],
                }}
                animate={{
                  scale: prefersReducedMotion ? 1 : currentKenBurns.scale[1],
                  x: prefersReducedMotion ? "0%" : currentKenBurns.x[1],
                  y: prefersReducedMotion ? "0%" : currentKenBurns.y[1],
                }}
                transition={{ duration: 5, ease: "linear" }}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

          {/* Top gradient */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Content container */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <span className="text-white font-semibold text-2xl tracking-tight">
                Atomic Influence
              </span>
            </motion.div>

            {/* Animated taglines */}
            <div className="text-center h-24 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="text-center"
                >
                  <h1 className="text-white text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                    {taglines[taglineIndex].headline}
                  </h1>
                  <p className="text-white/70 text-lg sm:text-xl">
                    {taglines[taglineIndex].subline}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/60"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Progress indicators */}
          {!prefersReducedMotion && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-500 ${
                    index === imageIndex
                      ? "w-8 h-1 bg-white"
                      : "w-2 h-1 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
