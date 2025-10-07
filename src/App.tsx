import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { Landing, DashboardPage, PracticePage, CreateListPage, ListViewPage, AccountPage, ContactPage, NotFoundPage } from './pages'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AdminDashboard } from './pages/AdminDashboard'

// Account-only routes that require full auth
function AuthRequiredRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your account...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Public routes - no auth needed, instant load */}
            <Route path="/" element={<Landing />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* App routes - free to use, auth happens at feature level */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="list/:listId" element={<ListViewPage />} />
              <Route path="practice/:subject" element={<PracticePage />} />
              <Route path="create-list" element={<CreateListPage />} />
              <Route path="contact" element={<ContactPage />} />

              {/* Only account page requires full auth initialization */}
              <Route path="account" element={
                <AuthRequiredRoute>
                  <AccountPage />
                </AuthRequiredRoute>
              } />
            </Route>

            {/* Redirect old routes */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/browse-lists" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/create-list" element={<Navigate to="/app/create-list" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}