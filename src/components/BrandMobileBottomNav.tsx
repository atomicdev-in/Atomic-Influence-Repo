import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  Megaphone, 
  Users, 
  BarChart3,
  CreditCard,
  Building2,
  Settings,
  HelpCircle,
  MoreHorizontal,
  Bell,
  MessageSquare,
  LogOut,
  type LucideIcon 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useCachedBrandRole } from "@/hooks/useRoleCache";
import { useBrandNegotiationCount } from "@/hooks/useBrandNegotiationCount";
import { triggerHaptic } from "@/lib/haptics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  shortTitle: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
}

// Primary nav items (always visible in bottom bar)
const primaryNavItems: NavItem[] = [
  { title: "Overview", shortTitle: "Home", url: "/brand/dashboard", icon: LayoutGrid },
  { title: "Campaigns", shortTitle: "Campaigns", url: "/brand/campaigns", icon: Megaphone },
  { title: "Creators", shortTitle: "Creators", url: "/brand/creators", icon: Users },
  { title: "Messages", shortTitle: "Messages", url: "/brand/messages", icon: MessageSquare },
];

// Secondary nav items (in "More" menu, role-filtered)
const secondaryNavItems: NavItem[] = [
  { title: "Notifications", shortTitle: "Alerts", url: "/brand/notifications", icon: Bell },
  { title: "Reports", shortTitle: "Reports", url: "/brand/reports", icon: BarChart3 },
  { title: "Payments", shortTitle: "Payments", url: "/brand/payments", icon: CreditCard },
  { title: "Profile", shortTitle: "Profile", url: "/brand/profile", icon: Building2 },
  { title: "Settings", shortTitle: "Settings", url: "/brand/settings", icon: Settings },
  { title: "Help", shortTitle: "Help", url: "/brand/help", icon: HelpCircle },
];

export function BrandMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const { currentUserRole, loading } = useCachedBrandRole();
  const { pendingCount } = useBrandNegotiationCount();

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  // Filter primary items based on role
  const filteredPrimaryItems = primaryNavItems.filter(item => {
    // Finance role: only Overview
    if (currentUserRole === 'finance') {
      return item.url === '/brand/dashboard';
    }
    // All other roles see all primary items
    return true;
  }).map(item => {
    // Add badge for campaigns
    if (item.url === '/brand/campaigns' && pendingCount > 0) {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  // Filter secondary items based on role
  const filteredSecondaryItems = secondaryNavItems.filter(item => {
    // Finance role: only see Payments, Reports, Settings, Notifications
    if (currentUserRole === 'finance') {
      return ['/brand/payments', '/brand/reports', '/brand/settings', '/brand/notifications'].includes(item.url);
    }
    
    // Campaign Manager: no Payments, Reports, or Profile
    if (currentUserRole === 'campaign_manager') {
      return !['/brand/payments', '/brand/reports', '/brand/profile'].includes(item.url);
    }
    
    // Owner and Admin see everything
    return true;
  });

  // Check if any secondary item is active
  const isMoreActive = filteredSecondaryItems.some(item => isActive(item.url));

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
      {/* Floating gradient bar - Brand purple theme */}
      <div 
        className={cn(
          "rounded-[26px] overflow-hidden",
          "border border-white/25",
          "shadow-2xl shadow-black/30"
        )}
        style={{
          background: "linear-gradient(165deg, hsl(259 80% 55%) 0%, hsl(280 70% 50%) 50%, hsl(330 77% 52%) 100%)",
        }}
      >
        <div className="flex items-center justify-around px-0.5 py-1.5">
          {filteredPrimaryItems.map((item) => {
            const isItemActive = isActive(item.url);
            const IconComponent = item.icon;

            return (
              <motion.button
                key={item.title}
                onClick={() => handleNavigation(item.url)}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl min-w-[52px] sm:min-w-[60px] relative",
                  "transition-all duration-200 touch-manipulation",
                  isItemActive
                    ? "bg-white/95 shadow-lg shadow-black/10"
                    : "hover:bg-white/15 active:bg-white/25"
                )}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="relative">
                  <IconComponent
                    className={cn(
                      "h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors",
                      isItemActive ? "text-slate-800" : "text-white"
                    )}
                    strokeWidth={isItemActive ? 2.5 : 2}
                  />
                  <AnimatePresence>
                    {item.badge && item.badge > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm"
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={cn(
                    "mobile-nav-label mt-1 transition-colors truncate max-w-full",
                    isItemActive ? "text-slate-800" : "text-white/90"
                  )}
                >
                  {item.shortTitle}
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
                <MoreHorizontal
                  className={cn(
                    "h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors",
                    isMoreActive ? "text-slate-800" : "text-white"
                  )}
                  strokeWidth={isMoreActive ? 2.5 : 2}
                />
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
              {filteredSecondaryItems.slice(0, 3).map((item) => {
                const IconComponent = item.icon;
                const isItemActive = isActive(item.url);
                
                return (
                  <DropdownMenuItem
                    key={item.title}
                    onClick={() => handleNavigation(item.url)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl mx-1 my-0.5",
                      isItemActive && "bg-primary/10"
                    )}
                  >
                    <IconComponent className={cn("h-5 w-5", isItemActive && "text-primary")} />
                    <span className={cn("font-medium", isItemActive && "text-primary")}>{item.title}</span>
                  </DropdownMenuItem>
                );
              })}
              {filteredSecondaryItems.length > 3 && (
                <>
                  <DropdownMenuSeparator className="mx-3 my-1" />
                  {filteredSecondaryItems.slice(3).map((item) => {
                    const IconComponent = item.icon;
                    const isItemActive = isActive(item.url);
                    
                    return (
                      <DropdownMenuItem
                        key={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className={cn(
                          "flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl mx-1 my-0.5",
                          isItemActive && "bg-primary/10"
                        )}
                      >
                        <IconComponent className={cn("h-5 w-5", isItemActive && "text-primary")} />
                        <span className={cn("font-medium", isItemActive && "text-primary")}>{item.title}</span>
                      </DropdownMenuItem>
                    );
                  })}
                  </>
              )}
              <DropdownMenuSeparator className="mx-3 my-1" />
              <DropdownMenuItem
                onClick={() => signOut().then(() => navigate("/login"))}
                className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl mx-1 my-0.5 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
}
