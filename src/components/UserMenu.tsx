import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Mail, Wallet, AlertCircle, Zap, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorProfile } from "@/hooks/useCreatorData";
import { useNotifications as useNotificationCenter } from "@/hooks/useNotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { NotificationCenter } from "@/components/NotificationCenter";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: profile } = useCreatorProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationCenter();
  const navigate = useNavigate();
  const location = useLocation();

  const isBrandRoute = location.pathname.startsWith('/brand');

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invite":
      case "info":
        return <Mail className="h-4 w-4 text-primary" />;
      case "campaign":
      case "success":
        return <Zap className="h-4 w-4 text-emerald-500" />;
      case "payment":
        return <Wallet className="h-4 w-4 text-green-500" />;
      case "action":
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="relative" data-user-menu>
        {/* Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex items-center justify-center rounded-full transition-all",
            "w-10 h-10 md:w-11 md:h-11",
            "border backdrop-blur-xl",
            theme === "dark"
              ? "bg-slate-900/80 border-white/10 hover:bg-slate-800/80"
              : "bg-white/80 border-slate-200/50 hover:bg-white/90"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <Avatar className="w-8 h-8 md:w-9 md:h-9">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-secondary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Unread badge on avatar */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Expanded Menu Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "absolute top-full right-0 mt-2 w-72 md:w-80",
                "rounded-2xl overflow-hidden z-50",
                "backdrop-blur-xl border",
                theme === "dark"
                  ? "bg-slate-900/90 border-white/10 shadow-2xl shadow-black/40"
                  : "bg-white/95 border-slate-200/50 shadow-xl shadow-slate-200/50"
              )}
              style={{
                boxShadow: theme === "dark"
                  ? "0 16px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.05)"
                  : "0 16px 64px -16px rgba(0,0,0,0.15), inset 0 1px 0 0 rgba(255,255,255,0.8)"
              }}
            >
              {/* User Info Section */}
              <div className={cn(
                "p-4 border-b",
                theme === "dark" ? "border-white/10" : "border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary to-secondary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-semibold truncate",
                      theme === "dark" ? "text-white" : "text-slate-800"
                    )}>
                      {displayName}
                    </p>
                    <p className={cn(
                      "text-sm truncate",
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    )}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className={cn(
                  "mt-3 flex items-center justify-between text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )}>
                  <span>{formattedDate}</span>
                  <span className="font-medium">{formattedTime}</span>
                </div>
              </div>

              {/* Notifications Button - Opens Full Center */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowNotificationCenter(true);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 transition-colors border-b",
                  theme === "dark" ? "hover:bg-white/5 border-white/10" : "hover:bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    theme === "dark" ? "bg-white/10" : "bg-slate-100"
                  )}>
                    <Bell className={cn(
                      "h-4 w-4",
                      theme === "dark" ? "text-white" : "text-slate-600"
                    )} />
                  </div>
                  <span className={cn(
                    "font-medium",
                    theme === "dark" ? "text-white" : "text-slate-800"
                  )}>
                    Notification Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="bg-accent hover:bg-accent">
                      {unreadCount}
                    </Badge>
                  )}
                  <ExternalLink className={cn(
                    "h-4 w-4",
                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                  )} />
                </div>
              </button>

              {/* Recent Notifications Preview */}
              {notifications.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 transition-colors text-left",
                        !notification.read && (theme === "dark" ? "bg-white/5" : "bg-primary/5"),
                        theme === "dark" ? "hover:bg-white/10" : "hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
                        theme === "dark" ? "bg-white/10" : "bg-slate-100"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            theme === "dark" ? "text-white" : "text-slate-800"
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                          )}
                        </div>
                        <p className={cn(
                          "text-xs line-clamp-1 mt-0.5",
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        )}>
                          {notification.message}
                        </p>
                        <p className={cn(
                          "text-xs mt-1",
                          theme === "dark" ? "text-slate-500" : "text-slate-400"
                        )}>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View Profile Link */}
              <button
                onClick={() => {
                  navigate(isBrandRoute ? "/brand/profile" : "/profile");
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full p-4 text-sm font-medium transition-colors text-center border-t",
                  theme === "dark" 
                    ? "text-primary hover:bg-white/5 border-white/10" 
                    : "text-primary hover:bg-slate-50 border-slate-100"
                )}
              >
                View Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        open={showNotificationCenter}
        onOpenChange={setShowNotificationCenter}
      />
    </>
  );
}
