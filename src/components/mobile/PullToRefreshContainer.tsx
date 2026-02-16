import { useState, useCallback, ReactNode, useRef } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const threshold = 80;
  const hasTriggeredHaptic = useRef(false);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled || isRefreshing) return;
      
      // Only allow pull down when at top of scroll
      const container = containerRef.current;
      if (container && container.scrollTop > 5) return;
      
      const newDistance = Math.max(0, Math.min(info.offset.y * 0.5, threshold * 1.5));
      setPullDistance(newDistance);

      // Trigger haptic when crossing threshold
      if (newDistance >= threshold && !hasTriggeredHaptic.current) {
        triggerHaptic("medium");
        hasTriggeredHaptic.current = true;
      } else if (newDistance < threshold) {
        hasTriggeredHaptic.current = false;
      }
    },
    [disabled, isRefreshing]
  );

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled || isRefreshing) return;
      
      hasTriggeredHaptic.current = false;

      if (info.offset.y >= threshold * 2) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        triggerHaptic("success");
        
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
    [disabled, isRefreshing, onRefresh, controls]
  );

  const progress = Math.min(pullDistance / threshold, 1);
  const readyToRefresh = pullDistance >= threshold;

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Refresh indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
        style={{ 
          top: Math.max(pullDistance - 48, -48),
          opacity: progress 
        }}
      >
        <motion.div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-background/95 backdrop-blur-md shadow-lg border border-border/50",
            readyToRefresh && "bg-primary/10 border-primary/30"
          )}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 180 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
          >
            <RefreshCw 
              className={cn(
                "h-5 w-5 transition-colors",
                readyToRefresh ? "text-primary" : "text-muted-foreground"
              )} 
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Ready text */}
      {readyToRefresh && !isRefreshing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-1/2 -translate-x-1/2 z-20 text-xs font-medium text-primary"
          style={{ top: pullDistance + 4 }}
        >
          Release to refresh
        </motion.p>
      )}

      {/* Content */}
      <motion.div
        drag={disabled ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ y: pullDistance * 0.3 }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
