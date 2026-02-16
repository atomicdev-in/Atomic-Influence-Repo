import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { CheckCircle, MessageCircle, Shield, Phone, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface WhatsAppConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (phoneData: {
    countryCode: string;
    phoneNumber: string;
    maskedNumber: string;
  }) => void;
}

type ConnectionStep = "phone" | "sending" | "verify" | "verifying" | "success";

const countries = [
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
].sort((a, b) => a.name.localeCompare(b.name));

export const WhatsAppConnectDialog = ({
  open,
  onOpenChange,
  onConnect,
}: WhatsAppConnectDialogProps) => {
  const [step, setStep] = useState<ConnectionStep>("phone");
  const [selectedCountry, setSelectedCountry] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setResendTimer(0);
    }
  }, [open]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const getMaskedNumber = () => {
    const last3 = phoneNumber.slice(-3);
    const masked = phoneNumber.slice(0, -3).replace(/\d/g, "•");
    return `${selectedCountry} ${masked}${last3}`;
  };

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setStep("sending");
    
    // Simulate sending OTP
    setTimeout(() => {
      setStep("verify");
      setResendTimer(60);
      toast({
        title: "Code Sent!",
        description: "Check your WhatsApp or SMS for the verification code.",
      });
    }, 1500);
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setStep("verifying");
    
    // Simulate verification
    setTimeout(() => {
      setStep("success");
      
      // Auto-close and callback after success
      setTimeout(() => {
        onConnect({
          countryCode: selectedCountry,
          phoneNumber: phoneNumber,
          maskedNumber: getMaskedNumber(),
        });
        toast({
          title: "WhatsApp verified",
          description: "Your phone number has been validated successfully.",
          variant: "success",
        });
        setStep("phone");
        onOpenChange(false);
      }, 1500);
    }, 2000);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    
    setStep("sending");
    setTimeout(() => {
      setStep("verify");
      setResendTimer(60);
      toast({
        title: "Code Resent!",
        description: "A new verification code has been sent.",
      });
    }, 1000);
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
  };

  const handleClose = () => {
    if (step === "phone" || step === "success") {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Connect WhatsApp</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Verify your phone number
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {step === "phone" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Secure Verification</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send a 6-digit code via WhatsApp or SMS to verify your number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background border-white/10">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-muted-foreground">({country.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-medium min-w-[70px] justify-center">
                    {selectedCountry}
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={!phoneNumber || phoneNumber.length < 6}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Send Verification Code
              </Button>
            </div>
          )}

          {step === "sending" && (
            <div className="flex flex-col items-center justify-center py-8">
              <GlassLoading size="lg" variant="primary" />
              <p className="mt-4 text-sm text-muted-foreground">Sending verification code...</p>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-foreground font-medium mt-1">
                  {selectedCountry} {phoneNumber}
                </p>
              </div>

              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="bg-white/5 border-white/20" />
                    <InputOTPSlot index={1} className="bg-white/5 border-white/20" />
                    <InputOTPSlot index={2} className="bg-white/5 border-white/20" />
                    <InputOTPSlot index={3} className="bg-white/5 border-white/20" />
                    <InputOTPSlot index={4} className="bg-white/5 border-white/20" />
                    <InputOTPSlot index={5} className="bg-white/5 border-white/20" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Number
              </Button>

              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`text-sm ${
                    resendTimer > 0 
                      ? "text-muted-foreground cursor-not-allowed" 
                      : "text-primary hover:underline cursor-pointer"
                  }`}
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s` 
                    : "Didn't receive a code? Resend"}
                </button>
              </div>
            </div>
          )}

          {step === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8">
              <GlassLoading size="lg" variant="primary" />
              <p className="mt-4 text-sm text-muted-foreground">Verifying your number...</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 animate-check-in">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">Verified!</p>
              <p className="text-sm text-muted-foreground mt-1">Your WhatsApp number has been linked</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
