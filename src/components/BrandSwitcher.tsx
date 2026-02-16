import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronDown, Check, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useBrandSwitcher, BrandMembership } from "@/hooks/useBrandSwitcher";
import { cn } from "@/lib/utils";

const roleLabels: Record<BrandMembership['role'], string> = {
  agency_admin: 'Admin',
  finance: 'Finance',
  campaign_manager: 'Manager',
};

const roleColors: Record<BrandMembership['role'], string> = {
  agency_admin: 'text-primary',
  finance: 'text-emerald-500',
  campaign_manager: 'text-blue-500',
};

interface BrandSwitcherProps {
  collapsed?: boolean;
}

export function BrandSwitcher({ collapsed = false }: BrandSwitcherProps) {
  const { brands, activeBrand, hasMultipleBrands, isLoading, switchBrand } = useBrandSwitcher();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-xl bg-white/5",
        collapsed && "justify-center"
      )}>
        <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
        {!collapsed && <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />}
      </div>
    );
  }

  if (!activeBrand) {
    return null;
  }

  // If only one brand and collapsed, just show the avatar
  if (!hasMultipleBrands && collapsed) {
    return (
      <div className="flex justify-center p-2">
        <Avatar className="h-9 w-9 rounded-xl">
          {activeBrand.brand_profile?.logo_url ? (
            <AvatarImage src={activeBrand.brand_profile.logo_url} alt={activeBrand.brand_profile?.company_name} />
          ) : (
            <AvatarFallback className="rounded-xl bg-primary/20 text-primary">
              {activeBrand.brand_profile?.company_name?.[0] || 'B'}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    );
  }

  // If only one brand and not collapsed, show static display
  if (!hasMultipleBrands) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Avatar className="h-9 w-9 rounded-xl">
          {activeBrand.brand_profile?.logo_url ? (
            <AvatarImage src={activeBrand.brand_profile.logo_url} alt={activeBrand.brand_profile?.company_name} />
          ) : (
            <AvatarFallback className="rounded-xl bg-primary/20 text-primary">
              {activeBrand.brand_profile?.company_name?.[0] || 'B'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {activeBrand.brand_profile?.company_name || 'My Brand'}
          </p>
          <p className={cn("text-xs", roleColors[activeBrand.role])}>
            {roleLabels[activeBrand.role]}
          </p>
        </div>
      </div>
    );
  }

  // Multiple brands - show dropdown
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 p-2 h-auto hover:bg-white/10",
            collapsed && "justify-center p-2"
          )}
        >
          <Avatar className="h-9 w-9 rounded-xl flex-shrink-0">
            {activeBrand.brand_profile?.logo_url ? (
              <AvatarImage src={activeBrand.brand_profile.logo_url} alt={activeBrand.brand_profile?.company_name} />
            ) : (
              <AvatarFallback className="rounded-xl bg-primary/20 text-primary">
                {activeBrand.brand_profile?.company_name?.[0] || 'B'}
              </AvatarFallback>
            )}
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {activeBrand.brand_profile?.company_name || 'My Brand'}
                </p>
                <p className={cn("text-xs", roleColors[activeBrand.role])}>
                  {roleLabels[activeBrand.role]}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-white/60 transition-transform flex-shrink-0",
                open && "rotate-180"
              )} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={collapsed ? "center" : "start"} 
        className="w-64"
        sideOffset={8}
      >
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Switch Brand
        </div>
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.brand_id}
            className="gap-3 p-2 cursor-pointer"
            onClick={() => {
              switchBrand(brand.brand_id);
              setOpen(false);
            }}
          >
            <Avatar className="h-8 w-8 rounded-lg">
              {brand.brand_profile?.logo_url ? (
                <AvatarImage src={brand.brand_profile.logo_url} alt={brand.brand_profile?.company_name} />
              ) : (
                <AvatarFallback className="rounded-lg bg-muted">
                  {brand.brand_profile?.company_name?.[0] || 'B'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {brand.brand_profile?.company_name || 'Unnamed Brand'}
              </p>
              <p className={cn("text-xs", roleColors[brand.role])}>
                {roleLabels[brand.role]}
              </p>
            </div>
            {brand.brand_id === activeBrand?.brand_id && (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="gap-2 text-muted-foreground cursor-pointer"
          onClick={() => {
            // This will be implemented when multi-brand creation is available
            setOpen(false);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Register Brand</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">Pending</Badge>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
