import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";
import { LucideIcon } from "lucide-react";

interface MobileNavButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function MobileNavButton({
  icon: Icon,
  label,
  isActive,
  badge,
  onClick,
  variant = "primary"
}: MobileNavButtonProps) {
  const handleClick = () => {
    triggerHaptic("selection");
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-[60px] relative",
        "transition-all duration-200 touch-manipulation",
        "active:scale-95",
        isActive
          ? "bg-white/95 shadow-lg shadow-black/10"
          : "hover:bg-white/15 active:bg-white/25"
      )}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Icon with badge */}
      <div className="relative">
        <Icon 
          className={cn(
            "h-[22px] w-[22px] transition-colors",
            isActive ? "text-slate-800" : "text-white"
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
        {badge && badge > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center",
              "rounded-full bg-accent text-[9px] font-bold text-white shadow-sm"
            )}
          >
            {badge > 99 ? "99+" : badge}
          </motion.span>
        )}
      </div>
      
      {/* Label */}
      <span 
        className={cn(
          "text-[10px] font-semibold mt-1.5 transition-colors leading-none",
          isActive ? "text-slate-800" : "text-white/90"
        )}
      >
        {label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
