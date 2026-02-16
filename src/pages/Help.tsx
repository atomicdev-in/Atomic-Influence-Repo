import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageSquare,
  Book,
  FileText,
  Video,
  ExternalLink,
  Send,
  Mail,
  Loader2,
  CheckCircle,
  Search,
  Zap,
  CreditCard,
  Link2,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Help = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      icon: Zap,
      color: "text-cyan",
      questions: [
        {
          question: "How do I connect my social media accounts?",
          answer: "Navigate to 'Connect Socials' from the sidebar menu. Click on the platform you want to connect (Instagram, TikTok, or YouTube) and follow the authentication prompts. Once connected, your follower counts and engagement metrics will be automatically synced."
        },
        {
          question: "What are the minimum requirements to apply for campaigns?",
          answer: "Requirements vary by campaign, but most brands look for: a minimum follower count (usually 5K-25K), a consistent posting schedule, good engagement rates (2-5%), and content that aligns with their brand. Check each campaign's specific requirements before applying."
        },
        {
          question: "How long does it take to get approved for a campaign?",
          answer: "Approval times vary by brand, but typically you'll hear back within 3-7 business days. Some brands may take longer for larger campaigns. You'll receive an email notification and see the update in your dashboard when a decision is made."
        },
      ]
    },
    {
      category: "Payments & Commissions",
      icon: CreditCard,
      color: "text-pink",
      questions: [
        {
          question: "How do commissions work?",
          answer: "Commissions are earned based on the performance of your content. The percentage shown on each campaign represents your earnings from sales generated through your unique tracking links. Commissions are calculated monthly and paid out once you reach the minimum threshold of $50."
        },
        {
          question: "When and how do I get paid?",
          answer: "Payments are processed on the 15th of each month for the previous month's earnings. You can choose to receive payments via PayPal, direct bank transfer, or digital wallet. Make sure to add your payment details in Settings > Payments."
        },
        {
          question: "What happens if a customer returns a product?",
          answer: "If a customer returns a product within the brand's return window, the associated commission will be deducted from your next payout. You can see all transactions, including returns, in your earnings dashboard."
        },
      ]
    },
    {
      category: "Connecting Accounts",
      icon: Link2,
      color: "text-purple",
      questions: [
        {
          question: "Why can't I connect my Instagram account?",
          answer: "Make sure you have a Business or Creator account on Instagram (not a personal account). Also, ensure your Instagram is connected to a Facebook Page. If you're still having issues, try logging out of Instagram, clearing your browser cache, and trying again."
        },
        {
          question: "Can I connect multiple accounts from the same platform?",
          answer: "Currently, you can connect one account per platform. If you need to switch accounts, disconnect the current one first from 'Connect Socials' page, then connect your other account."
        },
        {
          question: "How often are my social stats updated?",
          answer: "Your follower counts and engagement metrics are synced every 24 hours automatically. You can also manually refresh your stats by clicking the refresh button on your Profile page."
        },
      ]
    },
    {
      category: "Privacy & Security",
      icon: Shield,
      color: "text-orange",
      questions: [
        {
          question: "Who can see my profile information?",
          answer: "By default, brands can see your public profile including your bio, connected platforms, and aggregate stats. You can control what's visible in Settings > Privacy. Your email and personal contact details are never shared without your consent."
        },
        {
          question: "How do I enable two-factor authentication?",
          answer: "Go to Settings > Security and click 'Enable' next to Two-Factor Authentication. You can choose to receive codes via SMS or use an authenticator app like Google Authenticator or Authy."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can request account deletion in Settings > Data & Account. This will permanently delete all your data, including campaign history, earnings records, and connected accounts. This action cannot be undone."
        },
      ]
    },
  ];

  const resources = [
    {
      title: "Knowledge Base",
      description: "In-depth tutorials and guides",
      icon: Book,
      color: "from-cyan to-primary",
      link: "/help/knowledge-base",
      isExternal: false
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      icon: Video,
      color: "from-pink to-purple",
      link: "/resources",
      isExternal: false
    },
    {
      title: "API Documentation",
      description: "For developers and integrations",
      icon: FileText,
      color: "from-purple to-pink",
      link: "/resources",
      isExternal: false
    },
    {
      title: "Community Forum",
      description: "Connect with other creators",
      icon: Users,
      color: "from-orange to-pink",
      link: "/resources",
      isExternal: false
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setContactForm({ subject: "", message: "" });
    
    toast({
      title: "Request received",
      description: "Support will respond within 24-48 hours.",
    });
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Help Center"
          subtitle="Find answers and get support"
          icon={HelpCircle}
        />

        {/* Search */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2">How can we help you?</h2>
            <p className="text-muted-foreground mb-4">Search our FAQ or browse topics below</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="glass rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${category.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-foreground">{category.category}</h3>
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem 
                          key={qIndex} 
                          value={`${index}-${qIndex}`}
                          className="border-white/10 rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-white/5 text-left text-foreground/90 hover:no-underline">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                );
              })
            ) : (
              <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try a different search term or contact support below</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <div className="space-y-3">
                {resources.map((resource, index) => {
                  const IconComponent = resource.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => navigate(resource.link)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Contact Support</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-foreground/80">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What do you need help with?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1 bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground/80">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1 bg-white/5 border-white/10 rounded-xl min-h-[120px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-primary text-white rounded-xl h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-muted-foreground text-center">
                  Or email us directly at
                </p>
                <a 
                  href="mailto:support@atomicinfluence.com" 
                  className="flex items-center justify-center gap-2 text-primary hover:underline mt-1"
                >
                  <Mail className="h-4 w-4" />
                  support@atomicinfluence.com
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-4">Support Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. response time</span>
                  <span className="text-foreground font-medium">~4 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Satisfaction rate</span>
                  <span className="text-success font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Issues resolved</span>
                  <span className="text-foreground font-medium">12,400+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Help;
