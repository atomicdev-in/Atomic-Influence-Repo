import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useCreatorProfile } from "@/hooks/useCreatorData";
import {
  User,
  Edit2,
  Save,
  X,
  Mail,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Globe,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: cloudProfile, isLoading } = useCreatorProfile();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect old Brand Fit tab URLs to the new standalone page
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "brand-fit") {
      navigate("/brand-fit", { replace: true });
    }
  }, [searchParams, navigate]);

  // Initialize profile with empty values or cloud data
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    joinedDate: "",
    // Optional pricing - disabled by default
    pricingEnabled: false,
    pricingMin: "",
    pricingMax: "",
    pricingCurrency: "USD",
    pricingNote: "",
  });
  
  // Sync with cloud profile when loaded
  useEffect(() => {
    if (cloudProfile) {
      setProfile({
        name: cloudProfile.name || "",
        username: cloudProfile.username || "",
        email: cloudProfile.email || "",
        bio: cloudProfile.bio || "",
        location: cloudProfile.location || "",
        website: cloudProfile.website || "",
        joinedDate: cloudProfile.created_at 
          ? new Date(cloudProfile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "",
        pricingEnabled: cloudProfile.pricing_enabled || false,
        pricingMin: cloudProfile.pricing_min?.toString() || "",
        pricingMax: cloudProfile.pricing_max?.toString() || "",
        pricingCurrency: cloudProfile.pricing_currency || "USD",
        pricingNote: cloudProfile.pricing_note || "",
      });
    }
  }, [cloudProfile]);

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your changes have been recorded.",
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassLoading size="lg" variant="primary" text="Loading your profile..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div 
          className="p-6 lg:p-8 max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <PageHeader
            title="Creator Profile"
            subtitle="Your public identity and brand information."
            icon={User}
          >
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="gradient-primary text-white"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gradient-primary text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </PageHeader>

          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div 
              className="glass rounded-2xl p-6"
              variants={fadeInUp}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar with Upload */}
                <AvatarUpload 
                  currentAvatarUrl={cloudProfile?.avatar_url}
                  size="lg"
                  isEditing={isEditing}
                />

                {/* Info */}
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Display Name</Label>
                          <Input
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Username</Label>
                          <Input
                            value={editedProfile.username}
                            onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="@username"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Bio</Label>
                        <Textarea
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                          placeholder="Tell brands about yourself..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">{editedProfile.bio.length}/300 characters</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Location</Label>
                          <Input
                            value={editedProfile.location}
                            onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Website</Label>
                          <Input
                            value={editedProfile.website}
                            onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="yourwebsite.com"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                        <p className="text-muted-foreground">{profile.username}</p>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          {profile.website}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Joined {profile.joinedDate}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Pricing Range (Optional) */}
            <motion.div 
              className="glass rounded-2xl p-6"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan" />
                  <h3 className="font-semibold text-foreground">Pricing Range</h3>
                  <Badge className="bg-white/10 text-muted-foreground border-white/10 text-xs">Optional</Badge>
                </div>
                {!isEditing && profile.pricingEnabled && (
                  <Badge className="bg-cyan/20 text-cyan border-cyan/30">
                    ${profile.pricingMin} - ${profile.pricingMax} {profile.pricingCurrency}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Give brands an idea of your rates. This helps filter opportunities that match your pricing expectations.
              </p>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={editedProfile.pricingEnabled}
                      onChange={(e) => setEditedProfile({ ...editedProfile, pricingEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <Label className="text-sm text-foreground">Display pricing range on my profile</Label>
                  </div>
                  
                  {editedProfile.pricingEnabled && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Minimum</Label>
                          <Input
                            type="number"
                            value={editedProfile.pricingMin}
                            onChange={(e) => setEditedProfile({ ...editedProfile, pricingMin: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Maximum</Label>
                          <Input
                            type="number"
                            value={editedProfile.pricingMax}
                            onChange={(e) => setEditedProfile({ ...editedProfile, pricingMax: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl"
                            placeholder="2500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Currency</Label>
                          <Select 
                            value={editedProfile.pricingCurrency} 
                            onValueChange={(v) => setEditedProfile({ ...editedProfile, pricingCurrency: v })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-white/10">
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Pricing Note (Optional)</Label>
                        <Input
                          value={editedProfile.pricingNote}
                          onChange={(e) => setEditedProfile({ ...editedProfile, pricingNote: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl"
                          placeholder="e.g., Rates vary based on deliverables..."
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : profile.pricingEnabled ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${profile.pricingMin} - ${profile.pricingMax}
                    </span>
                    <span className="text-muted-foreground">{profile.pricingCurrency}</span>
                  </div>
                  {profile.pricingNote && (
                    <p className="text-sm text-muted-foreground">{profile.pricingNote}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                  <p className="text-sm text-muted-foreground">No pricing range set</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Add Pricing
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="grid sm:grid-cols-2 gap-4"
              variants={fadeInUp}
            >
              <motion.div 
                className="glass rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => navigate("/linked-accounts")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink/20 flex items-center justify-center">
                    <LinkIcon className="h-5 w-5 text-pink" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Linked Accounts</p>
                    <p className="text-sm text-muted-foreground">Manage social connections</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="glass rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => navigate("/brand-fit")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Brand Fit</p>
                    <p className="text-sm text-muted-foreground">Improve campaign matching</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Profile;