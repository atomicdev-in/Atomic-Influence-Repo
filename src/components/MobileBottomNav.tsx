import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  Layers, 
  Compass, 
  Mail,
  User,
  SlidersHorizontal,
  Link2,
  Settings,
  HelpCircle,
  MoreHorizontal,
  Bell,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSurveys } from "@/hooks/useSurveys";
import { useCreatorInvitations } from "@/hooks/useCreatorInvitations";
import { triggerHaptic } from "@/lib/haptics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTab {
  title: string;
  shortTitle: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

// Primary tabs (always visible in bottom bar)
const primaryTabs: MobileTab[] = [
  { title: "Overview", shortTitle: "Home", url: "/dashboard", icon: LayoutGrid },
  { title: "Active", shortTitle: "Active", url: "/active-campaigns", icon: Layers },
  { title: "Discover", shortTitle: "Discover", url: "/apply", icon: Compass },
  { title: "Invites", shortTitle: "Invites", url: "/invitations", icon: Mail },
];

// Secondary tabs (in "More" menu) - includes Sign Out
const secondaryTabs: MobileTab[] = [
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell },
  { title: "Surveys", shortTitle: "Surveys", url: "/surveys", icon: ClipboardList },
  { title: "Brand Fit", shortTitle: "Brand Fit", url: "/brand-fit", icon: SlidersHorizontal },
  { title: "Linked Accounts", shortTitle: "Accounts", url: "/linked-accounts", icon: Link2 },
  { title: "Profile", shortTitle: "Profile", url: "/profile", icon: User },
  { title: "Settings", shortTitle: "Settings", url: "/settings", icon: Settings },
  { title: "Help", shortTitle: "Help", url: "/help", icon: HelpCircle },
  { title: "Sign Out", shortTitle: "Sign Out", url: "/signout", icon: HelpCircle },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getIncompleteSurveys } = useSurveys();
  const { pendingCount: invitationPendingCount } = useCreatorInvitations();
  
  const incompleteSurveysCount = getIncompleteSurveys().length;

  const isActive = (path: string) => location.pathname === path;

  // Add badges to primary tabs
  const primaryTabsWithBadges = primaryTabs.map(tab => {
    if (tab.url === "/invitations" && invitationPendingCount > 0) {
      return { ...tab, badge: invitationPendingCount };
    }
    return tab;
  });

  // Add badges to secondary tabs
  const secondaryTabsWithBadges = secondaryTabs.map(tab => {
    if (tab.url === "/surveys" && incompleteSurveysCount > 0) {
      return { ...tab, badge: incompleteSurveysCount };
    }
    return tab;
  });

  // Check if any secondary item is active
  const isMoreActive = secondaryTabsWithBadges.some(tab => isActive(tab.url));
  
  // Check if there are badges in the secondary menu
  const secondaryBadgeCount = secondaryTabsWithBadges.reduce((acc, tab) => acc + (tab.badge || 0), 0);

  const handleNavigation = (url: string) => {
    triggerHaptic("selection");
    navigate(url);
  };

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "px-3 pb-3 pt-0",
        "safe-area-bottom"
      )}
    >
      {/* Floating gradient bar */}
      <div 
        className={cn(
          "rounded-[26px] overflow-hidden",
          "border border-white/25",
          "shadow-2xl shadow-black/30"
        )}
        style={{
          background: "linear-gradient(165deg, hsl(197 81% 49%) 0%, hsl(239 62% 58%) 50%, hsl(330 77% 55%) 100%)",
        }}
      >
        <div className="flex items-center justify-around px-0.5 py-1.5">
          {primaryTabsWithBadges.map((tab) => {
            const isTabActive = isActive(tab.url);
            const IconComponent = tab.icon;
            
            return (
              <motion.button
                key={tab.url}
                onClick={() => handleNavigation(tab.url)}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl min-w-[52px] sm:min-w-[60px] relative",
                  "transition-all duration-200 touch-manipulation",
                  isTabActive
                    ? "bg-white/95 shadow-lg shadow-black/10"
                    : "hover:bg-white/15 active:bg-white/25"
                )}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Icon with badge */}
                <div className="relative">
                  <IconComponent 
                    className={cn(
                      "h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors",
                      isTabActive ? "text-slate-800" : "text-white"
                    )}
                    strokeWidth={isTabActive ? 2.5 : 2}
                  />
                  <AnimatePresence>
                    {tab.badge && tab.badge > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm"
                      >
                        {tab.badge > 99 ? "99+" : tab.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Label */}
                <span 
                  className={cn(
                    "mobile-nav-label mt-1 transition-colors truncate max-w-full",
                    isTabActive ? "text-slate-800" : "text-white/90"
                  )}
                >
                  {tab.shortTitle}
                </span>
              </motion.button>
            );
          })}

          {/* More menu for secondary items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl min-w-[52px] sm:min-w-[60px] relative",
                  "transition-all duration-200 touch-manipulation",
                  isMoreActive
                    ? "bg-white/95 shadow-lg shadow-black/10"
                    : "hover:bg-white/15 active:bg-white/25"
                )}
                whileTap={{ scale: 0.92 }}
                onClick={() => triggerHaptic("light")}
              >
                <div className="relative">
                  <MoreHorizontal 
                    className={cn(
                      "h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors",
                      isMoreActive ? "text-slate-800" : "text-white"
                    )}
                    strokeWidth={isMoreActive ? 2.5 : 2}
                  />
                  <AnimatePresence>
                    {secondaryBadgeCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm"
                      >
                        {secondaryBadgeCount > 9 ? "9+" : secondaryBadgeCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span 
                  className={cn(
                    "mobile-nav-label mt-1 transition-colors",
                    isMoreActive ? "text-slate-800" : "text-white/90"
                  )}
                >
                  More
                </span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top"
              sideOffset={12}
              className="w-52 mb-1 bg-background/98 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl"
            >
              {secondaryTabsWithBadges.slice(0, 4).map((tab) => {
                const IconComponent = tab.icon;
                const isTabActive = isActive(tab.url);
                
                return (
                  <DropdownMenuItem
                    key={tab.url}
                    onClick={() => handleNavigation(tab.url)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl mx-1 my-0.5",
                      isTabActive && "bg-primary/10"
                    )}
                  >
                    <div className="relative">
                      <IconComponent className={cn("h-5 w-5", isTabActive && "text-primary")} />
                      {tab.badge && tab.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                          {tab.badge > 9 ? "+" : tab.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn("font-medium", isTabActive && "text-primary")}>{tab.title}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="mx-3 my-1" />
              {secondaryTabsWithBadges.slice(4).map((tab) => {
                const IconComponent = tab.icon;
                const isTabActive = isActive(tab.url);
                
                return (
                  <DropdownMenuItem
                    key={tab.url}
                    onClick={() => handleNavigation(tab.url)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl mx-1 my-0.5",
                      isTabActive && "bg-primary/10"
                    )}
                  >
                    <IconComponent className={cn("h-5 w-5", isTabActive && "text-primary")} />
                    <span className={cn("font-medium", isTabActive && "text-primary")}>{tab.title}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
}
