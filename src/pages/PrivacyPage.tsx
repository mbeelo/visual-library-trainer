import { Lock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-400 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-slate-300">Last updated: October 5, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">1. Information We Collect</h2>
            <div className="text-slate-300 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Account Information</h3>
                <p>When you create an account, we collect your email address and any profile information you choose to provide.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                <p>We collect information about how you use AfterImage, including practice sessions, progress data, and feature usage statistics.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">User Content</h3>
                <p>We store images you upload to your personal reference collections and any custom training lists you create.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">2. How We Use Your Information</h2>
            <div className="text-slate-300 leading-relaxed space-y-2">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide and improve the AfterImage service</li>
                <li>Sync your data across devices (for premium users)</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Send important service-related communications</li>
                <li>Process payments for premium subscriptions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">3. Data Storage and Security</h2>
            <div className="text-slate-300 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Local Storage</h3>
                <p>Free users' data is stored locally in their browser. This data is not accessible to us or shared with third parties.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Cloud Storage</h3>
                <p>Premium users' data is securely stored in our cloud infrastructure powered by Supabase, with industry-standard encryption.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Security Measures</h3>
                <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">4. Third-Party Services</h2>
            <div className="text-slate-300 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Payment Processing</h3>
                <p>We use Stripe to process payments. Stripe's privacy policy governs their collection and use of your payment information.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Authentication</h3>
                <p>We use Supabase for user authentication and may offer social login options (Google, etc.) which are governed by their respective privacy policies.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Analytics</h3>
                <p>We may use privacy-focused analytics tools to understand how users interact with our service, without collecting personally identifiable information.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">6. Your Rights and Choices</h2>
            <div className="text-slate-300 leading-relaxed space-y-2">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data (for premium users)</li>
                <li>Opt out of non-essential communications</li>
                <li>Request clarification about our data practices</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">7. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy.
              You may delete your account at any time, which will remove your personal data from our systems within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">8. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              AfterImage is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">9. Changes to Privacy Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page
              and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">10. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:privacy@afterimage.app" className="text-orange-400 hover:text-orange-300 transition-colors">
                privacy@afterimage.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}