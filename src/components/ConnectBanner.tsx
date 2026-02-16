import { Button } from "@/components/ui/button";
import { Youtube, Instagram, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ConnectBannerProps {
  onConnect: () => void;
}

const ConnectBanner = ({ onConnect }: ConnectBannerProps) => {
  return (
    <motion.div 
      className="glass rounded-2xl p-6 mb-8 relative overflow-hidden border-gradient"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Animated Gradient Glow */}
      <motion.div 
        className="absolute -left-20 -top-20 w-60 h-60 bg-cyan/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, 20, 0],
          y: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute right-1/3 -top-10 w-40 h-40 bg-purple/15 rounded-full blur-3xl"
        animate={{ 
          x: [0, -15, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink/15 rounded-full blur-3xl"
        animate={{ 
          x: [0, 10, 0],
          y: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          {/* Social Icons Cluster with animations */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 hidden sm:block shrink-0">
            <motion.div 
              className="absolute top-0 left-3 sm:left-4 w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.15, rotate: 5 }}
            >
              <Youtube className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
            </motion.div>
            <motion.div 
              className="absolute top-2 sm:top-3 right-0 w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.15, rotate: -5 }}
            >
              <svg className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-pink" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </motion.div>
            <motion.div 
              className="absolute bottom-2 sm:bottom-3 left-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.15, rotate: 5 }}
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </motion.div>
            <motion.div 
              className="absolute bottom-0 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.15, rotate: -5 }}
            >
              <Instagram className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink" />
            </motion.div>
          </div>

          <motion.div 
            className="flex-1 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 leading-tight">
              Link your social accounts to get matched with the right campaigns.
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
              We'll notify you when opportunities fit your audience. Linking more platforms improves match quality.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto"
        >
          <Button 
            onClick={onConnect} 
            className="w-full sm:w-auto rounded-xl px-6 sm:px-8 py-4 sm:py-5 gradient-primary hover:opacity-90 text-white border-0 glow-primary shrink-0 font-semibold text-sm sm:text-base"
          >
            Link Accounts
          </Button>
        </motion.div>
      </div>

      {/* Footer micro-copy */}
      <motion.div 
        className="relative z-10 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 sm:gap-2">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple shrink-0" />
          </motion.span>
          <span className="truncate">Stay active — the right opportunities will find you.</span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ConnectBanner;