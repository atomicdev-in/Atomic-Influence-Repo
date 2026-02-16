import { useState } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useAdminUsers, useUpdateUserRole, useRoleStats, type UserRole, type AdminUser } from "@/hooks/useAdminUserManagement";
import { useUsersWithStatus, useDisableUser, useEnableUser } from "@/hooks/useUserStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Building2, Palette, Search, AlertTriangle, MoreHorizontal, Ban, CheckCircle, UserX } from "lucide-react";
import { format } from "date-fns";

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleStatsCards({ stats, disabledCount }: { stats: { total: number; creators: number; brands: number; admins: number }; disabledCount: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Creators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.creators}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.brands}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 backdrop-blur-sm border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Disabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-400">{disabledCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-primary/20 text-primary border-primary/30" },
    brand: { label: "Brand", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    creator: { label: "Creator", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  };

  const variant = variants[role];
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: "active" | "disabled" }) {
  if (status === "disabled") {
    return (
      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
        <Ban className="h-3 w-3" />
        Disabled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Active
    </Badge>
  );
}

function RoleChangeDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newRole: UserRole) => void;
  isPending: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            This action will change the permissions for <strong>{user.name || user.email || user.user_id}</strong>. 
            This change is audited and immediate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || "Unknown User"}</p>
              <p className="text-sm text-muted-foreground">{user.email || user.user_id}</p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedRole === "admin" && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              <strong>Warning:</strong> Admin users have full access to all platform data and settings.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={() => selectedRole && onConfirm(selectedRole)} 
            disabled={!selectedRole || selectedRole === user.role || isPending}
          >
            {isPending ? "Updating..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusChangeDialog({
  user,
  action,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  user: { id: string; email: string; status: "active" | "disabled" } | null;
  action: "disable" | "enable";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  if (!user) return null;

  const isDisabling = action === "disable";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDisabling ? (
              <>
                <Ban className="h-5 w-5 text-red-400" />
                Disable User Account
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-400" />
                Enable User Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDisabling ? (
              <>
                This will prevent <strong>{user.email}</strong> from logging in and invalidate all active sessions.
                Their data will be preserved for audit purposes.
              </>
            ) : (
              <>
                This will allow <strong>{user.email}</strong> to log in again.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason {isDisabling ? "(required)" : "(optional)"}</Label>
            <Textarea
              id="reason"
              placeholder={isDisabling ? "Enter reason for disabling this user..." : "Enter reason for re-enabling..."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-background/50"
            />
          </div>
          {isDisabling && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <strong>Warning:</strong> This action is immediate. The user will be logged out and unable to access the platform.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant={isDisabling ? "destructive" : "default"}
            onClick={() => onConfirm(reason)} 
            disabled={isPending || (isDisabling && !reason.trim())}
          >
            {isPending ? "Processing..." : isDisabling ? "Disable User" : "Enable User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = useAdminUsers();
  const { data: usersWithStatus, isLoading: statusLoading } = useUsersWithStatus();
  const { data: stats } = useRoleStats();
  const updateRole = useUpdateUserRole();
  const disableUser = useDisableUser();
  const enableUser = useEnableUser();
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"disable" | "enable">("disable");
  const [selectedStatusUser, setSelectedStatusUser] = useState<{ id: string; email: string; status: "active" | "disabled" } | null>(null);

  // Merge users with status data
  const mergedUsers = users?.map(user => {
    const statusData = usersWithStatus?.find(u => u.id === user.user_id);
    return {
      ...user,
      status: statusData?.status || "active" as "active" | "disabled",
      banned_until: statusData?.banned_until,
      status_reason: statusData?.status_reason,
    };
  });

  const disabledCount = mergedUsers?.filter(u => u.status === "disabled").length || 0;

  const filteredUsers = mergedUsers?.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.user_id.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleConfirmRoleChange = async (newRole: UserRole) => {
    if (!selectedUser) return;
    
    await updateRole.mutateAsync({ userId: selectedUser.user_id, newRole });
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleStatusChange = (user: typeof mergedUsers[0], action: "disable" | "enable") => {
    setSelectedStatusUser({ id: user.user_id, email: user.email || user.user_id, status: user.status });
    setStatusAction(action);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async (reason: string) => {
    if (!selectedStatusUser) return;
    
    if (statusAction === "disable") {
      await disableUser.mutateAsync({ userId: selectedStatusUser.id, reason });
    } else {
      await enableUser.mutateAsync({ userId: selectedStatusUser.id, reason });
    }
    
    setStatusDialogOpen(false);
    setSelectedStatusUser(null);
    refetch();
  };

  if (isLoading || statusLoading) {
    return (
      <AdminDashboardLayout title="User Management">
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="User Management" 
              subtitle="View and manage all platform users, roles, and account status"
            />
            <UsersTableSkeleton />
          </div>
        </PageTransition>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="User Management" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="User Management" 
              subtitle="View and manage all platform users, roles, and account status"
            />

            {stats && <RoleStatsCards stats={stats} disabledCount={disabledCount} />}

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card/50 border-white/10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-card/50 border-white/10">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="creator">Creators</SelectItem>
                  <SelectItem value="brand">Brands</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-card/50 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!filteredUsers?.length ? (
              <EmptyState
                icon={Users}
                title="No users found"
                description={search || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria." 
                  : "Users will appear here once they sign up."
                }
              />
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Profile Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className={`border-white/10 ${user.status === "disabled" ? "opacity-60" : ""}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-9 w-9 ${user.status === "disabled" ? "grayscale" : ""}`}>
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate max-w-[200px]">
                                  {user.name || "Unknown User"}
                                </p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {user.email || user.user_id.slice(0, 8) + "..."}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground capitalize">
                              {user.profile_type || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(user.created_at), "MMM d, yyyy")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(user, "disable")}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Disable User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(user, "enable")}
                                    className="text-green-400 focus:text-green-400"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Enable User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </PageTransition>
      </PageErrorBoundary>

      <RoleChangeDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmRoleChange}
        isPending={updateRole.isPending}
      />

      <StatusChangeDialog
        user={selectedStatusUser}
        action={statusAction}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onConfirm={handleConfirmStatusChange}
        isPending={disableUser.isPending || enableUser.isPending}
      />
    </AdminDashboardLayout>
  );
}
