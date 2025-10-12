import { useState } from 'react'
import { X, Check, Star, Zap, Cloud, BarChart, Share, Download, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const { user } = useAuth()

  if (!isOpen) return null

  const handleUpgrade = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get the correct price ID based on selected plan
      const priceId = selectedPlan === 'monthly'
        ? import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY
        : import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY

      // Load Stripe dynamically
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }

      // Redirect directly to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/app/account?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/app/dashboard`,
        customerEmail: user.email,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Sorry, there was an error processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyPrice = 9
  const yearlyPrice = 79
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12)
  const savings = monthlyPrice * 12 - yearlyPrice

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
                <p className="text-slate-300">Unlock unlimited image collections and more</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-slate-700 p-1 rounded-lg flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-orange-400 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-orange-400 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-400 text-slate-900 text-xs px-1 rounded">
                  Save ${savings}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-white">
                ${selectedPlan === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}
              </span>
              <span className="text-slate-300">/month</span>
            </div>
            {selectedPlan === 'yearly' && (
              <p className="text-green-400 text-sm mt-1">
                Billed annually (${yearlyPrice}/year)
              </p>
            )}
          </div>

          {/* Available Features */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Available Today</h3>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-slate-900" />
              </div>
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Unlimited Image Collections
                </div>
                <p className="text-sm text-slate-300">Save as many reference images as you want for each drawing subject</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-slate-900" />
              </div>
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  Cloud Sync & Backup
                </div>
                <p className="text-sm text-slate-300">Your collections and progress automatically sync across all devices</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-slate-900" />
              </div>
              <div>
                <div className="font-medium text-white">Enhanced Progress Tracking</div>
                <p className="text-sm text-slate-300">Detailed session history with ratings, timing, and streak tracking</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Coming Soon to Pro
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart className="w-3 h-3 text-slate-300" />
              </div>
              <div>
                <div className="font-medium text-slate-300 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-green-500" />
                  Advanced Analytics Dashboard
                </div>
                <p className="text-sm text-slate-400">Performance insights, weak subject identification, improvement trends</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Share className="w-3 h-3 text-slate-300" />
              </div>
              <div>
                <div className="font-medium text-slate-300 flex items-center gap-2">
                  <Share className="w-4 h-4 text-purple-500" />
                  Share & Collaborate
                </div>
                <p className="text-sm text-slate-400">Share reference collections with art communities and friends</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="w-3 h-3 text-slate-300" />
              </div>
              <div>
                <div className="font-medium text-slate-300 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  Export Collections
                </div>
                <p className="text-sm text-slate-400">Download reference boards as PDFs, mood boards, or Pinterest exports</p>
              </div>
            </div>
          </div>

          {/* Free vs Pro comparison */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-white mb-2">Free Forever</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• 3 reference images per subject</li>
                  <li>• Local device storage only</li>
                  <li>• Core practice features</li>
                  <li>• Drawing timer & ratings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-400 mb-2">Pro ($9/month)</h4>
                <ul className="space-y-1 text-orange-300">
                  <li>• Unlimited reference images</li>
                  <li>• Cloud sync across devices</li>
                  <li>• Enhanced progress tracking</li>
                  <li>• Priority feature access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleUpgrade}
            disabled={isLoading || !user}
            className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-orange-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Setting up...' : `Upgrade to Pro - $${selectedPlan === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}/month`}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}