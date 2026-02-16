import { useState, useCallback, useRef, ReactNode } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = 80;

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled || isRefreshing) return;
      
      // Only allow pull down when at top of scroll
      const container = containerRef.current;
      if (container && container.scrollTop > 0) return;
      
      const newDistance = Math.max(0, Math.min(info.offset.y, threshold * 1.5));
      setPullDistance(newDistance);
    },
    [disabled, isRefreshing]
  );

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled || isRefreshing) return;
      
      if (info.offset.y >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          controls.start({ y: 0 });
        }
      } else {
        setPullDistance(0);
        controls.start({ y: 0 });
      }
    },
    [disabled, isRefreshing, onRefresh, controls, threshold]
  );

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Refresh indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{ 
          top: pullDistance - 40,
          opacity: progress 
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 360 }}
          transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        drag={disabled ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ y: pullDistance }}
      >
        {children}
      </motion.div>
    </div>
  );
}
