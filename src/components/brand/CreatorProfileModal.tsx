import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Star, 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Heart,
  MessageCircle,
  Play,
  CheckCircle2,
  Clock,
  DollarSign,
  Instagram,
  Youtube,
  Twitter,
  Send
} from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/formatters";

export interface CreatorData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  location: string;
  followers: number;
  engagement: number;
  avgViews: number;
  platforms: string[];
  niche: string[];
  brandFitScore: number;
  previousCollabs: number;
}

interface CreatorProfileModalProps {
  creator: CreatorData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platformIcons: Record<string, React.ElementType> = {
  Instagram: Instagram,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
};

// Extended mock data for creator details
const getCreatorDetails = (creator: CreatorData) => ({
  ...creator,
  bio: "Passionate content creator focused on authentic storytelling and engaging audiences through creative, high-quality content that resonates with modern consumers.",
  joinedDate: "March 2022",
  totalReach: creator.followers * 3.2,
  avgLikes: Math.round(creator.avgViews * 0.065),
  avgComments: Math.round(creator.avgViews * 0.012),
  responseTime: "< 24 hours",
  completionRate: 98,
  portfolio: [
    { id: '1', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=300&fit=crop', likes: 45200, views: 892000, type: 'video' },
    { id: '2', thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f5d0a?w=300&h=300&fit=crop', likes: 32100, views: 456000, type: 'image' },
    { id: '3', thumbnail: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&h=300&fit=crop', likes: 28700, views: 387000, type: 'video' },
    { id: '4', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop', likes: 51400, views: 723000, type: 'image' },
    { id: '5', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop', likes: 38900, views: 512000, type: 'video' },
    { id: '6', thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop', likes: 42300, views: 634000, type: 'image' },
  ],
  collaborations: [
    { id: '1', brand: 'GlowUp Cosmetics', campaign: 'Summer Radiance Launch', date: '2024-01', status: 'completed', earnings: 4500, reach: 1250000 },
    { id: '2', brand: 'FitLife Pro', campaign: 'New Year Fitness Push', date: '2023-12', status: 'completed', earnings: 3200, reach: 890000 },
    { id: '3', brand: 'TechGear Plus', campaign: 'Holiday Gift Guide', date: '2023-11', status: 'completed', earnings: 5800, reach: 2100000 },
    { id: '4', brand: 'EcoWear', campaign: 'Sustainable Fashion Week', date: '2023-09', status: 'completed', earnings: 2800, reach: 670000 },
  ],
  platformStats: creator.platforms.map(platform => ({
    name: platform,
    followers: Math.round(creator.followers * (0.3 + Math.random() * 0.7)),
    engagement: (creator.engagement * (0.8 + Math.random() * 0.4)).toFixed(1),
    avgViews: Math.round(creator.avgViews * (0.5 + Math.random() * 0.5)),
  })),
});

const getBrandFitColor = (score: number) => {
  if (score >= 90) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (score >= 80) return "text-primary bg-primary/10 border-primary/20";
  if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-muted-foreground bg-muted border-border";
};

export const CreatorProfileModal = ({ 
  creator, 
  open, 
  onOpenChange 
}: CreatorProfileModalProps) => {
  if (!creator) return null;
  
  const details = getCreatorDetails(creator);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="text-lg">{creator.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl">{creator.name}</DialogTitle>
                <Badge variant="outline" className={`text-xs font-semibold ${getBrandFitColor(creator.brandFitScore)}`}>
                  <Star className="h-3 w-3 mr-1" />
                  {creator.brandFitScore}% Brand Fit
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{creator.username}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {creator.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {details.joinedDate}
                </span>
              </div>
            </div>
            <Button size="sm" className="gap-1 shrink-0">
              <Send className="h-3.5 w-3.5" />
              Invite
            </Button>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mt-2">{details.bio}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <StatCard icon={Users} label="Followers" value={formatNumber(creator.followers)} />
          <StatCard icon={TrendingUp} label="Engagement" value={`${creator.engagement}%`} />
          <StatCard icon={Eye} label="Avg Views" value={formatNumber(creator.avgViews)} />
          <StatCard icon={CheckCircle2} label="Completion" value={`${details.completionRate}%`} />
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 mt-4">
          {details.platformStats.map(platform => {
            const Icon = platformIcons[platform.name] || Users;
            return (
              <div key={platform.name} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-background/50">
                <Icon className="h-4 w-4" />
                <div>
                  <p className="text-xs font-medium">{platform.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatNumber(platform.followers)} · {platform.engagement}% eng.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Niches */}
        <div className="flex flex-wrap gap-1 mt-3">
          {creator.niche.map(n => (
            <Badge key={n} variant="secondary" className="text-xs">
              {n}
            </Badge>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="collaborations">Collaboration History</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {details.portfolio.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer">
                  <img 
                    src={item.thumbnail} 
                    alt="Portfolio item"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Heart className="h-3.5 w-3.5" />
                      {formatNumber(item.likes)}
                    </div>
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      {formatNumber(item.views)}
                    </div>
                  </div>
                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2">
                      <Play className="h-4 w-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2">
              <ExternalLink className="h-4 w-4" />
              View Full Portfolio
            </Button>
          </TabsContent>

          <TabsContent value="collaborations" className="mt-4">
            {creator.previousCollabs > 0 ? (
              <div className="space-y-3">
                {details.collaborations.map((collab) => (
                  <div 
                    key={collab.id} 
                    className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-background/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{collab.campaign}</p>
                      <p className="text-xs text-muted-foreground">{collab.brand}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatNumber(collab.reach)}
                      </div>
                      <p className="text-xs text-muted-foreground">{collab.date}</p>
                    </div>
                  </div>
                ))}

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4 p-4 rounded-xl border border-border/50 bg-card/50">
                  <div className="text-center">
                    <p className="text-lg font-bold">{details.collaborations.length}</p>
                    <p className="text-xs text-muted-foreground">Campaigns</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {formatNumber(details.collaborations.reduce((sum, c) => sum + c.reach, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-500">
                      {formatCurrency(details.collaborations.reduce((sum, c) => sum + c.earnings, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-medium">No previous collaborations</p>
                <p className="text-sm text-muted-foreground">This creator hasn't worked with your brand yet</p>
                <Button className="mt-4 gap-1">
                  <Send className="h-4 w-4" />
                  Start First Collaboration
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="rounded-lg border border-border/50 bg-background/50 p-3">
    <Icon className="h-4 w-4 text-muted-foreground mb-1" />
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
