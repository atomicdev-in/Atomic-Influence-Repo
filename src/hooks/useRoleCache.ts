import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = "role_cache_";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RoleCache {
  userRole: CacheEntry<"creator" | "brand" | null> | null;
  brandProfileId: CacheEntry<string | null> | null;
  brandRole: CacheEntry<BrandRoleData | null> | null;
  campaignAccess: Map<string, CacheEntry<boolean>>;
}

interface BrandRoleData {
  role: "owner" | "agency_admin" | "finance" | "campaign_manager";
  brandId: string;
}

// Global cache instance (survives component remounts)
const globalCache: RoleCache = {
  userRole: null,
  brandProfileId: null,
  brandRole: null,
  campaignAccess: new Map(),
};

function isCacheValid<T>(entry: CacheEntry<T> | null | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

function setCache<T>(key: keyof Omit<RoleCache, 'campaignAccess'>, data: T): void {
  (globalCache[key] as CacheEntry<T>) = {
    data,
    timestamp: Date.now(),
  };
}

function setCampaignAccessCache(campaignId: string, canAccess: boolean): void {
  globalCache.campaignAccess.set(campaignId, {
    data: canAccess,
    timestamp: Date.now(),
  });
}

export function invalidateRoleCache(): void {
  globalCache.userRole = null;
  globalCache.brandProfileId = null;
  globalCache.brandRole = null;
  globalCache.campaignAccess.clear();
}

/**
 * Cached user role hook - prevents flicker and unnecessary DB calls
 */
export function useCachedUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<"creator" | "brand" | null>(
    isCacheValid(globalCache.userRole) ? globalCache.userRole!.data : null
  );
  const [loading, setLoading] = useState(!isCacheValid(globalCache.userRole));
  const fetchingRef = useRef(false);

  const fetchRole = useCallback(async () => {
    if (!user?.id || fetchingRef.current) return;
    
    // Check cache first
    if (isCacheValid(globalCache.userRole)) {
      setRole(globalCache.userRole!.data);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      const userRole = (data?.role as "creator" | "brand") || null;
      setCache("userRole", userRole);
      setRole(userRole);
    } catch (err) {
      console.error("Error fetching user role:", err);
      setRole(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user?.id) {
      setRole(null);
      setLoading(false);
      return;
    }

    fetchRole();
  }, [user?.id, authLoading, fetchRole]);

  const refetch = useCallback(() => {
    globalCache.userRole = null;
    return fetchRole();
  }, [fetchRole]);

  return { role, loading: authLoading || loading, refetch };
}

/**
 * Cached brand profile ID hook
 */
export function useCachedBrandProfileId() {
  const { user, loading: authLoading } = useAuth();
  const [brandProfileId, setBrandProfileId] = useState<string | null>(
    isCacheValid(globalCache.brandProfileId) ? globalCache.brandProfileId!.data : null
  );
  const [loading, setLoading] = useState(!isCacheValid(globalCache.brandProfileId));
  const fetchingRef = useRef(false);

  const fetchBrandProfile = useCallback(async () => {
    if (!user?.id || fetchingRef.current) return;

    // Check cache first
    if (isCacheValid(globalCache.brandProfileId)) {
      setBrandProfileId(globalCache.brandProfileId!.data);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      const profileId = data?.id || null;
      setCache("brandProfileId", profileId);
      setBrandProfileId(profileId);
    } catch (err) {
      console.error("Error fetching brand profile:", err);
      setBrandProfileId(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user?.id) {
      setBrandProfileId(null);
      setLoading(false);
      return;
    }

    fetchBrandProfile();
  }, [user?.id, authLoading, fetchBrandProfile]);

  return { brandProfileId, loading: authLoading || loading };
}

/**
 * Cached brand role hook - prevents race conditions and flicker
 */
export function useCachedBrandRole(providedBrandId?: string) {
  const { user, loading: authLoading } = useAuth();
  const { brandProfileId: fetchedBrandId, loading: profileLoading } = useCachedBrandProfileId();
  const brandId = providedBrandId || fetchedBrandId;
  
  const [roleData, setRoleData] = useState<BrandRoleData | null>(
    isCacheValid(globalCache.brandRole) ? globalCache.brandRole!.data : null
  );
  const [loading, setLoading] = useState(!isCacheValid(globalCache.brandRole));
  const fetchingRef = useRef(false);

  const fetchBrandRole = useCallback(async () => {
    if (!user?.id || !brandId || fetchingRef.current) return;

    // Check cache first (only if cached brandId matches)
    if (isCacheValid(globalCache.brandRole) && globalCache.brandRole?.data?.brandId === brandId) {
      setRoleData(globalCache.brandRole.data);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      // Check if user is brand owner
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("user_id")
        .eq("id", brandId)
        .single();

      if (brandProfile?.user_id === user.id) {
        const ownerData: BrandRoleData = { role: "owner", brandId };
        setCache("brandRole", ownerData);
        setRoleData(ownerData);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Check user's role in brand_user_roles
      const { data: roleRecord } = await supabase
        .from("brand_user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .maybeSingle();

      if (roleRecord?.role) {
        const data: BrandRoleData = { 
          role: roleRecord.role as "agency_admin" | "finance" | "campaign_manager", 
          brandId 
        };
        setCache("brandRole", data);
        setRoleData(data);
      } else {
        setCache("brandRole", null);
        setRoleData(null);
      }
    } catch (err) {
      console.error("Error fetching brand role:", err);
      setRoleData(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, brandId]);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    
    if (!user?.id || !brandId) {
      setRoleData(null);
      setLoading(false);
      return;
    }

    fetchBrandRole();
  }, [user?.id, brandId, authLoading, profileLoading, fetchBrandRole]);

  const currentUserRole = roleData?.role || null;
  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "agency_admin" || isOwner;
  const canManageTeam = isAdmin;
  const canViewFinance = isOwner || currentUserRole === "agency_admin" || currentUserRole === "finance";
  const canManageCampaigns = isOwner || currentUserRole === "agency_admin" || currentUserRole === "campaign_manager";

  return {
    currentUserRole,
    brandId,
    loading: authLoading || profileLoading || loading,
    isOwner,
    isAdmin,
    canManageTeam,
    canViewFinance,
    canManageCampaigns,
  };
}

/**
 * Cached campaign access check - for campaign managers
 */
export function useCachedCampaignAccess(campaignId?: string) {
  const { user, loading: authLoading } = useAuth();
  const { currentUserRole, isOwner, isAdmin, loading: roleLoading } = useCachedBrandRole();
  
  const cachedAccess = campaignId ? globalCache.campaignAccess.get(campaignId) : null;
  const [canAccess, setCanAccess] = useState<boolean>(
    isCacheValid(cachedAccess) ? cachedAccess!.data : false
  );
  const [loading, setLoading] = useState(!isCacheValid(cachedAccess));
  const fetchingRef = useRef(false);

  const checkAccess = useCallback(async () => {
    if (!user?.id || !campaignId || fetchingRef.current) return;

    // Owners and admins can access all campaigns
    if (isOwner || isAdmin) {
      setCampaignAccessCache(campaignId, true);
      setCanAccess(true);
      setLoading(false);
      return;
    }

    // Check cache
    const cached = globalCache.campaignAccess.get(campaignId);
    if (isCacheValid(cached)) {
      setCanAccess(cached!.data);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      // Check if user owns the campaign
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("brand_user_id")
        .eq("id", campaignId)
        .maybeSingle();

      if (campaign?.brand_user_id === user.id) {
        setCampaignAccessCache(campaignId, true);
        setCanAccess(true);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Check if user is assigned to this campaign
      const { data: assignment } = await supabase
        .from("campaign_manager_assignments")
        .select("id")
        .eq("user_id", user.id)
        .eq("campaign_id", campaignId)
        .maybeSingle();

      const hasAccess = !!assignment;
      setCampaignAccessCache(campaignId, hasAccess);
      setCanAccess(hasAccess);
    } catch (err) {
      console.error("Error checking campaign access:", err);
      setCanAccess(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, campaignId, isOwner, isAdmin]);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    
    if (!user?.id || !campaignId) {
      setCanAccess(false);
      setLoading(false);
      return;
    }

    checkAccess();
  }, [user?.id, campaignId, authLoading, roleLoading, checkAccess]);

  return { 
    canAccess, 
    loading: authLoading || roleLoading || loading,
    isCampaignManager: currentUserRole === "campaign_manager",
  };
}
