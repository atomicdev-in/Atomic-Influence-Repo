import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient - theme aware */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" 
            : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
        }`} 
      />
      
      {/* Animated floating shapes */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(197 81% 49% / ${isDark ? '0.12' : '0.08'}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(330 77% 57% / ${isDark ? '0.1' : '0.06'}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute bottom-[10%] left-[30%] w-[700px] h-[700px] rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(239 62% 62% / ${isDark ? '0.08' : '0.05'}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, -25, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      <motion.div
        className="absolute top-[60%] left-[60%] w-[400px] h-[400px] rounded-full"
        style={{
          background: `radial-gradient(circle, hsl(16 98% 63% / ${isDark ? '0.06' : '0.04'}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />
      
      {/* Subtle grain texture overlay */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}