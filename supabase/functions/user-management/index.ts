import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserStatusRequest {
  action: "disable" | "enable" | "list" | "get-status";
  userId?: string;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for auth check (uses caller's token)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the caller is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getUser(token);
    
    if (claimsError || !claims?.user) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminId = claims.user.id;

    // Check if caller is admin
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminId)
      .maybeSingle();

    if (roleError || roleData?.role !== "admin") {
      console.error("Role check failed:", roleError, roleData);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client for user management (service role)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body: UserStatusRequest = await req.json();
    const { action, userId, reason } = body;

    console.log(`User management action: ${action} for user: ${userId}`);

    if (action === "list") {
      // List all users with their status
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing users:", listError);
        throw listError;
      }

      // Get status logs for all users
      const { data: statusLogs } = await adminClient
        .from("user_status_log")
        .select("*")
        .order("created_at", { ascending: false });

      // Map users with their status
      const usersWithStatus = users.map((user) => {
        const latestStatus = statusLogs?.find((log) => log.user_id === user.id);
        const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          status: isBanned ? "disabled" : "active",
          banned_until: user.banned_until,
          status_reason: latestStatus?.reason,
          status_changed_at: latestStatus?.created_at,
        };
      });

      return new Response(
        JSON.stringify({ users: usersWithStatus }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get-status" && userId) {
      // Get single user status
      const { data: { user }, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
      
      if (getUserError || !user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: statusLog } = await adminClient
        .from("user_status_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const isBanned = user.banned_until && new Date(user.banned_until) > new Date();

      return new Response(
        JSON.stringify({
          id: user.id,
          email: user.email,
          status: isBanned ? "disabled" : "active",
          banned_until: user.banned_until,
          status_reason: statusLog?.reason,
          status_changed_at: statusLog?.created_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disable" && userId) {
      // Prevent admin from disabling themselves
      if (userId === adminId) {
        return new Response(
          JSON.stringify({ error: "Cannot disable your own account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if target user is also an admin (prevent disabling other admins unless super admin)
      const { data: targetRole } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      // Check if target is the bluecloudai tenant (protected)
      const { data: { user: targetUser } } = await adminClient.auth.admin.getUserById(userId);
      
      if (targetUser?.email?.endsWith("@bluecloudai.com")) {
        // Check if caller is also bluecloudai (super admin)
        if (!claims.user.email?.endsWith("@bluecloudai.com")) {
          return new Response(
            JSON.stringify({ error: "Cannot disable protected tenant users" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Ban the user (set banned_until to far future)
      const farFuture = new Date("2099-12-31T23:59:59Z").toISOString();
      const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // ~100 years
      });

      if (banError) {
        console.error("Error banning user:", banError);
        throw banError;
      }

      // Log the status change
      const { error: logError } = await adminClient
        .from("user_status_log")
        .insert({
          user_id: userId,
          status: "disabled",
          reason: reason || "Disabled by administrator",
          changed_by: adminId,
        });

      if (logError) {
        console.error("Error logging status change:", logError);
      }

      // Log to audit trail
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: adminId,
          action: "user_disabled",
          entity_type: "user",
          entity_id: userId,
          new_value: { status: "disabled", reason },
        });

      console.log(`User ${userId} disabled by admin ${adminId}`);

      return new Response(
        JSON.stringify({ success: true, status: "disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "enable" && userId) {
      // Unban the user
      const { error: unbanError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (unbanError) {
        console.error("Error unbanning user:", unbanError);
        throw unbanError;
      }

      // Log the status change
      const { error: logError } = await adminClient
        .from("user_status_log")
        .insert({
          user_id: userId,
          status: "active",
          reason: reason || "Re-enabled by administrator",
          changed_by: adminId,
        });

      if (logError) {
        console.error("Error logging status change:", logError);
      }

      // Log to audit trail
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: adminId,
          action: "user_enabled",
          entity_type: "user",
          entity_id: userId,
          new_value: { status: "active", reason },
        });

      console.log(`User ${userId} enabled by admin ${adminId}`);

      return new Response(
        JSON.stringify({ success: true, status: "active" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("User management error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
