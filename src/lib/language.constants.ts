/**
 * Centralized Language Constants
 * 
 * This file defines the approved institutional terminology for all system messages,
 * toast notifications, alerts, and transient feedback across the platform.
 * 
 * GUIDELINES:
 * - Use outcome-focused language that signals control and finality
 * - Eliminate emojis, hype, and conversational phrasing
 * - Every message should communicate status, consequence, and next action
 * - Speak with calm authority at every moment of feedback
 * 
 * USAGE:
 * import { MESSAGES, getEntityMessage } from "@/lib/language.constants";
 * toast({ title: MESSAGES.PROFILE.UPDATE_SUCCESS.title, description: MESSAGES.PROFILE.UPDATE_SUCCESS.description });
 */

// ============================================================================
// CORE OPERATION MESSAGES
// ============================================================================

export const OPERATIONS = {
  // Generic CRUD operations
  CREATE: {
    SUCCESS: { title: "Record created", description: "The new entry has been saved to the system." },
    FAILURE: { title: "Creation failed", description: "Unable to create the record. Please try again." },
    PENDING: { title: "Creating record", description: "Processing your request." },
  },
  UPDATE: {
    SUCCESS: { title: "Changes recorded", description: "Your modifications have been saved." },
    FAILURE: { title: "Update failed", description: "Unable to save changes. Please try again." },
    PENDING: { title: "Saving changes", description: "Processing your modifications." },
  },
  DELETE: {
    SUCCESS: { title: "Record removed", description: "The entry has been permanently deleted." },
    FAILURE: { title: "Deletion failed", description: "Unable to remove the record. Please try again." },
    PENDING: { title: "Removing record", description: "Processing deletion request." },
    CONFIRM: { title: "Confirm removal", description: "This action cannot be undone." },
  },
  SUBMIT: {
    SUCCESS: { title: "Submission received", description: "Your request has been recorded and is under review." },
    FAILURE: { title: "Submission failed", description: "Unable to process your submission. Please try again." },
    PENDING: { title: "Submitting request", description: "Processing your submission." },
  },
  FETCH: {
    FAILURE: { title: "Data retrieval failed", description: "Unable to load the requested information." },
    EMPTY: { title: "No records found", description: "There are no entries matching your criteria." },
  },
  EXPORT: {
    SUCCESS: { title: "Export initiated", description: "You will receive a download link when processing completes." },
    FAILURE: { title: "Export failed", description: "Unable to generate the export. Please try again." },
    PENDING: { title: "Preparing export", description: "Generating your data export." },
  },
} as const;

// ============================================================================
// AUTHENTICATION MESSAGES
// ============================================================================

export const AUTH = {
  SIGN_IN: {
    SUCCESS: { title: "Session established", description: "You have been authenticated successfully." },
    FAILURE: { title: "Authentication failed", description: "Invalid credentials. Please verify and try again." },
    REQUIRED: { title: "Authentication required", description: "You must be signed in to perform this action." },
  },
  SIGN_OUT: {
    SUCCESS: { title: "Session terminated", description: "You have been signed out from all devices." },
    FAILURE: { title: "Sign out failed", description: "Unable to terminate session. Please try again." },
  },
  REGISTER: {
    SUCCESS: { title: "Account registered", description: "Your account has been created. Please verify your email." },
    FAILURE: { title: "Registration failed", description: "Unable to create account. Please try again." },
    EMAIL_SENT: { title: "Verification sent", description: "Check your email to confirm your account." },
  },
  PASSWORD: {
    RESET_REQUESTED: { title: "Reset link sent", description: "Check your email for password reset instructions." },
    RESET_SUCCESS: { title: "Password updated", description: "Your password has been changed successfully." },
    RESET_FAILURE: { title: "Reset failed", description: "Unable to update password. Please try again." },
  },
  SESSION: {
    EXPIRED: { title: "Session expired", description: "Please sign in again to continue." },
    INVALID: { title: "Invalid session", description: "Your session could not be verified." },
  },
} as const;

// ============================================================================
// PROFILE & ACCOUNT MESSAGES
// ============================================================================

export const PROFILE = {
  UPDATE: {
    SUCCESS: { title: "Profile updated", description: "Your changes have been recorded." },
    FAILURE: { title: "Update failed", description: "Unable to save profile changes." },
  },
  AVATAR: {
    UPLOAD_SUCCESS: { title: "Avatar updated", description: "Your profile image has been changed." },
    UPLOAD_FAILURE: { title: "Upload failed", description: "Unable to upload image. Please try again." },
    REMOVE_SUCCESS: { title: "Avatar removed", description: "Your profile image has been cleared." },
    REMOVE_FAILURE: { title: "Removal failed", description: "Unable to remove avatar. Please try again." },
  },
  SETTINGS: {
    SAVE_SUCCESS: { title: "Preferences saved", description: "Your settings have been updated." },
    RESET_SUCCESS: { title: "Preferences reset", description: "Settings have been restored to defaults." },
  },
} as const;

// ============================================================================
// CAMPAIGN MESSAGES
// ============================================================================

export const CAMPAIGN = {
  CREATE: {
    SUCCESS: (name: string) => ({ 
      title: "Campaign published", 
      description: `"${name}" is now live and visible to creators.` 
    }),
    DRAFT_SAVED: { title: "Draft preserved", description: "Campaign draft has been saved for later." },
    FAILURE: { title: "Campaign creation failed", description: "Unable to publish campaign. Please review and try again." },
  },
  UPDATE: {
    SUCCESS: { title: "Campaign updated", description: "Changes have been applied to the campaign." },
    FAILURE: { title: "Update failed", description: "Unable to modify campaign. Please try again." },
  },
  DELETE: {
    SUCCESS: { title: "Campaign archived", description: "The campaign has been removed from active listings." },
    FAILURE: { title: "Archival failed", description: "Unable to archive campaign. Please try again." },
  },
  STATUS: {
    PAUSED: { title: "Campaign paused", description: "The campaign is no longer accepting new participants." },
    RESUMED: { title: "Campaign resumed", description: "The campaign is now active and accepting participants." },
    COMPLETED: { title: "Campaign concluded", description: "The campaign has reached its completion." },
  },
  APPLICATION: {
    SUBMITTED: (name: string) => ({ 
      title: "Application submitted", 
      description: `Your request to join "${name}" is under review.` 
    }),
    FAILURE: { title: "Application failed", description: "Unable to submit application. Please try again." },
  },
  ASSETS: {
    UPLOAD_SUCCESS: { title: "Asset uploaded", description: "File has been added to campaign resources." },
    UPLOAD_FAILURE: { title: "Upload failed", description: "Unable to upload asset. Please try again." },
    CTA_FAILURE: { title: "Link save failed", description: "Unable to save CTA links. Campaign created without links." },
  },
} as const;

// ============================================================================
// INVITATION MESSAGES
// ============================================================================

export const INVITATION = {
  SENT: {
    SUCCESS: (name: string) => ({ 
      title: "Invitation dispatched", 
      description: `${name} has been notified of the campaign opportunity.` 
    }),
    FAILURE: { title: "Invitation failed", description: "Unable to send invitation. Please try again." },
  },
  ACCEPTED: {
    CREATOR: { title: "Invitation accepted", description: "You are now assigned to this campaign. Tracking links are available." },
    BRAND: (name: string) => ({ 
      title: "Invitation accepted", 
      description: `${name} has joined the campaign. Tracking links have been generated.` 
    }),
  },
  DECLINED: {
    CREATOR: { title: "Invitation declined", description: "The brand has been notified of your decision." },
    BRAND: (name: string) => ({ 
      title: "Invitation declined", 
      description: `${name} has declined the invitation. You may invite other creators.` 
    }),
  },
  WITHDRAWN: {
    SUCCESS: (name: string) => ({ 
      title: "Invitation withdrawn", 
      description: `The invitation to ${name} has been cancelled.` 
    }),
  },
  UPDATE: {
    NOTIFICATION: { title: "Invitation status changed", description: "Your invitations have been updated." },
  },
} as const;

// ============================================================================
// NEGOTIATION MESSAGES
// ============================================================================

export const NEGOTIATION = {
  COUNTER_OFFER: {
    SUBMITTED: { title: "Counter-offer submitted", description: "The brand will review your proposal." },
    RECEIVED: (name: string) => ({ 
      title: "Negotiation initiated", 
      description: `${name} has submitted a counter-proposal. Review and respond.` 
    }),
    FAILURE: { title: "Submission failed", description: "Unable to submit counter-offer. Please try again." },
  },
  RESPONSE: {
    ACCEPTED: { title: "Negotiation resolved", description: "Terms have been accepted. The creator has been notified." },
    REJECTED: { title: "Proposal declined", description: "The counter-offer has been rejected. Creator has been notified." },
    COUNTERED: { title: "Counter-proposal sent", description: "Awaiting creator response to revised terms." },
  },
} as const;

// ============================================================================
// LINKED ACCOUNTS MESSAGES
// ============================================================================

export const ACCOUNTS = {
  CONNECT: {
    SUCCESS: (platform: string) => ({ 
      title: `${platform} linked`, 
      description: `Your ${platform} account has been connected successfully.` 
    }),
    FAILURE: (platform: string) => ({ 
      title: "Connection failed", 
      description: `Unable to link ${platform}. Please try again.` 
    }),
  },
  DISCONNECT: {
    SUCCESS: (platform: string) => ({ 
      title: `${platform} unlinked`, 
      description: `Your ${platform} account has been disconnected.` 
    }),
    FAILURE: { title: "Disconnection failed", description: "Unable to unlink account. Please try again." },
  },
  SYNC: {
    SUCCESS: { title: "Sync complete", description: "Account statistics have been updated." },
    FAILURE: { title: "Sync failed", description: "Unable to refresh account data. Please try again." },
  },
  VERIFY: {
    SUCCESS: (platform: string) => ({ 
      title: `${platform} verified`, 
      description: `Your ${platform} account has been validated.` 
    }),
    FAILURE: { title: "Verification failed", description: "Unable to verify account. Please try again." },
  },
  HANDLE: {
    ADDED: (platform: string) => ({ 
      title: `${platform} handle recorded`, 
      description: `Your ${platform} profile has been linked.` 
    }),
  },
} as const;

// ============================================================================
// SURVEY MESSAGES
// ============================================================================

export const SURVEY = {
  SUBMIT: {
    SUCCESS: { title: "Survey completed", description: "Your responses have been recorded and will improve campaign matching." },
    FAILURE: { title: "Submission failed", description: "Unable to save survey responses. Please try again." },
  },
  BRAND_FIT: {
    COMPLETE: { title: "Brand fit profile complete", description: "Your profile is now optimized for AI-powered campaign matching." },
  },
} as const;

// ============================================================================
// MESSAGING MESSAGES
// ============================================================================

export const MESSAGING = {
  SEND: {
    SUCCESS: { title: "Message sent", description: "Your communication has been delivered." },
    FAILURE: { title: "Delivery failed", description: "Unable to send message. Please try again." },
  },
  SUPPORT: {
    SUBMITTED: { title: "Request received", description: "Support will respond within 24-48 hours." },
    BRAND_SUBMITTED: { title: "Request received", description: "Brand support team will respond within 24 hours." },
  },
} as const;

// ============================================================================
// TEAM MANAGEMENT MESSAGES
// ============================================================================

export const TEAM = {
  INVITE: {
    SENT: { title: "Invitation sent", description: "Team member will receive an email to join." },
    FAILURE: { title: "Invitation failed", description: "Unable to send team invitation." },
  },
  MEMBER: {
    JOINED: { title: "Team joined", description: "You are now a member of this organization." },
    REMOVED: { title: "Member removed", description: "The team member has been removed from the organization." },
    ROLE_UPDATED: { title: "Role updated", description: "Team member permissions have been changed." },
  },
  ASSIGNMENT: {
    ADDED: { title: "Assignment recorded", description: "Campaign has been assigned to team member." },
    REMOVED: { title: "Assignment removed", description: "Team member has been unassigned from campaign." },
  },
} as const;

// ============================================================================
// TRACKING & ANALYTICS MESSAGES
// ============================================================================

export const TRACKING = {
  LINKS: {
    GENERATED: { title: "Tracking links generated", description: "Your unique campaign links are ready for use." },
    ACTIVITY: { title: "Tracking activity recorded", description: "New clicks or conversions have been detected." },
  },
  CONTENT: {
    DETECTED: { title: "Content detected", description: "Published content has been identified and recorded." },
    CONFIRMED: { title: "Content confirmed", description: "Deliverable has been marked as complete." },
  },
} as const;

// ============================================================================
// PAYMENT MESSAGES
// ============================================================================

export const PAYMENT = {
  PROCESSED: { title: "Payment processed", description: "Funds have been transferred to your account." },
  PENDING: { title: "Payment initiated", description: "Transfer is being processed and will arrive shortly." },
  FAILED: { title: "Payment failed", description: "Unable to process payment. Please contact support." },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERRORS = {
  GENERIC: { title: "Operation failed", description: "An unexpected error occurred. Please try again." },
  NETWORK: { title: "Connection error", description: "Unable to reach the server. Check your connection." },
  PERMISSION: { title: "Access denied", description: "You do not have permission to perform this action." },
  VALIDATION: { title: "Validation failed", description: "Please review your input and correct any errors." },
  NOT_FOUND: { title: "Not found", description: "The requested resource could not be located." },
  TIMEOUT: { title: "Request timeout", description: "The operation took too long. Please try again." },
} as const;

// ============================================================================
// DEMO/PLACEHOLDER MESSAGES
// ============================================================================

export const DEMO = {
  DATA_NOTICE: { title: "Demo data", description: "This is demonstration data. Create real records to see full functionality." },
  FEATURE_UNAVAILABLE: { title: "Feature in development", description: "This functionality will be available in a future release." },
} as const;

// ============================================================================
// EXPORT ALL MESSAGES
// ============================================================================

export const MESSAGES = {
  OPERATIONS,
  AUTH,
  PROFILE,
  CAMPAIGN,
  INVITATION,
  NEGOTIATION,
  ACCOUNTS,
  SURVEY,
  MESSAGING,
  TEAM,
  TRACKING,
  PAYMENT,
  ERRORS,
  DEMO,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a message with entity name interpolation
 */
export const getEntityMessage = (
  message: { title: string; description: string } | ((name: string) => { title: string; description: string }),
  entityName?: string
): { title: string; description: string } => {
  if (typeof message === 'function' && entityName) {
    return message(entityName);
  }
  return message as { title: string; description: string };
};

export default MESSAGES;
