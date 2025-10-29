import { useState } from 'react'
import { X, Star, Loader2 } from 'lucide-react'
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

      const isDevelopment = import.meta.env.DEV

      if (isDevelopment) {
        // Development: Use client-side approach (bypasses client-only integration requirement in test mode)
        console.log('🔧 Development mode: Using client-side Stripe checkout')

        const { loadStripe } = await import('@stripe/stripe-js')
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        // Use redirectToCheckout in development (test keys bypass client-only requirement)
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
      } else {
        // Production: Use server-side API
        console.log('🚀 Production mode: Using server-side checkout session')

        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId: user.id,
            userEmail: user.email,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { url } = await response.json()

        if (!url) {
          throw new Error('No checkout URL returned from server')
        }

        // Redirect to Stripe Checkout
        window.location.href = url
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
                <p className="text-sm text-slate-300">Build unlimited visual libraries</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* WHAT - Current vs Pro */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-slate-300 mb-2">Free (Current)</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• 3 images per subject</li>
                  <li>• Device storage only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-400 mb-2">Pro</h4>
                <ul className="space-y-1 text-orange-300">
                  <li>• Unlimited images</li>
                  <li>• Cloud sync everywhere</li>
                </ul>
              </div>
            </div>
          </div>

          {/* WHY - Simple benefit */}
          <div className="text-center mb-6">
            <p className="text-slate-300 text-lg">
              You're hitting the <span className="text-orange-400 font-semibold">3 image limit</span>.
              Upgrade to save unlimited references and sync across all your devices.
            </p>
          </div>

          {/* HOW - Pricing */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-slate-700 p-1 rounded-lg flex text-sm">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-orange-400 text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                $9/month
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-3 py-2 rounded-md font-medium transition-colors relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-orange-400 text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                $79/year
                <span className="absolute -top-1 -right-1 bg-green-400 text-slate-900 text-xs px-1 rounded">
                  Save $29
                </span>
              </button>
            </div>
          </div>

          {/* NOW - Action */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-orange-300 text-slate-900 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Start Pro Now
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 hover:text-slate-300 transition-colors text-sm"
            >
              Maybe later
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}