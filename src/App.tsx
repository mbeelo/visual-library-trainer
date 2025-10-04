import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Landing, DashboardPage, PracticePage, BrowseListsPage, CreateListPage } from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing page - no layout */}
          <Route path="/" element={<Landing />} />

          {/* App routes with layout */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="practice/:subject" element={<PracticePage />} />
            <Route path="browse-lists" element={<BrowseListsPage />} />
            <Route path="create-list" element={<CreateListPage />} />
          </Route>

          {/* Redirect old routes */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/browse-lists" element={<Navigate to="/app/browse-lists" replace />} />
          <Route path="/create-list" element={<Navigate to="/app/create-list" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}