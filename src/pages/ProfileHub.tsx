import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Link2, 
  SlidersHorizontal, 
  ClipboardList, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Camera,
  Shield,
  Bell
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSurveys } from "@/hooks/useSurveys";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

// Full Profile page for desktop, simplified hub for mobile
import DesktopProfile from "@/pages/Profile";

const MobileProfileHub = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme } = useTheme();
  const { getIncompleteSurveys, getCompletedSurveysList } = useSurveys();
  
  const incompleteSurveys = getIncompleteSurveys().length;
  const completedSurveys = getCompletedSurveysList().length;

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

  const menuItems = [
    {
      section: "Profile",
      items: [
        { 
          icon: User, 
          label: "Edit Profile", 
          subtitle: "Name, bio, pricing",
          url: "/profile?edit=true",
          color: "text-primary"
        },
        { 
          icon: Camera, 
          label: "Profile Picture", 
          subtitle: "Update your avatar",
          url: "/profile?section=avatar",
          color: "text-secondary"
        },
      ]
    },
    {
      section: "Brand Matching",
      items: [
        { 
          icon: Link2, 
          label: "Linked Accounts", 
          subtitle: "Instagram, TikTok, YouTube",
          url: "/connect-socials",
          color: "text-cyan"
        },
        { 
          icon: SlidersHorizontal, 
          label: "Brand Fit", 
          subtitle: "Preferences & categories",
          url: "/brand-fit",
          color: "text-purple"
        },
        { 
          icon: ClipboardList, 
          label: "Surveys", 
          subtitle: incompleteSurveys > 0 ? `${incompleteSurveys} pending` : `${completedSurveys} completed`,
          url: "/surveys",
          color: "text-pink",
          badge: incompleteSurveys > 0 ? incompleteSurveys : undefined
        },
      ]
    },
    {
      section: "Settings",
      items: [
        { 
          icon: Bell, 
          label: "Notifications", 
          subtitle: "Email & push preferences",
          url: "/settings?section=notifications",
          color: "text-orange"
        },
        { 
          icon: Shield, 
          label: "Privacy & Security", 
          subtitle: "Password, 2FA, data",
          url: "/settings?section=security",
          color: "text-success"
        },
        { 
          icon: Settings, 
          label: "Settings", 
          subtitle: "Account preferences",
          url: "/settings",
          color: "text-muted-foreground"
        },
        { 
          icon: HelpCircle, 
          label: "Help & Support", 
          subtitle: "FAQs, contact us",
          url: "/help",
          color: "text-muted-foreground"
        },
      ]
    }
  ];

  return (
    <DashboardLayout title="Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div 
          className="glass rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <button 
              onClick={() => navigate("/profile?section=avatar")}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-background flex items-center justify-center shadow-lg"
            >
              <Camera className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Alex Johnson</h2>
          <p className="text-sm text-muted-foreground">@alexjohnson</p>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </motion.div>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <motion.div 
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * sectionIndex }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.section}
            </h3>
            <div className="glass rounded-2xl overflow-hidden divide-y divide-white/10">
              {section.items.map((item, itemIndex) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.url)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left transition-colors",
                    "hover:bg-white/5 active:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === "dark" ? "bg-white/10" : "bg-slate-100"
                  )}>
                    <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleSignOut}
            className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-destructive/10"
            )}>
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <span className="font-medium text-destructive">Sign Out</span>
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

// Export component that switches based on mobile/desktop
export default function ProfilePage() {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileProfileHub />;
  }
  
  return <DesktopProfile />;
}
