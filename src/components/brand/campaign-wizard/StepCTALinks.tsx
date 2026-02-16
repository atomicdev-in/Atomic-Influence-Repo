import { Link2 } from "lucide-react";
import { CTALinksSection, CTALink } from "@/components/brand/CTALinksSection";

interface StepCTALinksProps {
  links: CTALink[];
  onLinksChange: (links: CTALink[]) => void;
}

export const StepCTALinks = ({ links, onLinksChange }: StepCTALinksProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">CTA Links</h3>
          <p className="text-sm text-muted-foreground">Add links creators will promote with unique tracking</p>
        </div>
      </div>
      
      <CTALinksSection 
        links={links}
        onLinksChange={onLinksChange}
      />
    </section>
  );
};
