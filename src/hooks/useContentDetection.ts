import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Types for content detection
export interface DetectionRule {
  platform: "instagram" | "tiktok" | "youtube";
  type: "post" | "reel" | "story" | "video";
  hashtags?: string[];
  mentions?: string[];
  requiredLinks?: string[];
  postingWindow?: { start: string; end: string };
}

export interface DetectedContent {
  id: string;
  platform: "instagram" | "tiktok" | "youtube";
  type: "post" | "reel" | "story" | "video";
  url: string;
  detectedAt: string;
  caption?: string;
  matchedRules: {
    hashtags: string[];
    mentions: string[];
    links: string[];
    withinWindow: boolean;
  };
  confidence: number; // 0-100 percentage
  thumbnailUrl?: string;
}

export interface LinkedAccount {
  platform: string;
  username: string | null;
  connected: boolean;
}

export interface UseContentDetectionResult {
  detectedContent: DetectedContent[];
  linkedAccounts: LinkedAccount[];
  isScanning: boolean;
  lastScanTime: string | null;
  scanForContent: (rules: DetectionRule[]) => Promise<DetectedContent[]>;
  confirmDetectedContent: (contentId: string) => void;
  getMatchConfidence: (content: DetectedContent) => string;
  hasLinkedAccount: (platform: string) => boolean;
}

// Mock detected content for demonstration
const generateMockDetectedContent = (rules: DetectionRule[], linkedAccounts: LinkedAccount[]): DetectedContent[] => {
  const content: DetectedContent[] = [];
  
  rules.forEach((rule, index) => {
    // Only generate mock content if user has linked account for this platform
    const hasAccount = linkedAccounts.some(
      acc => acc.platform.toLowerCase() === rule.platform && acc.connected
    );
    
    if (!hasAccount) return;

    // Simulate 60% chance of detecting content
    if (Math.random() > 0.4) {
      const matchedHashtags = rule.hashtags?.slice(0, Math.floor(Math.random() * (rule.hashtags.length + 1))) || [];
      const matchedMentions = rule.mentions?.slice(0, Math.floor(Math.random() * (rule.mentions.length + 1))) || [];
      const matchedLinks = rule.requiredLinks?.slice(0, Math.floor(Math.random() * (rule.requiredLinks.length + 1))) || [];
      
      const totalRules = (rule.hashtags?.length || 0) + (rule.mentions?.length || 0) + (rule.requiredLinks?.length || 0) + 1;
      const matchedCount = matchedHashtags.length + matchedMentions.length + matchedLinks.length + 1;
      const confidence = Math.round((matchedCount / totalRules) * 100);

      content.push({
        id: `detected-${rule.platform}-${rule.type}-${index}`,
        platform: rule.platform,
        type: rule.type,
        url: getMockUrl(rule.platform, rule.type),
        detectedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        caption: getMockCaption(matchedHashtags, matchedMentions),
        matchedRules: {
          hashtags: matchedHashtags,
          mentions: matchedMentions,
          links: matchedLinks,
          withinWindow: isWithinWindow(rule.postingWindow),
        },
        confidence,
        thumbnailUrl: getMockThumbnail(rule.platform),
      });
    }
  });

  return content;
};

const getMockUrl = (platform: string, type: string): string => {
  const randomId = Math.random().toString(36).substring(7);
  switch (platform) {
    case "instagram":
      return type === "reel" 
        ? `https://instagram.com/reel/${randomId}`
        : `https://instagram.com/p/${randomId}`;
    case "tiktok":
      return `https://tiktok.com/@creator/video/${randomId}`;
    case "youtube":
      return `https://youtube.com/watch?v=${randomId}`;
    default:
      return "#";
  }
};

const getMockCaption = (hashtags: string[], mentions: string[]): string => {
  const parts = [
    "Loving this product! ✨",
    ...mentions,
    ...hashtags,
  ];
  return parts.join(" ");
};

const getMockThumbnail = (platform: string): string => {
  const images: Record<string, string> = {
    instagram: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
    tiktok: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&h=200&fit=crop",
    youtube: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop",
  };
  return images[platform] || images.instagram;
};

const isWithinWindow = (window?: { start: string; end: string }): boolean => {
  if (!window) return true;
  const now = new Date();
  const start = new Date(window.start);
  const end = new Date(window.end);
  return now >= start && now <= end;
};

export const useContentDetection = (): UseContentDetectionResult => {
  const { user } = useAuth();
  const [detectedContent, setDetectedContent] = useState<DetectedContent[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // Fetch linked accounts from database
  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      if (!user) {
        setLinkedAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from("linked_accounts")
        .select("platform, username, connected")
        .eq("user_id", user.id);

      if (!error && data) {
        setLinkedAccounts(data);
      }
    };

    fetchLinkedAccounts();
  }, [user]);

  // Scan for content matching campaign rules
  const scanForContent = useCallback(async (rules: DetectionRule[]): Promise<DetectedContent[]> => {
    setIsScanning(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call social platform APIs
      // For now, we generate mock detected content
      const detected = generateMockDetectedContent(rules, linkedAccounts);
      
      setDetectedContent(detected);
      setLastScanTime(new Date().toISOString());
      
      return detected;
    } finally {
      setIsScanning(false);
    }
  }, [linkedAccounts]);

  // Confirm detected content as a submission
  const confirmDetectedContent = useCallback((contentId: string) => {
    setDetectedContent(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, confirmed: true } as DetectedContent
          : content
      )
    );
  }, []);

  // Get human-readable confidence label
  const getMatchConfidence = useCallback((content: DetectedContent): string => {
    if (content.confidence >= 90) return "High Match";
    if (content.confidence >= 70) return "Good Match";
    if (content.confidence >= 50) return "Partial Match";
    return "Low Match";
  }, []);

  // Check if user has a linked account for a platform
  const hasLinkedAccount = useCallback((platform: string): boolean => {
    return linkedAccounts.some(
      acc => acc.platform.toLowerCase() === platform.toLowerCase() && acc.connected
    );
  }, [linkedAccounts]);

  return {
    detectedContent,
    linkedAccounts,
    isScanning,
    lastScanTime,
    scanForContent,
    confirmDetectedContent,
    getMatchConfidence,
    hasLinkedAccount,
  };
};

// Detection rules builder helper
export const buildDetectionRules = (brief: {
  hashtags: string[];
  mentions: string[];
  requiredLinks: string[];
  postingWindow: { start: string; end: string };
  platforms: string[];
}): DetectionRule[] => {
  const rules: DetectionRule[] = [];
  
  brief.platforms.forEach(platform => {
    const platformTypes: Record<string, Array<"post" | "reel" | "story" | "video">> = {
      instagram: ["post", "reel", "story"],
      tiktok: ["video"],
      youtube: ["video"],
    };
    
    const types = platformTypes[platform.toLowerCase()] || ["post"];
    
    types.forEach(type => {
      rules.push({
        platform: platform.toLowerCase() as "instagram" | "tiktok" | "youtube",
        type,
        hashtags: brief.hashtags,
        mentions: brief.mentions,
        requiredLinks: brief.requiredLinks,
        postingWindow: brief.postingWindow,
      });
    });
  });
  
  return rules;
};
