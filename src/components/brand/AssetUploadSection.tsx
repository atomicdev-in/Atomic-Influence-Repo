import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  X, 
  FileImage, 
  FileVideo, 
  FileText, 
  Folder,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetUploadSectionProps {
  campaignId?: string; // Optional during creation, required for actual uploads
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
  disabled?: boolean;
}

export interface UploadedAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: 'image' | 'video' | 'brand_kit' | 'document' | 'general';
  description?: string;
  uploadProgress?: number;
  isUploading?: boolean;
}

const ASSET_CATEGORIES = [
  { value: 'image', label: 'Images', icon: FileImage },
  { value: 'video', label: 'Videos', icon: FileVideo },
  { value: 'brand_kit', label: 'Brand Kit', icon: Folder },
  { value: 'document', label: 'Documents', icon: FileText },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const AssetUploadSection = ({ 
  campaignId, 
  assets, 
  onAssetsChange,
  disabled = false 
}: AssetUploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const getAssetCategory = (fileType: string): UploadedAsset['category'] => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType === 'application/zip') return 'brand_kit';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 50MB.`);
        continue;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} has an unsupported file type.`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create temporary asset entries with upload progress
    const newAssets: UploadedAsset[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: '', // Will be set after upload
      category: getAssetCategory(file.type),
      uploadProgress: 0,
      isUploading: true,
    }));

    onAssetsChange([...assets, ...newAssets]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const asset = newAssets[i];
      
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${campaignId || 'temp'}/${asset.id}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('campaign-assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(filePath);

        // Update asset with URL - create new array instead of using callback
        const updatedAssets = assets.map(a => 
          a.id === asset.id 
            ? { ...a, fileUrl: urlData.publicUrl, isUploading: false, uploadProgress: 100 }
            : a
        ).concat(newAssets.filter(na => na.id !== asset.id && !assets.some(a => a.id === na.id)));
        
        // Find and update the specific asset
        const finalAssets = [...assets, ...newAssets].map(a =>
          a.id === asset.id 
            ? { ...a, fileUrl: urlData.publicUrl, isUploading: false, uploadProgress: 100 }
            : a
        );
        onAssetsChange(finalAssets);

        toast.success(`${file.name} uploaded successfully`);
      } catch (error: unknown) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
        
        // Remove failed asset
        const filteredAssets = [...assets, ...newAssets].filter(a => a.id !== asset.id);
        onAssetsChange(filteredAssets);
      }
    }
  }, [assets, campaignId, onAssetsChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeAsset = (id: string) => {
    onAssetsChange(assets.filter(a => a.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    const cat = ASSET_CATEGORIES.find(c => c.value === category);
    return cat?.icon || FileText;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
      >
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium mb-1">Drop files here or click to upload</p>
        <p className="text-sm text-muted-foreground mb-3">
          Images, videos, PDFs, brand kits (ZIP) up to 50MB each
        </p>
        <Input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="asset-upload"
        />
        <Label htmlFor="asset-upload">
          <Button variant="outline" size="sm" disabled={disabled} asChild>
            <span>Choose Files</span>
          </Button>
        </Label>
      </div>

      {/* Uploaded Assets List */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Assets ({assets.length})</Label>
          <div className="space-y-2">
            {assets.map((asset) => {
              const CategoryIcon = getCategoryIcon(asset.category);
              return (
                <div 
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(asset.fileSize)}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {asset.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {asset.isUploading && (
                      <Progress value={asset.uploadProgress} className="h-1 mt-1" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {asset.isUploading ? (
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    ) : asset.fileUrl ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAsset(asset.id)}
                      disabled={asset.isUploading}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
