import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Eye,
  Lock,
  Trash2,
  Download,
  LogOut,
  CreditCard,
  CheckCircle,
  BellRing,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    preferences: notificationPrefs, 
    togglePreference, 
    savePreferences: saveNotificationPrefs,
    resetToDefaults,
    hasUnsavedChanges 
  } = useNotificationPreferences();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out from all devices.",
      });
      navigate("/login");
    }
  };

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showStats: true,
    showConnectedAccounts: false,
    allowBrandDiscovery: true,
  });

  // Account preferences
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    theme: "dark",
    currency: "USD",
  });

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    saveNotificationPrefs();
    toast({
      title: "Preferences saved",
      description: "Your settings have been updated.",
      variant: "success",
    });
  };

  const handleResetNotifications = () => {
    resetToDefaults();
    toast({
      title: "Preferences reset",
      description: "Settings have been restored to defaults.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "You will receive a download link when processing completes.",
    });
  };

  const SettingSection = ({ 
    icon: Icon, 
    title, 
    description, 
    children,
    iconColor = "text-primary"
  }: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    children: React.ReactNode;
    iconColor?: string;
  }) => (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 pr-4">
        <Label className="text-foreground font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Settings"
          subtitle="Manage your account preferences"
          icon={SettingsIcon}
        >
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            )}
            <Button onClick={handleSaveSettings} className="gradient-primary text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </PageHeader>

        <div className="space-y-6">
          {/* Notifications */}
          <SettingSection
            icon={Bell}
            title="Notifications"
            description="Choose how you want to be notified"
            iconColor="text-cyan"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h3>
              </div>
              <SettingRow 
                label="Campaign Invitations"
                description="Get notified when brands invite you to campaigns"
              >
                <Switch 
                  checked={notificationPrefs.emailInvitations}
                  onCheckedChange={() => togglePreference('emailInvitations')}
                />
              </SettingRow>
              <SettingRow 
                label="Campaign Updates"
                description="Updates about campaigns you've applied to or joined"
              >
                <Switch 
                  checked={notificationPrefs.emailCampaignUpdates}
                  onCheckedChange={() => togglePreference('emailCampaignUpdates')}
                />
              </SettingRow>
              <SettingRow 
                label="Payment Notifications"
                description="Get notified about payment releases and updates"
              >
                <Switch 
                  checked={notificationPrefs.emailPayments}
                  onCheckedChange={() => togglePreference('emailPayments')}
                />
              </SettingRow>
              <SettingRow 
                label="Weekly Digest"
                description="A summary of new opportunities and your performance"
              >
                <Switch 
                  checked={notificationPrefs.emailWeeklyDigest}
                  onCheckedChange={() => togglePreference('emailWeeklyDigest')}
                />
              </SettingRow>
            </div>

            <div className="space-y-1 pt-4">
              <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2 mb-3">
                <BellRing className="h-4 w-4" />
                In-App Notifications
              </h3>
              <SettingRow 
                label="New Invitations"
                description="Show new campaign invitations in the notification bell"
              >
                <Switch 
                  checked={notificationPrefs.pushNewInvitations}
                  onCheckedChange={() => togglePreference('pushNewInvitations')}
                />
              </SettingRow>
              <SettingRow 
                label="Messages"
                description="Notifications for new messages from brands"
              >
                <Switch 
                  checked={notificationPrefs.pushMessages}
                  onCheckedChange={() => togglePreference('pushMessages')}
                />
              </SettingRow>
              <SettingRow 
                label="Deadline Reminders"
                description="Reminders before campaign deadlines"
              >
                <Switch 
                  checked={notificationPrefs.pushReminders}
                  onCheckedChange={() => togglePreference('pushReminders')}
                />
              </SettingRow>
              <SettingRow 
                label="Campaign Updates"
                description="Content approvals, revision requests, and status changes"
              >
                <Switch 
                  checked={notificationPrefs.pushCampaignUpdates}
                  onCheckedChange={() => togglePreference('pushCampaignUpdates')}
                />
              </SettingRow>
              <SettingRow 
                label="Payment Updates"
                description="Payment processing and release notifications"
              >
                <Switch 
                  checked={notificationPrefs.pushPayments}
                  onCheckedChange={() => togglePreference('pushPayments')}
                />
              </SettingRow>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
              <SettingRow 
                label="Marketing Emails"
                description="Tips, product updates, and promotional content"
              >
                <Switch 
                  checked={notificationPrefs.marketingEmails}
                  onCheckedChange={() => togglePreference('marketingEmails')}
                />
              </SettingRow>
            </div>
            
            <div className="pt-4 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetNotifications}
                className="border-white/10 hover:bg-white/5 rounded-xl text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </SettingSection>

          {/* Privacy */}
          <SettingSection
            icon={Shield}
            title="Privacy"
            description="Control your visibility and data"
            iconColor="text-pink"
          >
            <SettingRow 
              label="Public Profile"
              description="Allow your profile to be visible to brands"
            >
              <Switch 
                checked={privacy.profileVisible}
                onCheckedChange={() => handlePrivacyChange('profileVisible')}
              />
            </SettingRow>
            <SettingRow 
              label="Show Statistics"
              description="Display your follower counts and engagement rates"
            >
              <Switch 
                checked={privacy.showStats}
                onCheckedChange={() => handlePrivacyChange('showStats')}
              />
            </SettingRow>
            <SettingRow 
              label="Show Connected Accounts"
              description="Display which social platforms you've connected"
            >
              <Switch 
                checked={privacy.showConnectedAccounts}
                onCheckedChange={() => handlePrivacyChange('showConnectedAccounts')}
              />
            </SettingRow>
            <SettingRow 
              label="Brand Discovery"
              description="Allow brands to find and invite you to campaigns"
            >
              <Switch 
                checked={privacy.allowBrandDiscovery}
                onCheckedChange={() => handlePrivacyChange('allowBrandDiscovery')}
              />
            </SettingRow>
          </SettingSection>

          {/* Account Preferences */}
          <SettingSection
            icon={User}
            title="Account Preferences"
            description="Customize your experience"
            iconColor="text-purple"
          >
            <SettingRow label="Language">
              <Select value={preferences.language} onValueChange={(v) => setPreferences(p => ({ ...p, language: v }))}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Timezone">
              <Select value={preferences.timezone} onValueChange={(v) => setPreferences(p => ({ ...p, timezone: v }))}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                  <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  <SelectItem value="GMT">GMT (London)</SelectItem>
                  <SelectItem value="CET">Central European (CET)</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Theme">
              <Select value={preferences.theme} onValueChange={(v) => setPreferences(p => ({ ...p, theme: v }))}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl">
                  <Moon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="Currency">
              <Select value={preferences.currency} onValueChange={(v) => setPreferences(p => ({ ...p, currency: v }))}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingSection>

          {/* Security */}
          <SettingSection
            icon={Lock}
            title="Security"
            description="Protect your account"
            iconColor="text-orange"
          >
            <SettingRow 
              label="Change Password"
              description="Update your account password"
            >
              <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl">
                Update
              </Button>
            </SettingRow>
            <SettingRow 
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            >
              <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl">
                Enable
              </Button>
            </SettingRow>
            <SettingRow 
              label="Active Sessions"
              description="Manage devices where you're logged in"
            >
              <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </SettingRow>
          </SettingSection>

          {/* Data & Account */}
          <SettingSection
            icon={Download}
            title="Data & Account"
            description="Manage your data and account"
            iconColor="text-muted-foreground"
          >
            <SettingRow 
              label="Export Your Data"
              description="Download a copy of all your data"
            >
              <Button 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 rounded-xl"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </SettingRow>
            <SettingRow 
              label="Sign Out Everywhere"
              description="Log out from all devices"
            >
              <Button 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 rounded-xl"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out All
              </Button>
            </SettingRow>
            <div className="pt-4 mt-4 border-t border-white/10">
              <SettingRow 
                label="Delete Account"
                description="Permanently delete your account and all data"
              >
                <Button variant="outline" className="border-pink/30 text-pink hover:bg-pink/10 rounded-xl">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </SettingRow>
            </div>
          </SettingSection>
        </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Settings;
