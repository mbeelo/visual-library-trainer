import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Landing, DashboardPage, PracticePage, CreateListPage, ListViewPage, AccountPage, ContactPage, NotFoundPage } from './pages'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AdminDashboard } from './pages/AdminDashboard'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Landing page - no layout */}
            <Route path="/" element={<Landing />} />

            {/* Legal pages - no layout */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Admin route - no layout */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* App routes with layout */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="list/:listId" element={<ListViewPage />} />
              <Route path="practice/:subject" element={<PracticePage />} />
              <Route path="create-list" element={<CreateListPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="contact" element={<ContactPage />} />
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