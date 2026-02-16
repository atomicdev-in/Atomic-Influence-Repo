import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, Leaf, Wine, UtensilsCrossed, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SurveyCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  isCompleted: boolean;
  onClick: () => void;
  coverImage?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  lifestyle: <UtensilsCrossed className="h-5 w-5" />,
  values: <Leaf className="h-5 w-5" />,
  preferences: <Wine className="h-5 w-5" />,
  default: <ClipboardList className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  lifestyle: "from-orange to-pink",
  values: "from-green-500 to-cyan",
  preferences: "from-purple to-pink",
  default: "from-primary to-purple",
};

// Default cover images for each category
const categoryCoverImages: Record<string, string> = {
  lifestyle: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&q=80",
  values: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop&q=80",
  preferences: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=200&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&q=80",
};

export const SurveyCard = ({
  id,
  title,
  description,
  category,
  isCompleted,
  onClick,
  coverImage,
}: SurveyCardProps) => {
  const icon = categoryIcons[category] || categoryIcons.default;
  const gradientColor = categoryColors[category] || categoryColors.default;
  const defaultCoverImage = categoryCoverImages[category] || categoryCoverImages.default;
  const imageSrc = coverImage || defaultCoverImage;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl overflow-hidden transition-all duration-300 relative group",
        isCompleted
          ? "opacity-80 cursor-pointer border border-success/20 hover:border-success/40"
          : "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
      )}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cover Image */}
      <div className="relative h-28 sm:h-36 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            !isCompleted && "group-hover:scale-110"
          )}
        />
        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent",
          isCompleted && "from-success/30 via-success/10"
        )} />
        
        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
          <Badge
            className={cn(
              "backdrop-blur-md text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5",
              isCompleted
                ? "bg-success/80 text-white border-success/50"
                : "bg-white/20 text-white border-white/20"
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">Completed</span>
                <span className="xs:hidden">Done</span>
              </>
            ) : (
              <span>Not Started</span>
            )}
          </Badge>
        </div>

        {/* Category Icon */}
        <div className={cn(
          "absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
          isCompleted ? "bg-success/80" : `bg-gradient-to-br ${gradientColor}`
        )}>
          {isCompleted ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-5">
        <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-lg leading-tight line-clamp-2">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
          {description || "Complete this survey to improve your brand matching."}
        </p>

        {/* Action Button */}
        {!isCompleted ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-muted-foreground">~2 min</span>
            <motion.div 
              className="flex items-center gap-1 text-primary font-medium text-xs sm:text-sm group-hover:gap-1.5 sm:group-hover:gap-2 transition-all"
              whileHover={{ x: 2 }}
            >
              <span className="truncate">Take survey</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-success/70 min-w-0">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-[10px] sm:text-xs truncate">Response recorded</span>
            </div>
            <motion.div 
              className="flex items-center gap-1 text-muted-foreground font-medium text-xs sm:text-sm group-hover:text-success group-hover:gap-1.5 sm:group-hover:gap-2 transition-all shrink-0"
              whileHover={{ x: 2 }}
            >
              View
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
