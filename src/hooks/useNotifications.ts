import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBrandFitData, useLinkedAccounts } from "@/hooks/useCreatorData";
import { useSurveys } from "@/hooks/useSurveys";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

export interface Notification {
  id: string;
  type: "invite" | "campaign" | "payment" | "action";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

/**
 * Hook to manage user notifications based on app state and preferences
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const { data: brandFitData } = useBrandFitData();
  const { data: linkedAccounts } = useLinkedAccounts();
  const { getIncompleteSurveys } = useSurveys();
  const { shouldShowNotification } = useNotificationPreferences();
  
  // Track read status in localStorage
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("notification-read-ids");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Generate notifications based on current app state
  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];
    
    // Check if Brand Fit is incomplete
    const brandFitFields = brandFitData ? [
      brandFitData.brand_categories,
      brandFitData.alcohol_openness,
      brandFitData.personal_assets,
      brandFitData.driving_comfort,
      brandFitData.content_styles,
      brandFitData.camera_comfort,
      brandFitData.avoided_topics,
      brandFitData.audience_type,
      brandFitData.collaboration_type,
      brandFitData.creative_control,
    ] : [];
    
    const completedBrandFitFields = brandFitFields.filter(f => 
      f !== null && f !== undefined && (Array.isArray(f) ? f.length > 0 : true)
    ).length;
    
    if (completedBrandFitFields < 10) {
      notifs.push({
        id: "complete-brand-fit",
        type: "action",
        title: "Complete Your Brand Fit Profile",
        description: `${10 - completedBrandFitFields} fields remaining to unlock better campaign matches`,
        timestamp: new Date(),
        read: readIds.has("complete-brand-fit"),
        actionUrl: "/brand-fit",
      });
    }
    
    // Check for linked accounts
    const connectedAccounts = linkedAccounts?.filter(a => a.connected) || [];
    if (connectedAccounts.length === 0) {
      notifs.push({
        id: "connect-social",
        type: "action",
        title: "Connect Your Social Accounts",
        description: "Link at least one social account to start receiving campaigns",
        timestamp: new Date(),
        read: readIds.has("connect-social"),
        actionUrl: "/connect-socials",
      });
    }
    
    const incompleteSurveys = getIncompleteSurveys();
    // Check for incomplete surveys
    if (incompleteSurveys && incompleteSurveys.length > 0) {
      notifs.push({
        id: "incomplete-surveys",
        type: "action",
        title: `${incompleteSurveys.length} Survey${incompleteSurveys.length > 1 ? 's' : ''} Available`,
        description: "Complete surveys to enhance your Brand Fit and get better matches",
        timestamp: new Date(),
        read: readIds.has("incomplete-surveys"),
        actionUrl: "/surveys",
      });
    }
    
    // Mock brand invite notification
    notifs.push({
      id: "brand-invite-demo",
      type: "invite",
      title: "New Brand Invite: EcoTech",
      description: "You've been invited to collaborate on a sustainability campaign",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      read: readIds.has("brand-invite-demo"),
      actionUrl: "/invitations",
    });
    
    // Mock campaign update notification
    notifs.push({
      id: "campaign-update-demo",
      type: "campaign",
      title: "Content Approved",
      description: "Your submission for GreenLife has been approved",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: readIds.has("campaign-update-demo"),
      actionUrl: "/active-campaigns",
    });
    
    // Mock payment notification
    notifs.push({
      id: "payment-demo",
      type: "payment",
      title: "Payment Released",
      description: "$250.00 has been released for FitBrand campaign",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: readIds.has("payment-demo"),
      actionUrl: "/dashboard",
    });
    
    // Filter based on user preferences and sort by timestamp
    return notifs
      .filter(n => shouldShowNotification(n.type))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [brandFitData, linkedAccounts, getIncompleteSurveys, readIds, shouldShowNotification]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("notification-read-ids", JSON.stringify([...next]));
      return next;
    });
  };
  
  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem("notification-read-ids", JSON.stringify([...allIds]));
  };
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
