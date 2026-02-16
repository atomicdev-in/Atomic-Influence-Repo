import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "accent";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const ringSize = {
  sm: "border-2",
  md: "border-3",
  lg: "border-4",
  xl: "border-4",
};

const GlassSpinner = React.forwardRef<HTMLDivElement, GlassSpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-white/20 border-t-white/60",
      primary: "border-primary/20 border-t-primary",
      accent: "border-purple/20 border-t-cyan",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Outer glass container */}
        <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]" />
        
        {/* Spinning ring */}
        <div
          className={cn(
            "absolute inset-1 rounded-full animate-spin",
            ringSize[size],
            variantStyles[variant]
          )}
          style={{ animationDuration: "0.8s" }}
        />
        
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
        
        {/* Center dot */}
        <div className={cn(
          "rounded-full bg-gradient-to-br from-white/40 to-white/10",
          size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4"
        )} />
      </div>
    );
  }
);

GlassSpinner.displayName = "GlassSpinner";

interface GlassLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "accent";
  text?: string;
}

const GlassLoading = React.forwardRef<HTMLDivElement, GlassLoadingProps>(
  ({ className, size = "md", variant = "default", text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
        {...props}
      >
        <GlassSpinner size={size} variant={variant} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    );
  }
);

GlassLoading.displayName = "GlassLoading";

interface GlassOverlayLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "accent";
  text?: string;
}

const GlassOverlayLoading = React.forwardRef<HTMLDivElement, GlassOverlayLoadingProps>(
  ({ className, size = "lg", variant = "primary", text = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="glass rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <GlassLoading size={size} variant={variant} text={text} />
        </div>
      </div>
    );
  }
);

GlassOverlayLoading.displayName = "GlassOverlayLoading";

export { GlassSpinner, GlassLoading, GlassOverlayLoading };
