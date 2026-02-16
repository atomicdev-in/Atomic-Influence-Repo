import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  X, 
  Link2, 
  ExternalLink,
  Star
} from "lucide-react";

interface CTALinksSectionProps {
  links: CTALink[];
  onLinksChange: (links: CTALink[]) => void;
  disabled?: boolean;
}

export interface CTALink {
  id: string;
  label: string;
  url: string;
  isPrimary: boolean;
}

const SUGGESTED_LABELS = [
  "Website",
  "Landing Page", 
  "App Download",
  "Product Page",
  "Shop Now",
  "Sign Up",
  "Learn More",
];

export const CTALinksSection = ({ links, onLinksChange, disabled = false }: CTALinksSectionProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addLink = (label?: string) => {
    const newLink: CTALink = {
      id: crypto.randomUUID(),
      label: label || "",
      url: "",
      isPrimary: links.length === 0, // First link is primary by default
    };
    onLinksChange([...links, newLink]);
    setShowSuggestions(false);
  };

  const updateLink = (id: string, updates: Partial<CTALink>) => {
    onLinksChange(links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const removeLink = (id: string) => {
    const remaining = links.filter(link => link.id !== id);
    // If we removed the primary link, make the first remaining one primary
    if (remaining.length > 0 && !remaining.some(l => l.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onLinksChange(remaining);
  };

  const setPrimary = (id: string) => {
    onLinksChange(links.map(link => ({
      ...link,
      isPrimary: link.id === id,
    })));
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Links List */}
      {links.length > 0 && (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div 
              key={link.id}
              className={`p-4 rounded-xl border ${
                link.isPrimary 
                  ? 'border-primary/30 bg-primary/5' 
                  : 'border-border/50 bg-background/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Link label (e.g., Website)"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, { label: e.target.value })}
                      disabled={disabled}
                      className="max-w-[200px]"
                    />
                    {link.isPrimary && (
                      <Badge variant="default" className="gap-1 shrink-0">
                        <Star className="h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                    {!link.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimary(link.id)}
                        disabled={disabled}
                        className="text-xs"
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="https://example.com/landing-page"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, { url: e.target.value })}
                      disabled={disabled}
                      className="flex-1"
                    />
                    {link.url && isValidUrl(link.url) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="shrink-0"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  {link.url && !isValidUrl(link.url) && (
                    <p className="text-xs text-destructive">Please enter a valid URL</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(link.id)}
                  disabled={disabled}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Link */}
      {links.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            Add CTA links that creators will promote. Each creator will get unique tracking links.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_LABELS.slice(0, 4).map(label => (
              <Button 
                key={label} 
                variant="outline" 
                size="sm"
                onClick={() => addLink(label)}
                disabled={disabled}
              >
                <Plus className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            disabled={disabled}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Another Link
          </Button>
          
          {showSuggestions && (
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_LABELS.filter(l => !links.some(link => link.label === l)).slice(0, 3).map(label => (
                <Badge 
                  key={label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addLink(label)}
                >
                  {label}
                </Badge>
              ))}
              <Badge 
                variant="outline"
                className="cursor-pointer"
                onClick={() => addLink()}
              >
                Custom...
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Info Note */}
      {links.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            <strong>How tracking works:</strong> When creators are approved for this campaign, 
            the system will automatically generate unique tracking links for each creator. 
            These links allow you to track clicks and attribute conversions to specific creators.
          </p>
        </div>
      )}
    </div>
  );
};
