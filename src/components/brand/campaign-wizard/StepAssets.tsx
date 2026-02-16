import { Upload } from "lucide-react";
import { AssetUploadSection, UploadedAsset } from "@/components/brand/AssetUploadSection";

interface StepAssetsProps {
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
}

export const StepAssets = ({ assets, onAssetsChange }: StepAssetsProps) => {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Campaign Assets</h3>
          <p className="text-sm text-muted-foreground">Upload brand materials for creators</p>
        </div>
      </div>
      
      <AssetUploadSection 
        campaignId="temp"
        assets={assets}
        onAssetsChange={onAssetsChange}
      />
      
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Include logos, product images, brand guidelines, and any reference materials 
          that will help creators produce on-brand content.
        </p>
      </div>
    </section>
  );
};
