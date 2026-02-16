import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  DollarSign,
  Briefcase,
  MoreVertical,
  Plus,
  Crown,
  Check,
  X,
  Mail,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBrandRoles, BrandRole, BrandUserRole } from "@/hooks/useBrandRoles";
import { useCampaignAssignments } from "@/hooks/useCampaignAssignments";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { toast } from "@/hooks/use-toast";
import { CampaignAssignmentDialog } from "./CampaignAssignmentDialog";
import { formatDistanceToNow } from "date-fns";

const roleConfig: Record<BrandRole, { label: string; icon: typeof Shield; color: string; description: string }> = {
  agency_admin: {
    label: "Agency Admin",
    icon: Shield,
    color: "bg-primary/10 text-primary border-primary/20",
    description: "Full access to all campaigns, settings, and team management",
  },
  finance: {
    label: "Finance",
    icon: DollarSign,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    description: "Access to budgets, payouts, and financial reports only",
  },
  campaign_manager: {
    label: "Campaign Manager",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "Access to assigned campaigns only",
  },
};

export const TeamManagement = () => {
  const {
    currentUserRole,
    teamMembers,
    loading,
    isOwner,
    canManageTeam,
    updateTeamMemberRole,
    removeTeamMember,
  } = useBrandRoles();
  
  const { campaigns, getUserAssignments } = useCampaignAssignments();
  const { invitations, sendInvitation, cancelInvitation, resendInvitation } = useTeamInvitations();
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BrandRole>("campaign_manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<BrandUserRole | null>(null);
  const [assigningMember, setAssigningMember] = useState<BrandUserRole | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error, invitation } = await sendInvitation(inviteEmail, inviteRole);
    
    if (error) {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}. They'll receive a link to join your team.`,
      });
      
      // Log the invite link for testing (remove in production)
      if (invitation) {
        console.log(`🔗 Invite link: ${window.location.origin}/accept-invite?token=${invitation.token}`);
      }
    }
    
    setIsInviteOpen(false);
    setInviteEmail("");
    setInviteRole("campaign_manager");
    setIsSubmitting(false);
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    const { error } = await cancelInvitation(invitationId);
    if (error) {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation cancelled",
        description: `The invitation to ${email} has been cancelled`,
      });
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    const { error } = await resendInvitation(invitationId);
    if (error) {
      toast({
        title: "Failed to resend invitation",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation resent",
        description: `A new invitation has been sent to ${email}`,
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: BrandRole) => {
    const { error } = await updateTeamMemberRole(userId, newRole);
    if (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role updated",
        description: "Team member role has been updated",
      });
    }
    setEditingMember(null);
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await removeTeamMember(userId);
    if (error) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Member removed",
        description: "Team member has been removed",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team's access and permissions
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card key={key} className="border-border/50 bg-card/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team Members List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Active Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Owner (always shown) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-amber-500/30">
                  <AvatarFallback className="bg-amber-500/10 text-amber-600">
                    <Crown className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">You (Owner)</p>
                  <p className="text-sm text-muted-foreground">Full access to everything</p>
                </div>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Owner
              </Badge>
            </motion.div>

            {/* Team Members */}
            {teamMembers.map((member, index) => {
              const roleInfo = roleConfig[member.role];
              const Icon = roleInfo.icon;
              const assignments = getUserAssignments(member.user_id);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.user_email || `User ${member.user_id.slice(0, 8)}...`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                        {member.role === "campaign_manager" && assignments.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {assignments.length} campaign{assignments.length !== 1 ? "s" : ""} assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManageTeam && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingMember(member)}>
                          Change Role
                        </DropdownMenuItem>
                        {member.role === "campaign_manager" && (
                          <DropdownMenuItem onClick={() => setAssigningMember(member)}>
                            Manage Campaign Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </motion.div>
              );
            })}

            {teamMembers.length === 0 && invitations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Invite team members to collaborate on campaigns</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canManageTeam && invitations.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation, index) => {
                const roleInfo = roleConfig[invitation.role];
                const Icon = roleInfo.icon;
                const expiresIn = formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true });

                return (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-dashed border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <Icon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={roleInfo.color}>
                            {roleInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {expiresIn}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your brand team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as BrandRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {roleConfig[inviteRole].description}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for this team member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {Object.entries(roleConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isSelected = editingMember?.role === key;

              return (
                <button
                  key={key}
                  onClick={() => editingMember && handleRoleChange(editingMember.user_id, key as BrandRole)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{config.label}</p>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Assignment Dialog */}
      {assigningMember && (
        <CampaignAssignmentDialog
          member={assigningMember}
          campaigns={campaigns}
          onClose={() => setAssigningMember(null)}
        />
      )}
    </div>
  );
};
