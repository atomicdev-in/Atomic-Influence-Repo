import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { useLinkedAccounts as useLinkedAccountsData, useAddLinkedAccount, useRemoveLinkedAccount } from "@/hooks/useCreatorData";
import { useSocialConnect, SocialPlatform } from "@/hooks/useSocialConnect";
import {
  Link2,
  Instagram,
  Youtube,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Eye,
  Info,
  Linkedin,
  MessageCircle,
  Phone,
  Pencil,
  Star,
  Loader2,
} from "lucide-react";
import { LinkedInConnectDialog } from "@/components/LinkedInConnectDialog";
import { WhatsAppConnectDialog } from "@/components/WhatsAppConnectDialog";
import { HandleInputDialog } from "@/components/HandleInputDialog";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useMatchRateImpact,
  getLinkedAccountsData,
  calculateAverageEngagement,
} from "@/hooks/useCreatorScoring";

interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  followers: string;
  followersRaw: number;
  engagement: string;
  engagementRaw: number;
  connected: boolean;
  lastSync: string;
  verified: boolean;
  icon: React.ReactNode;
  color: string;
}

const LinkedAccounts = () => {
  // Get data from scoring engine
  const linkedAccountsData = getLinkedAccountsData();
  const { data: cloudAccounts, isLoading } = useLinkedAccountsData();
  const addLinkedAccount = useAddLinkedAccount();
  const removeLinkedAccount = useRemoveLinkedAccount();
  const matchRateImpact = useMatchRateImpact();
  const avgEngagement = calculateAverageEngagement(linkedAccountsData);
  
  // Real OAuth social connect hook
  const { 
    connectedAccounts: oauthAccounts,
    initOAuth,
    disconnect: disconnectOAuth,
    syncAccount,
    connectingPlatform,
    isConnecting,
    isSyncing,
  } = useSocialConnect();

  // Dialog states for LinkedIn and WhatsApp
  const [linkedInDialogOpen, setLinkedInDialogOpen] = useState(false);
  const [whatsAppDialogOpen, setWhatsAppDialogOpen] = useState(false);

  // Handle-based platform dialog states
  const [handleDialogOpen, setHandleDialogOpen] = useState(false);
  const [activeHandlePlatform, setActiveHandlePlatform] = useState<{
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    placeholder: string;
    urlPrefix: string;
  } | null>(null);

  // Handle-based platform data - initialized from cloud accounts
  const [handleBasedAccounts, setHandleBasedAccounts] = useState<{
    twitter?: string;
    twitch?: string;
    pinterest?: string;
  }>({});

  // Sync handle-based accounts from cloud on load
  useEffect(() => {
    if (cloudAccounts) {
      const handleAccounts: { twitter?: string; twitch?: string; pinterest?: string } = {};
      cloudAccounts.forEach((acc) => {
        if (acc.platform === 'twitter' && acc.username) {
          handleAccounts.twitter = acc.username;
        } else if (acc.platform === 'twitch' && acc.username) {
          handleAccounts.twitch = acc.username;
        } else if (acc.platform === 'pinterest' && acc.username) {
          handleAccounts.pinterest = acc.username;
        }
      });
      setHandleBasedAccounts(handleAccounts);
    }
  }, [cloudAccounts]);

  // LinkedIn connection state
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<{
    username: string;
    name: string;
    profileUrl: string;
  } | null>(null);

  // WhatsApp connection state
  const [whatsAppConnected, setWhatsAppConnected] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<{
    countryCode: string;
    phoneNumber: string;
    maskedNumber: string;
  } | null>(null);

  const [accounts, setAccounts] = useState<LinkedAccount[]>([
    {
      id: "instagram",
      platform: "Instagram",
      username: "@alex.creates",
      followers: `${(linkedAccountsData[0]?.followers / 1000).toFixed(1)}K`,
      followersRaw: linkedAccountsData[0]?.followers || 78500,
      engagement: `${linkedAccountsData[0]?.engagement || 4.2}%`,
      engagementRaw: linkedAccountsData[0]?.engagement || 4.2,
      connected: linkedAccountsData[0]?.connected ?? true,
      lastSync: "2 hours ago",
      verified: linkedAccountsData[0]?.verified ?? true,
      icon: <Instagram className="h-6 w-6" />,
      color: "from-pink to-purple",
    },
    {
      id: "tiktok",
      platform: "TikTok",
      username: "@alexjohnson",
      followers: `${(linkedAccountsData[1]?.followers / 1000).toFixed(1)}K`,
      followersRaw: linkedAccountsData[1]?.followers || 32100,
      engagement: `${linkedAccountsData[1]?.engagement || 6.8}%`,
      engagementRaw: linkedAccountsData[1]?.engagement || 6.8,
      connected: linkedAccountsData[1]?.connected ?? true,
      lastSync: "1 hour ago",
      verified: linkedAccountsData[1]?.verified ?? true,
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
      color: "from-cyan to-pink",
    },
    {
      id: "youtube",
      platform: "YouTube",
      username: "Alex Johnson",
      followers: `${(linkedAccountsData[2]?.followers / 1000).toFixed(1)}K`,
      followersRaw: linkedAccountsData[2]?.followers || 14800,
      engagement: `${linkedAccountsData[2]?.engagement || 3.1}%`,
      engagementRaw: linkedAccountsData[2]?.engagement || 3.1,
      connected: linkedAccountsData[2]?.connected ?? true,
      lastSync: "3 hours ago",
      verified: linkedAccountsData[2]?.verified ?? false,
      icon: <Youtube className="h-6 w-6" />,
      color: "from-red-500 to-orange",
    },
  ]);

  // Handle-based platforms configuration
  const handleBasedPlatforms = [
    {
      id: "twitter",
      name: "X (Twitter)",
      campaignCount: 12,
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "from-gray-600 to-gray-800",
      placeholder: "username",
      urlPrefix: "https://x.com/",
    },
    {
      id: "twitch",
      name: "Twitch",
      campaignCount: 8,
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
      color: "from-purple to-indigo-600",
      placeholder: "channelname",
      urlPrefix: "https://twitch.tv/",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      campaignCount: 5,
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
      color: "from-red-600 to-red-700",
      placeholder: "username",
      urlPrefix: "https://pinterest.com/",
    },
  ];

  // Handlers for LinkedIn
  const handleLinkedInConnect = (profileData: {
    username: string;
    name: string;
    profileUrl: string;
  }) => {
    setLinkedInConnected(true);
    setLinkedInProfile(profileData);
  };

  const handleLinkedInDisconnect = () => {
    setLinkedInConnected(false);
    setLinkedInProfile(null);
    toast({
      title: "LinkedIn Disconnected",
      description: "Your LinkedIn profile has been unlinked.",
    });
  };

  // Handlers for WhatsApp
  const handleWhatsAppConnect = (phoneData: {
    countryCode: string;
    phoneNumber: string;
    maskedNumber: string;
  }) => {
    setWhatsAppConnected(true);
    setWhatsAppData(phoneData);
  };

  const handleWhatsAppDisconnect = () => {
    setWhatsAppConnected(false);
    setWhatsAppData(null);
    toast({
      title: "WhatsApp Removed",
      description: "Your phone number has been removed.",
    });
  };

  // Handlers for handle-based platforms
  const openHandleDialog = (platform: typeof handleBasedPlatforms[0]) => {
    setActiveHandlePlatform(platform);
    setHandleDialogOpen(true);
  };

  const handleSaveHandle = async (handle: string) => {
    if (activeHandlePlatform) {
      // Save to local state
      setHandleBasedAccounts(prev => ({
        ...prev,
        [activeHandlePlatform.id]: handle,
      }));
      
      // Persist to database so it counts as a connected account
      try {
        await addLinkedAccount.mutateAsync({
          platform: activeHandlePlatform.id,
          username: handle,
          verified: false, // Handle-based accounts are not verified
        });
      } catch (error) {
        console.error('Failed to save handle to database:', error);
      }
    }
  };

  const handleRemoveHandle = async (platformId: string) => {
    setHandleBasedAccounts(prev => {
      const updated = { ...prev };
      delete updated[platformId as keyof typeof prev];
      return updated;
    });
    
    // Remove from database
    try {
      await removeLinkedAccount.mutateAsync(platformId);
    } catch (error) {
      console.error('Failed to remove handle from database:', error);
    }
    
    toast({
      title: "Handle Removed",
      description: "Your profile handle has been removed.",
    });
  };

  const connectedCount = accounts.filter(a => a.connected).length;
  const verifiedCount = accounts.filter(a => a.connected && a.verified).length;
  const totalFollowers = accounts.reduce((sum, a) => sum + a.followersRaw, 0);


  // Real OAuth connection handler
  const handleConnect = (platform: string) => {
    const oauthPlatform = platform.toLowerCase() as SocialPlatform;
    initOAuth(oauthPlatform);
  };

  // Sync account via real API
  const handleSync = (accountId: string) => {
    // Check if this is an OAuth-connected account
    const oauthAccount = oauthAccounts.find(a => a.id === accountId);
    if (oauthAccount) {
      syncAccount(accountId);
      return;
    }
    
    // Fallback for legacy mock accounts
    toast({
      title: "Syncing Account",
      description: "Your account stats are being updated...",
    });
    
    setTimeout(() => {
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, lastSync: "Just now" } : acc
      ));
      toast({
        title: "Sync complete",
        description: "Account statistics have been updated.",
        variant: "success",
      });
    }, 1500);
  };

  // Disconnect handler
  const handleDisconnect = (accountId: string) => {
    // Check if this is an OAuth-connected account
    const oauthAccount = oauthAccounts.find(a => a.id === accountId);
    if (oauthAccount) {
      disconnectOAuth(accountId);
      return;
    }
    
    // Fallback for legacy mock accounts
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({
      title: "Account unlinked",
      description: "The account has been disconnected from your profile.",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading linked accounts..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div 
          className="p-6 lg:p-8 max-w-5xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <PageHeader
            title="Linked Accounts"
            subtitle="Connect your social platforms to unlock campaigns and improve matching."
            icon={Link2}
          />

          {/* Impact Messaging Banner */}
          <motion.div 
            className="glass rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">How Linking Accounts Helps You</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-background border-white/10">
                      <p className="text-sm">Your match rate improvement is calculated based on: number of connected platforms, verification status, and engagement rates.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-cyan/20 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 text-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Better Matching</p>
                    <p className="text-xs text-muted-foreground">Brands find you based on your real audience data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-pink/20 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-pink" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Unlock Campaigns</p>
                    <p className="text-xs text-muted-foreground">Many campaigns require specific platform connections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-purple/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Verified Stats</p>
                    <p className="text-xs text-muted-foreground">Authentic metrics build brand trust</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-success">{connectedCount} accounts</span> connected • {(totalFollowers / 1000).toFixed(1)}K total reach • {avgEngagement.toFixed(1)}% avg engagement
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-success/20 text-success border-success/30 cursor-help">
                        {matchRateImpact.improvement} match rate
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border-white/10">
                      <p className="text-sm">Based on {connectedCount} connected and {verifiedCount} verified accounts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>

          {/* Connected Accounts (Authentication Required) */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Full authentication provides better matching and reporting
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Star className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
                <Badge className="bg-success/20 text-success border-success/30">
                  {connectedCount} connected
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-4">
              {accounts.map((account) => (
                <motion.div 
                  key={account.id}
                  className="glass rounded-2xl p-5"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Platform Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white shrink-0`}>
                      {account.icon}
                    </div>
                    
                    {/* Account Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{account.platform}</h3>
                        <CheckCircle className="h-4 w-4 text-success" />
                        {["instagram", "tiktok", "youtube"].includes(account.id) && (
                          <Badge className="bg-orange/20 text-orange border-orange/30 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {account.verified && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-6 sm:gap-8">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center cursor-help">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <p className="text-lg font-bold text-foreground">{account.followers}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">Followers</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border-white/10">
                            <p className="text-sm">{account.followersRaw.toLocaleString()} total followers</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center cursor-help">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-muted-foreground" />
                                <p className="text-lg font-bold text-cyan">{account.engagement}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">Engagement</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border-white/10">
                            <p className="text-sm">Avg engagement rate on {account.platform}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {account.engagementRaw > 5 ? "Excellent" : account.engagementRaw > 3 ? "Good" : "Average"} engagement
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSync(account.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Sync</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-muted-foreground hover:text-pink"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last synced: {account.lastSync}</span>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ExternalLink className="h-3 w-3" />
                      View profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Professional & Communication Connections */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Professional & Communication</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Verification
              </Badge>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* LinkedIn Card */}
              <motion.div 
                className={`glass rounded-2xl p-5 transition-all duration-200 ${
                  linkedInConnected ? "border-[#0A66C2]/30" : "hover:border-primary/30"
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white">
                    <Linkedin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">LinkedIn</h3>
                      {linkedInConnected && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    {linkedInConnected && linkedInProfile ? (
                      <p className="text-sm text-muted-foreground">@{linkedInProfile.username}</p>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Not connected
                      </div>
                    )}
                  </div>
                </div>

                {linkedInConnected ? (
                  <>
                    <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-xs text-success flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span className="font-medium">Profile verified</span> • Professional identity confirmed
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLinkedInDialogOpen(true)}
                        className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconnect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLinkedInDisconnect}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span className="font-medium">Boost credibility</span> with professional verification
                      </p>
                    </div>
                    <Button
                      onClick={() => setLinkedInDialogOpen(true)}
                      className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                  </>
                )}
              </motion.div>

              {/* WhatsApp Card */}
              <motion.div 
                className={`glass rounded-2xl p-5 transition-all duration-200 ${
                  whatsAppConnected ? "border-[#25D366]/30" : "hover:border-primary/30"
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">WhatsApp</h3>
                      {whatsAppConnected && (
                        <Badge className="bg-success/20 text-success border-success/30 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {whatsAppConnected && whatsAppData ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {whatsAppData.maskedNumber}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Not verified
                      </div>
                    )}
                  </div>
                </div>

                {whatsAppConnected ? (
                  <>
                    <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-xs text-success flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span className="font-medium">Phone verified</span> • Direct communication enabled
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWhatsAppDialogOpen(true)}
                        className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Number
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleWhatsAppDisconnect}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="font-medium">Enable direct messaging</span> with brands
                      </p>
                    </div>
                    <Button
                      onClick={() => setWhatsAppDialogOpen(true)}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Verify Phone Number
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Handle-Based Accounts */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Additional Platforms</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your public handle to help brands discover your content
                </p>
              </div>
              <Badge className="bg-muted text-muted-foreground border-white/10">
                Manual Entry
              </Badge>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {handleBasedPlatforms.map((platform) => {
                const hasHandle = !!handleBasedAccounts[platform.id as keyof typeof handleBasedAccounts];
                const handle = handleBasedAccounts[platform.id as keyof typeof handleBasedAccounts];
                
                return (
                  <motion.div 
                    key={platform.id}
                    className={`glass rounded-2xl p-5 transition-all duration-200 ${
                      hasHandle ? "border-success/30" : "hover:border-primary/30"
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white`}>
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{platform.name}</h3>
                          {hasHandle && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                        {hasHandle ? (
                          <p className="text-sm text-muted-foreground">@{handle}</p>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <AlertCircle className="h-3 w-3" />
                            Not added
                          </div>
                        )}
                      </div>
                    </div>

                    {hasHandle ? (
                      <>
                        <div className="mb-4 p-2 rounded-lg bg-success/10 border border-success/20">
                          <p className="text-xs text-success flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-medium">Handle added</span> • Profile linked
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openHandleDialog(platform)}
                            className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveHandle(platform.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 p-2 rounded-lg bg-muted/50 border border-white/10">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="font-medium">{platform.campaignCount} campaigns</span> on {platform.name}
                          </p>
                        </div>
                        <Button
                          onClick={() => openHandleDialog(platform)}
                          variant="outline"
                          className="w-full border-white/20 bg-white/5 hover:bg-white/10 rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Handle
                        </Button>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Helper text */}
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-white/5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Handle-based accounts</span> let you link your public profile without authentication. 
                    For better campaign matching, reporting, and brand trust, we recommend connecting accounts with full authentication when available.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Impact Summary */}
          <motion.div 
            className="mt-8 glass rounded-2xl p-6"
            variants={fadeInUp}
          >
            <h3 className="font-semibold text-foreground mb-4">Why connect your accounts?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Unlock exclusive campaigns</p>
                  <p className="text-xs text-muted-foreground">Many brands require specific platform connections</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Improve AI matching</p>
                  <p className="text-xs text-muted-foreground">Real engagement data powers better recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Build brand trust</p>
                  <p className="text-xs text-muted-foreground">Verified stats make brands more confident in you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Track performance</p>
                  <p className="text-xs text-muted-foreground">Monitor your growth and engagement in one place</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </PageTransition>

      {/* LinkedIn Connect Dialog */}
      <LinkedInConnectDialog
        open={linkedInDialogOpen}
        onOpenChange={setLinkedInDialogOpen}
        onConnect={handleLinkedInConnect}
      />

      {/* WhatsApp Connect Dialog */}
      <WhatsAppConnectDialog
        open={whatsAppDialogOpen}
        onOpenChange={setWhatsAppDialogOpen}
        onConnect={handleWhatsAppConnect}
      />

      {/* Handle Input Dialog */}
      {activeHandlePlatform && (
        <HandleInputDialog
          open={handleDialogOpen}
          onOpenChange={setHandleDialogOpen}
          platform={activeHandlePlatform}
          currentHandle={handleBasedAccounts[activeHandlePlatform.id as keyof typeof handleBasedAccounts] || ""}
          onSave={handleSaveHandle}
        />
      )}
    </DashboardLayout>
  );
};

export default LinkedAccounts;
