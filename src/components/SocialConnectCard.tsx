import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialConnectCardProps {
  icon: React.ReactNode;
  name: string;
  connected: boolean;
  onConnect: () => void;
  variant?: "connect" | "add";
}

const SocialConnectCard = ({
  icon,
  name,
  connected,
  onConnect,
  variant = "connect",
}: SocialConnectCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
        connected
          ? "border-primary/40 bg-primary/10"
          : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-foreground">{icon}</div>
        <span className="font-medium text-foreground">{name}</span>
      </div>
      {connected ? (
        <div className="flex items-center gap-2 text-primary animate-check-in">
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">Connected</span>
        </div>
      ) : (
        <Button
          onClick={onConnect}
          variant={variant === "connect" ? "default" : "outline"}
          size="sm"
          className={cn(
            "px-5 rounded-lg",
            variant === "connect" 
              ? "gradient-primary hover:opacity-90 text-white border-0 glow-primary" 
              : "border-white/20 bg-white/5 hover:bg-white/10"
          )}
        >
          {variant === "connect" ? "Connect" : "Add"}
        </Button>
      )}
    </div>
  );
};

export default SocialConnectCard;
