import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { UserMenu } from "@/components/UserMenu";
import { MoonIcon, SunIcon } from "@/components/GlassIcons";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "@/lib/haptics";

interface MobileHeaderProps {
  title?: string;
  brandName?: string;
  showNotificationBadge?: boolean;
  notificationCount?: number;
  variant?: "creator" | "brand";
  rightAction?: ReactNode;
}

export function MobileHeader({
  title,
  brandName = "Atomic",
  showNotificationBadge = false,
  notificationCount = 0,
  variant = "creator",
  rightAction,
}: MobileHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    triggerHaptic("light");
    toggleTheme();
  };

  const handleNotificationClick = () => {
    triggerHaptic("selection");
    navigate(variant === "brand" ? "/brand/notifications" : "/notifications");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "backdrop-blur-xl border-b transition-colors duration-300",
        "safe-area-top",
        theme === "dark" 
          ? "bg-slate-900/85 border-slate-700/50" 
          : "bg-white/85 border-slate-200/50"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 max-w-[55%]">
          <motion.div 
            className={cn(
              "w-8 h-8 shrink-0 rounded-xl flex items-center justify-center",
              variant === "brand" 
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "gradient-primary"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-bold text-xs">A</span>
          </motion.div>
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "mobile-title transition-colors",
              theme === "dark" ? "text-white" : "text-slate-800"
            )}>
              {title || brandName}
            </span>
            {title && (
              <span className={cn(
                "text-[9px] uppercase tracking-wider font-medium truncate",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )}>
                {variant === "brand" ? "Brand Portal" : "Creator Hub"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Notification Bell */}
          <motion.button
            onClick={handleNotificationClick}
            className={cn(
              "relative p-2 rounded-xl transition-colors touch-manipulation",
              theme === "dark" 
                ? "bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600" 
                : "bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300"
            )}
            whileTap={{ scale: 0.92 }}
          >
            <Bell className={cn(
              "h-[18px] w-[18px]",
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            )} />
            {showNotificationBadge && notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </motion.span>
            )}
          </motion.button>

          {/* User Menu */}
          <UserMenu />
          
          {/* Theme Toggle */}
          <motion.button
            onClick={handleThemeToggle}
            className={cn(
              "p-2 rounded-xl transition-colors touch-manipulation",
              theme === "dark" 
                ? "bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600" 
                : "bg-slate-100/80 hover:bg-slate-200 active:bg-slate-300"
            )}
            whileTap={{ scale: 0.92 }}
          >
            {theme === "light" ? (
              <MoonIcon className="h-[18px] w-[18px]" />
            ) : (
              <SunIcon className="h-[18px] w-[18px]" />
            )}
          </motion.button>

          {/* Custom right action */}
          {rightAction}
        </div>
      </div>
    </motion.header>
  );
}
