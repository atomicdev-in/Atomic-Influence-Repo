import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProfileSyncProvider } from "@/components/ProfileSyncProvider";
import SplashScreen from "@/components/SplashScreen";
import { AmbientBackground } from "@/components/AmbientBackground";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";

// Create query client with offline-first defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep in cache for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed requests
      retry: 3,
      // Don't refetch on window focus for better offline experience
      refetchOnWindowFocus: false,
      // Network mode: offlineFirst for graceful degradation
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 1,
      networkMode: "offlineFirst",
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Check if this is the first load in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsFirstLoad(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ProfileSyncProvider>
            {/* Global ambient background - mounted once, never remounts on route changes */}
            <AmbientBackground />
            
            {/* Offline indicator for network status */}
            <OfflineIndicator />
            
            {showSplash && isFirstLoad && (
              <SplashScreen onComplete={handleSplashComplete} minDuration={3000} />
            )}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </ProfileSyncProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
