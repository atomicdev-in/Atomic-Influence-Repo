import { useState } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette,
  Users,
  Megaphone,
  Brain,
  Lock,
  Mail,
  Globe,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SettingToggle = ({ id, label, description, checked, onCheckedChange }: SettingToggleProps) => (
  <div className="flex items-center justify-between py-3">
    <div className="space-y-0.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default function AdminSettings() {
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    newUserSignups: true,
    autoApproveCreators: false,
    autoApproveBrands: false,
    emailNotifications: true,
    matchingEnabled: true,
    advancedAnalytics: true,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    enforceRLS: true,
    auditLogging: true,
    twoFactorRequired: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    systemAlerts: true,
    userActivityAlerts: true,
    campaignAlerts: true,
    securityAlerts: true,
    weeklyDigest: true,
  });

  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleResetSettings = (section: string) => {
    toast.info(`${section} settings reset to defaults`);
  };

  return (
    <AdminDashboardLayout title="Settings">
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Platform Settings" 
              subtitle="Configure platform behavior, security, and notifications"
            />

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="bg-card/50 border border-white/10">
                <TabsTrigger value="general" className="data-[state=active]:bg-primary/20">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-primary/20">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="matching" className="data-[state=active]:bg-primary/20">
                  <Brain className="h-4 w-4 mr-2" />
                  Matching
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Platform Configuration
                    </CardTitle>
                    <CardDescription>Core platform settings and feature toggles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      id="maintenance-mode"
                      label="Maintenance Mode"
                      description="Temporarily disable platform access for all users except admins"
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="new-signups"
                      label="Allow New Signups"
                      description="Enable or disable new user registrations"
                      checked={platformSettings.newUserSignups}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, newUserSignups: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="auto-approve-creators"
                      label="Auto-Approve Creators"
                      description="Automatically approve new creator registrations"
                      checked={platformSettings.autoApproveCreators}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, autoApproveCreators: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="auto-approve-brands"
                      label="Auto-Approve Brands"
                      description="Automatically approve new brand registrations"
                      checked={platformSettings.autoApproveBrands}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, autoApproveBrands: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="advanced-analytics"
                      label="Advanced Analytics"
                      description="Enable detailed platform analytics and reporting"
                      checked={platformSettings.advancedAnalytics}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, advancedAnalytics: checked }))
                      }
                    />
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetSettings("General")}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSaveSettings("General")}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Security Configuration
                    </CardTitle>
                    <CardDescription>Authentication and access control settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      id="enforce-rls"
                      label="Enforce Row Level Security"
                      description="Ensure RLS policies are enforced on all database tables"
                      checked={securitySettings.enforceRLS}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enforceRLS: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="audit-logging"
                      label="Audit Logging"
                      description="Log all administrative actions for compliance"
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="two-factor"
                      label="Require Two-Factor Authentication"
                      description="Require 2FA for all admin accounts"
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => 
                            setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))
                          }
                          className="bg-muted/20 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-attempts">Max Login Attempts</Label>
                        <Input
                          id="max-attempts"
                          type="number"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => 
                            setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))
                          }
                          className="bg-muted/20 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetSettings("Security")}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSaveSettings("Security")}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Admin Notifications
                    </CardTitle>
                    <CardDescription>Configure which notifications you receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      id="system-alerts"
                      label="System Alerts"
                      description="Receive alerts for system health issues"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="user-activity"
                      label="User Activity Alerts"
                      description="Get notified about significant user actions"
                      checked={notificationSettings.userActivityAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, userActivityAlerts: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="campaign-alerts"
                      label="Campaign Alerts"
                      description="Notifications for campaign milestones and issues"
                      checked={notificationSettings.campaignAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, campaignAlerts: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="security-alerts"
                      label="Security Alerts"
                      description="Immediate alerts for security-related events"
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    <SettingToggle
                      id="weekly-digest"
                      label="Weekly Digest"
                      description="Receive a weekly summary of platform activity"
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                      }
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetSettings("Notification")}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSaveSettings("Notification")}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Matching Algorithm Settings */}
              <TabsContent value="matching" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Matching Algorithm
                    </CardTitle>
                    <CardDescription>Configure the AI matching system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      id="matching-enabled"
                      label="Enable Matching"
                      description="Enable the AI-powered creator-campaign matching system"
                      checked={platformSettings.matchingEnabled}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({ ...prev, matchingEnabled: checked }))
                      }
                    />
                    <Separator className="bg-white/5" />
                    
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-medium">Weight Configuration</h4>
                      <p className="text-xs text-muted-foreground">
                        Adjust the importance of different factors in the matching algorithm
                      </p>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Survey Responses</Label>
                            <Badge variant="outline">40%</Badge>
                          </div>
                          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full w-[40%] bg-gradient-to-r from-primary to-primary/60" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Engagement Rate</Label>
                            <Badge variant="outline">25%</Badge>
                          </div>
                          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full w-[25%] bg-gradient-to-r from-blue-500 to-blue-500/60" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Historical Performance</Label>
                            <Badge variant="outline">20%</Badge>
                          </div>
                          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full w-[20%] bg-gradient-to-r from-green-500 to-green-500/60" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Category Alignment</Label>
                            <Badge variant="outline">15%</Badge>
                          </div>
                          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full w-[15%] bg-gradient-to-r from-amber-500 to-amber-500/60" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetSettings("Matching")}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSaveSettings("Matching")}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
