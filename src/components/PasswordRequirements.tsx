import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = [
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Min. 8 char.", met: password.length >= 8 },
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center gap-2 text-sm">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
            req.met 
              ? "gradient-primary text-white animate-check-in" 
              : "bg-white/5 border border-white/10"
          )}>
            {req.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <Circle className="h-2 w-2 text-muted-foreground" />
            )}
          </div>
          <span className={cn(
            "transition-colors duration-200",
            req.met ? "text-foreground" : "text-muted-foreground"
          )}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;
