import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateCreatorProfile } from "@/hooks/useCreatorData";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UseAvatarUploadReturn {
  uploadAvatar: (file: File) => Promise<string | null>;
  removeAvatar: () => Promise<void>;
  isUploading: boolean;
  error: string | null;
}

export const useAvatarUpload = (): UseAvatarUploadReturn => {
  const { user } = useAuth();
  const updateProfile = useUpdateCreatorProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, WebP, or GIF)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image must be less than 5MB";
    }
    return null;
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      setError("Not authenticated");
      return null;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        title: "Upload Failed",
        description: validationError,
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a unique file name with user folder
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true, // Replace existing avatar
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Cache bust

      // Update profile with new avatar URL
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });

      toast({
        title: "Avatar updated",
        description: "Your profile image has been changed.",
      });

      return avatarUrl;
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      const errorMessage = err.message || "Failed to upload avatar";
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async (): Promise<void> => {
    if (!user?.id) {
      setError("Not authenticated");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // List files in user folder
      const { data: files } = await supabase.storage
        .from("avatars")
        .list(user.id);

      // Delete all avatar files for user
      if (files && files.length > 0) {
        const filesToDelete = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
      }

      // Update profile to remove avatar URL
      await updateProfile.mutateAsync({ avatar_url: "" });

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (err: any) {
      console.error("Avatar removal error:", err);
      const errorMessage = err.message || "Failed to remove avatar";
      setError(errorMessage);
      toast({
        title: "Removal Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    isUploading,
    error,
  };
};
