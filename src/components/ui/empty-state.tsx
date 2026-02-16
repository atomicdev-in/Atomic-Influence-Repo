import { LucideIcon, Inbox, FileX2, Users, Megaphone, CreditCard, BarChart3, Mail, ClipboardList, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-muted/50 flex items-center justify-center mb-4",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            compact ? "h-6 w-6" : "h-8 w-8"
          )}
        />
      </div>
      <h4 className={cn("font-medium mb-1", compact ? "text-sm" : "text-base")}>
        {title}
      </h4>
      <p
        className={cn(
          "text-muted-foreground max-w-sm",
          compact ? "text-xs" : "text-sm",
          action ? "mb-4" : ""
        )}
      >
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex gap-2">
          {secondaryAction && (
            <Button variant="outline" size={compact ? "sm" : "default"} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button size={compact ? "sm" : "default"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const emptyCampaigns = {
  icon: Megaphone,
  title: "No campaigns created",
  description: "Create your first campaign to begin recruiting creators and tracking performance.",
};

export const emptyCreators = {
  icon: Users,
  title: "No creators available",
  description: "Creator discovery will populate once campaigns are active and invitations are sent.",
};

export const emptyInvitations = {
  icon: Mail,
  title: "No invitations pending",
  description: "Invitations sent to creators will appear here once you begin campaign outreach.",
};

export const emptyApplications = {
  icon: ClipboardList,
  title: "No applications received",
  description: "Creator applications will appear here once campaigns are published and discoverable.",
};

export const emptyPayments = {
  icon: CreditCard,
  title: "No transactions recorded",
  description: "Payment history will display once creator payouts are processed.",
};

export const emptyReports = {
  icon: BarChart3,
  title: "No analytics available",
  description: "Performance data will populate once campaigns are active and tracking links are generating clicks.",
};

export const emptyMessages = {
  icon: MessageSquare,
  title: "No messages",
  description: "Campaign communications will appear here once creators are engaged.",
};

export const emptyNotifications = {
  icon: Bell,
  title: "No notifications",
  description: "System alerts and activity updates will appear here.",
};

export const emptySurveys = {
  icon: ClipboardList,
  title: "No surveys available",
  description: "Brand fit surveys will be displayed when available for completion.",
};

export const emptyNegotiations = {
  icon: FileX2,
  title: "No negotiations pending",
  description: "Counter-offers and negotiation requests will appear here.",
};

export const emptyTrackingLinks = {
  icon: FileX2,
  title: "No tracking links generated",
  description: "Creator-specific tracking links will be created upon campaign acceptance.",
};
