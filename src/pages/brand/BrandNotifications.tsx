import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { NotificationsSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Users,
  DollarSign,
  FileCheck,
  Clock,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotificationCenter";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors = {
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  error: "text-red-500 bg-red-500/10 border-red-500/20",
};

const categoryIcons: Record<string, any> = {
  general: Bell,
  campaign: FileCheck,
  invitation: Users,
  negotiation: Users,
  payment: DollarSign,
  approval: CheckCircle,
  revision: AlertTriangle,
  reminder: Clock,
};

const categoryLabels: Record<string, string> = {
  general: "General",
  campaign: "Campaign",
  invitation: "Invitation",
  negotiation: "Negotiation",
  payment: "Payment",
  approval: "Approval",
  revision: "Revision",
  reminder: "Reminder",
};

const BrandNotificationsContent = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, refetch } = useNotifications();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from notifications
  const categories = useMemo(() => {
    const cats = new Set(notifications.map(n => n.category));
    return Array.from(cats);
  }, [notifications]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; unread: number }> = {};
    notifications.forEach(n => {
      if (!stats[n.category]) {
        stats[n.category] = { total: 0, unread: 0 };
      }
      stats[n.category].total++;
      if (!n.read) stats[n.category].unread++;
    });
    return stats;
  }, [notifications]);

  // Apply filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !notification.title.toLowerCase().includes(query) &&
          !notification.message.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'unread' && notification.read) return false;
      if (statusFilter === 'read' && !notification.read) return false;

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;

      // Date range filter
      if (dateRange?.from) {
        const notifDate = new Date(notification.created_at);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(notifDate, { start: from, end: to })) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, searchQuery, statusFilter, typeFilter, categoryFilter, dateRange]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateRange(undefined);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || dateRange;

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 pb-24 md:pb-6">
      <PageHeader
        title="Notification Center"
        subtitle="Campaign signals and system communications"
        icon={Bell}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="h-9"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <SectionErrorBoundary>
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <div className="rounded-xl glass p-4 space-y-4">
              <h3 className="font-semibold text-sm">Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unread</span>
                  <Badge variant="default" className="rounded-full">
                    {unreadCount}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  {Object.entries(categoryStats).map(([category, stats]) => {
                    const Icon = categoryIcons[category] || Bell;
                    return (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category === categoryFilter ? 'all' : category)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm",
                          categoryFilter === category
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{categoryLabels[category] || category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stats.unread > 0 && (
                            <Badge variant="destructive" className="h-5 rounded-full text-xs">
                              {stats.unread}
                            </Badge>
                          )}
                          <span className="text-muted-foreground">{stats.total}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SectionErrorBoundary>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 w-10"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl glass"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Select dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications List */}
          <SectionErrorBoundary>
            <div className="rounded-2xl glass overflow-hidden">
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Bell className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium">No notifications found</p>
                    <p className="text-sm">
                      {hasActiveFilters 
                        ? "Adjust your filters to see more results" 
                        : "You're all caught up"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredNotifications.map((notification, index) => {
                      const IconComponent = typeIcons[notification.type as keyof typeof typeIcons];
                      const CategoryIconComponent = categoryIcons[notification.category as keyof typeof categoryIcons] || Bell;
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "group relative p-4 cursor-pointer transition-colors",
                            notification.read 
                              ? "hover:bg-muted/30" 
                              : "bg-primary/5 hover:bg-primary/10"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-4">
                            <div className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                              typeColors[notification.type as keyof typeof typeColors]
                            )}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className={cn(
                                    "text-sm truncate",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs gap-1">
                                  <CategoryIconComponent className="h-3 w-3" />
                                  {categoryLabels[notification.category] || notification.category}
                                </Badge>
                                {notification.action_url && (
                                  <span className="text-xs text-primary">
                                    View details →
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
};

const BrandNotifications = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandNotificationsContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandNotifications;
