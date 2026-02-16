import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, Trash2, Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  isEditing?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-28 h-28",
};

const iconSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function AvatarUpload({ 
  currentAvatarUrl, 
  size = "lg",
  isEditing = false,
  className 
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar, isUploading } = useAvatarUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const displayUrl = previewUrl || currentAvatarUrl;
  const hasAvatar = !!displayUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowPreview(true);
  };

  const handleConfirmUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if (result) {
      setPreviewUrl(null);
      setShowPreview(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    await removeAvatar();
    setPreviewUrl(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative shrink-0", className)}>
      {/* Avatar Container */}
      <div className={cn(sizeClasses[size], "rounded-2xl gradient-full p-0.5")}>
        <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center overflow-hidden">
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Profile avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={cn(iconSizes[size], "text-muted-foreground")} />
          )}
          
          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile picture"
      />

      {/* Edit controls */}
      {isEditing && !showPreview && (
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <button 
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            aria-label="Upload new avatar"
          >
            <Camera className="h-5 w-5" />
          </button>
          
          {hasAvatar && currentAvatarUrl && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  disabled={isUploading}
                  className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  aria-label="Remove avatar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-white/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your profile picture will be removed. You can upload a new one anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove} className="bg-destructive text-white hover:bg-destructive/90">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Preview confirmation overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-sm w-full text-center border border-white/20"
            >
              <button 
                onClick={handleCancelPreview}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Update Profile Picture?
              </h3>
              
              {/* Preview image */}
              <div className="w-32 h-32 mx-auto rounded-2xl gradient-full p-0.5 mb-6">
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <img 
                    src={previewUrl || ""} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleCancelPreview}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmUpload} 
                  disabled={isUploading}
                  className="gradient-primary text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Confirm
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
