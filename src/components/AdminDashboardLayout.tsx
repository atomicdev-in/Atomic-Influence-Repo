import { ReactNode, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminMobileBottomNav } from "@/components/AdminMobileBottomNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/UserMenu";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  onRefresh?: () => Promise<void>;
}

/**
 * Admin-specific dashboard layout with unique styling to differentiate from Creator/Brand dashboards.
 * Uses a darker, more institutional color scheme.
 */
export function AdminDashboardLayout({ children, title, onRefresh }: AdminDashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();

  // Pull to refresh logic for mobile
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;
  const progress = Math.min(pullDistance / threshold, 1);
  const readyToRefresh = pullDistance >= threshold;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && onRefresh) {
      const touch = e.touches[0];
      (e.currentTarget as any)._startY = touch.clientY;
    }
  }, [onRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const startY = (e.currentTarget as any)._startY;
    if (startY && onRefresh) {
      const touch = e.touches[0];
      const diff = touch.clientY - startY;
      if (diff > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(diff * 0.5, 120));
        if (diff >= threshold && !readyToRefresh) {
          triggerHaptic("medium");
        }
      }
    }
  }, [onRefresh, readyToRefresh, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic("success");
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <main className="flex-1 pl-[96px] pr-4 py-4 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        {/* User menu in top right corner */}
        <div className="fixed top-6 right-6 z-40">
          <UserMenu />
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed header */}
      <MobileHeader title={title || "Admin"} brandName="Atomic Admin" />
      
      {/* Offline indicator */}
      <OfflineIndicator />
      
      {/* Pull to refresh indicator */}
      {onRefresh && pullDistance > 0 && (
        <motion.div
          className="fixed top-16 left-0 right-0 flex justify-center z-30 pointer-events-none"
          style={{ paddingTop: pullDistance * 0.3 }}
        >
          <motion.div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-slate-800/90 backdrop-blur-xl border border-white/20 shadow-lg"
            )}
            animate={{ rotate: progress * 360, scale: 0.8 + progress * 0.2 }}
          >
            <motion.div
              className={cn(
                "w-5 h-5 border-2 border-t-transparent rounded-full",
                readyToRefresh ? "border-amber-400" : "border-white/50"
              )}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            />
          </motion.div>
        </motion.div>
      )}
      
      {/* Main content */}
      <main
        className="flex-1 overflow-auto pt-16 pb-24 px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 100px)" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          style={{ transform: `translateY(${pullDistance * 0.3}px)` }}
          className="max-w-lg mx-auto"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Bottom navigation */}
      <AdminMobileBottomNav />
    </div>
  );
}
