import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Link2, 
  Copy, 
  Download, 
  ExternalLink,
  QrCode,
  CheckCircle2,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreatorTrackingLink {
  id: string;
  label: string;
  shortUrl: string;
  originalUrl: string;
  qrCodeUrl: string;
  clickCount: number;
  isPrimary?: boolean;
}

interface CreatorTrackingLinksProps {
  campaignName: string;
  links: CreatorTrackingLink[];
}

export const CreatorTrackingLinks = ({ campaignName, links }: CreatorTrackingLinksProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(linkId);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const downloadQRCode = async (qrUrl: string, label: string) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaignName.replace(/\s+/g, '-')}-${label.replace(/\s+/g, '-')}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded!");
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-center">
        <Link2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium mb-1">No tracking links available</p>
        <p className="text-sm text-muted-foreground">
          Tracking links will appear here once the brand generates them for this campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Your Tracking Links
        </h4>
        <Badge variant="outline" className="text-xs">
          {links.length} link{links.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <div 
            key={link.id}
            className={`rounded-xl border p-4 ${
              link.isPrimary 
                ? 'border-primary/30 bg-primary/5' 
                : 'border-border/50 bg-background/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{link.label}</span>
                  {link.isPrimary && (
                    <Badge variant="default" className="text-xs">Primary</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                  → {link.originalUrl}
                </p>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {link.clickCount} clicks
              </div>
            </div>

            {/* Tracking URL */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-3">
              <code className="text-sm flex-1 truncate">{link.shortUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(link.shortUrl, link.id)}
                className="shrink-0 h-8 w-8"
              >
                {copiedId === link.id ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="shrink-0 h-8 w-8"
              >
                <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    View QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>{link.label} QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-xl">
                      <img 
                        src={link.qrCodeUrl} 
                        alt={`QR Code for ${link.label}`}
                        className="w-64 h-64"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan to open: {link.originalUrl}
                    </p>
                    <Button 
                      onClick={() => downloadQRCode(link.qrCodeUrl, link.label)}
                      className="gap-2 w-full"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadQRCode(link.qrCodeUrl, link.label)}
                className="gap-2 text-muted-foreground"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-600">
        <strong>Important:</strong> These tracking links are unique to you. 
        Use them in your content so the brand can track your performance. 
        Do not share your links with other creators.
      </div>
    </div>
  );
};
