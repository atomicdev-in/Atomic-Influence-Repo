import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Users,
  Building2,
  Megaphone,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { triggerHaptic } from "@/lib/haptics";

const mainNavItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutGrid },
  { title: "Creators", url: "/admin/creators", icon: Users },
  { title: "Brands", url: "/admin/brands", icon: Building2 },
  { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
];

const moreItems = [
  { title: "Surveys", url: "/admin/surveys" },
  { title: "Matching Intelligence", url: "/admin/matching" },
  { title: "System Health", url: "/admin/system-health" },
  { title: "Settings", url: "/admin/settings" },
  { title: "Help", url: "/admin/help" },
];

export function AdminMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isMoreActive = moreItems.some(item => currentPath === item.url);

  const handleNavigation = (url: string) => {
    triggerHaptic("light");
    navigate(url);
  };

  return (
    <motion.nav
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50",
        "flex items-center justify-around",
        "rounded-[24px] py-2 px-2",
        "shadow-2xl shadow-black/30",
        "border border-white/20"
      )}
      style={{
        background: "linear-gradient(165deg, hsl(220 25% 15% / 0.95) 0%, hsl(220 20% 20% / 0.95) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.url);
        
        return (
          <button
            key={item.url}
            onClick={() => handleNavigation(item.url)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
              active
                ? "bg-white/95 shadow-lg"
                : "hover:bg-white/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                active ? "text-slate-800" : "text-white/70"
              )}
              strokeWidth={2}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-slate-800" : "text-white/70"
              )}
            >
              {item.title}
            </span>
          </button>
        );
      })}

      {/* More Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
              isMoreActive
                ? "bg-white/95 shadow-lg"
                : "hover:bg-white/10"
            )}
          >
            <MoreHorizontal
              className={cn(
                "h-5 w-5 transition-colors",
                isMoreActive ? "text-slate-800" : "text-white/70"
              )}
              strokeWidth={2}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isMoreActive ? "text-slate-800" : "text-white/70"
              )}
            >
              More
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={16}
          className="w-56 bg-slate-900/95 backdrop-blur-xl border-white/20"
        >
          {moreItems.map((item) => (
            <DropdownMenuItem
              key={item.url}
              onClick={() => handleNavigation(item.url)}
              className={cn(
                "cursor-pointer text-white/80 hover:text-white hover:bg-white/10",
                isActive(item.url) && "bg-white/10 text-white"
              )}
            >
              {item.title}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => signOut().then(() => navigate("/login"))}
            className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.nav>
  );
}
