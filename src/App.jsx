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
  const { profile, hydrating } = useApp()

  // While Supabase hydration is in progress (only on first load / new device
  // when localStorage is empty), show a neutral loading screen rather than
  // flashing the onboarding form and then redirecting away.
  if (hydrating) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '-0.5px' }}>DG</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Se încarcă...</p>
        </div>
      </div>
    )
  }

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
