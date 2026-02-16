import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* Back link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Matters</h2>
            <p className="text-gray-600 leading-relaxed">
              At Atomic Influence, we believe in transparency about how we collect, use, and protect your information. This Privacy Policy explains our practices in plain language so you can make informed decisions about your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect information to help you connect with opportunities and manage your campaigns effectively:
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Account Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Name and email address when you sign up</li>
              <li>Profile details you choose to share (bio, location, website)</li>
              <li>Company name and industry (for brand accounts)</li>
              <li>Profile photo if you upload one</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Connected Accounts and Handles</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Social media usernames you provide (Instagram, TikTok, YouTube, etc.)</li>
              <li>Follower counts and engagement metrics from connected platforms</li>
              <li>Content categories and audience demographics when available</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Campaign Activity</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Campaigns you apply to, accept, or complete</li>
              <li>Content you submit through the platform</li>
              <li>Messages exchanged with brands or creators</li>
              <li>Surveys and Brand Fit preferences you complete</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Payment Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Payment details for receiving or sending payments</li>
              <li>Transaction history and earnings records</li>
              <li>Tax information as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use your data to power the features that make Atomic Influence valuable:
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Matching and Discovery</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Connecting creators with relevant brand campaigns based on audience and content style</li>
              <li>Helping brands find creators who align with their goals and values</li>
              <li>Calculating match scores and recommendations</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Payments and Transactions</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Processing campaign payments between brands and creators</li>
              <li>Generating invoices and payment records</li>
              <li>Complying with financial regulations and tax requirements</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Platform Improvement</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Understanding how you use the platform to make it better</li>
              <li>Developing new features based on user needs</li>
              <li>Identifying and fixing issues</li>
              <li>Analyzing trends to improve matching accuracy</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Communication</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Sending campaign invitations and updates</li>
              <li>Notifying you about important account or platform changes</li>
              <li>Providing customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Protect Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We take the security of your data seriously:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All data is encrypted in transit and at rest</li>
              <li>We use secure, industry-standard authentication</li>
              <li>Access to personal data is limited to authorized personnel</li>
              <li>We regularly review and update our security practices</li>
              <li>Payment information is processed through secure, compliant payment providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We share your information only in these circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>With campaign partners:</strong> Brands see creator profiles when evaluating applications; creators see brand details for campaigns they join</li>
              <li><strong>Service providers:</strong> Companies that help us operate the platform (payment processing, hosting, analytics)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect rights, safety, or property</li>
              <li><strong>Business transfers:</strong> If Atomic Influence is acquired, user data may be transferred to the new owner</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We never sell your personal information to third parties for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have control over your information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
              <li><strong>Correction:</strong> Update inaccurate information in your profile</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Receive your data in a commonly used format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@atomicinfluence.com or through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We keep your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal, financial, or operational purposes (such as transaction records) as required by law. Anonymized data may be retained indefinitely for analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how you use the platform. You can manage cookie preferences through your browser settings, though some features may not work properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy as our practices evolve. We'll notify you of significant changes via email or platform notification. The "Last updated" date at the top indicates when the policy was most recently revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@atomicinfluence.com.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Atomic Influence. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;