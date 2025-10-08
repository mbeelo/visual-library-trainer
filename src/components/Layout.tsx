import { Outlet, useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import Header from './Header'
import { useState, useEffect } from 'react'
import Toast from './Toast'
import { AuthModal } from './AuthModal'
import { UpgradeModal } from './UpgradeModal'
import { ModalProvider } from '../contexts/ModalContext'
import { useAuth } from '../contexts/AuthContext'

export function Layout() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean
    mode: 'signin' | 'signup'
  }>({ isOpen: false, mode: 'signin' })

  // Auto-close auth modal when user becomes authenticated
  useEffect(() => {
    if (user && authModal.isOpen) {
      console.log('User authenticated, closing auth modal')
      setAuthModal(prev => ({ ...prev, isOpen: false }))
    }
  }, [user, authModal.isOpen])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false
  })


  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Header
          onNavigateHome={() => navigate('/app/dashboard')}
          onShowAuth={(mode: 'signin' | 'signup') => setAuthModal({ isOpen: true, mode })}
        />

        <main>
          <ModalProvider
            onShowAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            onShowUpgrade={() => setShowUpgradeModal(true)}
            onShowToast={showToast}
          >
            <Outlet />
          </ModalProvider>
        </main>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          mode={authModal.mode}
          onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
        />

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />


        <footer className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              AfterImage
            </span>
          </div>
          <div className="text-orange-400 text-sm mb-2">
            The art of seeing twice
          </div>
          <div className="text-slate-400 text-xs">
            <a href="/app/contact" className="hover:text-orange-400 transition-colors">
              Contact & Support
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}