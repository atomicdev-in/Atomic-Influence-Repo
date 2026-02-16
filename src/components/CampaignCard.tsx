import { Badge } from "@/components/ui/badge";
import { Sparkles, Instagram, Youtube, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MatchScoreBadge from "@/components/MatchScoreBadge";

interface CampaignCardProps {
  id: string;
  imageUrl: string;
  commission: number;
  categories: string[];
  campaignName: string;
  isNew?: boolean;
  requirementMet?: boolean;
  language: string;
  country: string;
  countryFlag: string;
  socials: string[];
  matchScore?: number;
  matchReasons?: string[];
  isTopMatch?: boolean;
}

const CampaignCard = ({
  id,
  imageUrl,
  commission,
  categories,
  campaignName,
  isNew = false,
  requirementMet = false,
  language,
  countryFlag,
  socials,
  matchScore,
  matchReasons = [],
  isTopMatch = false,
}: CampaignCardProps) => {
  const navigate = useNavigate();
  const showMatchScore = typeof matchScore === "number" && matchScore > 0;
  const getSocialIcon = (social: string) => {
    switch (social.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "tiktok":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      onClick={() => navigate(`/campaign/${id}`)}
      className="glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Image Section */}
      <div className="relative h-44 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={campaignName}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-[60%]"
          >
            <Badge className="gradient-primary text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs px-2 py-0.5">
              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 shrink-0" /> 
              <span className="truncate">Commission {commission}%</span>
            </Badge>
          </motion.div>
          {showMatchScore && (
            <div className="shrink-0">
              <MatchScoreBadge 
                score={matchScore} 
                matchReasons={matchReasons}
                isTopMatch={isTopMatch}
                showLabel={false}
              />
            </div>
          )}
        </div>
        <div className="absolute bottom-2.5 left-2.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-full overflow-hidden border-2 border-white/20 shadow-lg" />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {categories.slice(0, 2).map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Badge
                variant="secondary"
                className="text-[10px] sm:text-xs font-normal bg-white/5 border-white/10 text-foreground/70 px-1.5 py-0.5"
              >
                {category}
              </Badge>
            </motion.div>
          ))}
          {categories.length > 2 && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal bg-white/5 border-white/10 text-foreground/70 px-1.5 py-0.5">
              +{categories.length - 2}
            </Badge>
          )}
        </div>

        {/* Campaign Name */}
        <div className="flex items-start gap-2 mb-2.5">
          <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight line-clamp-2 flex-1 min-w-0">
            {campaignName}
          </h3>
          {isNew && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="shrink-0"
            >
              <Badge className="bg-purple/20 text-purple border-purple/30 text-[10px] px-1.5 py-0.5">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                New
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="border-t border-white/10 pt-2.5">
          {/* Requirement Status */}
          <div className="mb-2.5">
            {requirementMet ? (
              <motion.span 
                className="text-success text-xs sm:text-sm font-medium flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Requirements met</span>
              </motion.span>
            ) : (
              <motion.span 
                className="text-orange text-xs sm:text-sm font-medium flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Requirement not met</span>
              </motion.span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-16">Language</span>
              <span className="text-foreground/80">{language}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-16">Country</span>
              <span className="text-lg">{countryFlag}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-16">Socials</span>
              <div className="flex gap-2">
                {socials.map((social, index) => (
                  <motion.div
                    key={social}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                    whileHover={{ scale: 1.15, y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {getSocialIcon(social)}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;