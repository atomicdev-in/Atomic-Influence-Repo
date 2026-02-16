import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AtSign, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HandleInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    placeholder: string;
    urlPrefix: string;
  };
  currentHandle?: string;
  onSave: (handle: string) => void;
}

export const HandleInputDialog = ({
  open,
  onOpenChange,
  platform,
  currentHandle = "",
  onSave,
}: HandleInputDialogProps) => {
  const [handle, setHandle] = useState(currentHandle);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (open) {
      setHandle(currentHandle);
    }
  }, [open, currentHandle]);

  useEffect(() => {
    // Basic validation - handle should have at least 2 characters
    const cleanHandle = handle.replace(/^@/, "").trim();
    setIsValid(cleanHandle.length >= 2);
  }, [handle]);

  const handleSave = () => {
    const cleanHandle = handle.replace(/^@/, "").trim();
    if (!isValid) {
      toast({
        title: "Invalid Handle",
        description: "Please enter a valid username or handle.",
        variant: "destructive",
      });
      return;
    }

    onSave(cleanHandle);
    toast({
      title: `${platform.name} handle recorded`,
      description: `Your ${platform.name} profile has been linked.`,
      variant: "success",
    });
    onOpenChange(false);
  };

  const previewUrl = handle.replace(/^@/, "").trim() 
    ? `${platform.urlPrefix}${handle.replace(/^@/, "").trim()}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white`}>
              {platform.icon}
            </div>
            <div>
              <DialogTitle className="text-foreground">
                {currentHandle ? "Edit" : "Add"} {platform.name} Handle
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your public username
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-white/10">
            <p className="text-sm text-muted-foreground">
              Adding your {platform.name} handle helps brands discover your content and improves campaign matching accuracy.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Username / Handle</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={platform.placeholder}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>
            {handle && isValid && (
              <div className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="h-3 w-3" />
                Valid handle format
              </div>
            )}
          </div>

          {previewUrl && isValid && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-1">Profile Preview</p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {previewUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 bg-white/5 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="gradient-primary text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {currentHandle ? "Update" : "Save"} Handle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
