import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Atomic Influence</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service govern your use of the Atomic Influence platform. By creating an account or using our services, you agree to be bound by these terms. Please read them carefully before proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Atomic Influence connects content creators with brands for marketing collaborations. Our platform facilitates campaign discovery, creator–brand matching, content delivery, and payment processing. We provide the tools and infrastructure; the creative partnerships are between you and the other party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you create an account on Atomic Influence, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate and complete information about yourself or your organization</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
              <li>Maintain up-to-date contact and payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Creator–Brand Interactions</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Atomic Influence facilitates connections between creators and brands, but we are not a party to the agreements you make with each other. When participating in campaigns:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Creators agree to deliver content that meets campaign requirements and deadlines</li>
              <li>Brands agree to provide clear briefs, timely feedback, and prompt payment</li>
              <li>Both parties agree to communicate professionally and respectfully</li>
              <li>Disputes should first be resolved directly between parties; we may assist but are not obligated to mediate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Participation</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you apply to or accept a campaign:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You commit to fulfilling the agreed deliverables within the specified timeline</li>
              <li>Content must be original, authentic, and comply with applicable advertising regulations</li>
              <li>Sponsored content must be clearly disclosed as required by law (e.g., FTC guidelines)</li>
              <li>You may not misrepresent your audience, engagement, or capabilities</li>
              <li>Campaign details are confidential unless otherwise specified</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payments and Fees</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Atomic Influence processes payments between brands and creators:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Creators receive payment after deliverables are approved and any required review period has passed</li>
              <li>Atomic Influence may charge service fees as disclosed on the platform</li>
              <li>You are responsible for any taxes on income earned through the platform</li>
              <li>Payment disputes must be raised within 30 days of the transaction</li>
              <li>We reserve the right to withhold payment for policy violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Ownership</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Content created through Atomic Influence campaigns:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Creators retain ownership of their original content unless otherwise agreed in campaign terms</li>
              <li>Brands receive usage rights as specified in individual campaign agreements</li>
              <li>You grant Atomic Influence a license to display content on our platform for promotional purposes</li>
              <li>You warrant that your content does not infringe on third-party rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree not to use Atomic Influence to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Post content that is harmful, fraudulent, deceptive, or offensive</li>
              <li>Harass, threaten, or discriminate against others</li>
              <li>Use fake accounts, bots, or manipulated metrics</li>
              <li>Circumvent platform fees or payment systems</li>
              <li>Scrape data or interfere with platform operations</li>
              <li>Promote illegal products or prohibited content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your account may be suspended or terminated:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>At your request at any time</li>
              <li>For violations of these Terms of Service</li>
              <li>For prolonged inactivity (with prior notice)</li>
              <li>If required by law or to protect the platform community</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Upon termination, your access to the platform will end. Outstanding payments will be processed according to our standard procedures, and certain obligations (such as confidentiality) survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Atomic Influence provides the platform "as is" and makes no guarantees about campaign success, earnings, or partnership outcomes. We are not liable for disputes between users, content performance, or indirect damages arising from platform use. Our total liability is limited to fees paid to us in the twelve months preceding any claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to These Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms of Service periodically. Significant changes will be communicated via email or platform notification. Continued use of Atomic Influence after changes take effect constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at legal@atomicinfluence.com.
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

export default Terms;