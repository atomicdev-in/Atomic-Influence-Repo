import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageCircle,
  ExternalLink,
  Shield,
  Users,
  Brain,
  Activity,
  Settings,
  AlertTriangle
} from "lucide-react";

const faqs = [
  {
    question: "How do I add a new admin user?",
    answer: "Navigate to User Management, find the user you want to promote, and click 'Change Role'. Select 'Admin' from the dropdown and confirm the change. Note: Admin role changes are logged for security purposes."
  },
  {
    question: "What does the matching intelligence score mean?",
    answer: "The matching score (0-100) represents how well a creator aligns with a campaign based on survey responses, engagement metrics, historical performance, and category alignment. Higher scores indicate better potential matches."
  },
  {
    question: "How can I view audit logs?",
    answer: "Go to System Health from the sidebar. The Audit Trail tab shows all administrative actions, role changes, and configuration updates. You can filter by date range and action type."
  },
  {
    question: "What should I do when system health shows 'Warning'?",
    answer: "Check the System Health page for specific issues. Common causes include stale data (tables not updated recently) or inactive safeguards. Address the flagged items or contact support if the issue persists."
  },
  {
    question: "How do I configure the matching algorithm weights?",
    answer: "Navigate to Settings > Matching tab. Here you can view the current weight distribution for different matching factors. Weight changes affect how creators are matched to campaigns platform-wide."
  },
  {
    question: "Can I export platform data?",
    answer: "Currently, data export is available through the Analytics section. You can view and export reports on creators, brands, campaigns, and matching performance."
  },
];

const guides = [
  {
    title: "User Management Guide",
    description: "Learn how to manage user roles, permissions, and access control",
    icon: Users,
    badge: "Essential"
  },
  {
    title: "Security Best Practices",
    description: "Configure security settings and understand RLS policies",
    icon: Shield,
    badge: "Important"
  },
  {
    title: "Understanding Matching AI",
    description: "Deep dive into how the matching algorithm works",
    icon: Brain,
    badge: "Advanced"
  },
  {
    title: "System Health Monitoring",
    description: "Monitor platform health and respond to alerts",
    icon: Activity,
    badge: "Essential"
  },
  {
    title: "Platform Configuration",
    description: "Configure platform settings and feature flags",
    icon: Settings,
    badge: "Essential"
  },
  {
    title: "Troubleshooting Guide",
    description: "Common issues and how to resolve them",
    icon: AlertTriangle,
    badge: "Reference"
  },
];

export default function AdminHelp() {
  return (
    <AdminDashboardLayout title="Help">
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Help & Documentation" 
              subtitle="Resources, guides, and support for platform administrators"
            />

            {/* Quick Links */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-xs text-muted-foreground mt-1">Full platform docs</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-medium">Contact Support</h3>
                  <p className="text-xs text-muted-foreground mt-1">Get help from our team</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium">Release Notes</h3>
                  <p className="text-xs text-muted-foreground mt-1">Latest updates</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                    <HelpCircle className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-medium">FAQs</h3>
                  <p className="text-xs text-muted-foreground mt-1">Common questions</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Guides */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Admin Guides</CardTitle>
                <CardDescription>Step-by-step guides for common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {guides.map((guide) => (
                    <div 
                      key={guide.title}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <guide.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{guide.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {guide.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{guide.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common admin questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Need More Help?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our support team is available 24/7 to assist with any platform issues
                    </p>
                  </div>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
