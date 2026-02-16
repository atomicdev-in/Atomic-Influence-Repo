import { useState, useEffect } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { Building2, Camera, Edit2, Globe, MapPin, Users, Mail, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BrandProfile {
  id: string;
  company_name: string;
  email: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  logo_url: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  name?: string;
}

const BrandProfilePage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (user) {
      fetchBrandProfile();
    }
  }, [user]);

  const fetchBrandProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch brand profile
      const { data: profileData } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);

        // Fetch team members
        const { data: members } = await supabase
          .from('brand_user_roles')
          .select('id, user_id, role, created_at')
          .eq('brand_id', profileData.id);

        setTeamMembers(members || []);
      }
    } catch (error) {
      console.error('Error fetching brand profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'agency_admin': return 'default';
      case 'campaign_manager': return 'secondary';
      default: return 'outline';
    }
  };

  const formatRoleDisplay = (role: string) => {
    switch (role) {
      case 'agency_admin': return 'Admin';
      case 'campaign_manager': return 'Campaign Manager';
      case 'finance': return 'Finance';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <BrandDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading profile..." />
        </div>
      </BrandDashboardLayout>
    );
  }

  if (!profile) {
    return (
      <BrandDashboardLayout>
        <PageTransition>
          <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
              title="Brand Profile"
              subtitle="Manage your company profile and details"
              icon={Building2}
            />
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <EmptyState
                icon={Building2}
                title="No brand profile found"
                description="Create your brand profile to get started with campaign management."
                action={{
                  label: "Create Profile",
                  onClick: () => {},
                }}
              />
            </div>
          </div>
        </PageTransition>
      </BrandDashboardLayout>
    );
  }

  return (
    <BrandDashboardLayout>
      <PageTransition>
        <div className="space-y-6 max-w-4xl mx-auto">
          <PageHeader
            title="Brand Profile"
            subtitle="Manage your company profile and details"
            icon={Building2}
          />

          {/* Profile Card */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.logo_url || ''} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.company_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.company_name}</h2>
                    <p className="text-muted-foreground">{profile.industry || 'Industry not specified'}</p>
                  </div>
                  <Button variant="outline" className="gap-2 shrink-0">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {profile.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {profile.company_size && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.company_size}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">About</h3>
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {profile.description || 'No description provided. Add information about your company to help creators understand your brand.'}
            </p>
          </div>

          {/* Brand Assets */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Brand Assets</h3>
              <Button variant="outline" size="sm">
                Upload Assets
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.logo_url ? (
                <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/30 overflow-hidden">
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/30">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <span className="text-xs text-muted-foreground">Logo</span>
                  </div>
                </div>
              )}
              <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center border border-border/30 border-dashed">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">Add Asset</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Button variant="outline" size="sm">
                Invite Team
              </Button>
            </div>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No team members added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current user as owner */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">You</h4>
                      <Badge variant="default" className="text-xs">
                        Owner
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member.name?.[0] || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.name || 'Team Member'}</h4>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                          {formatRoleDisplay(member.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email || 'No email'}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Joined {formatDate(member.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your password regularly</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandProfilePage;
