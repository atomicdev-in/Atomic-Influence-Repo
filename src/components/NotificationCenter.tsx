import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, Notification } from "@/hooks/useNotificationCenter";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors = {
  info: "text-blue-500 bg-blue-500/10",
  success: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  error: "text-red-500 bg-red-500/10",
};

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onOpenChange(false);
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed right-2 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-[calc(100vw-1rem)]",
              "rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base truncate">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full h-4 sm:h-5 min-w-4 sm:min-w-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 border-b border-border/30">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 text-[10px] sm:text-xs ml-auto px-2"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Read all</span>
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[350px] sm:h-[400px] max-h-[55vh] sm:max-h-[60vh]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No notifications</p>
                </div>
              ) : (
                <div className="p-1.5 sm:p-2">
                  {filteredNotifications.map((notification, index) => {
                    const Icon = typeIcons[notification.type];
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "group relative p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors",
                          notification.read 
                            ? "hover:bg-muted/50" 
                            : "bg-primary/5 hover:bg-primary/10"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-2.5 sm:gap-3">
                          <div className={cn(
                            "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center",
                            typeColors[notification.type]
                          )}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                              <p className={cn(
                                "text-xs sm:text-sm line-clamp-1 leading-tight",
                                !notification.read && "font-medium"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                                {formatTime(notification.created_at)}
                              </span>
                              {notification.action_url && (
                                <span className="text-[9px] sm:text-[10px] text-primary flex items-center gap-0.5">
                                  <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                  View
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions on hover */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full text-xs h-8"
                onClick={() => {
                  navigate('/notifications');
                  onOpenChange(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
