import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--cyan))",
  "hsl(var(--purple))",
  "hsl(var(--pink))",
  "hsl(var(--success))",
  "hsl(var(--orange))",
  "#FFD700", // Gold
  "#FF69B4", // Hot pink
];

const generateConfetti = (count: number): ConfettiPiece[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
};

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ isActive, onComplete }: ConfettiCelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isActive) {
      setPieces(generateConfetti(50));
      setShowCelebration(true);
      
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setShowCelebration(false);
        onComplete?.();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -20,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              }}
              initial={{
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "100vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
          
          {/* Center celebration burst */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="text-6xl">🎉</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to detect first unlock
export function useFirstUnlockCelebration(isReady: boolean, isLoading: boolean) {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);
  const [wasLocked, setWasLocked] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for loading to complete before checking
    if (isLoading) return;

    // On first load, record the initial state
    if (!hasCheckedInitial) {
      setWasLocked(!isReady);
      setHasCheckedInitial(true);
      return;
    }

    // If we were locked and now unlocked, celebrate!
    if (wasLocked === true && isReady) {
      setShouldCelebrate(true);
      setWasLocked(false);
    }
  }, [isReady, isLoading, hasCheckedInitial, wasLocked]);

  const clearCelebration = () => setShouldCelebrate(false);

  return { shouldCelebrate, clearCelebration };
}
