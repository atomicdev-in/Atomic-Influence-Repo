import { ReactNode, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AmbientBackground } from "@/components/AmbientBackground";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MoonIcon, SunIcon } from "@/components/GlassIcons";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  onRefresh?: () => Promise<void>;
}

export function MobileLayout({ 
  children, 
  title,
  showHeader = true,
  onRefresh 
}: MobileLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onRefresh || isRefreshing) return;
      const newDistance = Math.max(0, Math.min(info.offset.y, threshold * 1.5));
      setPullDistance(newDistance);
    },
    [onRefresh, isRefreshing]
  );

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onRefresh || isRefreshing) return;
      
      if (info.offset.y >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        
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

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="min-h-screen flex w-full relative">
        <AmbientBackground />
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Desktop User Menu - Top Right */}
        <div className="hidden md:block fixed top-4 right-4 z-50">
          <UserMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-28">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile layout with bottom nav
  return (
    <div className="min-h-screen w-full relative pb-20">
      <AmbientBackground />
      
      {/* Mobile Header */}
      {showHeader && (
        <header 
          className={cn(
            "fixed top-0 left-0 right-0 z-40",
            "backdrop-blur-xl border-b transition-colors duration-300",
            theme === "dark" 
              ? "bg-slate-900/85 border-slate-700/50" 
              : "bg-white/85 border-slate-200/50"
          )}
        >
          <div className="flex items-center justify-between px-3 py-2.5 safe-area-top gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-[60%]">
              <div className="w-8 h-8 shrink-0 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className={cn(
                "mobile-title transition-colors",
                theme === "dark" ? "text-white" : "text-slate-800"
              )}>
                {title || "Atomic"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* User Menu (notifications + profile) */}
              <UserMenu />
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-xl transition-colors touch-manipulation",
                  theme === "dark" 
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                )}
              >
                {theme === "light" ? <MoonIcon className="h-[18px] w-[18px]" /> : <SunIcon className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Pull to refresh indicator */}
      {onRefresh && (
        <motion.div
          className="fixed left-1/2 -translate-x-1/2 z-30 flex items-center justify-center"
          style={{ 
            top: showHeader ? 72 + pullDistance - 40 : pullDistance - 40,
            opacity: progress 
          }}
        >
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
            animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 360 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
          />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main 
        className={cn(
          "relative",
          showHeader ? "pt-[72px]" : ""
        )}
        drag={onRefresh ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance }}
      >
        <div className="p-4 min-h-[calc(100vh-72px-80px)]">
          {children}
        </div>
      </motion.main>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
