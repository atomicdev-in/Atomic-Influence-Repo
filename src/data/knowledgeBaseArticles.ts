import { Book, Users, CreditCard, Link2, Target, Sparkles, Shield, Rocket } from "lucide-react";

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: typeof Book;
  categoryColor: string;
  readTime: string;
  featured?: boolean;
  content: ArticleSection[];
}

export interface ArticleSection {
  type: "heading" | "paragraph" | "list" | "tip" | "warning" | "steps";
  content: string | string[];
}

export const categories = [
  { id: "getting-started", label: "Getting Started", icon: Rocket, color: "text-cyan" },
  { id: "social-accounts", label: "Social Accounts", icon: Link2, color: "text-purple" },
  { id: "campaigns", label: "Campaigns", icon: Target, color: "text-pink" },
  { id: "payments", label: "Payments", icon: CreditCard, color: "text-orange" },
  { id: "brand-fit", label: "Brand Fit", icon: Sparkles, color: "text-cyan" },
  { id: "account", label: "Account & Security", icon: Shield, color: "text-muted-foreground" },
];

export const articles: Article[] = [
  {
    id: "1",
    slug: "complete-profile-setup-guide",
    title: "Complete Profile Setup Guide",
    description: "Learn how to create a standout creator profile that attracts brand partnerships.",
    category: "getting-started",
    categoryIcon: Rocket,
    categoryColor: "text-cyan",
    readTime: "8 min read",
    featured: true,
    content: [
      { type: "paragraph", content: "Your creator profile is your first impression with brands. A complete, professional profile significantly increases your chances of being selected for campaigns. This guide walks you through every step of creating a profile that stands out." },
      { type: "heading", content: "Why Your Profile Matters" },
      { type: "paragraph", content: "Brands review dozens of creator profiles when selecting partners for campaigns. Your profile is your opportunity to showcase your unique voice, audience, and content style. Profiles with complete information receive 3x more campaign invitations than incomplete ones." },
      { type: "heading", content: "Step-by-Step Profile Setup" },
      { type: "steps", content: [
        "Upload a professional profile photo - Use a clear, high-quality headshot that shows your face. Avoid logos or group photos.",
        "Write a compelling bio - Describe who you are, what content you create, and what makes you unique. Keep it under 300 characters but make every word count.",
        "Add your location - Brands often search for creators in specific regions. Adding your location helps you appear in relevant searches.",
        "Include your website or portfolio - Link to your best work, media kit, or personal website to give brands more context.",
        "Set your pricing preferences - Adding rate ranges helps brands understand your expectations upfront."
      ]},
      { type: "tip", content: "Update your bio seasonally to reflect current content themes or recent achievements. Fresh profiles rank higher in search results." },
      { type: "heading", content: "Optimizing Your Profile for Discovery" },
      { type: "paragraph", content: "Atomic Influence uses your profile information to match you with relevant campaigns. The more complete and accurate your profile, the better your matches will be." },
      { type: "list", content: [
        "Use keywords that describe your niche (e.g., 'sustainable fashion', 'tech reviews', 'fitness lifestyle')",
        "Mention the types of brands you'd love to work with",
        "Highlight any unique skills (photography, video editing, copywriting)",
        "Include relevant achievements or past collaborations"
      ]},
      { type: "warning", content: "Never include personal contact information like phone numbers or addresses in your public bio. All communication should happen through the platform for your safety." },
    ]
  },
  {
    id: "2",
    slug: "connecting-social-media-accounts",
    title: "Connecting Your Social Media Accounts",
    description: "Step-by-step instructions for linking Instagram, TikTok, YouTube, and other platforms.",
    category: "social-accounts",
    categoryIcon: Link2,
    categoryColor: "text-purple",
    readTime: "6 min read",
    featured: true,
    content: [
      { type: "paragraph", content: "Connecting your social media accounts allows brands to see your audience size, engagement rates, and content style. This is essential for getting matched with the right campaigns." },
      { type: "heading", content: "Supported Platforms" },
      { type: "list", content: [
        "Instagram (Business or Creator accounts only)",
        "TikTok",
        "YouTube",
        "Twitter/X",
        "Pinterest",
        "Twitch",
        "LinkedIn"
      ]},
      { type: "heading", content: "Connecting Instagram" },
      { type: "paragraph", content: "Instagram requires a Business or Creator account (not a personal account) to connect. Here's how to set it up:" },
      { type: "steps", content: [
        "Convert to a Business or Creator account in Instagram Settings > Account > Switch Account Type",
        "Connect your Instagram to a Facebook Page (required by Meta's API)",
        "On Atomic Influence, go to Connect Socials and click the Instagram card",
        "Log in with your Instagram credentials and authorize access",
        "Wait for your metrics to sync (usually takes 1-2 minutes)"
      ]},
      { type: "tip", content: "If you're having trouble connecting, try logging out of Instagram in your browser first, then attempt the connection again." },
      { type: "heading", content: "Connecting TikTok" },
      { type: "steps", content: [
        "Navigate to Connect Socials in your dashboard",
        "Click the TikTok card",
        "Log in with your TikTok credentials",
        "Authorize Atomic Influence to access your public profile data",
        "Your follower count and recent engagement will sync automatically"
      ]},
      { type: "heading", content: "Connecting YouTube" },
      { type: "steps", content: [
        "Go to Connect Socials and click YouTube",
        "Sign in with your Google account that owns the YouTube channel",
        "Select the channel you want to connect (if you have multiple)",
        "Grant permission to view your channel analytics",
        "Your subscriber count and video metrics will appear on your profile"
      ]},
      { type: "heading", content: "Manual Handle Entry" },
      { type: "paragraph", content: "For platforms that don't support OAuth connection (like Twitter/X, Pinterest, or Twitch), you can manually enter your username. We'll verify your account and pull public metrics." },
      { type: "warning", content: "Providing fake or misleading social media information will result in account suspension. All accounts are verified against public data." },
    ]
  },
  {
    id: "3",
    slug: "how-campaign-matching-works",
    title: "How Campaign Matching Works",
    description: "Understand the AI-powered system that connects you with relevant brand opportunities.",
    category: "campaigns",
    categoryIcon: Target,
    categoryColor: "text-pink",
    readTime: "7 min read",
    featured: true,
    content: [
      { type: "paragraph", content: "Atomic Influence uses advanced AI to match creators with campaigns where they're most likely to succeed. Understanding how matching works helps you optimize your profile for better opportunities." },
      { type: "heading", content: "The Matching Algorithm" },
      { type: "paragraph", content: "Our matching system considers multiple factors to calculate your compatibility score with each campaign:" },
      { type: "list", content: [
        "Audience demographics - Does your audience match the brand's target market?",
        "Content style - Does your aesthetic and tone align with the brand?",
        "Engagement rate - How actively does your audience interact with your content?",
        "Platform fit - Are you strong on the platforms the campaign targets?",
        "Brand Fit preferences - What did you indicate in your Brand Fit survey?",
        "Past performance - How have you performed in similar campaigns?"
      ]},
      { type: "heading", content: "Understanding Match Scores" },
      { type: "paragraph", content: "Each campaign shows a match score indicating how well you fit the brand's requirements:" },
      { type: "list", content: [
        "90-100% - Excellent match. You meet or exceed all requirements.",
        "75-89% - Good match. You meet most requirements with minor gaps.",
        "60-74% - Fair match. Consider if you can meet the requirements.",
        "Below 60% - Low match. May not be the best fit for this campaign."
      ]},
      { type: "tip", content: "Focus on campaigns with 75%+ match scores. Brands prioritize creators with higher compatibility, and you're more likely to enjoy the collaboration." },
      { type: "heading", content: "Improving Your Match Scores" },
      { type: "steps", content: [
        "Complete your Brand Fit survey - This provides crucial preference data",
        "Connect all your social accounts - More data means better matching",
        "Keep your profile updated - Refresh your bio and metrics regularly",
        "Build a consistent content style - Brands look for creators with clear niches",
        "Maintain strong engagement - Quality audience beats quantity"
      ]},
      { type: "warning", content: "Applying to many low-match campaigns can hurt your standing. Brands see your application history, and a pattern of mismatched applications may reduce future opportunities." },
    ]
  },
  {
    id: "4",
    slug: "applying-to-campaigns",
    title: "Applying to Campaigns Successfully",
    description: "Tips and best practices for writing applications that get approved.",
    category: "campaigns",
    categoryIcon: Target,
    categoryColor: "text-pink",
    readTime: "10 min read",
    content: [
      { type: "paragraph", content: "A strong campaign application can be the difference between landing your dream partnership and being passed over. This guide shares proven strategies for writing applications that stand out." },
      { type: "heading", content: "Before You Apply" },
      { type: "paragraph", content: "Take time to evaluate whether a campaign is right for you:" },
      { type: "list", content: [
        "Read the entire campaign brief carefully",
        "Check if you meet all stated requirements",
        "Consider if the brand aligns with your values and content",
        "Evaluate if the compensation matches your rates",
        "Confirm you can meet the deadline"
      ]},
      { type: "heading", content: "Writing Your Application" },
      { type: "paragraph", content: "Your application should demonstrate that you understand the brand and have creative ideas for the campaign." },
      { type: "steps", content: [
        "Open with a personalized hook - Show you've researched the brand",
        "Explain why you're a good fit - Connect your audience and content to their goals",
        "Share a content idea - Give them a preview of your creative approach",
        "Highlight relevant experience - Mention similar successful campaigns",
        "End with enthusiasm - Express genuine interest in the partnership"
      ]},
      { type: "tip", content: "Keep applications concise but specific. Aim for 150-250 words that demonstrate quality over quantity." },
      { type: "heading", content: "Common Mistakes to Avoid" },
      { type: "list", content: [
        "Generic copy-paste applications that don't mention the specific brand",
        "Focusing only on yourself without addressing brand benefits",
        "Overpromising metrics or results you can't deliver",
        "Applying to campaigns clearly outside your niche",
        "Missing required information or attachments"
      ]},
      { type: "heading", content: "After Applying" },
      { type: "paragraph", content: "Most brands respond within 3-7 business days. You'll receive a notification when your application status changes. If approved, you'll get access to the full campaign brief and can begin creating content." },
      { type: "warning", content: "Don't message brands directly asking about application status. This can negatively impact their impression of you. Trust the process and focus on other opportunities while waiting." },
    ]
  },
  {
    id: "5",
    slug: "understanding-payments-commissions",
    title: "Understanding Payments & Commissions",
    description: "Everything you need to know about how and when you get paid.",
    category: "payments",
    categoryIcon: CreditCard,
    categoryColor: "text-orange",
    readTime: "8 min read",
    featured: true,
    content: [
      { type: "paragraph", content: "Getting paid for your work should be straightforward. This guide explains the different payment models, payout schedules, and how to set up your payment information." },
      { type: "heading", content: "Payment Models" },
      { type: "paragraph", content: "Campaigns on Atomic Influence use different compensation structures:" },
      { type: "list", content: [
        "Flat fee - Fixed payment for completing deliverables",
        "Commission-based - Percentage of sales from your content",
        "Hybrid - Base payment plus commission on performance",
        "Product-only - Free products in exchange for content (clearly labeled)"
      ]},
      { type: "heading", content: "How Commission Tracking Works" },
      { type: "paragraph", content: "For commission-based campaigns, you'll receive unique tracking links or codes:" },
      { type: "steps", content: [
        "Access your campaign workspace after approval",
        "Copy your unique tracking link or discount code",
        "Share only this link/code in your content",
        "Sales made through your link are automatically tracked",
        "Commission appears in your earnings dashboard within 24-48 hours"
      ]},
      { type: "tip", content: "Always use the exact tracking link provided. Modified or shortened links may not track properly, and you could lose credit for sales." },
      { type: "heading", content: "Payout Schedule" },
      { type: "paragraph", content: "Earnings are processed on a regular schedule:" },
      { type: "list", content: [
        "Flat fees: Paid within 7 days after deliverables are approved",
        "Commissions: Consolidated and paid on the 15th of each month",
        "Minimum payout threshold: $50 (earnings below this roll over)",
        "Processing time: 2-5 business days depending on payment method"
      ]},
      { type: "heading", content: "Setting Up Payment Methods" },
      { type: "paragraph", content: "Navigate to Settings > Payments to add your preferred payout method:" },
      { type: "list", content: [
        "PayPal - Fastest option, available in most countries",
        "Direct bank transfer (ACH) - US bank accounts only",
        "Wire transfer - International accounts, higher minimum",
        "Digital wallets - Select options available"
      ]},
      { type: "warning", content: "Keep your payment information up to date. Failed payments due to outdated info may delay your earnings and incur reprocessing fees." },
    ]
  },
  {
    id: "6",
    slug: "completing-brand-fit-survey",
    title: "Completing Your Brand Fit Survey",
    description: "How to use the Brand Fit survey to get better campaign matches.",
    category: "brand-fit",
    categoryIcon: Sparkles,
    categoryColor: "text-cyan",
    readTime: "5 min read",
    content: [
      { type: "paragraph", content: "The Brand Fit survey helps us understand your preferences, values, and the types of brands you want to work with. Completing it improves your match scores and helps you avoid campaigns that aren't right for you." },
      { type: "heading", content: "What Brand Fit Covers" },
      { type: "list", content: [
        "Content categories you're comfortable promoting",
        "Personal assets you're willing to feature (home, car, pets)",
        "Topics or products you want to avoid",
        "Your preferred collaboration styles",
        "Audience demographics and content style",
        "Openness to different industries"
      ]},
      { type: "heading", content: "Why It Matters" },
      { type: "paragraph", content: "Brands value authenticity. When you promote products that align with your values and lifestyle, your content feels more genuine and performs better. Brand Fit ensures you're only matched with campaigns where you can create authentic content." },
      { type: "tip", content: "Be honest in your Brand Fit responses. Saying yes to everything doesn't get you more opportunities—it gets you mismatched campaigns that hurt your performance." },
      { type: "heading", content: "Updating Brand Fit" },
      { type: "paragraph", content: "Your preferences may change over time. You can retake or update the Brand Fit survey anytime from your dashboard. We recommend reviewing it every few months or whenever your content focus shifts." },
      { type: "steps", content: [
        "Navigate to Brand Fit from the sidebar",
        "Click 'Retake Survey' to start fresh or 'Edit Responses' to modify specific answers",
        "Complete all sections for the best matching results",
        "Submit to update your preferences immediately"
      ]},
    ]
  },
  {
    id: "7",
    slug: "account-security-best-practices",
    title: "Account Security Best Practices",
    description: "Protect your account and personal information with these security measures.",
    category: "account",
    categoryIcon: Shield,
    categoryColor: "text-muted-foreground",
    readTime: "6 min read",
    content: [
      { type: "paragraph", content: "Your Atomic Influence account contains sensitive information about your earnings, connected accounts, and personal data. Following security best practices protects you from unauthorized access." },
      { type: "heading", content: "Creating a Strong Password" },
      { type: "list", content: [
        "Use at least 12 characters",
        "Include uppercase and lowercase letters",
        "Add numbers and special characters",
        "Avoid personal information (birthdays, names)",
        "Don't reuse passwords from other sites"
      ]},
      { type: "heading", content: "Enabling Two-Factor Authentication" },
      { type: "paragraph", content: "Two-factor authentication (2FA) adds an extra layer of security by requiring a code from your phone in addition to your password." },
      { type: "steps", content: [
        "Go to Settings > Security",
        "Click 'Enable Two-Factor Authentication'",
        "Choose SMS or authenticator app",
        "Follow the setup prompts to verify",
        "Save your backup codes in a secure location"
      ]},
      { type: "tip", content: "Authenticator apps (like Google Authenticator or Authy) are more secure than SMS codes. They work even without cell service." },
      { type: "heading", content: "Recognizing Phishing Attempts" },
      { type: "paragraph", content: "Be cautious of emails or messages that:" },
      { type: "list", content: [
        "Ask for your password or payment information",
        "Create urgency with threats about your account",
        "Come from email addresses that look similar to but aren't from atomicinfluence.com",
        "Contain suspicious links or attachments",
        "Offer deals that seem too good to be true"
      ]},
      { type: "warning", content: "Atomic Influence will never ask for your password via email or message. If you receive such a request, report it immediately to security@atomicinfluence.com." },
      { type: "heading", content: "Managing Connected Accounts" },
      { type: "paragraph", content: "Regularly review which social accounts are connected and remove any you no longer use. You can manage connected accounts in Settings > Connected Accounts." },
    ]
  },
  {
    id: "8",
    slug: "creating-content-that-converts",
    title: "Creating Content That Converts",
    description: "Best practices for producing sponsored content that drives results.",
    category: "campaigns",
    categoryIcon: Target,
    categoryColor: "text-pink",
    readTime: "12 min read",
    content: [
      { type: "paragraph", content: "Great sponsored content balances authenticity with brand messaging. This guide shares proven strategies for creating content that your audience loves and that delivers results for brands." },
      { type: "heading", content: "Understanding the Brief" },
      { type: "paragraph", content: "Before creating anything, thoroughly understand what the brand wants:" },
      { type: "list", content: [
        "Key messages they want communicated",
        "Required talking points or product features",
        "Visual guidelines and brand assets",
        "Posting requirements (timing, hashtags, mentions)",
        "What NOT to do or say"
      ]},
      { type: "heading", content: "Staying Authentic" },
      { type: "paragraph", content: "Your audience follows you for your unique voice. Don't lose that in sponsored content:" },
      { type: "steps", content: [
        "Only accept campaigns for products you'd genuinely use or recommend",
        "Integrate the product naturally into your content style",
        "Share your honest experience, including any neutral observations",
        "Use your normal tone and vocabulary",
        "Show, don't just tell—demonstrate the product in action"
      ]},
      { type: "tip", content: "The best sponsored content doesn't feel like an ad. Your audience should learn something valuable or be entertained, just like your regular content." },
      { type: "heading", content: "Disclosure Requirements" },
      { type: "paragraph", content: "Always disclose sponsored partnerships clearly and conspicuously:" },
      { type: "list", content: [
        "Use #ad or #sponsored at the beginning of captions, not buried at the end",
        "Verbally disclose in videos (\"I've partnered with [brand]...\")",
        "Use platform-native partnership labels when available",
        "Make disclosure visible without clicking 'more'"
      ]},
      { type: "warning", content: "Failing to properly disclose sponsored content violates FTC guidelines and platform rules. This can result in campaign rejection, account penalties, and legal issues." },
      { type: "heading", content: "Driving Action" },
      { type: "paragraph", content: "For commission-based campaigns, encourage your audience to take action:" },
      { type: "list", content: [
        "Include a clear call-to-action",
        "Explain the benefit of using your link/code",
        "Create urgency when appropriate (limited offers)",
        "Make it easy—put links in accessible places",
        "Follow up with reminder content when allowed"
      ]},
    ]
  },
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getArticlesByCategory = (categoryId: string): Article[] => {
  return articles.filter(article => article.category === categoryId);
};

export const searchArticles = (query: string): Article[] => {
  const lowerQuery = query.toLowerCase();
  return articles.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.description.toLowerCase().includes(lowerQuery) ||
    article.content.some(section => {
      if (typeof section.content === 'string') {
        return section.content.toLowerCase().includes(lowerQuery);
      }
      return section.content.some(item => item.toLowerCase().includes(lowerQuery));
    })
  );
};