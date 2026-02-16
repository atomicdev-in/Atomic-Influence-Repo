import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrandMembership {
  brand_id: string;
  role: 'agency_admin' | 'finance' | 'campaign_manager';
  is_default: boolean;
  brand_profile?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
}

const ACTIVE_BRAND_KEY = 'atomic-active-brand';

export const useBrandSwitcher = () => {
  const [brands, setBrands] = useState<BrandMembership[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get brands the user owns directly
      const { data: ownedBrands } = await supabase
        .from('brand_profiles')
        .select('id, company_name, logo_url')
        .eq('user_id', user.id);

      // Get brands the user is a member of
      const { data: memberships } = await supabase
        .from('brand_memberships')
        .select(`
          brand_id,
          role,
          is_default,
          brand_profile:brand_profiles(id, company_name, logo_url)
        `)
        .eq('user_id', user.id);

      const allBrands: BrandMembership[] = [];

      // Add owned brands as agency_admin
      if (ownedBrands) {
        ownedBrands.forEach(brand => {
          allBrands.push({
            brand_id: brand.id,
            role: 'agency_admin',
            is_default: true,
            brand_profile: brand,
          });
        });
      }

      // Add membership brands (avoiding duplicates)
      if (memberships) {
        memberships.forEach(m => {
          if (!allBrands.some(b => b.brand_id === m.brand_id)) {
            const profile = Array.isArray(m.brand_profile) ? m.brand_profile[0] : m.brand_profile;
            allBrands.push({
              brand_id: m.brand_id,
              role: m.role as BrandMembership['role'],
              is_default: m.is_default,
              brand_profile: profile,
            });
          }
        });
      }

      setBrands(allBrands);

      // Restore active brand from localStorage or use default
      const storedBrandId = localStorage.getItem(ACTIVE_BRAND_KEY);
      if (storedBrandId && allBrands.some(b => b.brand_id === storedBrandId)) {
        setActiveBrandId(storedBrandId);
      } else if (allBrands.length > 0) {
        const defaultBrand = allBrands.find(b => b.is_default) || allBrands[0];
        setActiveBrandId(defaultBrand.brand_id);
        localStorage.setItem(ACTIVE_BRAND_KEY, defaultBrand.brand_id);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchBrand = useCallback((brandId: string) => {
    if (brands.some(b => b.brand_id === brandId)) {
      setActiveBrandId(brandId);
      localStorage.setItem(ACTIVE_BRAND_KEY, brandId);
    }
  }, [brands]);

  const activeBrand = brands.find(b => b.brand_id === activeBrandId);
  const hasMultipleBrands = brands.length > 1;

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    activeBrandId,
    activeBrand,
    hasMultipleBrands,
    isLoading,
    switchBrand,
    refetch: fetchBrands,
  };
};
