import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassIconProps {
  isActive?: boolean;
  isHovered?: boolean;
  className?: string;
}

// Shared gradient definitions
const GradientDefs = () => (
  <defs>
    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#17A9E5" stopOpacity="0.9" />
      <stop offset="50%" stopColor="#6263D9" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#E53D92" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="glassGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#17A9E5" stopOpacity="1" />
      <stop offset="50%" stopColor="#6263D9" stopOpacity="1" />
      <stop offset="100%" stopColor="#E53D92" stopOpacity="1" />
    </linearGradient>
    <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="white" stopOpacity="0.6" />
      <stop offset="50%" stopColor="white" stopOpacity="0.1" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="white" stopOpacity="0.25" />
      <stop offset="100%" stopColor="white" stopOpacity="0.1" />
    </linearGradient>
    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);

// Overview Icon - Dashboard/Grid style
export const OverviewIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Main rounded square */}
    <rect
      x="3"
      y="3"
      width="8"
      height="8"
      rx="2.5"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <rect x="3" y="3" width="8" height="4" rx="2" fill="url(#glassHighlight)" />
    
    {/* Secondary squares */}
    <rect
      x="13"
      y="3"
      width="8"
      height="8"
      rx="2.5"
      fill="url(#glassBody)"
      stroke={isActive ? "url(#glassGradientActive)" : "white"}
      strokeWidth="0.5"
      strokeOpacity={isActive ? 0.8 : 0.3}
    />
    <rect
      x="3"
      y="13"
      width="8"
      height="8"
      rx="2.5"
      fill="url(#glassBody)"
      stroke={isActive ? "url(#glassGradientActive)" : "white"}
      strokeWidth="0.5"
      strokeOpacity={isActive ? 0.8 : 0.3}
    />
    <rect
      x="13"
      y="13"
      width="8"
      height="8"
      rx="2.5"
      fill="url(#glassBody)"
      stroke={isActive ? "url(#glassGradientActive)" : "white"}
      strokeWidth="0.5"
      strokeOpacity={isActive ? 0.8 : 0.3}
    />
  </motion.svg>
);

// Active Campaigns Icon - Stacked layers
export const ActiveCampaignsIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Back layer */}
    <rect
      x="6"
      y="2"
      width="14"
      height="10"
      rx="3"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.2"
    />
    {/* Middle layer */}
    <rect
      x="4"
      y="6"
      width="14"
      height="10"
      rx="3"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />
    {/* Front layer - main */}
    <rect
      x="2"
      y="10"
      width="14"
      height="12"
      rx="3"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <rect x="2" y="10" width="14" height="5" rx="2.5" fill="url(#glassHighlight)" />
    {/* Play button accent */}
    <path
      d="M7 15 L7 19 L11 17 Z"
      fill="white"
      fillOpacity="0.9"
    />
  </motion.svg>
);

// Discover Campaigns Icon - Compass
export const DiscoverIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Compass outer ring */}
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="url(#glassBody)"
      stroke={isActive ? "url(#glassGradientActive)" : "white"}
      strokeWidth="1"
      strokeOpacity={isActive ? 1 : 0.4}
    />
    {/* Compass needle - gradient filled */}
    <path
      d="M12 5 L14 12 L12 19 L10 12 Z"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    {/* Center dot */}
    <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.9" />
    {/* Highlight arc */}
    <path
      d="M5 12 A7 7 0 0 1 12 5"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
  </motion.svg>
);

// Brand Invites Icon - Envelope with badge
export const InvitesIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Envelope body */}
    <rect
      x="2"
      y="6"
      width="18"
      height="14"
      rx="3"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    {/* Envelope flap */}
    <path
      d="M2 9 L11 15 L20 9"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeOpacity="0.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Highlight on top */}
    <rect x="2" y="6" width="18" height="4" rx="2" fill="url(#glassHighlight)" />
    {/* Badge circle */}
    <circle
      cx="18"
      cy="6"
      r="4"
      fill="white"
      stroke={isActive ? "url(#glassGradientActive)" : "#E53D92"}
      strokeWidth="1.5"
    />
    <circle cx="18" cy="6" r="1.5" fill={isActive ? "#17A9E5" : "#E53D92"} />
  </motion.svg>
);

// Brand Fit Icon - Sliders/Controls
export const BrandFitIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Slider tracks */}
    <rect x="4" y="6" width="16" height="3" rx="1.5" fill="url(#glassBody)" />
    <rect x="4" y="11" width="16" height="3" rx="1.5" fill="url(#glassBody)" />
    <rect x="4" y="16" width="16" height="3" rx="1.5" fill="url(#glassBody)" />
    
    {/* Slider handles */}
    <circle
      cx="14"
      cy="7.5"
      r="3"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <circle cx="14" cy="6.5" r="1.5" fill="url(#glassHighlight)" />
    
    <circle
      cx="8"
      cy="12.5"
      r="3"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
    
    <circle
      cx="16"
      cy="17.5"
      r="3"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.5"
    />
  </motion.svg>
);

// Linked Accounts Icon - Connected nodes
export const LinkedAccountsIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Connection lines */}
    <line x1="7" y1="7" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="17" y1="7" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="12" y1="12" x2="12" y2="19" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    
    {/* Center node - main */}
    <circle
      cx="12"
      cy="12"
      r="4"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <circle cx="12" cy="10.5" r="2" fill="url(#glassHighlight)" />
    
    {/* Outer nodes */}
    <circle cx="7" cy="6" r="3" fill="url(#glassBody)" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
    <circle cx="17" cy="6" r="3" fill="url(#glassBody)" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
    <circle cx="12" cy="20" r="3" fill="url(#glassBody)" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
  </motion.svg>
);

// Creator Profile Icon - User avatar with glass effect
export const ProfileIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Head */}
    <circle
      cx="12"
      cy="8"
      r="5"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <ellipse cx="12" cy="6" rx="3" ry="2" fill="url(#glassHighlight)" />
    
    {/* Body */}
    <path
      d="M4 22 C4 17 8 14 12 14 C16 14 20 17 20 22"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />
  </motion.svg>
);

// Settings Icon - Gear with glass effect
export const SettingsIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
      rotate: isHovered ? 15 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Gear teeth */}
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(0 12 12)"
    />
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(60 12 12)"
    />
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(120 12 12)"
    />
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(180 12 12)"
    />
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(240 12 12)"
    />
    <path
      d="M12 2 L14 4 L14 6 L12 8 L10 6 L10 4 Z"
      fill="url(#glassBody)"
      transform="rotate(300 12 12)"
    />
    
    {/* Center circle */}
    <circle
      cx="12"
      cy="12"
      r="5"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <circle cx="12" cy="10" r="3" fill="url(#glassHighlight)" />
    
    {/* Inner dot */}
    <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.9" />
  </motion.svg>
);

// Help Icon - Question mark in circle
export const HelpIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      y: isHovered && !isActive ? -1 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Outer circle */}
    <circle
      cx="12"
      cy="12"
      r="9"
      fill={isActive ? "url(#glassGradientActive)" : "url(#glassGradient)"}
      filter={isActive || isHovered ? "url(#glowFilter)" : undefined}
    />
    <ellipse cx="12" cy="8" rx="6" ry="4" fill="url(#glassHighlight)" />
    
    {/* Question mark */}
    <path
      d="M9 9 C9 7 10.5 6 12 6 C13.5 6 15 7 15 9 C15 11 12 11 12 13"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16" r="1.5" fill="white" />
  </motion.svg>
);

// Logout Icon - Door with arrow
export const LogoutIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    animate={{
      scale: isActive ? 1.06 : isHovered ? 1.04 : 1,
      opacity: isActive ? 1 : isHovered ? 1 : 0.88,
      x: isHovered ? 2 : 0,
    }}
    transition={{ duration: isHovered ? 0.18 : 0.14, ease: "easeOut" }}
  >
    <GradientDefs />
    {/* Door frame */}
    <rect
      x="3"
      y="3"
      width="10"
      height="18"
      rx="2"
      fill="url(#glassBody)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />
    
    {/* Arrow */}
    <path
      d="M15 12 L21 12 M18 9 L21 12 L18 15"
      fill="none"
      stroke={isHovered ? "#E53D92" : "white"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={isHovered ? 1 : 0.7}
    />
  </motion.svg>
);

// Theme Toggle Icons
export const SunIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    animate={{
      scale: isHovered ? 1.1 : 1,
      rotate: isHovered ? 45 : 0,
    }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    <GradientDefs />
    <circle cx="12" cy="12" r="4" fill="url(#glassGradient)" />
    {/* Rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line
        key={angle}
        x1="12"
        y1="2"
        x2="12"
        y2="5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
        transform={`rotate(${angle} 12 12)`}
      />
    ))}
  </motion.svg>
);

export const MoonIcon = ({ isActive, isHovered, className }: GlassIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    animate={{
      scale: isHovered ? 1.1 : 1,
    }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    <GradientDefs />
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="url(#glassGradient)"
    />
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3"
      fill="none"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />
  </motion.svg>
);
