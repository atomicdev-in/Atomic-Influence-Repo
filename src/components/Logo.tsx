import { BrandWordmark } from "@/components/BrandWordmark";

interface LogoProps {
  showTagline?: boolean;
  collapsed?: boolean;
}

const Logo = ({ showTagline = false, collapsed = false }: LogoProps) => {
  if (collapsed) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <BrandWordmark variant="collapsed" size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <BrandWordmark variant="collapsed" size="md" color="white" />
          </div>
        </div>
        <BrandWordmark variant="full" size="md" color="gradient" />
      </div>
      {showTagline && (
        <>
          <div className="h-5 w-px bg-border" />
          <span className="text-muted-foreground text-sm font-medium">for Creators</span>
        </>
      )}
    </div>
  );
};

export default Logo;
