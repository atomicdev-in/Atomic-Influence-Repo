import { useState } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { Settings, Users, Bell, Shield, Palette, Moon, Sun, Lock, Eye, LogOut, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TeamManagement } from "@/components/brand/TeamManagement";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BrandSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [creatorUpdates, setCreatorUpdates] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

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
        title: "Session terminated",
        description: "You have been signed out from all devices.",
      });
      navigate("/login");
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "You will receive a download link when processing completes.",
    });
  };

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
    <BrandDashboardLayout>
      <PageTransition>
        <div className="space-y-6 max-w-5xl mx-auto">
          <PageHeader
            title="Settings"
            subtitle="Manage your account, team, and preferences"
            icon={Settings}
          />

          <Tabs defaultValue="team" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Team Tab */}
            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SettingRow 
                    label="Email Notifications"
                    description="Receive email updates about campaign activity"
                  >
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </SettingRow>
                  <SettingRow 
                    label="Push Notifications"
                    description="Get instant notifications in your browser"
                  >
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </SettingRow>
                  <SettingRow 
                    label="Campaign Alerts"
                    description="Notifications about campaign milestones and deadlines"
                  >
                    <Switch
                      checked={campaignAlerts}
                      onCheckedChange={setCampaignAlerts}
                    />
                  </SettingRow>
                  <SettingRow 
                    label="Creator Updates"
                    description="Get notified when creators respond to invitations"
                  >
                    <Switch
                      checked={creatorUpdates}
                      onCheckedChange={setCreatorUpdates}
                    />
                  </SettingRow>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the dashboard looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingRow 
                    label="Theme"
                    description="Switch between light and dark mode"
                  >
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 rounded-xl gap-2"
                      onClick={toggleTheme}
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4" />
                          Light Mode
                        </>
                      )}
                    </Button>
                  </SettingRow>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-muted-foreground">
                      Your theme preference is saved automatically and persists across sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandSettings;
