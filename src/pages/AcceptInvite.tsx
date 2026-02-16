import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { acceptInvitation } = useTeamInvitations();
  
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "accepted" | "error">("loading");
  const [invitation, setInvitation] = useState<{
    email: string;
    role: string;
    brand_name?: string;
  } | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        // Fetch invitation details
        const { data, error } = await supabase
          .from("team_invitations")
          .select(`
            *,
            brand_profiles:brand_id (company_name)
          `)
          .eq("token", token)
          .single();

        if (error || !data) {
          setStatus("invalid");
          return;
        }

        // Check if already accepted
        if (data.status === "accepted") {
          setStatus("accepted");
          return;
        }

        // Check if expired or cancelled
        if (data.status !== "pending" || new Date(data.expires_at) < new Date()) {
          setStatus("invalid");
          return;
        }

        setInvitation({
          email: data.email,
          role: data.role,
          brand_name: (data.brand_profiles as any)?.company_name || "Unknown Brand",
        });
        setStatus("valid");
      } catch (err) {
        console.error("Error validating invitation:", err);
        setStatus("error");
      }
    };

    validateInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !user) return;

    setIsAccepting(true);
    const { error } = await acceptInvitation(token);
    
    if (error) {
      toast.error("Operation failed", { description: error.message });
      setIsAccepting(false);
    } else {
      toast.success("Team joined", { description: "You are now a member of this organization." });
      setStatus("accepted");
      setTimeout(() => {
        navigate("/brand/dashboard");
      }, 2000);
    }
  };

  // If not authenticated, redirect to login with return URL
  useEffect(() => {
    if (!authLoading && !user && status === "valid") {
      const returnUrl = `/accept-invite?token=${token}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, user, status, token, navigate]);

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validating invitation...</p>
        </motion.div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>
                This invitation link is invalid, expired, or has already been used.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"
              >
                <Check className="h-8 w-8 text-emerald-500" />
              </motion.div>
              <CardTitle>Welcome to the Team!</CardTitle>
              <CardDescription>
                You've successfully joined. Redirecting to your dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>
              You've been invited to join {invitation?.brand_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{invitation?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{invitation?.role?.replace("_", " ")}</span>
              </div>
            </div>

            {user?.email?.toLowerCase() !== invitation?.email?.toLowerCase() && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-400">
                <p>
                  You're logged in as <strong>{user?.email}</strong>, but this invitation was sent to{" "}
                  <strong>{invitation?.email}</strong>. Make sure you're using the correct account.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/brand/dashboard")}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
