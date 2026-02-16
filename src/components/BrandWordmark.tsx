import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  variant?: "full" | "collapsed" | "logo";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "white" | "gradient" | "foreground";
  withHoverGlow?: boolean;
  withShimmer?: boolean;
}

/**
 * Atomic Influence brand wordmark using futuristic Orbitron font.
 * - Full variant: "ATOMIC INFLUENCE"
 * - Collapsed variant: "A" lettermark
 * - Logo variant: Uses the stylized 'ai' logo image
 */
export function BrandWordmark({ 
  variant = "full", 
  size = "md",
  color = "white",
  withHoverGlow = false,
  withShimmer = false,
  className 
}: BrandWordmarkProps) {
  const sizeClasses = {
    sm: variant === "collapsed" || variant === "logo" ? "text-lg" : "text-sm",
    md: variant === "collapsed" || variant === "logo" ? "text-xl" : "text-base",
    lg: variant === "collapsed" || variant === "logo" ? "text-2xl" : "text-lg",
    xl: variant === "collapsed" || variant === "logo" ? "text-3xl" : "text-xl",
  };

  const logoSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    white: "text-white",
    gradient: "text-gradient",
    foreground: "text-foreground",
  };

  const hoverGlowClasses = withHoverGlow 
    ? "transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:scale-105" 
    : "";

  // Logo variant - uses the stylized 'ai' favicon image
  if (variant === "logo") {
    return (
      <img 
        src="/favicon.jpeg" 
        alt="Atomic Influence"
        className={cn(
          logoSizeClasses[size],
          "rounded-lg object-cover",
          withHoverGlow && "transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:scale-105",
          className
        )}
      />
    );
  }

  if (variant === "collapsed") {
    return (
      <span 
        className={cn(
          "brand-wordmark font-bold",
          sizeClasses[size],
          colorClasses[color],
          hoverGlowClasses,
          className
        )}
      >
        A
      </span>
    );
  }

  // Shimmer class for full variant
  const shimmerClass = withShimmer && variant === "full" ? "animate-text-shimmer" : "";

  return (
    <span 
      className={cn(
        "brand-wordmark tracking-wider",
        sizeClasses[size],
        !withShimmer && (color === "gradient" ? "" : colorClasses[color]),
        shimmerClass,
        hoverGlowClasses,
        className
      )}
    >
      {color === "gradient" && !withShimmer ? (
        <>
          <span className="text-gradient">Atomic</span>
          <span className="text-foreground"> Influence</span>
        </>
      ) : (
        "Atomic Influence"
      )}
    </span>
  );
}

/**
 * Full brand header with wordmark for auth screens
 */
export function BrandHeader({ 
  size = "lg",
  withHoverGlow = true,
  className 
}: { 
  size?: "md" | "lg" | "xl";
  withHoverGlow?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  };

  const hoverGlowClasses = withHoverGlow 
    ? "transition-all duration-300 hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.5)] hover:scale-[1.02]" 
    : "";

  return (
    <h1 
      className={cn(
        "brand-wordmark-lg text-white tracking-widest cursor-default",
        sizeClasses[size],
        hoverGlowClasses,
        className
      )}
    >
      Atomic Influence
    </h1>
  );
}
