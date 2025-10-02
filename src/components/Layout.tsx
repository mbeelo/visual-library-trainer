import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import { defaultList, communityLists } from '../data'
import { useLocalStorage } from '../hooks'
import { TrainingList } from '../types'
import { useState } from 'react'
import Toast from './Toast'
import { AuthModal } from './AuthModal'
import { UpgradeModal } from './UpgradeModal'
import ListBrowser from './ListBrowser'
import ListCreator from './ListCreator'
import { ModalProvider } from '../contexts/ModalContext'

export function Layout() {
  const navigate = useNavigate()
  const [customLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [settings, setSettings] = useLocalStorage('vlt-settings', {
    activeListId: defaultList.id
  })

  const [showListBrowser, setShowListBrowser] = useState(false)
  const [showListCreator, setShowListCreator] = useState(false)
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean
    mode: 'signin' | 'signup'
  }>({ isOpen: false, mode: 'signin' })
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

  const allLists = [defaultList, ...communityLists, ...customLists]
  const activeList = allLists.find(list => list.id === settings.activeListId) || defaultList

  const setActiveList = (list: TrainingList) => {
    setSettings(prev => ({ ...prev, activeListId: list.id }))
    showToast(`Switched to "${list.name}"`, 'success')
    setShowListBrowser(false)
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header
          activeList={activeList}
          allLists={allLists}
          onSetActiveList={setActiveList}
          showListBrowser={showListBrowser}
          setShowListBrowser={setShowListBrowser}
          showListCreator={showListCreator}
          setShowListCreator={setShowListCreator}
          onNavigateHome={() => navigate('/dashboard')}
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

        {showListBrowser && (
          <ListBrowser
            isOpen={showListBrowser}
            onClose={() => setShowListBrowser(false)}
            allLists={allLists}
            activeList={activeList}
            onSetActiveList={setActiveList}
          />
        )}

        {showListCreator && (
          <ListCreator
            isOpen={showListCreator}
            onClose={() => setShowListCreator(false)}
            onListCreated={(newList) => {
              setActiveList(newList)
              setShowListCreator(false)
            }}
          />
        )}

        <footer className="mt-16 text-center">
          <div className="text-gray-500 text-sm font-medium">
            <a
              href="https://behelo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors duration-200"
            >
              behelo.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}