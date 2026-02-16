import { ReactNode, useState, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { BrandSidebar } from "@/components/BrandSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandMobileBottomNav } from "@/components/BrandMobileBottomNav";
import { UserMenu } from "@/components/UserMenu";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MoonIcon, SunIcon } from "@/components/GlassIcons";
import { Bell, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "@/lib/haptics";

type DashboardVariant = "creator" | "brand";

interface UnifiedDashboardLayoutProps {
  children: ReactNode;
  variant: DashboardVariant;
  title?: string;
  showHeader?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * Unified dashboard layout that provides consistent structure for both
 * Creator and Brand dashboards while allowing role-specific customization.
 * 
 * Mobile-first design with:
 * - Pull-to-refresh with haptic feedback
 * - Offline indicator
 * - Optimized touch targets
 * - Safe area handling
 */
export function UnifiedDashboardLayout({ 
  children, 
  variant,
  title,
  showHeader = true,
  onRefresh 
}: UnifiedDashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onRefresh || isRefreshing) return;
      const newDistance = Math.max(0, Math.min(info.offset.y * 0.5, threshold * 1.5));
      setPullDistance(newDistance);
      
      // Haptic feedback when crossing threshold
      if (newDistance >= threshold && pullDistance < threshold) {
        triggerHaptic("medium");
      }
    },
    [onRefresh, isRefreshing, pullDistance]
  );

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onRefresh || isRefreshing) return;
      
      if (info.offset.y >= threshold * 2) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        triggerHaptic("success");
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    },
    [onRefresh, isRefreshing]
  );

  const progress = Math.min(pullDistance / threshold, 1);
  const readyToRefresh = pullDistance >= threshold;

  // Get the appropriate sidebar and nav based on variant
  const Sidebar = variant === "brand" ? BrandSidebar : AppSidebar;
  const MobileNav = variant === "brand" ? BrandMobileBottomNav : MobileBottomNav;
  const brandName = variant === "brand" ? "Atomic" : "Atomic";

  const handleThemeToggle = () => {
    triggerHaptic("light");
    toggleTheme();
  };

  const handleNotificationClick = () => {
    triggerHaptic("selection");
    navigate(variant === "brand" ? "/brand/notifications" : "/notifications");
  };

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="relative z-10 min-h-screen pl-28">
          {/* User Menu - Top Right */}
          <div className="fixed top-4 right-4 z-40">
            <UserMenu />
          </div>
          
          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8 pt-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile layout with bottom nav
  return (
    <div className="min-h-screen w-full relative pb-24">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Mobile Header */}
      {showHeader && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "fixed top-0 left-0 right-0 z-40",
            "backdrop-blur-xl border-b transition-colors duration-200",
            "safe-area-top",
            theme === "dark" 
              ? "bg-slate-900/90 border-slate-700/50" 
              : "bg-white/90 border-slate-200/50"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  variant === "brand" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "gradient-primary"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-sm">A</span>
              </motion.div>
              <div className="flex flex-col">
                <span className={cn(
                  "font-semibold text-base leading-tight transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-800"
                )}>
                  {title || brandName}
                </span>
                {title && (
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-medium",
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  )}>
                    {variant === "brand" ? "Brand Portal" : "Creator Hub"}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Notification Bell */}
              <motion.button
                onClick={handleNotificationClick}
                className={cn(
                  "relative p-2.5 rounded-xl transition-colors touch-manipulation",
                  "active:scale-95",
                  theme === "dark" 
                    ? "bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600" 
                    : "bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300"
                )}
                whileTap={{ scale: 0.92 }}
              >
                <Bell className={cn(
                  "h-5 w-5",
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                )} />
              </motion.button>

              {/* User Menu */}
              <UserMenu />
              
              {/* Theme Toggle */}
              <motion.button
                onClick={handleThemeToggle}
                className={cn(
                  "p-2.5 rounded-xl transition-colors touch-manipulation",
                  "active:scale-95",
                  theme === "dark" 
                    ? "bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600" 
                    : "bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300"
                )}
                whileTap={{ scale: 0.92 }}
              >
                {theme === "light" ? <MoonIcon /> : <SunIcon />}
              </motion.button>
            </div>
          </div>
        </motion.header>
      )}

      {/* Pull to refresh indicator */}
      {onRefresh && (
        <motion.div
          className="fixed left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center"
          style={{ 
            top: showHeader ? 64 + Math.max(pullDistance - 48, -48) : Math.max(pullDistance - 48, -48),
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
          {readyToRefresh && !isRefreshing && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-medium text-primary mt-1"
            >
              Release to refresh
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main 
        className={cn(
          "relative will-change-transform",
          showHeader ? "pt-[68px]" : ""
        )}
        drag={onRefresh ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance * 0.3 }}
      >
        <div className="p-4 min-h-[calc(100vh-68px-96px)]">
          {children}
        </div>
      </motion.main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

/**
 * Creator-specific layout wrapper
 */
export function CreatorDashboardLayout({ 
  children, 
  title, 
  onRefresh 
}: { 
  children: ReactNode; 
  title?: string; 
  onRefresh?: () => Promise<void>; 
}) {
  return (
    <UnifiedDashboardLayout variant="creator" title={title} onRefresh={onRefresh}>
      {children}
    </UnifiedDashboardLayout>
  );
}

/**
 * Brand-specific layout wrapper
 */
export function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <UnifiedDashboardLayout variant="brand">
      {children}
    </UnifiedDashboardLayout>
  );
}
