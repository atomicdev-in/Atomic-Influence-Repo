import { useState, useEffect } from "react";

export interface NotificationPreferences {
  // Email notifications
  emailInvitations: boolean;
  emailCampaignUpdates: boolean;
  emailPayments: boolean;
  emailWeeklyDigest: boolean;
  // Push/In-app notifications
  pushNewInvitations: boolean;
  pushMessages: boolean;
  pushReminders: boolean;
  pushCampaignUpdates: boolean;
  pushPayments: boolean;
  // Marketing
  marketingEmails: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailInvitations: true,
  emailCampaignUpdates: true,
  emailPayments: true,
  emailWeeklyDigest: false,
  pushNewInvitations: true,
  pushMessages: true,
  pushReminders: true,
  pushCampaignUpdates: true,
  pushPayments: true,
  marketingEmails: false,
};

const STORAGE_KEY = "notification-preferences";

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setHasUnsavedChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setHasUnsavedChanges(false);
    return true;
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasUnsavedChanges(true);
  };

  // Check if a notification type should be shown based on preferences
  const shouldShowNotification = (type: "invite" | "campaign" | "payment" | "action"): boolean => {
    switch (type) {
      case "invite":
        return preferences.pushNewInvitations;
      case "campaign":
        return preferences.pushCampaignUpdates;
      case "payment":
        return preferences.pushPayments;
      case "action":
        return true; // Always show action items
      default:
        return true;
    }
  };

  return {
    preferences,
    updatePreference,
    togglePreference,
    savePreferences,
    resetToDefaults,
    hasUnsavedChanges,
    shouldShowNotification,
  };
};
