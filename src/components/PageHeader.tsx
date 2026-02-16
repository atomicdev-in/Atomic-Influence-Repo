import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
  /** @deprecated Use children instead for action slot */
  action?: React.ReactNode;
}

/**
 * Consistent page header component with brand gradient background.
 * Used across all primary pages for visual identity and hierarchy.
 */
export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  className,
  children,
  action
}: PageHeaderProps) {
  return (
    <motion.div 
      className={cn(
        "relative overflow-hidden rounded-2xl mb-6",
        "bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10",
        "dark:from-primary/20 dark:via-secondary/15 dark:to-accent/15",
        "border border-white/40 dark:border-white/10",
        "backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
      
      {/* Decorative gradient orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl dark:bg-primary/20" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent/10 blur-xl dark:bg-accent/15" />
      
      <div className="relative px-4 py-3 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            {Icon && (
              <motion.div 
                className={cn(
                  "shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl",
                  "bg-gradient-to-br from-primary/20 to-secondary/20",
                  "dark:from-primary/30 dark:to-secondary/30",
                  "flex items-center justify-center",
                  "border border-white/50 dark:border-white/20",
                  "shadow-sm"
                )}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="h-4 w-4 sm:h-5.5 sm:w-5.5 text-primary dark:text-primary" />
              </motion.div>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-foreground truncate leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Optional action slot */}
          {(children || action) && (
            <div className="shrink-0 flex items-center gap-2">
              {children || action}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact variant for mobile or smaller sections
 */
export function PageHeaderCompact({ 
  title, 
  subtitle,
  icon: Icon,
  className 
}: Omit<PageHeaderProps, 'children'>) {
  return (
    <motion.div 
      className={cn(
        "flex items-center gap-3 mb-4",
        className
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-primary/15 dark:bg-primary/25 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
