import { useState } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Plus, Lock, Trash2, Shield, Building2, Sparkles } from "lucide-react";

interface TenantRule {
  id: string;
  tenant_identifier: string;
  email_domain: string;
  assigned_role: "creator" | "brand" | "admin";
  is_locked: boolean;
  priority: number;
  created_at: string;
}

const AdminTenantRules = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    tenant_identifier: "",
    email_domain: "",
    assigned_role: "creator" as "creator" | "brand" | "admin",
    priority: 0,
  });

  // Fetch tenant rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ["tenant-role-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_role_rules")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as TenantRule[];
    },
  });

  // Add new rule mutation
  const addRuleMutation = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      const { error } = await supabase.from("tenant_role_rules").insert({
        tenant_identifier: rule.tenant_identifier,
        email_domain: rule.email_domain,
        assigned_role: rule.assigned_role,
        priority: rule.priority,
        is_locked: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-role-rules"] });
      toast({ title: "Rule Added", description: "Tenant role rule created successfully." });
      setIsAddDialogOpen(false);
      setNewRule({ tenant_identifier: "", email_domain: "", assigned_role: "creator", priority: 0 });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_role_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-role-rules"] });
      toast({ title: "Rule Deleted", description: "Tenant role rule removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "brand":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "brand":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AdminDashboardLayout title="Tenant Rules">
      <PageErrorBoundary>
        <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tenant Role Rules</h1>
            <p className="text-muted-foreground">
              Configure automatic role assignment based on email domains
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tenant Role Rule</DialogTitle>
                <DialogDescription>
                  Create a new automatic role assignment rule based on email domain.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant_identifier">Tenant Identifier</Label>
                  <Input
                    id="tenant_identifier"
                    placeholder="e.g., acme-corp"
                    value={newRule.tenant_identifier}
                    onChange={(e) => setNewRule({ ...newRule, tenant_identifier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_domain">Email Domain</Label>
                  <Input
                    id="email_domain"
                    placeholder="e.g., acme.com"
                    value={newRule.email_domain}
                    onChange={(e) => setNewRule({ ...newRule, email_domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Users with emails ending in @{newRule.email_domain || "domain.com"} will be auto-assigned.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Assigned Role</Label>
                  <Select
                    value={newRule.assigned_role}
                    onValueChange={(value: "creator" | "brand" | "admin") =>
                      setNewRule({ ...newRule, assigned_role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    placeholder="0"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority rules are matched first if multiple domains apply.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => addRuleMutation.mutate(newRule)}
                  disabled={!newRule.tenant_identifier || !newRule.email_domain || addRuleMutation.isPending}
                >
                  {addRuleMutation.isPending ? "Adding..." : "Add Rule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Rules</CardTitle>
            <CardDescription>
              Rules are matched in priority order. Locked rules cannot be modified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Email Domain</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tenant role rules configured.
                    </TableCell>
                  </TableRow>
                )}
                {rules?.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.tenant_identifier}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">@{rule.email_domain}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(rule.assigned_role) as "default" | "secondary" | "destructive"} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(rule.assigned_role)}
                        {rule.assigned_role}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      {rule.is_locked ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit text-amber-600 border-amber-600/30">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit">Editable</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={rule.is_locked || deleteRuleMutation.isPending}
                        onClick={() => deleteRuleMutation.mutate(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Lock className="h-5 w-5" />
              About Locked Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Locked rules are system-critical and cannot be modified or deleted through this interface.
              The <strong>bluecloudai</strong> rule is permanently locked to ensure the SaaS owner always
              has admin access. To modify locked rules, contact system support or use direct database access
              with appropriate authorization.
            </p>
          </CardContent>
        </Card>
        </div>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
};

export default AdminTenantRules;
