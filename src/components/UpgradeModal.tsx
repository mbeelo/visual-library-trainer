import { useState } from 'react'
import { X, Check, Star, Zap, Cloud, BarChart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { stripe } from '../lib/stripe'

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
      // Create Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan === 'monthly' ? 'price_monthly' : 'price_yearly',
          userId: user.id,
          email: user.email,
        }),
      })

      const { sessionId } = await response.json()
      const stripeInstance = await stripe

      if (stripeInstance) {
        await stripeInstance.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyPrice = 9
  const yearlyPrice = 79
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12)
  const savings = monthlyPrice * 12 - yearlyPrice

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
                <p className="text-gray-600">Unlock unlimited image collections and more</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                  Save ${savings}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-gray-900">
                ${selectedPlan === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}
              </span>
              <span className="text-gray-600">/month</span>
            </div>
            {selectedPlan === 'yearly' && (
              <p className="text-green-600 text-sm mt-1">
                Billed annually (${yearlyPrice}/year)
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Unlimited Image Collections
                </div>
                <p className="text-sm text-gray-600">Save as many reference images as you want for each drawing subject</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  Cloud Sync
                </div>
                <p className="text-sm text-gray-600">Access your collections from any device, never lose your progress</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-green-500" />
                  Advanced Analytics
                </div>
                <p className="text-sm text-gray-600">Track your progress with detailed insights and performance metrics</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Export Collections</div>
                <p className="text-sm text-gray-600">Download your reference boards as PDFs or images</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Priority Support</div>
                <p className="text-sm text-gray-600">Get help when you need it with dedicated support</p>
              </div>
            </div>
          </div>

          {/* Free vs Pro comparison */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Free Tier</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 3 images per subject</li>
                  <li>• Local storage only</li>
                  <li>• Basic features</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Pro Tier</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Unlimited images</li>
                  <li>• Cloud sync</li>
                  <li>• Advanced features</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Setting up...' : `Upgrade to Pro - $${selectedPlan === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}/month`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}