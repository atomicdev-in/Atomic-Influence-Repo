import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Instagram, Youtube } from "lucide-react";
import SocialConnectCard from "@/components/SocialConnectCard";
import Logo from "@/components/Logo";

const ConnectSocials = () => {
  const navigate = useNavigate();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [addedHandles, setAddedHandles] = useState<string[]>([]);

  const recommendedSocials = [
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      name: "TikTok",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      icon: <Youtube className="h-5 w-5" />,
    },
  ];

  const additionalSocials = [
    {
      name: "X",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Twitch",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
    },
  ];

  const toggleConnect = (name: string) => {
    setConnectedAccounts((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleAdd = (name: string) => {
    setAddedHandles((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const hasConnections = connectedAccounts.length > 0 || addedHandles.length > 0;

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Glass Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl border-gradient">
          <div className="mb-8">
            <Logo />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Can we get to know each other?
          </h1>
          <p className="text-muted-foreground mb-8">
            Connect your social media accounts with Atomic Influence to verify your account and unlock more collaboration opportunities.
          </p>

          {/* Recommended Socials */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">
                  Connect social accounts
                </span>
                <Badge className="gradient-primary text-white border-0 text-xs">
                  Recommended
                </Badge>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                How to connect?
              </button>
            </div>

            <div className="space-y-3">
              {recommendedSocials.map((social) => (
                <SocialConnectCard
                  key={social.name}
                  icon={social.icon}
                  name={social.name}
                  connected={connectedAccounts.includes(social.name)}
                  onConnect={() => toggleConnect(social.name)}
                  variant="connect"
                />
              ))}
            </div>
          </div>

          {/* Additional Handles */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-4">
              Add social handle
            </h3>

            <div className="space-y-3">
              {additionalSocials.map((social) => (
                <SocialConnectCard
                  key={social.name}
                  icon={social.icon}
                  name={social.name}
                  connected={addedHandles.includes(social.name)}
                  onConnect={() => toggleAdd(social.name)}
                  variant="add"
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Skip for now
            </Button>
            <Button
              disabled={!hasConnections}
              onClick={() => navigate("/dashboard")}
              className="px-8 gradient-primary hover:opacity-90 text-white border-0 glow-primary disabled:opacity-40"
            >
              Validate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectSocials;
