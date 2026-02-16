import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { CheckCircle, Linkedin, Shield, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LinkedInConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (profileData: {
    username: string;
    name: string;
    profileUrl: string;
  }) => void;
}

type ConnectionStep = "intro" | "connecting" | "authorizing" | "success";

export const LinkedInConnectDialog = ({
  open,
  onOpenChange,
  onConnect,
}: LinkedInConnectDialogProps) => {
  const [step, setStep] = useState<ConnectionStep>("intro");

  const handleStartConnect = () => {
    setStep("connecting");
    
    // Simulate OAuth flow
    setTimeout(() => {
      setStep("authorizing");
      
      // Simulate authorization completion
      setTimeout(() => {
        setStep("success");
        
        // Auto-close and callback after success
        setTimeout(() => {
          onConnect({
            username: "alex-johnson-creator",
            name: "Alex Johnson",
            profileUrl: "https://linkedin.com/in/alex-johnson-creator",
          });
          toast({
            title: "LinkedIn linked",
            description: "Your LinkedIn account has been connected successfully.",
            variant: "success",
          });
          setStep("intro");
          onOpenChange(false);
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    if (step === "intro" || step === "success") {
      setStep("intro");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
              <Linkedin className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Connect LinkedIn</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Link your professional profile
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {step === "intro" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Secure OAuth Connection</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll redirect you to LinkedIn to authorize. We only access your public profile information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">What we'll access:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Public profile name and photo
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Profile headline and summary
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Connection count (followers)
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleStartConnect}
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect with LinkedIn
              </Button>
            </div>
          )}

          {step === "connecting" && (
            <div className="flex flex-col items-center justify-center py-8">
              <GlassLoading size="lg" variant="primary" />
              <p className="mt-4 text-sm text-muted-foreground">Opening LinkedIn authorization...</p>
            </div>
          )}

          {step === "authorizing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <GlassLoading size="lg" variant="primary" />
              <p className="mt-4 text-sm text-muted-foreground">Waiting for authorization...</p>
              <p className="mt-2 text-xs text-muted-foreground">Complete the login in the popup window</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 animate-check-in">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">Connected!</p>
              <p className="text-sm text-muted-foreground mt-1">Your LinkedIn profile has been linked</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
