import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
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
  Search,
  Rocket,
  CreditCard,
  Users,
  Shield,
  Target,
  BarChart3,
  FileCheck,
  Briefcase,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BrandHelp = () => {
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
      icon: Rocket,
      color: "text-cyan",
      questions: [
        {
          question: "How do I create my first campaign?",
          answer: "Navigate to 'Campaigns' from the sidebar and select 'Create Campaign'. Define your campaign parameters including budget allocation, deliverable requirements, timeline, and creator criteria. Once published, your campaign will be visible to qualified creators who may submit for consideration."
        },
        {
          question: "How does creator matching work?",
          answer: "Our AI analyzes creator profiles, audience demographics, content style, and engagement metrics to match them with your brand. You'll see match scores indicating how well each creator aligns with your campaign goals. Higher scores indicate better potential fit."
        },
        {
          question: "What information should I include in my campaign brief?",
          answer: "A strong brief includes: clear objectives, target audience description, key messages, content requirements (format, length, style), posting guidelines, disclosure requirements, timeline with milestones, and budget. The more detail you provide, the better applications you'll receive."
        },
      ]
    },
    {
      category: "Finding Creators",
      icon: Users,
      color: "text-purple",
      questions: [
        {
          question: "How do I search for specific types of creators?",
          answer: "Use the 'Creators' page to browse and filter by platform, follower count, engagement rate, content category, location, and audience demographics. You can also save searches and set up alerts for new creators matching your criteria."
        },
        {
          question: "Can I invite specific creators to my campaigns?",
          answer: "Yes! From any creator's profile, click 'Invite to Campaign' to send a direct invitation. Invited creators receive priority notifications and typically respond faster than public applications."
        },
        {
          question: "How do I verify a creator's audience is authentic?",
          answer: "We analyze engagement patterns, follower growth rates, and audience authenticity scores. Look for the 'Verified Audience' badge on creator profiles. You can also request detailed analytics reports before finalizing partnerships."
        },
      ]
    },
    {
      category: "Campaign Management",
      icon: Target,
      color: "text-pink",
      questions: [
        {
          question: "How do I review and approve creator submissions?",
          answer: "Submissions appear in your 'Applications' section. Evaluate each creator's profile, portfolio, and match score. You may approve, decline, or request additional information. Approved creators receive campaign details and assignment confirmation."
        },
        {
          question: "What happens after I approve a creator?",
          answer: "Once approved, creators can access full campaign details and begin creating content. You'll receive notifications at each milestone. Content is submitted through the platform for your review and approval before posting."
        },
        {
          question: "How do I request revisions to submitted content?",
          answer: "When reviewing submitted content, click 'Request Changes' and provide specific feedback. Be clear about what needs modification. Creators can submit revisions, and you can track all versions in the campaign workspace."
        },
      ]
    },
    {
      category: "Payments & Billing",
      icon: CreditCard,
      color: "text-orange",
      questions: [
        {
          question: "How do creator payments work?",
          answer: "You fund campaigns upfront. Payments are held in escrow and released to creators after you approve their final deliverables. This protects both parties and ensures work is completed to satisfaction before payment."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit cards, debit cards, ACH bank transfers, and wire transfers. For enterprise accounts, we also offer invoicing with NET 30 terms. Add or manage payment methods in Settings > Payments."
        },
        {
          question: "Are there any platform fees?",
          answer: "Atomic Influence charges a service fee on campaign budgets, disclosed during campaign creation. There are no hidden fees. Volume discounts are available for brands running multiple campaigns or with higher monthly spend."
        },
        {
          question: "What if I'm not satisfied with a creator's work?",
          answer: "If work doesn't meet the agreed requirements, you can request revisions. If issues persist, contact our support team. We'll mediate and, if necessary, facilitate refunds for incomplete or unsatisfactory work as per our terms."
        },
      ]
    },
    {
      category: "Reporting & Analytics",
      icon: BarChart3,
      color: "text-success",
      questions: [
        {
          question: "What metrics can I track for my campaigns?",
          answer: "Track impressions, reach, engagement (likes, comments, shares), click-through rates, conversions, and ROI. We aggregate data from creator content and your tracking links to provide comprehensive performance reports."
        },
        {
          question: "How do I set up conversion tracking?",
          answer: "In campaign settings, add your conversion pixel or tracking URL. We'll generate unique links for each creator. You can also integrate with Google Analytics, Facebook Pixel, or your preferred analytics platform."
        },
        {
          question: "Can I export campaign reports?",
          answer: "Yes, all reports can be exported as PDF or CSV from the Reports page. Schedule automated reports to be sent weekly or monthly to your team's email addresses."
        },
      ]
    },
    {
      category: "Content & Compliance",
      icon: FileCheck,
      color: "text-cyan",
      questions: [
        {
          question: "How do I ensure creators follow disclosure guidelines?",
          answer: "Our platform automatically reminds creators about FTC disclosure requirements. You can specify disclosure language in your brief, and we flag content that may be missing proper disclosures before it goes live."
        },
        {
          question: "Who owns the content created for my campaigns?",
          answer: "Content ownership depends on your campaign terms. By default, creators retain ownership but grant you usage rights as specified. You can negotiate extended or exclusive rights as part of the campaign agreement."
        },
        {
          question: "Can I use creator content in my own marketing?",
          answer: "Usage rights are defined in each campaign. Standard terms usually include social media reposts and website usage. For paid advertising, TV, or extended usage, negotiate these rights upfront and include them in your campaign terms."
        },
      ]
    },
    {
      category: "Account & Security",
      icon: Shield,
      color: "text-muted-foreground",
      questions: [
        {
          question: "How do I add team members to my brand account?",
          answer: "Go to Settings > Team and click 'Invite Member'. Enter their email and assign a role (Admin, Manager, or Viewer). They'll receive an invitation to join your brand account with appropriate permissions."
        },
        {
          question: "What security measures protect my data?",
          answer: "We use bank-level encryption for all data, secure payment processing, and regular security audits. Two-factor authentication is available and recommended. We never share your business data with third parties."
        },
        {
          question: "How do I update our company billing information?",
          answer: "Navigate to Settings > Billing to update payment methods, billing address, and tax information. Changes apply to future transactions; past invoices retain original information for record-keeping."
        },
      ]
    },
  ];

  const resources = [
    {
      title: "Brand Success Guide",
      description: "Best practices for creator campaigns",
      icon: Book,
      color: "from-cyan to-primary",
      link: "/brand/resources"
    },
    {
      title: "Video Tutorials",
      description: "Platform walkthroughs and tips",
      icon: Video,
      color: "from-pink to-purple",
      link: "/brand/resources"
    },
    {
      title: "Case Studies",
      description: "Learn from successful campaigns",
      icon: Briefcase,
      color: "from-purple to-pink",
      link: "/brand/resources"
    },
    {
      title: "API Documentation",
      description: "Integrate with your systems",
      icon: FileText,
      color: "from-orange to-pink",
      link: "/brand/resources"
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
      description: "Brand support team will respond within 24 hours.",
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
    <BrandDashboardLayout>
      <PageTransition>
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Help Center"
            subtitle="Find answers and get support for your brand account"
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
                  <h3 className="font-semibold text-foreground">Contact Brand Support</h3>
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
                      Submitting...
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
                    href="mailto:brands@atomicinfluence.com" 
                    className="flex items-center justify-center gap-2 text-primary hover:underline mt-1"
                  >
                    <Mail className="h-4 w-4" />
                    brands@atomicinfluence.com
                  </a>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <h3 className="font-semibold text-foreground mb-4">Brand Support</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority response</span>
                    <span className="text-foreground font-medium">~2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Satisfaction rate</span>
                    <span className="text-success font-medium">99%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Brands supported</span>
                    <span className="text-foreground font-medium">2,500+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandHelp;