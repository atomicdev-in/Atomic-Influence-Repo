import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Dashboard page skeleton - mirrors the brand/creator overview layout
export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
    
    {/* Content Section */}
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/30">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Campaign list skeleton
export const CampaignListSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center">
          <Skeleton className="h-10 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-28 mx-auto" />
        </div>
      ))}
    </div>
    
    {/* Filters */}
    <div className="flex gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-44" />
    </div>
    
    {/* List */}
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
      <Skeleton className="h-6 w-40 mb-6" />
      <CardListSkeleton count={4} />
    </div>
  </div>
);

// Card list skeleton
export const CardListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div 
        key={i} 
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
      >
        <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="text-right space-y-2 min-w-[140px]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

// Creators grid skeleton
export const CreatorsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/30">
          <div className="text-center space-y-1">
            <Skeleton className="h-5 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-5 w-10 mx-auto" />
            <Skeleton className="h-3 w-14 mx-auto" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    ))}
  </div>
);

// Notifications page skeleton
export const NotificationsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
    
    {/* Stats */}
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Search */}
    <Skeleton className="h-10 w-full" />
    
    {/* List */}
    <div className="rounded-2xl bg-card/50 border border-border/50 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border/30">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Messages page skeleton
export const MessagesSkeleton = () => (
  <div className="h-[calc(100vh-2rem)] m-4 flex overflow-hidden animate-pulse">
    {/* Conversation list */}
    <div className="w-80 lg:w-96 bg-card/50 rounded-l-2xl border-r border-border/50 p-4 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Chat area */}
    <div className="flex-1 bg-card/50 rounded-r-2xl flex flex-col">
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
            <Skeleton className={cn("h-16 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border/50 flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  </div>
);

// Payments page skeleton
export const PaymentsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
    
    {/* Balance cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      ))}
    </div>
    
    {/* Tabs */}
    <Skeleton className="h-10 w-80" />
    
    {/* Transaction list */}
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
      <CardListSkeleton count={4} />
    </div>
  </div>
);

// Reports page skeleton
export const ReportsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <ChartSkeleton height={200} />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex items-center gap-8">
          <Skeleton className="h-40 w-40 rounded-full" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse">
    <div className="flex gap-4 p-3 border-b border-border">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16 ml-auto" />
      </div>
    ))}
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-start gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse">
    <div 
      className="rounded-xl bg-muted/30 flex items-end justify-around p-4"
      style={{ height }}
    >
      {[...Array(7)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-8" 
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

// Modal/Dialog content skeleton
export const DialogSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
    </div>
  </div>
);

// Grid cards skeleton
export const GridCardsSkeleton = ({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 | 4 }) => {
  const gridClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[cols];
  
  return (
    <div className={cn("grid grid-cols-1 gap-4 animate-pulse", gridClass)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Campaign detail skeleton
export const CampaignDetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex items-start gap-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
    
    {/* Tabs */}
    <Skeleton className="h-10 w-96" />
    
    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
