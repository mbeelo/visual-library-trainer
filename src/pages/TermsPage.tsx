import { Shield, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TermsPage() {
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
              <Shield className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-slate-300">Last updated: October 5, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing and using AfterImage ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              AfterImage is a visual memory training application designed to help artists improve their drawing skills through memory-based practice and reference study.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The Service includes both free and premium features, including but not limited to drawing prompts, reference collections, progress tracking, and cloud synchronization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">3. User Accounts</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You may use AfterImage without creating an account for basic features. To access premium features and cloud synchronization, account creation is required.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">4. Subscription and Payments</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Premium features are available through paid subscription plans. Subscription fees are charged in advance on a monthly or annual basis.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">5. User Content</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You retain ownership of any content you upload to AfterImage, including images and custom training lists.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By uploading content, you grant AfterImage a non-exclusive license to store, display, and process your content solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">6. Prohibited Use</h2>
            <div className="text-slate-300 leading-relaxed space-y-2">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Upload illegal, harmful, or inappropriate content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the Service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              AfterImage shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">8. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-400 mb-4">9. Contact Information</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@afterimage.app" className="text-orange-400 hover:text-orange-300 transition-colors">
                support@afterimage.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}