import { useState, useEffect } from 'react'
import { User, Crown, Calendar, Settings, LogOut, Trash2, Mail, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AccountPage() {
  const { user, signOut, subscriptionTier } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/app/dashboard')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/app/dashboard')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-400 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-300">Manage your profile and subscription</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            <p className="text-sm text-slate-300">Your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3">
              <span className="text-white">{user.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Account Created</label>
            <div className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3">
              <span className="text-white">{formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Subscription</h2>
            <p className="text-sm text-slate-300">Your current plan and benefits</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-white">
                {subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
              {subscriptionTier === 'pro' && (
                <span className="bg-orange-400 text-slate-900 px-3 py-1 rounded-lg text-sm font-medium">
                  Active
                </span>
              )}
            </div>
            <p className="text-slate-300">
              {subscriptionTier === 'pro'
                ? 'Unlimited image collections, cloud sync, and advanced features'
                : 'Basic features with 3 images per subject'
              }
            </p>
          </div>

          {subscriptionTier === 'free' && (
            <button
              onClick={() => {/* TODO: Open upgrade modal */}}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Account Actions</h2>
            <p className="text-sm text-slate-300">Manage your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                <p className="text-sm text-slate-300">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to delete your account? This will permanently remove all your data,
              including your image collections, practice history, and progress.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement account deletion
                  console.log('Delete account requested')
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}