/**
 * Centralized formatting utilities for consistent data display across the platform.
 * All formatting functions are deterministic and locale-aware.
 */

/**
 * Format a number as currency (USD by default)
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format a date string to a short readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date as relative time (e.g., "5m ago", "2d ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

/**
 * Get status color classes based on status string
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Campaign statuses
    draft: 'bg-muted text-muted-foreground border-border',
    discovery: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    live: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    reviewing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    // Invitation statuses
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    declined: 'bg-red-500/10 text-red-500 border-red-500/20',
    negotiating: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    withdrawn: 'bg-muted text-muted-foreground border-border',
    expired: 'bg-muted text-muted-foreground border-border',
    // Payment statuses
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    overdue: 'bg-red-500/10 text-red-500 border-red-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return colors[status] || 'bg-muted text-muted-foreground border-border';
};

/**
 * Format percentage with optional decimal places
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
