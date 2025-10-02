import React, { createContext, useContext } from 'react'

interface ModalContextType {
  showAuthModal: (mode: 'signin' | 'signup') => void
  showUpgradeModal: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalProviderProps {
  children: React.ReactNode
  onShowAuth: (mode: 'signin' | 'signup') => void
  onShowUpgrade: () => void
  onShowToast: (message: string, type?: 'success' | 'error' | 'warning') => void
}

export function ModalProvider({
  children,
  onShowAuth,
  onShowUpgrade,
  onShowToast
}: ModalProviderProps) {
  const contextValue: ModalContextType = {
    showAuthModal: onShowAuth,
    showUpgradeModal: onShowUpgrade,
    showToast: onShowToast
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  )
}