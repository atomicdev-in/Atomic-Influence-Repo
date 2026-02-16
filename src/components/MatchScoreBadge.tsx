import { motion } from "framer-motion";
import { Sparkles, Target, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchScoreBadgeProps {
  score: number;
  matchReasons: string[];
  isTopMatch: boolean;
  showLabel?: boolean;
}

const MatchScoreBadge = ({ score, matchReasons, isTopMatch, showLabel = true }: MatchScoreBadgeProps) => {
  const getScoreColor = () => {
    if (score >= 80) return "from-success to-cyan";
    if (score >= 60) return "from-cyan to-primary";
    if (score >= 40) return "from-primary to-purple";
    return "from-muted to-muted-foreground";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Great Match";
    if (score >= 40) return "Good Match";
    return "Potential Match";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isTopMatch 
                ? "bg-gradient-to-r " + getScoreColor() + " text-white" 
                : "bg-white/10 border border-white/20 text-foreground"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            {isTopMatch ? (
              <Sparkles className="h-3.5 w-3.5" />
            ) : (
              <Target className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-semibold">{score}%</span>
            {showLabel && (
              <span className="text-xs hidden sm:inline">{getScoreLabel()}</span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-background/95 backdrop-blur-sm border-white/10 p-3 max-w-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getScoreColor()} flex items-center justify-center`}>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
              {getScoreLabel()} - {score}%
            </div>
            {matchReasons.length > 0 && (
              <ul className="space-y-1">
                {matchReasons.map((reason, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MatchScoreBadge;
