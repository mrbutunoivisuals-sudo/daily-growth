import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import NavBar from './components/NavBar.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Today from './pages/Today.jsx'
import Coach from './pages/Coach.jsx'
import Review from './pages/Review.jsx'
import Settings from './pages/Settings.jsx'

function RequireProfile({ children }) {
  const { profile } = useApp()
  if (!profile?.onboardingDone) return <Navigate to="/onboarding" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/today"      element={<RequireProfile><Today /></RequireProfile>} />
        <Route path="/coach"      element={<RequireProfile><Coach /></RequireProfile>} />
        <Route path="/review"     element={<RequireProfile><Review /></RequireProfile>} />
        <Route path="/settings"   element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path="/"           element={<Navigate to="/today" replace />} />
        <Route path="*"           element={<Navigate to="/today" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
              <AppRoutes />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
