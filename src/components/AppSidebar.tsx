import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft,
  LayoutGrid,
  Layers,
  Compass, 
  Mail, 
  SlidersHorizontal, 
  Link2, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sun,
  Moon,
  ClipboardList,
  Pin,
  PinOff,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useSurveys } from "@/hooks/useSurveys";
import { useCreatorInvitations } from "@/hooks/useCreatorInvitations";
import { toast } from "@/hooks/use-toast";
import { BrandWordmark } from "@/components/BrandWordmark";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
}

const baseMainItems: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutGrid },
  { title: "Active Campaigns", url: "/active-campaigns", icon: Layers },
  { title: "Discover Campaigns", url: "/apply", icon: Compass },
  { title: "Brand Invites", url: "/invitations", icon: Mail },
  { title: "Brand Fit", url: "/brand-fit", icon: SlidersHorizontal },
  { title: "Surveys", url: "/surveys", icon: ClipboardList },
  { title: "Linked Accounts", url: "/connect-socials", icon: Link2 },
  { title: "Creator Profile", url: "/profile", icon: User },
];

const bottomItems: NavItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

// Persist pin state in localStorage
const SIDEBAR_PIN_KEY = "creator_sidebar_pinned";

export function AppSidebar() {
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_PIN_KEY);
    return saved === "true";
  });
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { getIncompleteSurveys } = useSurveys();
  const { pendingCount: invitationPendingCount } = useCreatorInvitations();
  const currentPath = location.pathname;

  // Persist pin state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_PIN_KEY, String(isPinned));
  }, [isPinned]);

  const isActive = (path: string) => currentPath === path;
  
  // Get incomplete surveys count for badge
  const incompleteSurveysCount = getIncompleteSurveys().length;
  
  // Add badges to nav items dynamically
  const navItemsWithBadges = useMemo(() => baseMainItems.map(item => {
    if (item.url === "/surveys" && incompleteSurveysCount > 0) {
      return { ...item, badge: incompleteSurveysCount };
    }
    if (item.url === "/invitations" && invitationPendingCount > 0) {
      return { ...item, badge: invitationPendingCount };
    }
    return item;
  }), [incompleteSurveysCount, invitationPendingCount]);

  const handleNavigation = (url: string) => {
    navigate(url);
    // Only collapse if not pinned
    if (!isPinned && window.innerWidth < 768) {
      setIsHovered(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Session terminated",
        description: "You have been signed out successfully.",
      });
      navigate("/login");
    }
  };

  const togglePin = () => {
    setIsPinned(prev => !prev);
    if (!isPinned) {
      toast({
        title: "Sidebar pinned",
        description: "Sidebar will stay expanded.",
      });
    }
  };

  const sidebarVariants = {
    collapsed: {
      width: 80,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    },
    expanded: {
      width: 280,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const itemVariants = {
    collapsed: { paddingLeft: 16, paddingRight: 16 },
    expanded: { paddingLeft: 18, paddingRight: 18 },
  };

  const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  };

  return (
    <motion.aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-50",
        "flex flex-col",
        "rounded-[28px] overflow-hidden",
        "shadow-2xl shadow-black/20",
        "border border-white/20"
      )}
      style={{
        background: "linear-gradient(165deg, hsl(197 81% 49%) 0%, hsl(239 62% 62%) 50%, hsl(330 77% 57%) 100%)",
      }}
      variants={sidebarVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      onMouseEnter={() => !isPinned && setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      {/* Header with Brand Wordmark */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleNavigation("/dashboard")}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BrandWordmark variant="full" size="sm" color="white" withHoverGlow withShimmer />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden animate-logo-pulse-glow"
              >
                <BrandWordmark variant="logo" size="lg" withHoverGlow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <div className="flex items-center gap-2">
              {/* Pin/Lock Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={togglePin}
                className={cn(
                  "w-8 h-8 rounded-xl backdrop-blur-sm flex items-center justify-center transition-colors",
                  isPinned 
                    ? "bg-white/30 text-white" 
                    : "bg-white/20 text-white/70 hover:bg-white/30 hover:text-white"
                )}
                title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
              >
                {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </motion.button>
              
              {/* Collapse Button - only when not pinned */}
              {!isPinned && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsHovered(false)}
                  className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 min-h-0 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 transition-colors">
        <ul className="space-y-2 px-3">
          {navItemsWithBadges.map((item) => {
            const isItemActive = isActive(item.url);
            const IconComponent = item.icon;
            
            return (
              <li key={item.title}>
                <motion.button
                  onClick={() => handleNavigation(item.url)}
                  className={cn(
                    "w-full flex items-center gap-4 py-3.5 rounded-2xl transition-colors",
                    "relative overflow-hidden min-h-[52px]",
                    isItemActive
                      ? "bg-white/95 shadow-lg"
                      : "hover:bg-white/15"
                  )}
                  variants={itemVariants}
                  animate={isExpanded ? "expanded" : "collapsed"}
                  whileHover={!isItemActive ? hoverScale : undefined}
                >
                  {/* Icon with badge */}
                  <div className="shrink-0 w-6 flex items-center justify-center relative z-10">
                    <IconComponent 
                      className={cn(
                        "h-5 w-5",
                        isItemActive ? "text-slate-800" : "text-white"
                      )}
                      strokeWidth={2}
                    />
                    {/* Badge for collapsed state */}
                    {item.badge && item.badge > 0 && !isExpanded && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 relative z-10"
                      >
                        <span className={cn(
                          "text-[15px] font-medium whitespace-nowrap overflow-hidden",
                          isItemActive ? "text-slate-800" : "text-white"
                        )}>
                          {item.title}
                        </span>
                        {/* Badge for expanded state */}
                        {item.badge && item.badge > 0 && (
                          <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active indicator dot for collapsed state */}
                  {isItemActive && !isExpanded && !item.badge && (
                    <motion.div
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Account Section - Visually Separated */}
      <div className="border-t border-white/20 shrink-0">
        {/* Section Label */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pt-3 pb-1"
            >
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-medium">
                Account
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className={cn(
          "space-y-1 py-2",
          isExpanded ? "px-3" : "px-2"
        )}>
          {/* Theme Toggle */}
          <li>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="w-full flex items-center gap-4 py-2.5 rounded-2xl transition-colors hover:bg-white/15 min-h-[44px]"
              variants={itemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              whileHover={hoverScale}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <div className="shrink-0 w-6 flex items-center justify-center">
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-white" strokeWidth={2} />
                ) : (
                  <Sun className="h-5 w-5 text-white" strokeWidth={2} />
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[15px] font-medium whitespace-nowrap overflow-hidden text-white"
                  >
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </li>

          {bottomItems.map((item) => {
            const isItemActive = isActive(item.url);
            const IconComponent = item.icon;
            
            return (
              <li key={item.title}>
                <motion.button
                  onClick={() => handleNavigation(item.url)}
                  className={cn(
                    "w-full flex items-center gap-4 py-2.5 rounded-2xl transition-colors",
                    "relative overflow-hidden min-h-[44px]",
                    isItemActive
                      ? "bg-white/95 shadow-lg"
                      : "hover:bg-white/15"
                  )}
                  variants={itemVariants}
                  animate={isExpanded ? "expanded" : "collapsed"}
                  whileHover={!isItemActive ? hoverScale : undefined}
                >
                  <div className="shrink-0 w-6 flex items-center justify-center relative z-10">
                    <IconComponent 
                      className={cn(
                        "h-5 w-5",
                        isItemActive ? "text-slate-800" : "text-white"
                      )}
                      strokeWidth={2}
                    />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "text-[15px] font-medium whitespace-nowrap overflow-hidden relative z-10",
                          isItemActive ? "text-slate-800" : "text-white"
                        )}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </li>
            );
          })}
          
          {/* Sign Out */}
          <li>
            <motion.button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 py-2.5 rounded-2xl transition-colors hover:bg-white/15 min-h-[44px]"
              variants={itemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              whileHover={hoverScale}
            >
              <div className="shrink-0 w-6 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[15px] font-medium whitespace-nowrap overflow-hidden text-white"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </li>
        </ul>
      </div>
    </motion.aside>
  );
}
