import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requirePremium?: boolean
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requirePremium = false,
  fallback
}: ProtectedRouteProps) {
  const { user, subscriptionTier } = useAuth()

  if (requireAuth && !user) {
    return fallback || (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Authentication Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to access this feature.
        </p>
        <button
          onClick={() => {
            // This would trigger auth modal in a real implementation
            console.log('Open auth modal')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (requirePremium && (!user || subscriptionTier !== 'pro')) {
    return fallback || (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Premium Feature
        </h2>
        <p className="text-gray-600 mb-6">
          This feature requires a premium subscription.
        </p>
        <button
          onClick={() => {
            // This would trigger upgrade modal in a real implementation
            console.log('Open upgrade modal')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Upgrade to Premium
        </button>
      </div>
    )
  }

  return <>{children}</>
}