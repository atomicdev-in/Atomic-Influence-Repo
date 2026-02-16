import { useState, useEffect } from "react";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { Users, Search, Filter, MapPin, Instagram, Youtube, Twitter, Send, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatorProfileModal, CreatorData } from "@/components/brand/CreatorProfileModal";
import { InviteCreatorDialog } from "@/components/brand/InviteCreatorDialog";
import { EmptyState, emptyCreators } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { CreatorsGridSkeleton } from "@/components/ui/page-skeleton";

const platformIcons: Record<string, React.ElementType> = {
  Instagram: Instagram,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
};

interface RealCreator {
  id: string;
  user_id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  linked_accounts?: {
    platform: string;
    followers: number;
    engagement: number;
  }[];
}

const BrandCreatorsContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedCreator, setSelectedCreator] = useState<CreatorData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [creatorToInvite, setCreatorToInvite] = useState<CreatorData | null>(null);
  const [creators, setCreators] = useState<RealCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: creatorRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'creator');

        if (rolesError) throw rolesError;

        if (!creatorRoles?.length) {
          setCreators([]);
          setIsLoading(false);
          return;
        }

        const creatorUserIds = creatorRoles.map(r => r.user_id);

        const { data: profiles, error: profilesError } = await supabase
          .from('creator_profiles')
          .select('*')
          .in('user_id', creatorUserIds);

        if (profilesError) throw profilesError;

        if (profiles) {
          const { data: accounts } = await supabase
            .from('linked_accounts')
            .select('user_id, platform, followers, engagement')
            .in('user_id', creatorUserIds)
            .eq('connected', true);

          const creatorsWithAccounts = profiles.map(profile => ({
            ...profile,
            linked_accounts: accounts?.filter(a => a.user_id === profile.user_id) || [],
          }));

          setCreators(creatorsWithAccounts);
        }
      } catch (err) {
        console.error('Error fetching creators:', err);
        setError(err instanceof Error ? err : new Error('Failed to load creators'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleCreatorClick = (creator: RealCreator) => {
    const creatorData: CreatorData = {
      id: creator.user_id,
      name: creator.name || creator.email.split('@')[0],
      username: creator.username || `@${creator.email.split('@')[0]}`,
      avatar: creator.avatar_url || '',
      brandFitScore: 85,
      location: creator.location || 'Not specified',
      followers: creator.linked_accounts?.reduce((sum, a) => sum + (a.followers || 0), 0) || 0,
      engagement: creator.linked_accounts?.[0]?.engagement || 0,
      avgViews: 0,
      platforms: creator.linked_accounts?.map(a => a.platform) || [],
      niche: [],
      previousCollabs: 0,
    };
    setSelectedCreator(creatorData);
    setModalOpen(true);
  };

  const handleInviteClick = (creator: RealCreator, e: React.MouseEvent) => {
    e.stopPropagation();
    const creatorData: CreatorData = {
      id: creator.user_id,
      name: creator.name || creator.email.split('@')[0],
      username: creator.username || `@${creator.email.split('@')[0]}`,
      avatar: creator.avatar_url || '',
      brandFitScore: 85,
      location: creator.location || 'Not specified',
      followers: creator.linked_accounts?.reduce((sum, a) => sum + (a.followers || 0), 0) || 0,
      engagement: creator.linked_accounts?.[0]?.engagement || 0,
      avgViews: 0,
      platforms: creator.linked_accounts?.map(a => a.platform) || [],
      niche: [],
      previousCollabs: 0,
    };
    setCreatorToInvite(creatorData);
    setInviteDialogOpen(true);
  };

  const allPlatforms = [...new Set(creators.flatMap(c => c.linked_accounts?.map(a => a.platform) || []))];

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = 
      (creator.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (creator.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (creator.bio?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || 
      creator.linked_accounts?.some(a => a.platform === platformFilter);
    return matchesSearch && matchesPlatform;
  });

  if (error) {
    throw error;
  }

  if (isLoading) {
    return <CreatorsGridSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Creators"
        subtitle="Discover and connect with registered creators"
        icon={Users}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators by name or bio..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {allPlatforms.length > 0 && (
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {allPlatforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Creators Grid */}
      <SectionErrorBoundary>
        {creators.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <EmptyState {...emptyCreators} />
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <EmptyState
              icon={Users}
              title="No creators match filters"
              description="Adjust your search or filter criteria to see results."
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setPlatformFilter("all");
                },
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-colors cursor-pointer"
                  onClick={() => handleCreatorClick(creator)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={creator.avatar_url || ''} alt={creator.name || creator.email} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {(creator.name || creator.email)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{creator.name || creator.email.split('@')[0]}</h4>
                      <p className="text-sm text-muted-foreground">{creator.username || `@${creator.email.split('@')[0]}`}</p>
                      {creator.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {creator.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {creator.linked_accounts && creator.linked_accounts.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      {creator.linked_accounts.map(account => {
                        const Icon = platformIcons[account.platform] || Users;
                        return (
                          <Badge key={account.platform} variant="secondary" className="text-xs gap-1">
                            <Icon className="h-3 w-3" />
                            {account.platform}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {creator.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{creator.bio}</p>
                  )}

                  {creator.linked_accounts && creator.linked_accounts.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-background/50">
                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {formatNumber(creator.linked_accounts.reduce((sum, a) => sum + (a.followers || 0), 0))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Total Followers</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">
                          {(creator.linked_accounts.reduce((sum, a) => sum + (a.engagement || 0), 0) / creator.linked_accounts.length).toFixed(1)}%
                        </div>
                        <span className="text-[10px] text-muted-foreground">Avg Engagement</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreatorClick(creator);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={(e) => handleInviteClick(creator, e)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Invite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionErrorBoundary>

      <CreatorProfileModal
        creator={selectedCreator}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <InviteCreatorDialog
        creator={creatorToInvite}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};

const BrandCreators = () => {
  return (
    <BrandDashboardLayout>
      <PageTransition>
        <PageErrorBoundary>
          <BrandCreatorsContent />
        </PageErrorBoundary>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandCreators;
