import { QueryClient } from "@tanstack/react-query";

// Create a query client with offline-first defaults
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed requests up to 3 times
      retry: 3,
      // Don't refetch on window focus for better offline experience
      refetchOnWindowFocus: false,
      // Use cached data while revalidating
      refetchOnMount: true,
      // Network mode: offlineFirst for graceful degradation
      networkMode: "offlineFirst",
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      networkMode: "offlineFirst",
    },
  },
});

// Utility to check if we're offline
export const isOffline = () => typeof navigator !== "undefined" && !navigator.onLine;
